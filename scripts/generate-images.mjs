// Renders the social card (public/og.png) and the app icons from SVG.
// Run with `npm run images` after changing name/role. Needs JetBrains Mono
// installed locally (any "JetBrains Mono" or "JetBrainsMono Nerd Font").
import sharp from 'sharp';
import { readFile } from 'node:fs/promises';
import { parse } from 'yaml';
import { portraitDark } from '../src/lib/portraits.ts';

const profile = parse(await readFile(new URL('../src/data/profile.yml', import.meta.url), 'utf8'));
const out = (p) => new URL(`../public/${p}`, import.meta.url).pathname;
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const mono = "'JetBrains Mono', 'JetBrainsMono Nerd Font Mono', 'JetBrainsMono Nerd Font', monospace";
const c = { bg: '#15171c', panel: '#1b1e25', line: '#2b3038', text: '#d7dae0', muted: '#9198a4', green: '#97c58e', amber: '#e2b466', blue: '#90b4da', dot: '#2a2f39' };

const portrait = portraitDark
  .split('\n')
  .map((l, i) => `<tspan x="884" y="${118 + i * 11.4}">${esc(l)}</tspan>`)
  .join('');

const flags = profile.synopsis
  .map((s) => `<tspan fill="${c.text}"> [</tspan><tspan fill="${c.amber}">${esc(s.flag)}</tspan><tspan fill="${c.text}"> ${esc(s.arg)}]</tspan>`)
  .join('');

const og = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <pattern id="dots" width="22" height="22" patternUnits="userSpaceOnUse"><circle cx="11" cy="11" r="1.3" fill="${c.dot}"/></pattern>
    <linearGradient id="fade" x1="0" y1="0" x2="0" y2="1"><stop offset="0.5" stop-color="${c.bg}" stop-opacity="0"/><stop offset="1" stop-color="${c.bg}"/></linearGradient>
  </defs>
  <rect width="1200" height="630" fill="${c.bg}"/>
  <rect width="1200" height="630" fill="url(#dots)"/>
  <rect width="1200" height="630" fill="url(#fade)"/>
  <rect x="0" y="0" width="1200" height="64" fill="${c.panel}"/>
  <rect x="0" y="64" width="1200" height="1" fill="${c.line}"/>
  <text x="64" y="41" font-family="${mono}" font-size="22" font-weight="500"><tspan fill="${c.green}">burak@burakuren</tspan><tspan fill="${c.muted}">:</tspan><tspan fill="${c.blue}">~</tspan><tspan fill="${c.muted}">$</tspan></text>
  <rect x="308" y="22" width="11" height="24" fill="${c.green}"/>
  <text x="64" y="136" font-family="${mono}" font-size="18" fill="${c.muted}">UREN(1)</text>
  <text x="64" y="196" font-family="${mono}" font-size="20" font-weight="700" fill="${c.text}" letter-spacing="1.6">NAME</text>
  <text x="96" y="290" font-family="${mono}" font-size="84" font-weight="700" fill="${c.text}" letter-spacing="-2.5">${esc(profile.name)}</text>
  <rect x="${96 + profile.name.length * 48.5}" y="222" width="8" height="78" fill="${c.green}"/>
  <text x="96" y="344" font-family="${mono}" font-size="28" fill="${c.muted}">— ${esc(profile.tagline)}</text>
  <text x="64" y="420" font-family="${mono}" font-size="20" font-weight="700" fill="${c.text}" letter-spacing="1.6">SYNOPSIS</text>
  <text x="96" y="466" font-family="${mono}" font-size="24" xml:space="preserve"><tspan fill="${c.text}" font-weight="700">burak</tspan>${flags}</text>
  <text x="64" y="574" font-family="${mono}" font-size="22" fill="${c.green}">burakuren.com</text>
  <text x="1136" y="574" font-family="${mono}" font-size="20" fill="${c.muted}" text-anchor="end">python · django · devops · linux</text>
  <text font-family="${mono}" font-size="11" fill="${c.text}" xml:space="preserve" opacity="0.9">${portrait}</text>
</svg>`;

await sharp(Buffer.from(og)).png({ compressionLevel: 9 }).toFile(out('og.png'));

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
