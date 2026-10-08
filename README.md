# burakuren.com

Personal site of Burak Üren: a static [Astro](https://astro.build) build, content edited with [Sveltia CMS](https://sveltiacms.app), served by [Cloudflare Workers](https://developers.cloudflare.com/workers/static-assets/).

## Stack

| Piece | What it does |
| --- | --- |
| Astro 7 | Static output, content collections, image optimisation, self-hosted fonts, CSP meta tag |
| Sveltia CMS | Git-based editor at `/admin/`; every save is a commit to `main` |
| `sveltia-cms-auth` Worker | GitHub OAuth for the CMS (deployed separately) |
| Cloudflare Workers static assets | Serves `dist/` at `burakuren.com`, with headers from `public/_headers` |
| Cloudflare Redirect Rule | 301s `www.burakuren.com/*` to the apex domain (zone rule, no code) |
| Workers Builds | Cloudflare's Git integration: on push to `main`, type-check, build, `wrangler deploy` |

## Where the content lives

| File | Edited in the CMS as | Shown on |
| --- | --- | --- |
| `src/data/profile.yml` | Profile & home page | Hero, terminal card, about, contact, SEO, structured data |
| `src/data/projects.yml` | Projects | `ls -l ~/projects` |
| `src/data/experience.yml` | Experience | `git log --career` |
| `src/data/skills.yml` | Skills | `skills.conf` |
| `src/content/blog/<slug>/index.md` | Blog | `/blog/` and `/blog/<slug>/` |
| `public/resume.pdf` | (replace the file) | Resume download buttons |

Schemas are in `src/content.config.ts`; a CMS edit that doesn't match fails the build instead of shipping broken content.

### Writing posts

- New posts start as **drafts**. Drafts render in `npm run dev` and are left out of production builds, the sitemap and RSS.
- The `/blog/` page is `noindex` and out of the sitemap until the first post is published.
- Images go next to the post (`src/content/blog/<slug>/`) and are optimised by Astro.
- Markdown extras:
  - Code fence titles: ` ```ini title="api.socket" `
  - Callouts: `> [!NOTE]`, `> [!TIP]`, `> [!WARNING]`
  - Captions: `![alt text](./image.png "fig. 1: caption")`

## Development

Requires Node 22.12+.

```sh
npm install
npm run dev        # http://localhost:4321 (drafts visible)
npm run check      # astro check (types + content schemas)
npm run build      # static build into dist/
npm run preview    # build, then serve dist/ with wrangler dev (production headers)
```

The CMS works against your local clone too: run `npm run dev`, open `http://localhost:4321/admin/index.html` and choose "Work with Local Repository".

`npm run images` regenerates `public/og.png` and the icons from `src/data/profile.yml` (needs JetBrains Mono installed locally).

## Deployment

Pushes to `main` deploy through [Workers Builds](https://developers.cloudflare.com/workers/ci-cd/builds/), connected to the `burakuren-com` Worker in the Cloudflare dashboard:

- Build command: `npm run check && npm run build`
- Deploy command: `npx wrangler deploy`
- Node version comes from `.node-version`.

Manual deploys:

```sh
npm run deploy   # site → burakuren.com
```

### CMS sign-in

`public/admin/config.yml` points `base_url` at `https://sveltia-cms-auth.burakuren101.workers.dev`. That Worker's `ALLOWED_DOMAINS` variable must include `burakuren.com` (and `www.burakuren.com`).
