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

## Blog Post Writing Style

Use this style when creating or editing files under `content/posts/`.

### Distinctive Style Profile (from existing posts)

- **Tone**: practical, friendly, and mentor-like; write as a hands-on peer explaining real usage, not as an academic textbook.
- **Vocabulary**: plain technical English, command-first language, security/Linux/web-dev terms; avoid unnecessary jargon and explain uncommon terms in one line.
- **Sentence structure**: mostly short/medium sentences with direct guidance, then occasional longer explanatory paragraphs for context or tradeoffs.
- **Rhetorical devices**: direct second-person address ("you"), light emphasis (`**bold**`, *italics*), occasional rhetorical questions, caution notes, and occasional light humor.
- **Pacing**: fast start, then step-by-step execution blocks; alternate between explanation and actionable snippets; close with a concise wrap-up and optional invitation for questions.

### Authoring Rules for New Posts

- Start with a short intro explaining what the reader will achieve and for whom the post is intended.
- Organize with clear `##` and `###` sections in execution order (install/setup/configure/test/troubleshoot/conclusion).
- Prefer practical commands, config snippets, and examples over theory-heavy exposition.
- Add one short explanation before or after each code block to clarify purpose and expected result.
- Use concise lists/tables/checklists to improve scanability for operators and quick reference readers.
- Include caveats and safety notes when a command is risky, privileged, destructive, or security-sensitive.
- Keep language approachable and direct; avoid overly corporate or overly academic phrasing.
- End with a compact conclusion, practical next step, or reference links for deeper reading.

### Prompt Template (Style Mimic)

Use this prompt when generating a new post draft:

> Write a technical blog post in the style of this site:
>
> - Voice: friendly, practical mentor; direct but not formal.
> - Audience: beginner-to-intermediate technical readers.
> - Structure: intro -> step-by-step sections -> conclusion.
> - Writing pattern: alternate short explanations with actionable commands/config snippets.
> - Tone details: use "you" language, occasional light humor, and concise caution notes for risky steps.
> - Vocabulary: plain technical English; explain uncommon terms briefly.
> - Pacing: keep momentum high with clear progression and minimal fluff.
> - Output quality: accurate, reproducible instructions with concrete examples and expected outcomes.

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

## Deployment Note

- Typical Cloudflare deployment time is about 2 minutes.
