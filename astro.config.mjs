// @ts-check
import { defineConfig, fontProviders } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { satteri } from '@astrojs/markdown-satteri';
import satteriCallouts from 'satteri-callouts';
import { codeBlockHeader } from './src/lib/shiki-code-header.mjs';
import { figureFromTitle } from './src/lib/satteri-figure.mjs';
import { SITE_URL } from './src/site.config.mjs';
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { HEAD_INIT } from './src/lib/head-init.mjs';

// The blog index is `noindex` until the first post is published, so keep it
// out of the sitemap too (Search Console flags noindex URLs in sitemaps).
const hasPublishedPosts = readdirSync('./src/content/blog', { withFileTypes: true }).some((d) => {
  const file = `./src/content/blog/${d.name}/index.md`;
  return d.isDirectory() && existsSync(file) && !/^draft:\s*true\s*$/m.test(readFileSync(file, 'utf8').split(/^---\s*$/m)[1] ?? '');
});

// https://docs.astro.build/en/reference/configuration-reference/
export default defineConfig({
  site: SITE_URL,
  trailingSlash: 'always',
  // Astro 7 defaults to 'jsx', which drops whitespace between inline
  // elements. The terminal-style markup relies on those spaces.
  compressHTML: true,
  build: {
    format: 'directory',
    inlineStylesheets: 'auto',
  },
  security: {
    // Emitted as a <meta> CSP with hashes for Astro's own scripts. Styles
    // need 'unsafe-inline' because Shiki colours tokens with style attributes.
    csp: {
      algorithm: 'SHA-256',
      directives: [
        "default-src 'self'",
        "img-src 'self' data:",
        "font-src 'self'",
        // Cloudflare Web Analytics is enabled on the zone and injects its beacon.
        "connect-src 'self' https://cloudflareinsights.com",
        "base-uri 'self'",
        "form-action 'self'",
        "object-src 'none'",
        'upgrade-insecure-requests',
      ],
      scriptDirective: {
        resources: ["'self'", 'https://static.cloudflareinsights.com'],
        hashes: [`sha256-${createHash('sha256').update(HEAD_INIT).digest('base64')}`],
      },
      styleDirective: {
        resources: ["'self'", "'unsafe-inline'"],
      },
    },
  },
  integrations: [
    sitemap({
      filter: (page) => !page.includes('/admin/') && !page.includes('/lab/') && (hasPublishedPosts || !page.endsWith('/blog/')),
    }),
  ],
  fonts: [
    {
      provider: fontProviders.fontsource(),
      name: 'IBM Plex Sans',
      cssVariable: '--font-sans',
      weights: [400, 500, 600],
      styles: ['normal'],
      subsets: ['latin', 'latin-ext'],
      fallbacks: ['system-ui', 'sans-serif'],
    },
    {
      provider: fontProviders.fontsource(),
      name: 'JetBrains Mono',
      cssVariable: '--font-mono',
      weights: [400, 500, 700],
      styles: ['normal'],
      subsets: ['latin', 'latin-ext'],
      fallbacks: ['ui-monospace', 'monospace'],
    },
  ],
  markdown: {
    processor: satteri({
      // `> [!NOTE]` style callouts, styled in global.css.
      hastPlugins: [satteriCallouts({ theme: 'github', showIndicator: false }), figureFromTitle()],
    }),
    syntaxHighlight: 'shiki',
    shikiConfig: {
      // Colours come from CSS custom properties, so code blocks follow the
      // site's tokens without hard-coding colours into inline styles.
      theme: 'css-variables',
      wrap: false,
      transformers: [codeBlockHeader()],
    },
  },
});
