// @ts-check
import { defineHastPlugin } from 'satteri';
import Slugger from 'github-slugger';

/**
 * Prose touches for blog posts:
 *
 * - every h2 gets a leading `<a class="heading-anchor">` linking to its
 *   section (the "#" is CSS, so heading text and the TOC stay clean);
 * - tables are wrapped in `<div class="table-scroll">` so wide ones scroll
 *   inside their own box on narrow screens.
 *
 * Astro assigns heading ids after user plugins and keeps an id that is
 * already there, so ids are set here with the same slugger, over the same
 * headings in the same order, to get identical slugs.
 */
export function proseExtras() {
  return () => {
    const slugger = new Slugger();
    return defineHastPlugin({
      name: 'prose-extras',
      element: {
        filter: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'table'],
        visit(node, ctx) {
          if (node.tagName === 'table') {
            ctx.wrapNode(node, { type: 'element', tagName: 'div', properties: { className: ['table-scroll'] }, children: [] });
            return;
          }
          const existing = node.properties?.id;
          const id = typeof existing === 'string' ? existing : slugger.slug(ctx.textContent(node));
          if (typeof existing !== 'string') ctx.setProperty(node, 'id', id);
          if (node.tagName !== 'h2') return;
          ctx.prependChild(node, {
            type: 'element',
            tagName: 'a',
            properties: { className: ['heading-anchor'], href: `#${id}`, ariaLabel: 'Link to this section' },
            children: [],
          });
        },
      },
    });
  };
}
