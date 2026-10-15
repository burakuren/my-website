/**
 * Plain text from the CMS with **double asterisks** around the parts that
 * should be bold (metrics are always bold). Everything else is escaped, so
 * the result is safe for `set:html`.
 */
export function bold(text: string, tag: 'strong' | 'b' = 'strong'): string {
  const escaped = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  return escaped.replace(/\*\*(.+?)\*\*/g, `<${tag}>$1</${tag}>`);
}
