import type { APIRoute } from 'astro';
import { renderSiteImage } from '../../lib/share-image';

export const GET: APIRoute = async () => {
  const png = await renderSiteImage();
  return new Response(new Uint8Array(png), { headers: { 'Content-Type': 'image/png' } });
};
