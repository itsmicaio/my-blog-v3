import { createRequire } from 'node:module';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import type { default as SatoriRender, Font } from 'satori';
import sharp from 'sharp';
import { SITE } from '../consts';
import { excerpt, isoDate, readingTime, tagLabel, type Post } from './posts';

export const SHARE_IMAGE_WIDTH = 1200;
export const SHARE_IMAGE_HEIGHT = 630;

// Satori never sees CSS variables, so the Emerald 8-Bit Arcade tokens are copied from
// the @theme block in src/styles/global.css. Change them together.
const COLOR = {
  header: '#131b17',
  band: '#dfd9cb',
  bandRaised: '#eae5d9',
  wellSoft: '#1a2520',
  emeraldDeep: '#1e4d3a',
  emeraldMid: '#40916c',
  emeraldMint: '#74c69d',
  bright: '#f7f9f6',
  outline: '#8a938c',
  pixelBlack: '#0b0e0d',
};

const AVATAR_SIZE = 56;
const MAX_TAGS = 3;
const TITLE_SIZE_LARGE = 60;
const TITLE_SIZE_SMALL = 50;
const LONG_TITLE_CHARS = 48;

type Style = Record<string, string | number>;
type Child = Element | string;
interface Element {
  type: 'div' | 'img';
  props: {
    style: Style;
    children?: Child | Child[];
    src?: string;
    width?: number;
    height?: number;
  };
}

// Satori honours lineClamp only on a block, and requires an explicit display on any
// element with several children, so wrappers are flex and text sits in blocks.
const box = (style: Style, children: Child[]): Element => ({
  type: 'div',
  props: { style: { display: 'flex', ...style }, children },
});
const text = (content: string, style: Style): Element => ({
  type: 'div',
  props: { style: { display: 'block', ...style }, children: content },
});

const mono = (size: number, weight: 400 | 700 = 700): Style => ({
  fontFamily: 'Space Mono',
  fontWeight: weight,
  fontSize: size,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
});

const chip = (label: string, dashed = false): Element =>
  text(label, {
    ...mono(20),
    backgroundColor: COLOR.bandRaised,
    color: COLOR.emeraldDeep,
    border: `1px ${dashed ? 'dashed' : 'solid'} ${COLOR.emeraldDeep}`,
    padding: '4px 10px',
  });

const badge = (label: string): Element =>
  text(label, {
    ...mono(16),
    backgroundColor: COLOR.wellSoft,
    color: COLOR.emeraldMint,
    border: `1px solid ${COLOR.emeraldMid}`,
    padding: '2px 4px',
  });

interface Card {
  bandLeft: Element;
  bandRight: Element;
  chips: Element[];
  title: string;
  titleSize: number;
  summary: string;
  footerLeft: Element;
  footerRight: Element[];
}

function card(content: Card, avatar: string): Element {
  const body: Child[] = [];
  if (content.chips.length > 0) body.push(box({ gap: 10 }, content.chips));
  body.push(
    text(content.title, {
      fontFamily: 'Space Grotesk',
      fontWeight: 700,
      fontSize: content.titleSize,
      lineHeight: 1.05,
      letterSpacing: '-0.02em',
      textTransform: 'uppercase',
      color: COLOR.emeraldDeep,
      lineClamp: 3,
    }),
    text(content.summary, {
      fontFamily: 'Space Grotesk',
      fontWeight: 400,
      fontSize: 26,
      lineHeight: 1.35,
      color: COLOR.pixelBlack,
      lineClamp: 3,
    }),
    box(
      {
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 'auto',
        borderTop: `2px solid ${COLOR.band}`,
        paddingTop: 14,
      },
      [
        content.footerLeft,
        box({ alignItems: 'center', gap: 12 }, [
          {
            type: 'img',
            props: {
              style: { width: AVATAR_SIZE, height: AVATAR_SIZE },
              src: avatar,
              width: AVATAR_SIZE,
              height: AVATAR_SIZE,
            },
          },
          ...content.footerRight,
        ]),
      ],
    ),
  );

  return box(
    {
      width: SHARE_IMAGE_WIDTH,
      height: SHARE_IMAGE_HEIGHT,
      backgroundColor: COLOR.header,
      padding: 48,
    },
    [
      box(
        {
          flexDirection: 'column',
          flexGrow: 1,
          backgroundColor: COLOR.bright,
          border: `4px solid ${COLOR.emeraldDeep}`,
          boxShadow: `10px 10px 0 ${COLOR.emeraldDeep}`,
        },
        [
          box(
            {
              justifyContent: 'space-between',
              backgroundColor: COLOR.band,
              borderBottom: `2px solid ${COLOR.emeraldDeep}`,
              padding: '12px 28px',
            },
            [content.bandLeft, content.bandRight],
          ),
          box({ flexDirection: 'column', flexGrow: 1, padding: 24, gap: 12 }, body),
        ],
      ),
    ],
  );
}

interface Assets {
  fonts: Font[];
  avatar: string;
}

const load = createRequire(import.meta.url);

async function loadFont(name: string, weight: 400 | 700, file: string): Promise<Font> {
  return { name, weight, style: 'normal', data: await readFile(load.resolve(file)) };
}

async function loadAssets(): Promise<Assets> {
  const fonts = await Promise.all([
    loadFont(
      'Space Grotesk',
      700,
      '@fontsource/space-grotesk/files/space-grotesk-latin-700-normal.woff',
    ),
    loadFont(
      'Space Grotesk',
      400,
      '@fontsource/space-grotesk/files/space-grotesk-latin-400-normal.woff',
    ),
    loadFont('Space Mono', 700, '@fontsource/space-mono/files/space-mono-latin-700-normal.woff'),
    loadFont('Space Mono', 400, '@fontsource/space-mono/files/space-mono-latin-400-normal.woff'),
  ]);
  // Resized to its display size here so librsvg has nothing left to scale. The build
  // runs from the project root, which is also where Astro resolves public/ from.
  const avatarPng = await sharp(path.join('public', SITE.avatar))
    .resize(AVATAR_SIZE, AVATAR_SIZE)
    .png()
    .toBuffer();
  return { fonts, avatar: `data:image/png;base64,${avatarPng.toString('base64')}` };
}

let assets: Promise<Assets> | undefined;

// Satori 0.36's ES module build inlines harfbuzz's loader, which reads __dirname and so
// throws under native Node ESM; its CommonJS build defines it. Required lazily, so pages
// that only import the size constants never load it. Fixed upstream in 0.37.1.
function loadSatori(): typeof SatoriRender {
  return (load('satori') as { default: typeof SatoriRender }).default;
}

async function rasterise(tree: Element, fonts: Font[]): Promise<Buffer> {
  const svg = await loadSatori()(tree as unknown as React.ReactNode, {
    width: SHARE_IMAGE_WIDTH,
    height: SHARE_IMAGE_HEIGHT,
    fonts,
  });
  return sharp(Buffer.from(svg)).png().toBuffer();
}

export async function renderPostImage(post: Post, number: number): Promise<Buffer> {
  const { fonts, avatar } = await (assets ??= loadAssets());
  const tags = post.data.tags;
  const chips = tags.slice(0, MAX_TAGS).map((tag) => chip(`> ${tagLabel(tag)}`));
  if (tags.length > MAX_TAGS) chips.push(chip(`+${tags.length - MAX_TAGS}`, true));
  const title = post.data.title;

  const tree = card(
    {
      bandLeft: text(`> Post #${String(number).padStart(2, '0')}`, {
        ...mono(22),
        color: COLOR.emeraldDeep,
      }),
      bandRight: text(`${readingTime(post)} min read`, { ...mono(22), color: COLOR.pixelBlack }),
      chips,
      title,
      titleSize: title.length > LONG_TITLE_CHARS ? TITLE_SIZE_SMALL : TITLE_SIZE_LARGE,
      summary: excerpt(post),
      footerLeft: text(isoDate(post.data.pubDate), { ...mono(20), color: COLOR.outline }),
      footerRight: [text(SITE.author, { ...mono(20), color: COLOR.emeraldDeep }), badge('[1P]')],
    },
    avatar,
  );
  return rasterise(tree, fonts);
}

export async function renderSiteImage(): Promise<Buffer> {
  const { fonts, avatar } = await (assets ??= loadAssets());
  const tree = card(
    {
      bandLeft: text(`> ${new URL(SITE.url).host}`, { ...mono(22, 400), color: COLOR.emeraldDeep }),
      bandRight: badge('[1P]'),
      chips: [],
      title: SITE.title,
      titleSize: TITLE_SIZE_LARGE,
      summary: SITE.description,
      footerLeft: text(SITE.tagline, { ...mono(20, 400), color: COLOR.outline }),
      footerRight: [text(SITE.author, { ...mono(20), color: COLOR.emeraldDeep })],
    },
    avatar,
  );
  return rasterise(tree, fonts);
}
