import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { SITE } from '../consts';
import { getPublishedPosts, summary } from '../lib/posts';

export async function GET(context: APIContext) {
  const posts = await getPublishedPosts();

  return rss({
    title: SITE.title,
    description: SITE.description,
    site: context.site!,
    items: posts.map((post) => ({
      title: post.data.title,
      description: summary(post),
      pubDate: post.data.pubDate,
      link: `/post/${post.id}/`,
    })),
    customData: `<language>${SITE.lang}</language>`,
  });
}
