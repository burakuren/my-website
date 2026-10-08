import { createHash } from 'node:crypto';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** 2026-09-14 — ISO calendar date in UTC, as shown throughout the site. */
export function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/** "2026-03" → "Mar 2026" */
export function monthLabel(ym: string): string {
  const [y, m] = ym.split('-').map(Number);
  return `${MONTHS[m - 1]} ${y}`;
}

/** Short, stable pseudo commit hash derived from the given text. */
export function shortHash(text: string): string {
  return createHash('sha1').update(text).digest('hex').slice(0, 7);
}

/** Minutes to read, at ~220 words per minute; code fences count less. */
export function readingMinutes(markdown: string): number {
  const prose = markdown.replace(/```[\s\S]*?```/g, (block) => ' '.repeat(Math.ceil(block.length / 3)));
  const words = prose.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 220));
}
