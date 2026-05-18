---
name: ux-scoring
description: Perform manual UI/UX scoring for webpages using Nielsen heuristics, WCAG findings, persona-based analysis, and priority recommendations. Use when the user asks to "get the score", requests UX scoring, asks for UI/UX audit scoring, or wants a weighted heuristic evaluation report.
---

# UX Scoring

## Purpose

Use this skill to generate a manual, stakeholder-ready UX score report for a page or flow.

## Inputs To Collect

Gather the minimum required inputs before scoring:

1. Target URL or local route to evaluate
2. Analysis mode:
   - `Quick` (fast pass)
   - `Deep` (full pass)
   - `Custom` (specific heuristics selected by user)
3. Device + theme coverage (desktop/mobile, light/dark)
4. Persona set:
   - Use default personas if none provided
   - Accept up to five custom personas with age, tech level, accessibility needs, and goals

If any input is missing, ask concise follow-up questions and continue once provided.

## Scoring Dimensions

Evaluate and score all requested dimensions:

1. Nielsen's 10 heuristics (weighted)
2. WCAG 2.2 AA issues (severity-tagged findings)
3. Vision analysis observations from full-page screenshots:
   - visual hierarchy
   - color harmony/contrast signals
   - CTA visibility and discoverability
4. Persona impact

## Suggested Heuristic Weights

Use this default weighting unless the user provides custom weights:

- Visibility of system status: `10%`
- Match between system and real world: `10%`
- User control and freedom: `10%`
- Consistency and standards: `10%`
- Error prevention: `12%`
- Recognition rather than recall: `10%`
- Flexibility and efficiency of use: `8%`
- Aesthetic and minimalist design: `10%`
- Help users recognize, diagnose, recover from errors: `10%`
- Help and documentation: `10%`

## Scoring Method

For each heuristic:

1. Assign a `0-100` score
2. Record key evidence
3. Add at least one actionable fix suggestion
4. Mark quick wins (`Yes/No`)
5. Assign priority (`Critical`, `High`, `Medium`, `Low`)

Then compute:

- Weighted heuristic total (`0-100`)
- WCAG severity summary (`critical/serious/moderate/minor`)
- Overall UX score (`0-100`) with short rationale

## Required Report Sections

Return results in this order:

1. Overall score snapshot
2. Nielsen heuristic breakdown (0-100 each + weighted contribution)
3. WCAG findings summary (with affected elements/components)
4. Persona impact notes
5. Vision analysis notes
6. Priority matrix (`Critical` -> `Low`)
7. Quick wins list
8. Estimated fix effort/cost bands (`S`, `M`, `L`)
9. Privacy note (BYOK/no telemetry assumptions)
10. Optional export-ready markdown block (for PDF/Markdown handoff)

## Heatmap And Highlight Mapping

When possible, include a compact issue map so findings can drive:

- heatmap overlays (critical=red, moderate=yellow, minor=green)
- hover-to-highlight behavior mapping issue -> target selector/component

If selectors are unavailable, provide best-effort component/location labels.

## Mode Rules

- `Quick`: focus on highest-impact heuristics, key WCAG issues, and top quick wins.
- `Deep`: run the complete framework with full breakdown and larger fix matrix.
- `Custom`: score only user-selected heuristics and clearly mark skipped ones.

## Response Style Rules

- Keep output concise but complete.
- Use actionable language and avoid generic advice.
- Flag assumptions explicitly.
- Never claim automated scans were run unless they were actually executed in the session.

## Playwright / Test Environment Notes

When scoring via Playwright MCP:

- Ignore the purple **Discord promo overlay** (`mcp-discord-container`, "Join Discord Community", "Get Premium FREE"). It comes from the Playwright MCP browser, not this repository.
- Do not count it as a site defect, heatmap issue, or recommended fix unless the user confirms the same widget in a normal browser (no Playwright).
- Mention it briefly under assumptions if it appeared during capture, so stakeholders are not confused.
