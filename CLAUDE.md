# CLAUDE.md

Personal site of Burak Üren (backend engineer) at https://burakuren.com. Static Astro 7 site, content edited in Sveltia CMS, served by Cloudflare Workers. See `README.md` for the user-facing overview; this file holds what an agent needs to work on it safely.

## Commands

```sh
npm run dev        # astro dev on :4321; drafts visible; CMS at /admin/index.html (not /admin/)
npm run check      # astro check: types + content schemas. Run before every push.
npm run build      # static build into dist/
npm run preview    # build + wrangler dev on :8787 (real _headers/_redirects)
npm run images     # regenerate public/og.png + icons from profile.yml and src/assets/burak.jpg
npm run deploy     # manual site deploy (normally CI does it)
npm run deploy:www # www → apex redirect Worker (workers/www-redirect)
```

`astro dev` daemonizes in Astro 7; stop it with `npx astro dev stop`. `wrangler dev` hot-reloads `dist/` and can serve a stale/half-written build if you rebuild while it runs; restart it after `npm run build`.

## Design source

- Design lives in Claude Design exports under `design/` (gitignored, local only). They are self-extracting bundles; read them with `python3 -I scripts/unpack-design.py "design/<file>.html" <out-dir>`. Each board becomes a folder; markup uses `{{c.*}}` placeholders and the colours/data/embedded images are in the board's `text/x-dc` script.
- Visual language: Linux terminal + man pages + git (`UREN(1)` running headers, `$ cat about.md` section commands, `ls -l` projects, `git log` experience, `.conf` skills, `~ ❯` prompts). Keep new UI and copy in that voice.
- Theme tokens are CSS custom properties in `src/styles/global.css`. Dark is the default regardless of OS preference; light only via the toggle (`[data-theme]`, stored in localStorage). Colours must come from tokens, not literals.
- The user's real photo (`src/assets/burak.jpg`, rendered via `src/components/Avatar.astro` as AVIF/WebP/JPEG) replaced the design's ASCII portrait everywhere. Don't reintroduce ASCII art for him.

## Content model

| Data | File | Schema | CMS |
| --- | --- | --- | --- |
| Profile, hero, about, contact, SEO | `src/data/profile.yml` | `profile` in `src/content.config.ts` | singleton `profile` |
| Projects | `src/data/projects.yml` (`projects:` list) | `projects` | singleton `projects` |
| Experience | `src/data/experience.yml` (`entries:` list, newest first) | `experience` | singleton `experience` |
| Skills | `src/data/skills.yml` | `skills` | singleton `skills` |
| Posts | `src/content/blog/<slug>/index.md` (page bundles; images beside the post) | `blog` | collection `blog` |

- **Any field change must be made in three places:** the YAML, the Zod schema in `src/content.config.ts`, and `public/admin/config.yml`. Sveltia writes with `omit_empty_optional_fields`, so optional fields must be `.optional()`/`.default()`, never required-but-empty.
- Posts default to `draft: true`. Drafts render only in dev (`src/lib/posts.ts`). `/blog/` is `noindex` and kept out of the sitemap until a published post exists (logic in `astro.config.mjs` + `src/pages/blog/index.astro`).
- Markdown pipeline (Astro 7 Sätteri processor): Shiki with the `css-variables` theme mapped to site tokens; `src/lib/shiki-code-header.mjs` wraps code blocks (fence meta `title="..."`, copy button revealed by JS); `satteri-callouts` for `> [!NOTE]`; `src/lib/satteri-figure.mjs` turns `![alt](img "caption")` into figure/figcaption.
- The CV is `public/cv.pdf` (contains a phone number). `_headers` forces download as `Burak_Uren_CV.pdf` with `X-Robots-Tag: noindex`; `/resume.pdf` 301s to it. The source CV lives in `CV/` (gitignored).
- Site copy is English only.
- No em dashes (—) or en dashes (–) anywhere in site copy, titles, meta or CMS hints. Use a plain hyphen, colon, semicolon, comma or `|` (page titles: `Page | Burak Üren`).

## Astro 7 gotchas hit in this project

- `compressHTML: true` is set on purpose. Astro 7's default `'jsx'` strips whitespace between inline elements and breaks the terminal markup (`<span>~</span> <span>❯</span>`).
- CSP is Astro's `security.csp` (a `<meta>` tag with hashes). The inline theme script is hashed from `src/lib/theme-init.mjs`; edit it only there. Styles need `'unsafe-inline'` because Shiki uses style attributes, so the build warns "Shiki ... not compatible with CSP". That warning is expected. The Cloudflare Web Analytics beacon is allowlisted in `script-src`/`connect-src`.
- A global `[hidden] { display: none !important; }` exists because components set `display: flex` and progressive-enhancement JS toggles `hidden`.
- `.wrap` needs `width: 100%`: `main` is a flex item of a column flexbox, and auto margins otherwise shrink it to content width.
- Zod 4: use `z.url()` / `z.email()`, not `z.string().url()`.

## SEO checklist (keep intact)

Canonical + OG/Twitter tags + JSON-LD in `src/layouts/Base.astro`; ProfilePage/Person/WebSite on home, Blog on `/blog/`, BlogPosting + BreadcrumbList on posts; sitemap (`@astrojs/sitemap`, `/admin/` excluded), `robots.txt` (`src/pages/robots.txt.ts`), RSS (`src/pages/rss.xml.ts`), `trailingSlash: 'always'`, self-hosted fonts via the Astro Fonts API. Last Lighthouse run: 99-100 across categories, CLS 0.

## Cloudflare / deployment

- Account `661b818927961aa2609e3860dab9f598`. Worker `burakuren-com` is assets-only (`wrangler.jsonc`) on the **custom domain** `burakuren.com` (apex is canonical). `www.burakuren.com` is a separate Worker (`workers/www-redirect`) that 301s to the apex.
- CI is **Workers Builds** (connected in the dashboard): every push to `main`, including every Sveltia CMS save, runs `npm run check && npm run build` then `npx wrangler deploy`. Live roughly 60-70s after a push. Node version from `.node-version`.
- Use Wrangler for anything you execute (deploys, config changes). Dashboard-only setup (DNS, zone settings, Git connection) is fine to ask the user to do. The local wrangler OAuth token cannot read or edit DNS.
- CMS auth: `public/admin/config.yml` → `base_url: https://sveltia-cms-auth.burakuren101.workers.dev`. That Worker is **shared with another project (irem-ak-website)** and has no local source. Its `ALLOWED_DOMAINS` must keep the irem entries. To change it, download the deployed bundle via the Cloudflare API (`/workers/scripts/sveltia-cms-auth/content/v2`) and redeploy it unchanged with `wrangler deploy --no-bundle` and updated `vars`; the `GITHUB_CLIENT_SECRET` secret persists across deploys.
- DNS on `burakuren.com` also carries Tutanota mail: MX, SPF + verification TXT, `_dmarc` (p=quarantine), DKIM CNAMEs `s1/s2._domainkey` (must stay **DNS-only**, not proxied), and `mta-sts` / `_mta-sts` CNAMEs. Never touch these when changing web records.

## Testing in the browser

Claude in Chrome is available for visual checks. The Chrome window can't be resized from tools; the tab group window that opens is often ~500px wide, which is handy for mobile checks. Scrolling via the `scroll` action can time out on long pages; use `javascript_tool` with `scrollTo`/`scrollIntoView` and then screenshot. Lighthouse runs locally with `npx -y lighthouse@12 <url> --chrome-flags="--headless=new --no-sandbox"` (Chromium is installed).

## Conventions

- Commit messages: imperative subject, wrapped body explaining what/why, ending with the `Co-Authored-By` trailer from the session's attribution reminder.
- `design/`, `CV/`, `dist/`, `.astro/`, `.wrangler/` are gitignored. Don't commit raw photos or scans; crop/optimise into `src/assets/` and strip metadata.
