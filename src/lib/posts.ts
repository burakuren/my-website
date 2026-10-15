import { getCollection, type CollectionEntry } from 'astro:content';

export type Post = CollectionEntry<'blog'>;

/**
 * Published posts, newest first, including guest posts that live on other
 * sites. Drafts are visible in `astro dev` so they can be previewed, and
 * never make it into a production build.
 */
export async function getPosts(): Promise<Post[]> {
  const posts = await getCollection('blog', ({ data }) => import.meta.env.DEV || !data.draft);
  return posts.sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());
}

/** Guest posts have an external URL and no page of their own. */
export const isExternal = (post: Post) => Boolean(post.data.externalUrl);

/** Posts with a page on this site. */
export const localPosts = (posts: Post[]) => posts.filter((p) => !isExternal(p));

export const postUrl = (post: Post) => post.data.externalUrl ?? `/blog/${post.id}/`;

/** "blog.teclado.com" from a guest post's URL. */
export const postHost = (post: Post) => (post.data.externalUrl ? new URL(post.data.externalUrl).hostname.replace(/^www\./, '') : '');
