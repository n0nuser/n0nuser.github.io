# Project Guide

## Purpose

This document is the primary project reference for contributors and AI agents.

It describes architecture, workflows, conventions, and operational history at a practical level.

## Project Overview

- Personal technical website built with Hugo
- Content-first structure with posts, pages, and writeups
- Theme-based frontend with project customizations
- Progressive Web App support via static assets

## Technology Stack

### Core

- Hugo static site generator (current version: v0.159.1)
- Go-template based Hugo layouts/shortcodes
- Markdown content in leaf bundles and page files
- Theme customization based on Color Your World

### Frontend Assets

- Vendored search library (`assets/libs/fuse.js@6.4.6/`)
- Vendored lazy-loading library (`assets/libs/lazysizes@5.2.2/`)
- Custom static assets under `static/`

### Configuration

- Main site configuration in `config.toml`
- Deployment/build behavior is Cloudflare-first (no active GitHub Pages workflow)
- Ignore/build artifact policy in `.gitignore`

## Repository Structure

```text
n0nuser.github.io/
├── content/          # Posts, pages, writeups, section indexes
├── layouts/          # Hugo templates and shortcodes
├── themes/           # Hugo theme source
├── static/           # Static files (PWA assets, media, misc)
├── assets/           # Processed assets and vendored JS libs
├── archetypes/       # Content templates/front matter defaults
├── .github/workflows/# CI/CD definitions (currently inactive/empty for Hugo deploy)
├── config.toml       # Site configuration
└── README.md         # Top-level project summary
```

## Content Model and Conventions

### Content Areas

- `content/posts/` for technical articles
- `content/writeups/htb/` for HTB writeups
- `content/about.md`, `content/resume.md`, `content/uses.md` for standalone pages
- `content/search/index.md` for search page configuration

### Front Matter Patterns

- Most content files use YAML front matter (`---`)
- Some section index files use TOML front matter (`+++`)
- Common post fields:
  - `title`, `description`, `date`
  - `author`, `cover`, `coverAlt`
  - `toc`, `tags`, optional `draft`/`lastmod`

### Naming and Structure

- Predominant pattern is leaf bundles: `content/<section>/<slug>/index.md`
- Existing names are not fully normalized (mixed underscore and capitalization styles)
- Recommendation for new content: prefer lowercase and hyphen/underscore consistency

## Build, Run, and Deploy Workflows

### Local Development

- Direct Hugo run:
  - `hugo server`
- LAN preview pattern used in repo scripts:
  - `hugo server --bind <local-ip> --baseURL http://<local-ip>:1313`

### Build

- Standard production build:
  - `hugo --gc --minify`
- Cloudflare-like local Linux build via Docker:
  - `.\build-cf.ps1`
- Lint and validation suite:
  - `npm run lint`

### Deployment Source of Truth

- Primary operational target: Cloudflare Pages
- GitHub Pages workflow has been removed/deactivated to avoid parallel deployment paths
- Typical Cloudflare deployment time is about 2 minutes

### SEO and Search Operations

- Google Search Console property has been added for this site.
- Ads policy: no ads are served on this site; keep `ads.txt` aligned with this policy if published.
- Crawler policy source of truth is Cloudflare's managed `robots.txt` (Content-Signal directive and AI-bot disallow list). The repo file `static/robots.txt` only carries the `Sitemap:` reference to avoid duplicate `User-agent: *` blocks in the served output.
- Response headers are configured via `static/_headers` (Cloudflare Pages format). HSTS is set to `max-age=31536000` (1 year) without `includeSubDomains` and without `preload`. To enable `includeSubDomains`, first confirm every subdomain serves HTTPS correctly. `preload` should only be added after an explicit decision because submission to the HSTS preload list is effectively permanent.
- If the Cloudflare dashboard HSTS setting (SSL/TLS -> Edge Certificates -> HSTS) is also enabled, align it with the `_headers` value or disable it to avoid duplicate `Strict-Transport-Security` headers in responses.

### Existing Automation and Scripts

- Local script `deploy.sh` includes build + git add/commit/push to `master`
- Local script `editBlog.sh` includes LAN preview and editor/browser helpers
- Local script `build-cf.ps1` runs `hugo --gc --minify` in Docker (`hugomods/hugo:debian-dart-sass-node-git-non-root-0.159.1`) to mirror Cloudflare Pages build behavior
- Node-based lint scripts in `package.json` include template sanity checks, SCSS linting, markdown linting, and native Hugo build validation

## Quality and Validation

- No active in-repo CI quality workflow is currently configured
- No centralized test suite file was detected in root-level package tooling
- Expected validation baseline:
  - Hugo build succeeds
  - Pages render and links resolve
  - Key routes load without runtime errors

### UI/UX Validation Procedure (Current Practice)

- Validate homepage and header behavior at minimum in:
  - desktop (`~1440px`)
  - mobile (`~390px`)
  - both light and dark mode
- Prefer interactive audits (Playwright or equivalent) covering:
  - visual hierarchy
  - spacing/alignment
  - accessibility basics (target size, labels, contrast signals)
  - responsive behavior
  - console/runtime errors
  - broken interactions
- If automated overlays/widgets appear during testing, treat them as potential test noise and verify whether issues reproduce without overlay interference.
- **Playwright MCP only:** a purple Discord invite card (`mcp-discord-container` / "Join Discord Community") is injected by the Playwright MCP tool, not by Hugo layouts or site scripts. Exclude it from site UX scores and do not add CSS or layout workarounds unless the same overlay appears in a normal browser session.

### Manual UX Scoring Workflow

When the user explicitly asks to "get the score", run the project skill at `.cursor/skills/ux-scoring/SKILL.md` and return a structured score report that includes:

- Nielsen's 10 heuristics with weighted scoring and recommendations
- WCAG 2.2 AA audit results (axe-core style severity and affected elements)
- Persona-based findings (built-in profiles plus up to five custom personas when provided)
- Analysis mode selection (Quick, Deep, or Custom heuristic subset)
- Vision-oriented observations from full-page screenshots (hierarchy, color harmony, CTA visibility)
- Detailed 0-100 per-heuristic scoring with quick wins and priority matrix
- Privacy note confirming BYOK/no telemetry assumptions when applicable
- Optional heatmap/highlight-ready issue mapping so findings can be overlaid on-page

This scoring workflow is manual and analyst-driven unless the user asks for additional automation.

### Current Navigation/UI Conventions (May 2026)

- Mobile header uses an always-visible nav row under the brand (no collapsible menu button).
- `/uses` stays as a top-level nav label (standard personal-site convention).
- `/now` is optional and should only be shown when actively maintained.
- Nav links should keep underlines visually close to text.
- Tap targets should remain touch-friendly (`>=44px`) without creating large visual gaps.
- Homepage recent-post metadata is shown inline as: `date · reading time`.

## Security and Privacy Notes

- This document intentionally omits personal identifiers and direct contact handles
- Treat third-party integration identifiers as configuration values, not documentation defaults
- Do not store secrets in repository content or config files

## Operational Constraints

- `set -e` in `deploy.sh` enforces fail-fast script execution
- Build artifacts (`public/`, `resources/`) are intentionally ignored in VCS
- `markup.goldmark.renderer.unsafe = true` enables raw HTML in markdown; use carefully

## Selective History Highlights

The following milestones were extracted with a low-cost strategy (recent window + keyword pivots), not full-history exhaustive diff ingestion.

- Migration direction toward Cloudflare Pages is documented in project content/history
- Workflow evolution historically included Hugo CI and Lighthouse audits
- Analytics transitions:
  - removed Google Analytics
  - later adoption of Umami-related analytics
- Prior removal of Netlify CMS and addition of PWA functionality

## Recommended Contributor Workflow

For branch strategy, PR order (`feature` → `develop` → `main`), and merge-based integration as used in this repo, see [contributing.md](../contributing.md).

1. Create or edit content using existing archetype/front matter patterns.
2. Preview with Hugo locally.
3. Validate generated output and key pages.
4. Commit with clear message.
5. Deploy according to current platform process.

## Canonical References

- [contributing.md](../contributing.md)
- `README.md`
- `config.toml`
- `deploy.sh`
- `editBlog.sh`
- `archetypes/default.md`
- `archetypes/page.md`
- `content/posts/personal_webpage/index.md`
