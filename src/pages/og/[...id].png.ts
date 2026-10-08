import type { APIRoute, GetStaticPaths } from 'astro';
import { getPublishedPosts, postNumber, type Post } from '../../lib/posts';
import { renderPostImage } from '../../lib/share-image';

export const getStaticPaths: GetStaticPaths = async () => {
  const posts = await getPublishedPosts();
  return posts.map((post) => ({
    params: { id: post.id },
    props: { post, number: postNumber(posts, post) },
  }));
};

export const GET: APIRoute<{ post: Post; number: number }> = async ({ props }) => {
  const png = await renderPostImage(props.post, props.number);
  return new Response(new Uint8Array(png), { headers: { 'Content-Type': 'image/png' } });
};
