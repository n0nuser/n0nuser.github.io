---
slug: "programmers-to-orchestrators"
title: "From Programmers to Orchestrators: Working in the Code-Overload Era"
description: "AI made writing code cheap. The work moved to context, constraints and verification. What the evidence says, and what a team can change on Monday."
date: 2026-09-26
lastmod: 2026-09-26
author: "Pablo Jesús González Rubio"
coverAlt: "From Programmers to Orchestrators"
toc: true
draft: false
tags: [ "Software Development", "AI" ]
---

AI now writes most of the new code at some of the largest companies. It didn't make software engineering easier. It moved the hard part: **producing code stopped being the bottleneck, and proving it works became the job.**

This post covers what the evidence says about that shift. Each section ends with something a team can change on Monday.

It's written for engineers and tech leads who use AI assistants daily and feel they ship more code but not more value. For the concrete setup I use, see the companion post: [How I Work with AI Agents](/posts/how-i-work-with-ai-agents/).

## Code overload

The volume numbers are real:

- **Google:** in April 2026, Sundar Pichai said about [75% of Google's new code is AI-generated](https://www.semafor.com/article/04/24/2026/google-ceo-says-75-of-companys-new-code-is-ai-generated) and approved by engineers. The figure was about 25% in late 2024.
- **Amazon:** Andy Jassy said AI-assisted Java upgrades [saved an estimated 4,500 developer-years](https://x.com/ajassy/status/1826608791741493281) of work. An upgrade that took about 50 developer-days took a few hours.

The cost shows up downstream. In April 2026 the New York Times gave it a name, [code overload](https://www.thestar.com.my/tech/tech-news/2026/04/07/the-big-bang-ai-has-created-a-code-overload): teams produce more code than they can handle. One company in the article went from 25,000 lines of code a month to 250,000, and was left with a review backlog of about a million lines.

More code isn't more value. Every line has to be reviewed, secured, tested and maintained, and none of those got ten times faster.

**On Monday:** stop measuring lines, PRs or "percent AI-written". Measure what reaches users and what breaks after it does.

## The job moved

Shah Rahman's [practical guide to AI-native engineering](https://blog.bytebytego.com/p/a-practical-guide-to-becoming-an) frames the shift well. The engineer stops being the one who types the code and becomes the one who **orchestrates** agents that do.

Two ideas from it are worth keeping:

- **Vibe coding isn't engineering.** Describing what you want and accepting what comes back is fine for a prototype. It isn't a way to build a system other people depend on.
- **A time split: 40% context, 20% generation, 40% verification.** It's Rahman's recommendation, not a measured law. The shape matters more than the numbers: generation is the smallest slice.

The skills that matter change with it:

- **Decomposition:** splitting work into steps an agent can finish and a human can check.
- **Context engineering:** giving the agent the specs, rules and domain knowledge it would otherwise guess.
- **Specification:** stating what "done" means before any code is generated.

**On Monday:** before the next agent task, write down what "done" means as something you can check. If you can't, the task isn't ready for an agent.

## Verification is the new bottleneck

The best evidence on AI productivity is a randomised trial by [METR](https://arxiv.org/abs/2507.09089) (2025). Experienced open-source developers worked on their own repositories, with and without AI tools:

- With AI, tasks took **19% longer**.
- Before starting, the developers expected AI to make them **24% faster**.
- After finishing, they still believed it had made them **about 20% faster**.

The gap between felt speed and measured speed is the point. Generating code feels productive. Prompting, waiting, reading the output and correcting it don't feel like work, but they take the time.

Two more findings from [ByteByteGo's piece on verification](https://blog.bytebytego.com/p/why-code-verification-matters-more):

- **AI reviewing AI is weak.** Two similar models share the same blind spots. Their agreement is one opinion stated twice, not an independent check.
- **Verification is a stack of filters.** Type checkers, linters, tests, human review and production monitoring each catch a different class of error. None catches all of them.

GitHub's [guide to keeping quality high](https://github.blog/ai-and-ml/generative-ai/speed-is-nothing-without-control-how-to-keep-quality-high-in-the-ai-era/) adds a practical habit: write down the *why*. Issues, commit messages and PR descriptions that explain the reasoning are what the next human, or agent, needs to review the change.

**On Monday:** list the filters your code passes through before production. Add the cheapest missing one. A deterministic check beats another model's opinion.

## The codebase is the agents' memory

poteto (Lauren Tan) described [shipping 2,000 PRs in a month](https://www.youtube.com/watch?v=NjoZoUm85x0) with agents. The argument of the talk is that the limit isn't the number of agents, it's **trust**. More agents running before you trust their output only produce more bad PRs.

The talk and [pstack](https://github.com/cursor/plugins/tree/main/pstack), the skills and principles poteto published, share a few ideas that apply to any team:

- **The codebase teaches.** Agents copy what they find. One workaround left in place becomes the pattern the next changes follow.
- **Encode lessons in structure.** When a bad pattern appears, write the lint rule that forbids it. A rule in a doc gets skipped. A failing check doesn't.
- **A feature map.** A compact record of each user-facing feature: what it does, how to reach it, and its traps. Agents use it to find and verify features instead of guessing.
- **Prove it works.** Verify against the real artifact (run the feature, read the value, inspect the diff), not against a self-report or "it compiles".
- **Guard the context window.** An agent works better with less, well-chosen context.

The same logic shows up in language choice. [GitHub's Octoverse data](https://github.blog/ai-and-ml/generative-ai/how-ai-is-reshaping-developer-choice-and-octoverse-data-proves-it/) shows TypeScript became the most-used language on GitHub in August 2025. One reason given: types constrain what a model can generate. Declaring `x: string` rules out every non-string operation before the model writes a line.

**On Monday:** find the workaround in your codebase that agents keep copying. Fix the root cause, then add a check that fails if the workaround comes back.

## If you can measure it, agents can climb it

Anthropic's post on [making claude.ai 3x faster in two weeks](https://claude.dev/blog/how-we-made-claude-ai-faster/) is a good example of verification done right. The team ran the sprint from a single Slack channel, with Claude in every thread. Over 3,000 changes merged and the key journeys got 3.1x faster (geometric mean), with no customer-facing incidents reported.

What made it work was the measurement, not the model:

- **Deterministic metrics.** Wall-clock milliseconds are noisy in CI. They counted CPU instructions with Valgrind and `node --predictable`, plus React commits, DOM mutations and layout recalculations. Those counts don't change between runs.
- **One-way ratchets.** Each benchmark became a number that could only go down. A PR that made it worse failed.
- **Humans owned the hill.** People set the targets (like an 8.33 ms frame budget for 120 Hz displays), made the taste calls, and kept each thread narrow.

Meta's [capacity efficiency platform](https://engineering.fb.com/2026/04/16/developer-tools/capacity-efficiency-at-meta-how-unified-ai-agents-optimize-performance-at-hyperscale/) shows the same shape at a larger scale. Agents combine **tools** (standard interfaces to profiling data, code and configs) with **skills** (encoded expertise from senior engineers). Regression investigations went from about 10 hours to about 30 minutes, and the fix goes back to the original author as a PR for review.

Here's a minimal ratchet for CI. It counts the instructions a benchmark executes and fails if the count goes up:

```bash
#!/usr/bin/env bash
# Fail CI if a benchmark's CPU instruction count goes up. Lower counts become the new baseline.
set -euo pipefail

baseline_file=perf/baseline.txt
measure() {
  valgrind --tool=callgrind --callgrind-out-file=/dev/null \
    node --predictable bench/render.js 2>&1 >/dev/null \
    | awk '/Collected :/ { print $NF }'
}

count=$(measure)
baseline=$(cat "$baseline_file")
echo "instructions: $count (baseline: $baseline)"

if (( count > baseline )); then
  echo "FAIL: +$(( count - baseline )) instructions over the baseline" >&2
  exit 1
fi
if (( count < baseline )); then
  echo "$count" > "$baseline_file"
  echo "Improved. Commit perf/baseline.txt so the number can only go down."
fi
```

- Seed `perf/baseline.txt` with the current count once.
- An agent can now optimise against a number that doesn't lie, and CI stops it from giving back what it won.

**On Monday:** pick one slow path. Turn it into a deterministic number and a ratchet. Then point an agent at it.

## Security, briefly

Faster code generation also means faster mistakes in dependencies and inputs. Two risks are specific to agents:

- **Slopsquatting.** Models sometimes invent package names. Attackers register those names with malicious code, and an agent that installs what it "remembers" pulls it in.
- **Prompt injection.** Instructions hidden in a document, issue or web page the agent reads can take over what it does next.

The defence against the first is cheap: nothing enters the lockfile unless someone approved it.

```bash
#!/usr/bin/env bash
# Fail if the lockfile contains a package nobody approved.
set -euo pipefail

unknown=$(comm -23 \
  <(jq -r '.packages | keys[] | select(. != "") | sub(".*node_modules/"; "")' package-lock.json | sort -u) \
  <(sort -u deps-allowlist.txt))

if [ -n "$unknown" ]; then
  echo "Packages not in deps-allowlist.txt:" >&2
  echo "$unknown" >&2
  exit 1
fi
echo "All dependencies are allowlisted."
```

- It covers transitive dependencies too, so the first run lists everything. Review that list once.
- After that, a new name in a PR is a deliberate decision, not something an agent slipped in.

**On Monday:** add the allowlist check to CI, and give agents the least access that lets them finish the task.

## What stays valuable

In January 2025 Mark Zuckerberg predicted that [in 2025](https://fortune.com/2025/01/24/mark-zuckerberg-ai-engineer-capex-spend) AI would work as "a sort of midlevel engineer". Whether or not that happened where you work, the direction is clear: writing syntax is becoming a commodity.

What doesn't become a commodity:

- **Judgment:** knowing what's worth building, and when an answer that looks right is wrong.
- **Architecture:** designing systems that stay understandable to people and to agents.
- **Domain depth:** the business rule that isn't written down anywhere.
- **Verification:** building the environment that proves the work is right.

The question for every team is the same: **is your environment forcing agents toward good output, or letting generated code grow unchecked?**

If you want to see what such an environment looks like in practice, the companion post shows mine: [How I Work with AI Agents](/posts/how-i-work-with-ai-agents/).

## Further reading

- [A Practical Guide to Becoming an AI-Native Engineer](https://blog.bytebytego.com/p/a-practical-guide-to-becoming-an), Shah Rahman (ByteByteGo): orchestration, the 40/20/40 split, and the agentic development life cycle.
- [Why Code Verification Matters More Than Ever in the Age of AI](https://blog.bytebytego.com/p/why-code-verification-matters-more) (ByteByteGo): why AI-on-AI review fails and how to layer verification.
- [Measuring the Impact of Early-2025 AI on Experienced Open-Source Developer Productivity](https://arxiv.org/abs/2507.09089) (METR): the randomised trial behind the 19% figure.
- [How we made claude.ai 3x faster in two weeks](https://claude.dev/blog/how-we-made-claude-ai-faster/) (Anthropic): deterministic benchmarks, ratchets and human steering.
- [Capacity Efficiency at Meta](https://engineering.fb.com/2026/04/16/developer-tools/capacity-efficiency-at-meta-how-unified-ai-agents-optimize-performance-at-hyperscale/) (Engineering at Meta): tools plus skills for performance work at scale.
- [How I Shipped 2000 PRs Last Month](https://www.youtube.com/watch?v=NjoZoUm85x0), poteto (Lauren Tan), and [pstack](https://github.com/cursor/plugins/tree/main/pstack): trust before throughput.
- [How AI is reshaping developer choice](https://github.blog/ai-and-ml/generative-ai/how-ai-is-reshaping-developer-choice-and-octoverse-data-proves-it/) (GitHub): why typed languages and AI work well together.
- [Speed is nothing without control](https://github.blog/ai-and-ml/generative-ai/speed-is-nothing-without-control-how-to-keep-quality-high-in-the-ai-era/) (GitHub): guardrails and documenting the why.
- [The big bang: AI has created a code overload](https://www.thestar.com.my/tech/tech-news/2026/04/07/the-big-bang-ai-has-created-a-code-overload), Mike Isaac and Erin Griffith (New York Times, syndicated).

If you have questions or disagree with any of this, let me know.
