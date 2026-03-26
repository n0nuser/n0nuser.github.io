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

- Hugo static site generator
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
- `content/about.md`, `content/now.md`, `content/resume.md`, `content/uses.md` for standalone pages
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

### Deployment Source of Truth

- Primary operational target: Cloudflare Pages
- GitHub Pages workflow has been removed/deactivated to avoid parallel deployment paths

### Existing Automation and Scripts

- Local script `deploy.sh` includes build + git add/commit/push to `master`
- Local script `editBlog.sh` includes LAN preview and editor/browser helpers

## Quality and Validation

- No active in-repo CI quality workflow is currently configured
- No centralized test suite file was detected in root-level package tooling
- Expected validation baseline:
  - Hugo build succeeds
  - Pages render and links resolve
  - Key routes load without runtime errors

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

1. Create or edit content using existing archetype/front matter patterns.
2. Preview with Hugo locally.
3. Validate generated output and key pages.
4. Commit with clear message.
5. Deploy according to current platform process.

## Canonical References

- `README.md`
- `config.toml`
- `deploy.sh`
- `editBlog.sh`
- `archetypes/default.md`
- `archetypes/page.md`
- `content/posts/personal_webpage/index.md`
