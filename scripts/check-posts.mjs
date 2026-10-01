import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const POSTS = 'src/content/blog';
const PUBLIC = 'public';
const UPLOADS = '/uploads/';

const POST_FILE = /\.mdx?$/;
const IMAGE_REF = /!\[[^\]]*\]\(\s*([^)\s]+)/g;
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const DATE_PREFIX = /^\d{4}-\d{2}-\d{2}-/;

function bodyOf(raw) {
  if (!raw.startsWith('---\n')) return raw;
  const fenceEnd = raw.indexOf('\n---', 3);
  if (fenceEnd === -1) return raw;
  return raw.slice(raw.indexOf('\n', fenceEnd + 1) + 1);
}

function stripFencedCode(text) {
  return text.replace(/^```[\s\S]*?^```/gm, '');
}

function filenameProblem(file) {
  const segments = file.replace(POST_FILE, '').split(path.sep);
  if (segments.some((segment) => DATE_PREFIX.test(segment))) return 'date-prefixed filename';
  if (!segments.every((segment) => SLUG.test(segment))) return 'filename not lowercase kebab-case';
  return null;
}

function isInside(dir, target) {
  const relative = path.relative(dir, target);
  return relative !== '' && !relative.startsWith('..') && !path.isAbsolute(relative);
}

function imageProblem(ref, file) {
  if (/^[a-z][a-z0-9+.-]*:/i.test(ref) || ref.startsWith('//')) return 'external image';
  const target = decodeURIComponent(ref);
  if (ref.startsWith('/')) {
    if (!ref.startsWith(UPLOADS)) return 'image outside /uploads/';
    if (!fs.existsSync(path.join(PUBLIC, target))) return 'missing asset';
    return null;
  }
  const resolved = path.resolve(POSTS, path.dirname(file), target);
  if (!isInside(path.resolve(POSTS), resolved)) return `relative image outside ${POSTS}/`;
  if (!fs.existsSync(resolved)) return 'missing asset';
  return null;
}

const problems = [];

const files = fs
  .readdirSync(POSTS, { recursive: true })
  .filter((file) => POST_FILE.test(file))
  .sort();

for (const file of files) {
  const nameProblem = filenameProblem(file);
  if (nameProblem) problems.push(`${nameProblem}: ${file}`);

  const body = stripFencedCode(bodyOf(fs.readFileSync(path.join(POSTS, file), 'utf8')));

  for (const [, ref] of body.matchAll(IMAGE_REF)) {
    const refProblem = imageProblem(ref, file);
    if (refProblem) problems.push(`${refProblem}: ${ref}  (referenced by ${file})`);
  }
}

for (const problem of problems) {
  console.error(problem);
}

if (problems.length) {
  console.error(`\n${problems.length} problem(s) in ${POSTS}`);
  process.exit(1);
}

console.log(
  `posts ok: ${files.length} filenames are valid slugs and every image resolves under ${UPLOADS} or ${POSTS}/`,
);
