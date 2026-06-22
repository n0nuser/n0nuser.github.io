# Improvement Plan — UI/UX, SEO, and Content

> Source: live audit on 2026-06-18 (Hugo `0.162.1` run locally, inspected via Playwright across
> desktop/mobile + light/dark) plus a full read of SEO infrastructure, layouts, and every post's
> front matter. This plan is the source of truth for the follow-up work. Check items off as they land.

## Goals

1. Bring the site up to modern (2026) UI/UX expectations for a technical blog.
2. Close the remaining SEO gaps on an already-strong foundation.
3. Standardize content on the newer narrative style and fix quality issues.
4. Grow attraction with flagship backend content and better content structure.

## Guardrails

- Implement only what each task describes; keep changes minimal and reviewable.
- Preserve existing style/conventions (see `AGENTS.md`, `docs/project-guide.md`).
- Validate every change in desktop + mobile and light + dark before marking done.
- Run `npm run lint` and confirm a clean `hugo --gc --minify` build before finishing a phase.
- Ignore the Playwright MCP Discord overlay; it is not part of the site.
- Branch per phase; PR order `feature -> develop -> main` (see `contributing.md`). Do not push/deploy unless asked.

---

## Phase 1 — UI/UX quick wins

High-impact, low-risk. Each is self-contained.

- [x] **Code copy-to-clipboard buttons.** Add a copy button to every fenced code block (highest-value
      miss for a command-heavy blog). Implement in `layouts/partials/processed-content.html` or a small
      JS in `layouts/partials/myscripts.html`; style in `assets/scss`. Must work with the custom Chroma
      classes (`useCustomChroma = true`). Accessible button (`aria-label`, focus ring, "Copied" state).
- [x] **Post discovery loop.** At the end of `layouts/_default/single.html` add:
  - Related posts (by shared tags, 3 max, exclude current).
  - Prev/next navigation within the section.
  - A "Back to all posts" link.
- [x] **Header search affordance.** Surface search beyond `/posts/` — a header search icon/link
      (`layouts/partials/header.html`) routing to the existing search page.
- [x] **Second hero CTA.** In `content/_index.md` add a secondary action next to "Read latest posts"
      (e.g. *View résumé* or *Get in touch*). Keep the existing `.btn` styling.
- [x] **Fix deprecated PWA meta.** In `layouts/partials/head.html` add
      `<meta name="mobile-web-app-capable" content="yes">` alongside the existing
      `apple-mobile-web-app-capable` (resolves the live console warning).

### Acceptance
- No new console errors/warnings; copy buttons work in both themes; related/prev-next render correctly
  on a post with and without shared tags.

---

## Phase 2 — Accessibility & responsive polish

- [ ] **Hero highlight contrast.** Verify dark text over mint/pink highlights and the pale-yellow
      "HEY THERE!" meets WCAG 2.2 AA (>= 4.5:1) in light mode; adjust highlight shades if borderline.
- [ ] **TOC on mobile.** Collapse the TOC by default on small viewports (it currently ships `open` and
      pushes content far down on long posts). Optionally add a sticky right-rail TOC on desktop.
- [ ] **Image formats.** Convert older `.png`/`.jpg` post screenshots and covers to WebP/AVIF via the
      render-image hook (`layouts/_default/_markup/render-image.html`) or by re-encoding assets, to
      improve LCP. Keep `coverAlt`/alt text intact.
- [ ] **Breadcrumb UI** on deep pages (pairs with Phase 3 breadcrumb schema).

### Acceptance
- axe-style pass shows no new serious/critical issues; Lighthouse/PSI LCP not regressed.

---

## Phase 3 — SEO

Strong foundation already (titles, descriptions, canonical, OG/Twitter, Article + WebSite schema, RSS,
sitemap, manifest, hreflang, sameAs). Close the gaps:

- [ ] **Surface the 14 HTB writeups.** They exist under `content/writeups/htb/` but the nav is commented
      out in `config.toml` and nothing links to them internally. Add a `/writeups` index and/or nav entry.
- [ ] **Topic-cluster internal linking.** Cross-link the Linux series (audit, backup, processes,
      startup, users, filesystem, disk management, security) as a "series" so they reinforce each other.
- [x] **Schema enhancements** in `layouts/partials/head.html`:
  - [x] Add `SearchAction` to the WebSite JSON-LD (sitelinks search box).
  - [x] Add `Person` / `ProfilePage` schema on home + about (reuse the existing `sameAs` array).
  - [x] Add `BreadcrumbList`.
  - [x] Add `HowTo` schema to step-by-step posts (`ssh`, `wireguard`, `emailserver`).
  - [x] Resolve the `datePublished` TODO already noted in the template.
- [ ] **Title/description intent.** Rewrite terse titles toward search intent without losing voice
      (e.g. "Linux - Backup" -> "How to Back Up a Linux Server: rsync, tar, and Automated Snapshots").
- [ ] **Freshness signals.** Add/refresh `lastmod` on cornerstone posts so they read as maintained.
- [x] **Config consistency.** Fix "Pablo Gonzalez" (no accent) in `config.toml` description.

### Acceptance
- Rich Results Test passes for Article, WebSite (SearchAction), Person, BreadcrumbList, and HowTo where
  applied; HTB writeups reachable within 2 clicks from the homepage.

---

## Phase 4 — Content quality & standardization

- [x] **WIP / thin content triage:**
  - `software_dev_best_practices` ("- WIP") is published — finish it, set `draft: true`, or `noindex`.
    Content was already complete; dropped the stale "- WIP" suffix from the title.
  - `fyp` — add a real `description`; remove the empty `tags: [""]` (junk taxonomy page). Done (stays `draft: true`).
  - `crypto_notes` — thin and off-brand; `noindex` or retag. Set `noindex: true`.
- [x] **Copy fixes:** `sudo systemclt` -> `systemctl` (wireguard), "operative system" -> "operating
      system", "considerate" -> "consider", and a general typo sweep. Also fixed "Operative System" in
      `Bash_Cheatsheet` and a stray duplicated-word typo in `crypto_notes`.
- [ ] **Style standardization:** adopt the newer narrative template (homelab/microservices) as canonical;
      backfill older "class notes" Linux posts over time (intro -> ordered sections -> code + one-line
      explainer -> tables/checklists -> "What worked well" -> conclusion). Deferred — large content
      rewrite, not a quick pass; acceptance for this phase doesn't require it.
- [x] **Front matter normalization:** ensure every post has `description`, `lastmod`, non-empty `tags`.

### Acceptance
- No published post titled WIP; no empty descriptions/tags; spell-check clean.

---

## Phase 5 — Growth: new content & structure

Brand = Python backend engineer; biggest momentum = homelab post. Ranked by ROI.

- [ ] **Flagship: "How I made financial endpoints 2-4x faster with Redis caching."** Cited on the
      homepage/resume — turn into a case study (key design, invalidation, stampede protection, measurement).
- [ ] **"API-first microservices with FastAPI in production"** — sequel to the microservices-vs-monolith
      post (OpenTelemetry, resilience/retries, pydantic settings). Forms a backend cluster.
- [ ] **"Structured logging, metrics & tracing in Python."**
- [ ] **Homelab follow-ups:** backups with `restic` (the post itself flagged this gap), SWAG + CrowdSec
      deep dive, Grafana/Prometheus monitoring.
- [ ] **Security back-catalog refresh:** modernize RFID / RubberSpark / P4wnP1 and bundle as a
      "hardware hacking" series with cross-links.
- [ ] **`/projects` page** showcasing GitHub repos (recruiter-facing; work is currently invisible).
- [ ] **`/now` page** (nav convention already reserved).
- [ ] **Topic-cluster landing pages** (`/linux`, `/backend`).

### Acceptance
- Flagship Redis post published in the canonical style; `/projects` live and linked from nav.

---

## Validation checklist (per phase)

1. `hugo server` renders without console errors (desktop 1440px + mobile 390px, light + dark).
2. `npm run lint` clean.
3. `hugo --gc --minify` builds clean.
4. SEO changes verified in Google Rich Results Test where applicable.
5. Changes scoped, reversible, and free of sensitive identifiers.

## Suggested execution order

Phase 1 (quick wins) -> Phase 3 schema items (cheap, high SEO value) -> Phase 4 triage -> Phase 2 polish
-> Phase 5 content (ongoing). Start the flagship Redis post in parallel anytime.
