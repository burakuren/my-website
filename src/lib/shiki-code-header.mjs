// @ts-check
/**
 * Shiki transformer that wraps every fenced code block in a small "window"
 * with a header: an optional title, the language, and a copy button.
 *
 * Set a title from Markdown with the fence meta string:
 *
 *   ```ini title="api.socket + api.service"
 *
 * The copy button ships `hidden` and is revealed by a client script, so
 * readers without JavaScript never see a control that does nothing.
 *
 * @returns {import('shiki').ShikiTransformer}
 */
export function codeBlockHeader() {
  return {
    name: 'code-block-header',
    root(root) {
      const pre = /** @type {import('hast').Element | undefined} */ (root.children.find((n) => n.type === 'element' && n.tagName === 'pre'));
      if (!pre) return;
      const lang = this.options.lang && this.options.lang !== 'plaintext' ? this.options.lang : '';
      const meta = this.options.meta?.__raw ?? '';
      const title = /title=(?:"([^"]*)"|'([^']*)')/.exec(meta);
      const label = title ? title[1] ?? title[2] : lang === 'bash' || lang === 'sh' || lang === 'shell' ? 'terminal' : '';

      /** @type {import('hast').ElementContent[]} */
      const info = [];
      if (label) info.push({ type: 'element', tagName: 'span', properties: { className: ['code-title'] }, children: [{ type: 'text', value: label }] });
      if (lang) info.push({ type: 'element', tagName: 'span', properties: { className: ['code-lang'] }, children: [{ type: 'text', value: lang }] });

      root.children = [
        {
          type: 'element',
          tagName: 'div',
          properties: { className: ['code-block'] },
          children: [
            {
              type: 'element',
              tagName: 'div',
              properties: { className: ['code-head'] },
              children: [
                { type: 'element', tagName: 'span', properties: { className: ['code-info'] }, children: info },
                {
                  type: 'element',
                  tagName: 'button',
                  properties: { type: 'button', className: ['code-copy'], hidden: true },
                  children: [{ type: 'text', value: 'copy' }],
                },
              ],
            },
            { type: 'element', tagName: 'div', properties: { className: ['code-scroll'] }, children: [pre] },
          ],
        },
      ];
    },
  };
}
