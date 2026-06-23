# Contributing

How to land changes in this repo, based on **actual git history** (merge commits and GitHub PRs), not a generic workflow.

## Branch roles

| Branch | Role |
|--------|------|
| `main` | What ships / what production (e.g. Cloudflare Pages) tracks. |
| `develop` | Integration branch: day-to-day work lands here first **when it exists**. As of 2026-06-23 it has been deleted upstream — verify with `git ls-remote origin develop` before assuming it's there (see checklist below). |
| `feature/<topic>` | Short-lived branch for a focused change set (recommended for PRs). |

Historically, work has often been committed directly on `develop`, then promoted. For **new contributors and LLM agents**, prefer a **feature branch + PR** so review and scope stay clear.

## How changes reach `main` (observed pattern)

1. **If `develop` exists upstream**: work is integrated there first (commits and/or PRs into `develop`), then promoted to `main` via a PR using a **merge commit** (messages look like `Merge pull request #N from n0nuser/develop`).
2. **If `develop` does not exist upstream** (current state): PR the feature branch straight into `main`.
3. **`develop` is sometimes synced from `main`** with a merge (messages like `Merge remote-tracking branch 'origin/main' into develop`) so both lines stay aligned after a release, on the occasions `develop` exists.

There is **no evidence** in recent history of `main` being advanced by rebase-only or squash-only promotion; the default integration style here is **merge**.

```mermaid
flowchart LR
  feature[feature_topic] --> prDev[PR_into_develop_if_it_exists]
  prDev --> develop[develop]
  develop --> prMain[PR_develop_into_main]
  feature --> prMainDirect[PR_into_main_if_develop_is_absent]
  prMain --> main[main]
  prMainDirect --> main
```

## Standard flow (recommended)

### 0. Check whether `develop` exists upstream

```powershell
git fetch origin --prune
git ls-remote origin develop
```

If that prints nothing, `develop` is gone — skip straight to step 2 and target `main` in step 5/6.
Don't trust a local `remotes/origin/develop` ref alone; it can be stale until you `--prune`.

### 1. Start from current integration branch

```powershell
git checkout develop   # or main, if develop doesn't exist (see step 0)
git pull origin develop   # or main
```

### 2. Create a feature branch

```powershell
git checkout -b feature/your-topic
```

Use a short, kebab-style topic: `feature/seo-notes`, `feature/fix-search`, etc.

### 3. Make changes and validate

Follow [docs/project-guide.md](docs/project-guide.md) for Hugo, lint, and deploy notes.

### 4. Commit with a clear message

This project uses **Conventional Commits**-style subjects in recent history, for example:

- `feat: ...`
- `fix: ...`
- `chore: ...`
- `docs: ...`

Keep the subject imperative and under ~72 characters when possible.

### 5. Open PR → `develop` (or `main` if `develop` doesn't exist, per step 0)

```powershell
git push -u origin feature/your-topic
gh pr create --base develop --head feature/your-topic --title "..." --body "..."
# if develop is absent:
gh pr create --base main --head feature/your-topic --title "..." --body "..."
```

Prefer **Create a merge commit** on GitHub when merging the PR (matches existing history). If your repo settings force squash or rebase, follow the setting—but then local expectations may differ from the merge-based history above.

Repository note (current behavior): GitHub merge methods for this repo currently allow **MERGE commit** and reject squash/rebase for PR merge + auto-merge operations. When using `gh pr merge`, prefer `--merge`.

### 6. After merge: promote `develop` → `main` (when ready to release, and only if `develop` exists)

When `develop` contains what you want live:

```powershell
git checkout develop
git pull origin develop
gh pr create --base main --head develop --title "..." --body "Promote develop to main."
```

Merge that PR the same way you merged into `develop`.

### 7. Keep `develop` aligned with `main` (as needed)

If `main` moved and you need those commits on `develop`:

```powershell
git checkout develop
git pull origin develop
git merge origin/main
# resolve conflicts if any, then:
git push origin develop
```

## If you hit merge conflicts

1. Run `git status` and fix files Git lists.
2. Prefer minimal edits: keep intent from both sides when both matter.
3. `git add` the resolved paths, then `git commit` (completes the merge).
4. Push the branch and finish the PR.

## LLM / agent checklist (copy-paste discipline)

Use this so automated helpers do not smuggle unrelated edits into a PR.

- [ ] **Base branch exists**: run `git fetch origin --prune && git ls-remote origin develop` before opening a PR; don't assume `develop` exists just because a local/stale remote-tracking ref shows it.
- [ ] **Branch**: created from up-to-date `develop` (or `main`, if `develop` is absent) as `feature/<topic>`.
- [ ] **Scope**: only intentional paths are staged (`git diff --staged`).
- [ ] **No secrets**: no API keys, tokens, or personal identifiers in commits.
- [ ] **Destructive git**: no `git reset --hard`, force-push, or history rewrite unless the human explicitly asked.
- [ ] **Push / deploy**: only when the human asked for that step.
- [ ] **Promotion order**: if `develop` exists, merge there first and open `develop` → `main` only when releasing; if it doesn't exist, PR straight into `main`.
- [ ] **Document**: if you change how we work, update this file and the relevant section in [docs/project-guide.md](docs/project-guide.md).

## Quick reference

- Project guide: [docs/project-guide.md](docs/project-guide.md)
- Agent rules: [AGENTS.md](AGENTS.md)
