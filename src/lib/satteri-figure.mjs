// @ts-check
import { defineHastPlugin } from 'satteri';

/**
 * Turns a paragraph that contains only an image with a title into a
 * <figure> with a <figcaption>:
 *
 *   ![Alt text for screen readers](./diagram.png "fig. 1: what the image shows")
 *
 * The alt text stays on the image; the title becomes the visible caption.
 * Images without a title are left untouched.
 */
export function figureFromTitle() {
  return defineHastPlugin({
    name: 'figure-from-title',
    element: {
      filter: ['p'],
      visit(node) {
        const kids = node.children.filter((c) => !(c.type === 'text' && c.value.trim() === ''));
        if (kids.length !== 1) return;
        const img = kids[0];
        if (img.type !== 'element' || img.tagName !== 'img') return;
        const caption = img.properties?.title;
        if (typeof caption !== 'string' || caption.trim() === '') return;
        const { title: _drop, ...imgProps } = img.properties;
        return {
          type: 'element',
          tagName: 'figure',
          properties: {},
          children: [
            { ...img, properties: imgProps },
            { type: 'element', tagName: 'figcaption', properties: {}, children: [{ type: 'text', value: caption }] },
          ],
        };
      },
    },
  });
}
