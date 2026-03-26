# AGENTS.md

## Scope

This file defines how agents should operate in this repository.

Detailed project documentation lives in `@docs/project-guide.md`.

## Primary Project Reference

- Read `@docs/project-guide.md` before making changes.
- Treat `@docs/project-guide.md` as the source for architecture, workflows, content model, and project history highlights.

## Core Working Rules

- Implement only what is requested.
- Keep changes minimal, clear, and easy to review.
- Preserve existing content and style conventions unless explicitly asked to change them.
- Prefer consistency with existing files over introducing new patterns.

## Safety Rules

- Never run destructive git commands without explicit approval.
- Never push or deploy unless explicitly requested.
- Avoid committing generated artifacts unless required by repository policy.
- Keep sensitive identifiers out of new documentation and code comments.

## Documentation Rules

- For project-level details, update `@docs/project-guide.md` instead of duplicating long explanations here.
- If process or architecture changes, update both:
  - `@docs/project-guide.md` (detailed explanation)
  - `AGENTS.md` (brief operational note if agent behavior changes)

## Validation Checklist

Before finalizing work:

1. Confirm instructions were followed exactly.
2. Confirm references to project behavior match `@docs/project-guide.md`.
3. Confirm no sensitive personal identifiers were introduced.
4. Confirm changes are scoped and reversible.

## Quick References

- Project guide: `@docs/project-guide.md`
- Main config: `config.toml`
- CI workflow: `.github/workflows/hugo.yml`
- Scripts: `deploy.sh`, `editBlog.sh`
