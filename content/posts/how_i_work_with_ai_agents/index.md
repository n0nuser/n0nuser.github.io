---
slug: "how-i-work-with-ai-agents"
title: "How I Work with AI Agents: Context, Handoffs and Rules"
description: "The setup behind my AI agent workflow: tools that shrink what the agent reads, a concise output style, handoffs at 30% context, state kept in the issue tracker, rules written from failures, and an orchestrator/executor loop."
date: 2026-09-26
lastmod: 2026-09-26
author: "Pablo Jesús González Rubio"
coverAlt: "How I Work with AI Agents"
toc: true
draft: false
tags: [ "Software Development", "AI" ]
---

Agents write code fast. The slow part now is giving them the right context, keeping them inside the rules, and checking what they did. This post is the setup I use for that, with the real config.

The same habits run at two scales. At home it's a few hobby repos. At work it's around 14 Claude Code sessions open at once, managed by an orchestrator. Only the hobby setup is shown in detail.

It's written for someone who already uses an agent CLI and keeps running out of context or losing track of state between sessions.

> Examples use [Claude Code](https://code.claude.com/docs/en/overview). Most of it transfers to any agent CLI that supports hooks and an instructions file.

## Context is the budget

Everything below follows from one rule: **keep the context window small.**

- **Cost.** The whole context is sent again on every turn. A session at 90% pays for that 90% on every message.
- **Quality.** Models handle a long context worse than a short one. Instructions from the start get diluted by pages of tool output.
- **So I hand off at ~30%.** A fresh session that reads a one-page handoff beats a full session that has "seen everything".

Auto-compact is off on purpose. A compaction summary is written by the model, at the worst moment, with no review. A handoff is a file I can read.

```json
{
  "autoCompactEnabled": false
}
```

## Tools that shrink what the agent reads

Most context is tool output, not conversation. These tools cut it at the source.

### rtk: filter shell output

[rtk](https://github.com/rtk-ai/rtk) is a CLI proxy that compresses the output of common commands (`git`, `grep`, `ls`, test runners) before the agent sees it. A `PreToolUse` hook rewrites every shell command through it, so the agent never has to remember to use it:

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [{ "type": "command", "command": "rtk hook claude" }]
      }
    ]
  }
}
```

`rtk gain` reports what it saved. On **26 September 2026**:

```text
Total commands:    8361
Input tokens:      3.9M
Output tokens:     1.7M
Tokens saved:      2.2M (56.4%)
```

`rtk proxy <cmd>` runs a command unfiltered. You'll need it: see [what broke](#what-broke).

### Search: pick the tool by what you're looking for

Grepping for a function name and then reading five files is the most expensive way to find code. Each question has a cheaper tool:

| Looking for | Tool |
| --- | --- |
| Strings, comments, flag names, error messages | [`rg`](https://github.com/BurntSushi/ripgrep) (ripgrep) |
| A syntax shape: a call, a def, an argument pattern | [`ast-grep`](https://ast-grep.github.io/) |
| A symbol you can name, with callers and blast radius | [CodeGraph](https://github.com/colbymchenry/codegraph) |
| Fields in JSON output | [`jq`](https://jqlang.org/) |

```console
# Every call of apply_filter, whatever its arguments
$ ast-grep run -p 'apply_filter($$$ARGS)' -l python src/

# A symbol's source, its callers and what breaks if it changes, in one call
$ codegraph explore "apply_filter"

# Only the fields you need from an API response
$ gh issue list --json number,title,labels --jq '.[] | {number, title}'
```

CodeGraph keeps a pre-built symbol and call graph of the repo. It runs as an MCP tool and as a `UserPromptSubmit` hook that attaches relevant code to each prompt:

```json
{
  "hooks": {
    "UserPromptSubmit": [
      { "hooks": [{ "type": "command", "command": "codegraph prompt-hook" }] }
    ]
  }
}
```

The rule that makes these tools stick is written in the global `CLAUDE.md`, not remembered:

```markdown
In repositories indexed by CodeGraph (a `.codegraph/` directory exists at the
repo root), reach for it BEFORE grep/find or reading files.
If there is no `.codegraph/` directory, skip CodeGraph entirely.
```

## Concise output style

Claude Code has a built-in `Concise` output style: lead with the result, no preamble, no recap. I set it once, globally:

```json
{
  "outputStyle": "Concise"
}
```

The same rule goes in each repo's instructions, so it also binds other agents:

```markdown
## Communication

After making changes: bullet points, a few sentences. What changed and why.
No preamble, no essay, no summary of the summary. Expand only when asked,
when introducing a new architectural pattern, or when making a breaking change.
```

- **What it saves:** output tokens, and your reading time.
- **What it costs:** you sometimes have to ask "why?". That's a cheap question.

## The statusline: see the number

You can't hand off at 30% if you can't see 30%. The [statusline](https://code.claude.com/docs/en/statusline) is a script that receives the session as JSON on stdin and prints a line. Mine shows the model, a context bar, and the 5-hour and weekly usage:

```text
Opus (high) | 61k ▓▓▓░░░░░░░ 200k (30%)
🌿 main | window 5h 42% (2h13m) · week 18%
```

```json
{
  "statusLine": { "type": "command", "command": "bash ~/.claude/claude-statusline/statusline.sh" }
}
```

The core of the script, trimmed:

```bash
#!/bin/bash
input=$(cat)

model=$(echo "$input" | jq -r '.model.display_name // "Claude"')
effort=$(echo "$input" | jq -r '.effort.level // empty')

# Context bar: tokens in the window vs its size
size=$(echo "$input" | jq -r '.context_window.context_window_size // 200000')
used=$(echo "$input" | jq -r '.context_window.total_input_tokens // 0')
pct=$(( used * 100 / size ))
bar=""
for i in $(seq 1 10); do
  if [ $(( i * 10 )) -le "$pct" ]; then bar+="▓"; else bar+="░"; fi
done

# Plan usage windows
five=$(echo "$input" | jq -r '.rate_limits.five_hour.used_percentage // empty | round')
week=$(echo "$input" | jq -r '.rate_limits.seven_day.used_percentage // 0 | round')

printf '%s%s | %dk %s %dk (%d%%)\n' "$model" "${effort:+ ($effort)}" $((used / 1000)) "$bar" $((size / 1000)) "$pct"
if [ -n "$five" ]; then printf 'window 5h %d%% · week %d%%\n' "$five" "$week"; fi
```

The full version adds colours (green, yellow at 50%, orange at 70%, red at 90%), a reset countdown and the git branch. The colours don't mark 30%. I watch the number.

## The handoff loop

At ~30% context:

1. Run `/handoff`. It writes the current state to a file.
2. Run `/clear`.
3. Type "work from this handoff" and give the path.

`/handoff` comes from [Matt Pocock's skills](#matt-pococks-skills). A handoff is only useful if it's short and honest. This is the shape I use:

```markdown
# Handoff: YYYY-MM-DD

## State
One paragraph. What exists, and whether production serves the latest work.

## Shipped since the last handoff
- Commit SHAs and PR numbers. Facts, not narrative.

## In flight / blocked
- What it is, what it's waiting on, and who or what unblocks it.

## Next actions, in order
1. Concrete enough to start without asking a question.

## Gotchas
- Traps that silently do the wrong thing, and why, so nobody undoes the fix.

## Open questions for the user
- Decisions that aren't the agent's to make.
```

Two rules make it work:

- **Gather, don't remember.** The handoff is built from `git log`, `git status` and the tracker, not from the model's memory of the chat.
- **Link, don't restate.** If a spec, ADR or issue already says it, link it. The handoff is an index, not a copy.

A good handoff also has a section for **what is believed but not measured**. It's the list of places where the code embodies a guess, and the next session should know which ones they are.

## Matt Pocock's skills

[Skills](https://code.claude.com/docs/en/skills) are packaged instructions an agent loads when a task matches. I use [Matt Pocock's skills](https://github.com/mattpocock/skills) for most of the work loop:

| Stage | Skill | What it does |
| --- | --- | --- |
| Setup | `setup-matt-pocock-skills` | Wires the repo to its tracker, labels and docs layout |
| Think | `grill-with-docs` | Interviews you about a plan and writes ADRs and glossary terms as it goes |
| Specify | `to-spec`, `to-tickets` | Turns the conversation into a spec, then into tickets with blocking edges |
| Plan big work | `wayfinder` | A map issue with decision tickets, for work bigger than one session |
| Route | `triage` | Moves issues through triage labels and writes agent-ready briefs |
| Build | `tdd`, `diagnosing-bugs` | Red-green-refactor; a diagnosis loop for hard bugs |
| Check | `code-review` | Reviews the diff against the repo's standards and against the spec |
| Look things up | `research` | Checks primary sources and writes the findings to a file in the repo |
| Name things | `domain-modeling` | Keeps `CONTEXT.md` and the ADRs in sync with the code's vocabulary |
| Stop | `handoff` | Compacts the session into a document for the next one |

```console
/plugin install mattpocock-skills@claude-plugins-official
```

Skills fit the context rule: an agent only loads a skill when it needs it, instead of carrying every workflow in its instructions.

## State lives outside the chat

The chat is disposable. Anything that must survive a `/clear` lives in a file or in the tracker.

**The tracker is the source of truth.** GitHub Issues for hobby projects, Jira at work. Every issue is written as a brief an agent can act on:

```markdown
## Why
The problem, and why it matters now.

## Outline
The steps or sections, in order.

## Done when
- Checkable conditions. Not "improve X", but "X passes Y".
```

**Every kind of doc helps an agent.** Each answers a question the agent would otherwise guess at:

| Doc | Answers |
| --- | --- |
| `AGENTS.md` / `CLAUDE.md` | What are the rules here? |
| `CONTEXT.md` | What do the domain words mean? |
| `docs/adr/` | What was decided, and what was rejected? |
| `docs/research/` | What did we learn that informs, but doesn't settle, a decision? |
| Findings | What would nobody have guessed? |
| Execution logs, with the reasoning | What actually happened in the last run, and why? |
| `gotchas.md` | What silently does the wrong thing? |

A gotchas entry is one line each of symptom, cause and fix:

```markdown
- **`pkill -f <pattern>` matches the shell running it** and kills your own
  session. Use a bracket pattern (`pkill -f "[u]vicorn"`) or kill by PID.
```

**Memory is for preferences only.** How I like to work goes in memory. Facts about the code go in the repo, where they get reviewed.

## Rules written from failures

My `AGENTS.md` rules aren't best practices from a book. Each one exists because an agent did the opposite and it cost time. The core set:

- **Verify before you claim.** "The tests should pass" isn't a result. Run the command, read the output, quote the decisive line.
- **Exercise the real path.** Moved a file? Run the tests *and* the entry point. Changed a default? Print the resolved value.
- **Never suppress a diagnostic to make it quiet.** No bare `# noqa`, no widening the lint ignore list, no `skip`. A suppression names one code and states its reason on the same line.
- **Delete workarounds when the reason is gone.** Leaving both the fix and the shim is worse than either: the next reader can't tell which path is real.
- **Stay inside the scope you were given.** Mention the other bug; don't fix it in the same change.

Rules get better when they carry their evidence. "Don't use a first-byte-only watchdog" is easy to ignore. "One stall ran for 15,319 seconds under a 120-second first-byte deadline" isn't.

Before merge, new code goes through a review checklist filled row by row. That process is its own post: [An Opinionated Python Code Review Guide](/posts/python-code-review-guide/).

## Orchestrator and executor

On some repos I split the work between two agents. The **orchestrator** plans and reviews. The **executor** ([OpenCode](https://opencode.ai/), run headless) writes every byte. The orchestrator isn't allowed to edit source, not even a one-character typo.

That rule sounds extreme. It exists because a hand fix makes the execution log stop describing the tree, and every later review then reasons about a state that isn't on disk.

The loop is a small state machine:

```text
PLAN → EXECUTE → REVIEW → { COMPLETE | CORRECT }
```

- **Plan.** Write the steps into `TODO_PLAN.md`, each with its files and an acceptance command. Exactly one step is `ACTIVE`.
- **Execute.** Send the executor one self-contained brief for the active step. If the brief has an "and then", it's two steps.
- **Review.** Read the `git diff` *and* the log. Never the executor's summary alone.
- **Correct.** Send what's wrong and what right looks like into the same session. After three failed corrections, the step is `BLOCKED` and a human decides.

Every brief starts with the same line, for a reason explained below:

```text
You are the executor. Do not read AGENTS.md or .orchestrator/.
Do not run opencode. Do not edit .orchestrator/*.
```

Hung executor runs are detected by output growth, not by elapsed time. The wrapper allows 120 seconds to the first byte and then 300 seconds between bytes, and retries up to three times. Stray processes still get swept by hand:

```bash
# List every executor process with its age and CPU; kill by PID, never pkill -f
pgrep -x opencode | while read p; do ps -o pid=,etimes=,%cpu= -p "$p"; done
```

## Scaling out

- **A git worktree per task.** Parallel sessions never share a working tree, so they can't overwrite each other's changes.
- **A terminal workspace manager.** [herdr](https://herdr.dev/) runs each agent in a pane and marks it working, blocked or idle, so I see who's waiting on me without checking every pane.
- **Sessions that talk.** Claude Code sessions can message each other, which is how two agents avoid editing the same thing.

At work this becomes about 14 Claude sessions, managed by an orchestrator session. The shape is the same: one tracker ticket per session, one worktree per ticket, the orchestrator reviews, the sessions execute. Only the numbers change.

## What broke

The setup is a list of fixes for things that went wrong. These are the ones worth knowing about.

- **The executor's summary contradicted its own log.** One run ended with "the commit-message file didn't exist, so I didn't commit", directly below its own successful commit hash. Another listed changed files and left one out. That's why review reads the `git diff`, never the summary.
- **Runs hang silently.** Eighteen hangs measured between 324 seconds and 15,319 seconds, all at 0.2 to 2.1% CPU. Elapsed time carries no signal. A four-hour stall and a five-minute stall are the same bug, which is why the watchdog measures output growth. Three abandoned processes were once found still alive after 13.7, 12.8 and 3.3 hours.
- **A quota error looked exactly like a hang.** The provider rejected the request, the executor swallowed the error, printed nothing and stayed alive. The watchdog would have spent all three retries on an error no retry can clear. Now it checks the provider log for errors before calling silence a stall.
- **The executor promoted itself.** It read the orchestrator's rulebook, concluded it was the orchestrator, launched its own nested executor and edited the plan file. Hence the "You are the executor" line at the top of every brief.
- **The token filter hid a green test suite.** `rtk pytest` reported "No tests collected" on a suite that passes. It reads like a real failure, so the executor retried it for about ten minutes. Acceptance checks now run unfiltered, and every brief says so.
- **The context hook doesn't know what you're doing.** The CodeGraph prompt hook attaches code to every prompt, including prompts about writing prose, where it's ~15 KB of noise.

The last cost is the plainest one: **all of this is setup.** Hooks, rules, templates and a wrapper script are work, and each one exists because the version without it failed first.

## Setup checklist

The minimum to copy. It should take less than an hour.

- [ ] Install the tools:

  ```console
  # See each project's README for other platforms
  curl -fsSL https://raw.githubusercontent.com/rtk-ai/rtk/refs/heads/master/install.sh | sh
  npm i -g @colbymchenry/codegraph @ast-grep/cli
  sudo dnf install ripgrep jq   # or apt / brew
  ```

- [ ] Run `rtk init -g`. It installs the `PreToolUse` hook and an `RTK.md` instructions file.
- [ ] Add the rest to `~/.claude/settings.json`:

  ```json
  {
    "outputStyle": "Concise",
    "autoCompactEnabled": false,
    "statusLine": { "type": "command", "command": "bash ~/.claude/statusline.sh" },
    "hooks": {
      "UserPromptSubmit": [
        { "hooks": [{ "type": "command", "command": "codegraph prompt-hook" }] }
      ]
    }
  }
  ```

- [ ] Save the statusline script above as `~/.claude/statusline.sh`.
- [ ] Install the skills: `/plugin install mattpocock-skills@claude-plugins-official`, then run `setup-matt-pocock-skills` in each repo.
- [ ] Write a starter `AGENTS.md` (and a `CLAUDE.md` that contains `@AGENTS.md`):

  ```markdown
  # AGENTS.md

  ## Rules
  - Verify before you claim: run it, quote the decisive line.
  - Never suppress a diagnostic to make it quiet.
  - Stay inside the scope you were given.

  ## Where things live
  - Issues: GitHub (`gh`). Decisions: `docs/adr/`. Glossary: `CONTEXT.md`.
  - Traps: `docs/agents/gotchas.md`.

  ## Communication
  - After changes: a few bullets. What changed and why.
  ```

- [ ] Start a `gotchas.md`. Add a line the first time something costs you more than a few minutes.
- [ ] At 30% on the statusline: `/handoff`, `/clear`, "work from this handoff".

If you have questions or a setup that works better, let me know.
