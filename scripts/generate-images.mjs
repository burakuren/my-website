// Renders the social card (public/og.png) and the app icons.
// Run with `npm run images` after changing the name, role or tagline.
//
// The card is the v2 design's og/og.html filled from profile.yml and
// screenshotted by headless Chromium at 1200x630 (fonts load from Google
// Fonts, so this needs a network connection). The icons are SVG rendered
// by sharp.
import sharp from 'sharp';
import { execFileSync } from 'node:child_process';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { parse } from 'yaml';

const profile = parse(await readFile(new URL('../src/data/profile.yml', import.meta.url), 'utf8'));
const out = (p) => new URL(`../public/${p}`, import.meta.url).pathname;
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const c = { bg: '#15171c', green: '#97c58e' };
// Bottom strip of the card; kept short (cards are cached for a long time).
const STACK = 'python django flask postgresql';

const photo = await sharp(new URL('../src/assets/burak.jpg', import.meta.url).pathname).resize(640, 640).jpeg({ quality: 88 }).toBuffer();

const ogHtml = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500&family=JetBrains+Mono:wght@400;500;700&display=block" rel="stylesheet">
  <style>
    :root {
      --bg: #15171c;
      --panel: #1b1e25;
      --line: #2b3038;
      --text: #d7dae0;
      --muted: #9198a4;
      --strong: #f2f3f5;
      --green: #97c58e;
      --amber: #e2b466;
    }
    * { box-sizing: border-box; margin: 0; }
    html, body { width: 1200px; height: 630px; overflow: hidden; background: var(--bg); }
    body {
      -webkit-font-smoothing: antialiased;
      font-family: 'IBM Plex Sans', sans-serif;
      color: var(--text);
    }
    .card {
      position: relative;
      width: 1200px;
      height: 630px;
      padding: 64px 80px 0;
      display: grid;
      grid-template-columns: 1fr 320px;
      grid-template-rows: auto 1fr auto;
      column-gap: 64px;
    }
    .prompt {
      grid-column: 1 / -1;
      font: 500 24px/1 'JetBrains Mono', monospace;
      color: var(--muted);
    }
    .prompt b { color: var(--green); font-weight: 500; margin-right: 14px; }
    .copy { align-self: center; }
    .name {
      font: 700 96px/1.02 'JetBrains Mono', monospace;
      letter-spacing: -0.03em;
      color: var(--strong);
    }
    .role {
      margin-top: 14px;
      font-size: 40px;
      font-weight: 500;
      color: var(--green);
      letter-spacing: -0.005em;
    }
    .tagline {
      margin-top: 36px;
      font-size: 32px;
      line-height: 1.35;
      color: var(--text);
      max-width: 19em;
    }
    .photo {
      align-self: center;
      width: 320px;
      height: 320px;
      border-radius: 50%;
      border: 3px solid var(--line);
      object-fit: cover;
    }
    /* Bottom strip: the site's terminal, reduced to one line */
    .strip {
      grid-column: 1 / -1;
      margin: 0 -80px;
      padding: 0 80px;
      height: 84px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-top: 1px solid var(--line);
      background: var(--panel);
      font: 400 24px/1 'JetBrains Mono', monospace;
    }
    .stack { color: var(--amber); word-spacing: 0.4em; }
  </style>
</head>
<body>
  <div class="card">
    <p class="prompt"><b>~ ❯</b>burakuren.com</p>
    <div class="copy">
      <p class="name">${esc(profile.name)}</p>
      <p class="role">${esc(profile.role)}</p>
      <p class="tagline">${esc(profile.tagline)}</p>
    </div>
    <img class="photo" src="data:image/jpeg;base64,${photo.toString('base64')}" alt="">
    <div class="strip">
      <span class="stack">${esc(STACK)}</span>
    </div>
  </div>
</body>
</html>`;

const dir = await mkdtemp(join(tmpdir(), 'og-'));
try {
  await writeFile(join(dir, 'og.html'), ogHtml);
  execFileSync(process.env.CHROMIUM ?? 'chromium', [
    '--headless=new',
    '--no-sandbox',
    '--hide-scrollbars',
    '--force-device-scale-factor=1',
    '--window-size=1200,630',
    '--virtual-time-budget=10000',
    `--screenshot=${join(dir, 'og.png')}`,
    `file://${join(dir, 'og.html')}`,
  ], { stdio: 'ignore' });
  await sharp(join(dir, 'og.png')).resize(1200, 630, { fit: 'cover', position: 'top' }).png({ compressionLevel: 9 }).toFile(out('og.png'));
} finally {
  await rm(dir, { recursive: true, force: true });
}

const icon = (size, radius) => `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 64 64">
  <rect width="64" height="64" rx="${radius}" fill="${c.bg}"/>
  <path fill="${c.green}" d="M15 20.5 27.5 32 15 43.5l-3.4-3.7L20 32l-8.4-7.8z"/>
  <rect fill="${c.green}" x="31" y="40" width="20" height="5" rx="1"/>
</svg>`;

await sharp(Buffer.from(icon(180, 0))).png().toFile(out('apple-touch-icon.png'));
await sharp(Buffer.from(icon(192, 12))).png().toFile(out('icon-192.png'));
await sharp(Buffer.from(icon(512, 12))).png().toFile(out('icon-512.png'));
// favicon.ico: a single 32px PNG wrapped in an ICO container.
const png32 = await sharp(Buffer.from(icon(32, 12))).png().toBuffer();
const header = Buffer.alloc(22);
header.writeUInt16LE(0, 0);
header.writeUInt16LE(1, 2);
header.writeUInt16LE(1, 4);
header.writeUInt8(32, 6);
header.writeUInt8(32, 7);
header.writeUInt16LE(1, 10);
header.writeUInt16LE(32, 12);
header.writeUInt32LE(png32.length, 14);
header.writeUInt32LE(22, 18);
await import('node:fs/promises').then((fs) => fs.writeFile(out('favicon.ico'), Buffer.concat([header, png32])));

console.log('wrote og.png, apple-touch-icon.png, icon-192.png, icon-512.png, favicon.ico');
