# Mini Elite Helper

A clean, searchable Elite Dangerous resource directory. Find a tool by name or activity, save favorites, and keep your own website links close.

## v0.1

- **Directory:** 42 curated resources, text search, combined category filters, favorites-only view, and alphabetical or favorites-first ordering.
- **Tools:** 16 task shortcuts with direct provider links.
- **Saved:** local favorites and custom website bookmarks with editing, category filtering, tags, and deletion confirmation.
- Responsive light/dark interface with keyboard navigation and device-theme support.
- Static hosting on Cloudflare Workers, with direct-link routing.

Saved data stays in the browser and origin where it was created. Changing browsers, domains, or clearing site data starts a separate collection. If storage is unavailable, the site keeps working and explains that changes last for the visit.

## GitHub-only development

This initial implementation was authored through connected GitHub tools. Dependencies, builds, tests, and review images run on GitHub Actions runners; no local checkout is required.

Use GitHub's editor, github.dev, or the connected GitHub tools to edit files on a feature branch and open a pull request. The **Validate v0.1** workflow installs the pinned dependency lockfile, type-checks, builds, runs unit checks, and tests the built site through the Workers runtime.

Workflow artifacts contain the static build, browser report, screenshots, and a link-review report. Successful pushes to the initial feature branch also store review images on the separate [QA branch](https://github.com/masalaempire/WebEDHelper/tree/qa/v0.1-preview/qa/screenshots), with the tested source commit recorded in its review manifest. Screenshots use a test saved collection; real visitors start with an empty collection.

## Cloudflare Workers setup

When you are ready to host the site, connect this GitHub repository through Cloudflare Workers Builds.

| Setting | Value |
| --- | --- |
| Worker name | `webedhelper` |
| Repository | `masalaempire/WebEDHelper` |
| Root directory | Repository root |
| Production branch | `main` |
| Node version | `24` (set `NODE_VERSION=24` if needed) |
| Build command | `npm run build` |
| Deploy command | `npx wrangler deploy` |

The Worker name in the dashboard must match `wrangler.jsonc`. Static assets come from `dist`; SPA fallback handles direct visits and refreshes for `/tools`, `/saved`, and the app's unknown-page view. v0.1 needs no application secrets, database bindings, or backend script. The domain can be added after the first deployment.

See [Workers Builds](https://developers.cloudflare.com/workers/ci-cd/builds/) and [SPA routing](https://developers.cloudflare.com/workers/static-assets/routing/single-page-application/).

## Catalog maintenance

Edit `src/data/resources.json` to add or revise a resource. Keep IDs stable because favorites refer to them. Each entry has a name, maintained destination URL, original short description, recognized categories, tags, search keywords, resource type, and review date. Use one entry per resource; a provider's individual functions belong in `src/data/tasks.json`.

Desktop tools link to documentation or download pages and are clearly labeled. Paid tools say so in their descriptions and tags. The directory points users to external services; it does not download or launch companion software.

The link-review workflow records HTTP results and redirects. Access blocks, rate limits, and timeouts need manual review and do not establish that a service is offline. Check content as well as reachability when maintaining the catalog. The initial catalog excludes retired services such as CMDR's Toolbox.

## Commands

These commands run in CI or an optional cloud development environment:

```text
npm ci
npm run dev
npm run build
npm test
npm run test:e2e
npm run preview:worker
npm run deploy
```

Node 24 is used in CI. Build before starting a Workers preview or deployment. Browser tests require Chromium via `npx playwright install chromium`.

## Release boundary

CMDR accounts, Frontier APIs, live statistics, journal parsing, cloud synchronization, fleet dashboards, and saved non-website records are deferred. The first release is useful as a directory without those integrations.

This is an unofficial community project and is not affiliated with Frontier Developments. Resource names belong to their respective owners.
