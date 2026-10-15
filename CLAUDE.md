# CLAUDE.md

Personal site of Burak Üren (backend engineer) at https://burakuren.com. Static Astro 7 site, content edited in Sveltia CMS, served by Cloudflare Workers. See `README.md` for the user-facing overview; this file holds what an agent needs to work on it safely.

## Commands

```sh
npm run dev        # astro dev on :4321; drafts visible; CMS at /admin/index.html (not /admin/)
npm run check      # astro check: types + content schemas. Run before every push.
npm run build      # static build into dist/
npm run preview    # build + wrangler dev on :8787 (real _headers/_redirects)
npm run images     # regenerate public/og.png (headless Chromium, needs network for fonts) + icons from profile.yml and src/assets/burak.jpg
npm run deploy     # manual site deploy (normally CI does it)
```

`astro dev` daemonizes in Astro 7; stop it with `npx astro dev stop`. `wrangler dev` hot-reloads `dist/` and can serve a stale/half-written build if you rebuild while it runs; restart it after `npm run build`.

## Design source

- Design lives under `design/` (gitignored, local only). The current one is `design/v2/`: static HTML mockups (`index.html`, `blog/index.html`, `blog/post.html`, `og/og.html`) with `styles.css`, screenshots in `screens/`, the spec in `HANDOFF.md` and reasoning in `README.md`. v2 shipped on 2026-10-15; the copy HANDOFF.md lists as unconfirmed has been confirmed by the owner (MatFabe's third result became "Every release checked by an automated test suite before it ships"), and its sample posts, Fig. 1 and pager link were never ported on purpose. Older Claude Design exports are self-extracting bundles; read them with `python3 -I scripts/unpack-design.py "design/<file>.html" <out-dir>`.
- Visual language (v2): plain English first, terminal as an accent. Plain section headings ("How I can help", "Experience", "About me", "Skills and tools", "Blog"), no explainer lines under them. The terminal shows up only as accents: the `~ ❯` mark, the name in JetBrains Mono 700, `--flag` service labels, the git-graph rail in Experience, and "Technical details" styled as terminal output. IBM Plex Sans for prose, JetBrains Mono only for code, tool names, tags, the email and the name. Metrics are always bold (`**x**` in CMS text, rendered by `src/lib/inline.ts`). Links side by side use `.link-row` (icon + label, LinkedIn, GitHub, then extras). Don't reintroduce man-page labels (`NAME`, `UREN(1)`, `$ cat ...`).
- Theme tokens are CSS custom properties in `src/styles/global.css`. The site is dark only (the light theme and its toggle were removed on purpose). Colours must come from tokens, not literals.
- Header (all pages): sticky; `~ ❯` + name (links home; on `/` it scrolls to top via `src/lib/scroll-top.ts`), "Blog", LinkedIn/GitHub/RSS icon links (from the `IconSprite.astro` sprite), "Download CV". No section nav or menu toggle; under 520px the `~ ❯` mark and the CV button hide. No floating back-to-top button (a fixed bottom element made Firefox Android's bottom toolbar reappear and shift the page).
- Section links: home h2s use `SectionTitle.astro`: a link icon at the right end of the heading row, same place in every section at every width (a `#` before or after the text was tried: no room in the mobile gutter, and it orphaned or forced wraps on the long contact heading). `src/lib/section-links.ts` copies the URL on click and shows a "Link copied" pill. Ids `#services`, `#experience`, `#about`, `#skills`, `#blog`, `#contact` are shared publicly, so don't rename them. Blog posts keep their hover `#` in the left margin (prose convention).
- Responsive layout: the hero is two columns at >=1080px (300px round photo on the right); below that the photo sits beside the name (152px, 120px at <=760px with the name on two lines). It is a single `<Avatar>` with `widths`/`sizes`, moved by grid areas, so the photo downloads once. Services, about, contact stack under 900px; experience, blog rows and skills stack at <=760px. The post TOC is a sticky rail at >=1080px and a closed `<details>` below. Hover colour changes are wrapped in `@media (hover: hover)` so tapped links don't stay lit on touch screens. The viewport meta has `viewport-fit=cover` (no Chrome Android "chin"), so bottom-anchored things use `env(safe-area-inset-bottom)`.
- Email: never in the HTML or any `href`. `Base.astro` puts it base64-encoded on `<body data-m>`; `[data-mailto]` links point at `#contact` and `src/lib/mailto.ts` opens `mailto:` on click (and powers "Copy address"). Keep it out of JSON-LD and RSS (RSS uses `dc:creator`).
- The user's real photo (`src/assets/burak.jpg`, rendered via `src/components/Avatar.astro` as AVIF/WebP/JPEG) replaced the design's ASCII portrait everywhere. Don't reintroduce ASCII art for him.

## Content model

| Data | File | Schema | CMS |
| --- | --- | --- | --- |
| Profile, hero, services, about + facts, contact, SEO | `src/data/profile.yml` | `profile` in `src/content.config.ts` | singleton `profile` |
| Experience | `src/data/experience.yml` (`entries:` list, newest first) | `experience` | singleton `experience` |
| Skills | `src/data/skills.yml` (`groups:` of area + comma list) | `skills` | singleton `skills` |
| Posts | `src/content/blog/<slug>/index.md` (page bundles; images beside the post) | `blog` | collection `blog` |

- **Any field change must be made in three places:** the YAML, the Zod schema in `src/content.config.ts`, and `public/admin/config.yml`. Sveltia writes with `omit_empty_optional_fields`, so optional fields must be `.optional()`/`.default()`, never required-but-empty.
- Posts default to `draft: true`. Drafts render only in dev (`src/lib/posts.ts`). `/blog/` is `noindex` and kept out of the sitemap until a published post exists (logic in `astro.config.mjs` + `src/pages/blog/index.astro`).
- Guest posts are body-less blog entries with `externalUrl` + `publisher`: no page is built, lists render them as cards linking out (new tab), RSS links to the external URL, and they count as published.
- Markdown pipeline (Astro 7 Sätteri processor): Shiki with the `css-variables` theme mapped to site tokens; `src/lib/shiki-code-header.mjs` wraps code blocks (fence meta `title="..."`, copy button revealed by JS); `satteri-callouts` for `> [!NOTE]`; `src/lib/satteri-figure.mjs` turns `![alt](img "caption")` into figure/figcaption; `src/lib/satteri-prose.mjs` adds h2 `#` anchors and wraps tables in `.table-scroll` (it sets heading ids itself with github-slugger, because Astro assigns ids after user plugins and keeps existing ones).
- The CV is `public/cv.pdf` (contains a phone number). `_headers` forces download as `Burak_Uren_CV_BackendEngineer.pdf` (same name as the source file; `CV_FILENAME` in `src/site.config.mjs` sets the `download` attribute) with `X-Robots-Tag: noindex`; `/resume.pdf` 301s to it. The source CV lives in `CV/` (gitignored).
- Site copy is English only.
- No em dashes (—) or en dashes (–) anywhere in site copy, titles, meta or CMS hints. Use a plain hyphen, colon, semicolon, comma or `|` (page titles: `Page | Burak Üren`).

## Astro 7 gotchas hit in this project

- `compressHTML: true` is set on purpose. Astro 7's default `'jsx'` strips whitespace between inline elements (e.g. `<strong>5,000+</strong> registered users`).
- CSP is Astro's `security.csp` (a `<meta>` tag with hashes). The inline head script (adds `.js` to `<html>` before paint) is hashed from `src/lib/head-init.mjs`; edit it only there. Styles need `'unsafe-inline'` because Shiki uses style attributes, so the build warns "Shiki ... not compatible with CSP". That warning is expected. The Cloudflare Web Analytics beacon is allowlisted in `script-src`/`connect-src`.
- A global `[hidden] { display: none !important; }` exists because components set `display: flex` and progressive-enhancement JS toggles `hidden`.
- `.wrap` needs `width: 100%`: `main` is a flex item of a column flexbox, and auto margins otherwise shrink it to content width.
- Zod 4: use `z.url()` / `z.email()`, not `z.string().url()`.

## SEO checklist (keep intact)

Canonical + OG/Twitter tags + JSON-LD in `src/layouts/Base.astro`; ProfilePage/Person/WebSite on home, Blog on `/blog/`, BlogPosting + BreadcrumbList on posts; sitemap (`@astrojs/sitemap`, `/admin/` excluded), `robots.txt` (`src/pages/robots.txt.ts`), RSS (`src/pages/rss.xml.ts`), `trailingSlash: 'always'`, self-hosted fonts via the Astro Fonts API. Last Lighthouse run: 99-100 across categories, CLS 0.

## Cloudflare / deployment

- Account `661b818927961aa2609e3860dab9f598`. Worker `burakuren-com` is assets-only (`wrangler.jsonc`) on the **custom domain** `burakuren.com` (apex is canonical). `www.burakuren.com` 301s to the apex via a zone **Single Redirect rule** (Rules > Redirect Rules, Cloudflare's "Redirect from WWW to root" template: wildcard `https://www.*` → `https://${1}`, 301, query string preserved; `http://www` hops via Always Use HTTPS first) on a proxied placeholder record `www AAAA 100::`. Dashboard-managed, not in the repo; don't reintroduce a Worker for it.
- CI is **Workers Builds** (connected in the dashboard): every push to `main`, including every Sveltia CMS save, runs `npm run check && npm run build` then `npx wrangler deploy`. Live roughly 60-70s after a push. Node version from `.node-version`.
- Costs: Cloudflare Free plan, $0. Static asset requests are free and unlimited (the site Worker runs no script). The account's 100k Worker requests/day are shared with `sveltia-cms-auth` (and the irem site); on Free, exceeding them returns errors (1027), not charges, so keep edge jobs (redirects, headers) in zone rules or `_headers`/`_redirects` rather than Workers. Recurring spend is only the domain and Tutanota mail.
- TypeScript is on 6.x; 7 is out (Oct 2026) but untested here. Bump only after `npm run check` passes with it.
- Pick the best-practice Cloudflare feature first, even if it is dashboard-only; the user does dashboard steps (DNS, zone settings, rules, Git connection). Use Wrangler for anything you execute yourself. The local wrangler OAuth token cannot read or edit DNS.
- CMS auth: `public/admin/config.yml` → `base_url: https://sveltia-cms-auth.burakuren101.workers.dev`. That Worker is **shared with another project (irem-ak-website)** and has no local source. Its `ALLOWED_DOMAINS` must keep the irem entries. To change it, download the deployed bundle via the Cloudflare API (`/workers/scripts/sveltia-cms-auth/content/v2`) and redeploy it unchanged with `wrangler deploy --no-bundle` and updated `vars`; the `GITHUB_CLIENT_SECRET` secret persists across deploys.
- DNS on `burakuren.com` also carries Tutanota mail: MX, SPF + verification TXT, `_dmarc` (p=quarantine), DKIM CNAMEs `s1/s2._domainkey` (must stay **DNS-only**, not proxied), and `mta-sts` / `_mta-sts` CNAMEs. Never touch these when changing web records.

## Testing in the browser

Claude in Chrome is available for visual checks. The Chrome window can't be resized from tools; the tab group window that opens is often ~500px wide, which is handy for mobile checks. Scrolling via the `scroll` action can time out on long pages; use `javascript_tool` with `scrollTo`/`scrollIntoView` and then screenshot. For exact 390px/1440px screenshots, headless Chromium works without the extension: `chromium --headless=new --no-sandbox --hide-scrollbars --force-device-scale-factor=1 --window-size=390,8600 --virtual-time-budget=4000 --screenshot=out.png http://localhost:8787/` (a tall window captures the whole page; drafts only render under `npm run dev`). Lighthouse runs locally with `npx -y lighthouse@12 <url> --chrome-flags="--headless=new --no-sandbox"` (Chromium is installed).

## Conventions

- Commit messages: imperative subject, wrapped body explaining what/why, ending with the `Co-Authored-By` trailer from the session's attribution reminder.
- `design/`, `CV/`, `dist/`, `.astro/`, `.wrangler/` are gitignored. Don't commit raw photos or scans; crop/optimise into `src/assets/` and strip metadata.
