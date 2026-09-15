import { getCollection, type CollectionEntry } from 'astro:content';

export type Post = CollectionEntry<'blog'>;

export const EXCERPT_SHORT = 120;
export const EXCERPT_LONG = 200;

export async function getPublishedPosts(): Promise<Post[]> {
  const posts = await getCollection('blog', ({ data }) => !data.draft || import.meta.env.DEV);
  return posts.sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());
}

export async function getArticles(limit?: number): Promise<Post[]> {
  const articles = (await getPublishedPosts()).filter((post) => post.data.type === 'article');
  return limit === undefined ? articles : articles.slice(0, limit);
}

export function formatDate(date: Date, lang = 'pt-BR'): string {
  return new Intl.DateTimeFormat(lang, {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date);
}

function toPlainText(markdown: string): string {
  return (
    markdown
      // Code must go before anything else, or its contents leak into the summary.
      .replace(/^```[\s\S]*?^```/gm, ' ')
      .replace(/^~~~[\s\S]*?^~~~/gm, ' ')
      .replace(/`([^`]*)`/g, '$1')
      // Images carry no prose; links keep their text.
      .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
      .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
      .replace(/<[^>]+>/g, ' ')
      .replace(/^\s{0,3}#{1,6}\s+/gm, '')
      .replace(/^\s{0,3}>\s?/gm, '')
      .replace(/^\s{0,3}(?:[-*+]|\d+\.)\s+/gm, '')
      .replace(/^\s{0,3}(?:[-*_]\s*){3,}$/gm, ' ')
      .replace(/(\*\*|__)(.*?)\1/g, '$2')
      .replace(/(\*|_)(.*?)\1/g, '$2')
      .replace(/\s+/g, ' ')
      .trim()
  );
}

/**
 * Mirrors the excerpt v2 relied on: prune to `limit` characters at a word
 * boundary, then append an ellipsis. Verified against the live site, whose
 * excerpts run 116-121 characters for a 120-character limit.
 */
function prune(text: string, limit: number): string {
  if (text.length <= limit) return text;
  const clipped = text.slice(0, limit);
  const lastSpace = clipped.lastIndexOf(' ');
  return `${(lastSpace > 0 ? clipped.slice(0, lastSpace) : clipped).replace(/[\s,.;:!?-]+$/, '')}…`;
}

export function excerpt(post: Post, limit: number = EXCERPT_SHORT): string {
  if (post.data.description) return post.data.description;
  return prune(toPlainText(post.body ?? ''), limit);
}

export function summary(post: Post): string {
  return excerpt(post, EXCERPT_LONG);
}

const TAG_LABELS: Record<string, string> = {
  aleatorio: 'Aleatório',
  javascript: 'JavaScript',
  web: 'Web',
  typescript: 'TypeScript',
  'google-cloud': 'GCP',
  aws: 'AWS',
  frontend: 'FrontEnd',
  backend: 'BackEnd',
  tech: 'Tech',
  nodejs: 'NodeJS',
  react: 'React',
  ia: 'IA',
};

const warnedTags = new Set<string>();

export function tagLabel(tag: string): string {
  const label = TAG_LABELS[tag];
  if (label) return label;
  if (!warnedTags.has(tag)) {
    warnedTags.add(tag);
    console.warn(`[posts] tag "${tag}" has no label in TAG_LABELS; falling back to the raw slug`);
  }
  return tag;
}
