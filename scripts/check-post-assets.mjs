import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const POSTS = 'src/content/blog';
const PUBLIC = 'public';

const IMAGE_REF = /!\[[^\]]*\]\(\s*([^)\s]+)/g;

function bodyOf(raw) {
  if (!raw.startsWith('---\n')) return raw;
  const fenceEnd = raw.indexOf('\n---', 3);
  if (fenceEnd === -1) return raw;
  return raw.slice(raw.indexOf('\n', fenceEnd + 1) + 1);
}

function stripFencedCode(text) {
  return text.replace(/^```[\s\S]*?^```/gm, '');
}

const missing = [];
const external = [];

for (const file of fs.readdirSync(POSTS).filter((f) => f.endsWith('.md'))) {
  const body = stripFencedCode(bodyOf(fs.readFileSync(path.join(POSTS, file), 'utf8')));

  for (const [, ref] of body.matchAll(IMAGE_REF)) {
    if (/^https?:\/\//.test(ref)) {
      external.push({ file, ref });
    } else if (ref.startsWith('/')) {
      if (!fs.existsSync(path.join(PUBLIC, decodeURIComponent(ref)))) {
        missing.push({ file, ref });
      }
    }
  }
}

for (const { file, ref } of missing) {
  console.error(`missing asset: ${ref}  (referenced by ${file})`);
}
for (const { file, ref } of external) {
  console.error(`external image: ${ref}  (referenced by ${file})`);
}

if (missing.length || external.length) {
  console.error(`\n${missing.length} missing, ${external.length} external`);
  process.exit(1);
}

console.log('post assets ok: every image reference is a local file under public/');
