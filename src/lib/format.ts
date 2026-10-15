const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** "14 Sep 2026", in UTC, as shown throughout the site. */
export function dateLabel(d: Date): string {
  return `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

 /** 2026-09-14 (v1 blog pages; removed once they are restyled). */
export function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/** "2026-03" → "Mar 2026" */
export function monthLabel(ym: string): string {
  const [y, m] = ym.split('-').map(Number);
  return `${MONTHS[m - 1]} ${y}`;
}

/** Minutes to read, at ~220 words per minute; code fences count less. */
export function readingMinutes(markdown: string): number {
  const prose = markdown.replace(/```[\s\S]*?```/g, (block) => ' '.repeat(Math.ceil(block.length / 3)));
  const words = prose.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 220));
}
