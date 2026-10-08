import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { getEntry } from 'astro:content';
import { getPosts, postUrl } from '../lib/posts';

export async function GET(context: APIContext) {
  const profile = (await getEntry('profile', 'profile'))!.data;
  const posts = (await getPosts()).filter((p) => !p.data.draft);
  return rss({
    title: `${profile.name} | Blog`,
    description: 'Notes from building and running systems: backend, infrastructure and Linux.',
    site: context.site!,
    trailingSlash: true,
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.pubDate,
      link: postUrl(post),
      categories: post.data.tags,
      author: `${profile.email} (${profile.name})`,
    })),
    customData: '<language>en</language>',
  });
}
