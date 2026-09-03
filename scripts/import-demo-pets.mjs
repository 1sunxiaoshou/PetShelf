// Import data and images only. Never execute code from the upstream repository.
import { mkdir, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import AdmZip from 'adm-zip';

const revision = '3cf5aa32e656ed1addd2526e3f8c0a0e93c6988f';
const repository = 'https://github.com/legeling/awesome-codex-pet';
const raw = `https://raw.githubusercontent.com/legeling/awesome-codex-pet/${revision}`;
const root = fileURLToPath(new URL('../', import.meta.url));
const slugs = [
  'minty--somnusochi', 'corgi-companion--cxian0928-afk', 'gudong--rank',
  'desk-otter--zihualiu1997', 'iris--yau-427', 'panda--jason-bai',
  'naiwa--sandytruant', 'starcorn--alterhq', 'mimi--spacebody',
  'hajimi--zeyuwang1999', 'diandian--lllucasxu', 'bubu--gbn666',
  'frankie--aygunvarol', 'yuanzai--gaming33', 'wally--wally025',
  'tuantuan--jbbom', 'pixel-duck--flamurmaliqi',
];

async function get(url) {
  const response = await fetch(url, { signal: AbortSignal.timeout(45000) });
  if (!response.ok) throw new Error(`${response.status}: ${url}`);
  return response;
}

function webpSize(buffer) {
  if (buffer.toString('ascii', 0, 4) !== 'RIFF' || buffer.toString('ascii', 8, 12) !== 'WEBP') {
    throw new Error('Not a WebP image');
  }
  const type = buffer.toString('ascii', 12, 16);
  if (type === 'VP8X') return [buffer.readUIntLE(24, 3) + 1, buffer.readUIntLE(27, 3) + 1];
  if (type === 'VP8L') {
    const bits = buffer.readUInt32LE(21);
    return [(bits & 0x3fff) + 1, ((bits >>> 14) & 0x3fff) + 1];
  }
  if (type === 'VP8 ') return [buffer.readUInt16LE(26) & 0x3fff, buffer.readUInt16LE(28) & 0x3fff];
  throw new Error(`Unsupported WebP chunk: ${type}`);
}

const catalog = await (await get(`${raw}/pets.json`)).json();
const tree = await (await get(`https://api.github.com/repos/legeling/awesome-codex-pet/git/trees/${revision}?recursive=1`)).json();
const imported = [];
for (const slug of slugs) {
  if (imported.length === 12) break;
  const entry = catalog.find((pet) => pet.slug === slug);
  const assetRoot = `${raw}/pets/${slug}`;
  const [manifestText, submissionText] = await Promise.all([
    get(`${assetRoot}/pet.json`).then((r) => r.text()),
    get(`${assetRoot}/submission.json`).then((r) => r.text()),
  ]);
  const manifest = JSON.parse(manifestText);
  const submission = JSON.parse(submissionText);
  if (!/^(MIT License|CC BY 4\.0)/.test(submission.license)) throw new Error(`License needs review: ${slug}`);
  if (manifest.spritesheetPath !== 'spritesheet.webp') throw new Error(`Unexpected asset path: ${slug}`);
  const version = manifest.spriteVersionNumber ?? 1;
  if (![1, 2].includes(version)) throw new Error(`Unsupported version: ${slug}`);
  const bytes = Buffer.from(await (await get(`${assetRoot}/spritesheet.webp`)).arrayBuffer());
  const sha256 = createHash('sha256').update(bytes).digest('hex');
  // Some submission checksums predate the gallery's own asset normalization.
  // Verify against the pinned Git tree instead of trusting stale submission metadata.
  const expectedBlob = tree.tree.find((item) => item.path === `pets/${slug}/spritesheet.webp`)?.sha;
  const gitBlob = createHash('sha1').update(`blob ${bytes.length}\0`).update(bytes).digest('hex');
  if (!expectedBlob || gitBlob !== expectedBlob) throw new Error(`Pinned Git blob mismatch: ${slug}`);
  const [width, height] = webpSize(bytes);
  if (width !== 1536 || height !== (version === 2 ? 2288 : 1872)) throw new Error(`Atlas mismatch: ${slug}`);

  let licenseText = `Asset: ${manifest.displayName}\nCreator: ${submission.author}\nLicense declared by creator: ${submission.license}\nSource: ${submission.source_url || repository + '/tree/' + revision + '/pets/' + slug}\n\n`;
  if (submission.license.startsWith('MIT')) {
    const match = submission.source_url?.match(/^https:\/\/github\.com\/([^/]+\/[^/#]+)/);
    if (!match) throw new Error(`MIT source license unavailable: ${slug}`);
    let license;
    try { license = await (await get(`https://api.github.com/repos/${match[1]}/license`)).json(); }
    catch { console.log(`Skipped ${slug}: original license could not be retrieved`); continue; }
    if (license.license?.spdx_id !== 'MIT') {
      console.log(`Skipped ${slug}: source license differs from submission metadata`);
      continue;
    }
    licenseText += Buffer.from(license.content, 'base64').toString('utf8');
  } else {
    licenseText += 'CC BY 4.0: https://creativecommons.org/licenses/by/4.0/\nNo changes made to the original spritesheet or manifest.\n';
  }
  const target = path.join(root, 'public', 'pets', 'community', slug);
  await mkdir(target, { recursive: true });
  await Promise.all([
    writeFile(path.join(target, 'pet.json'), manifestText),
    writeFile(path.join(target, 'submission.json'), submissionText),
    writeFile(path.join(target, 'spritesheet.webp'), bytes),
    writeFile(path.join(target, 'LICENSE.txt'), licenseText),
  ]);
  const zip = new AdmZip();
  zip.addFile('pet.json', Buffer.from(manifestText));
  zip.addFile('spritesheet.webp', bytes);
  zip.addFile('LICENSE.txt', Buffer.from(licenseText));
  await writeFile(path.join(target, 'pet.zip'), zip.toBuffer());
  imported.push({
    id: slug, manifestId: manifest.id, displayName: manifest.displayName,
    description: manifest.description, author: submission.author,
    authorUrl: submission.author_url || '', sourceUrl: submission.source_url || `${repository}/tree/${revision}/pets/${slug}`,
    galleryUrl: `${repository}/tree/${revision}/pets/${slug}`,
    license: submission.license, licensePath: `/pets/community/${slug}/LICENSE.txt`,
    spritesheetPath: `/pets/community/${slug}/spritesheet.webp`,
    manifestPath: `/pets/community/${slug}/pet.json`,
    spriteVersionNumber: version, width, height, sha256,
    searchNames: Object.values(entry?.localized_names || {}).join(' '),
    sourceRevision: revision, gitBlob,
    submissionChecksumMatches: submission.spritesheet_sha256 ? sha256 === submission.spritesheet_sha256 : null,
  });
  console.log(`${slug}: V${version}, ${width}x${height}, ${(bytes.length / 1048576).toFixed(2)} MB, license retained`);
}
if (imported.length !== 12) throw new Error('Expected 12 fully verified assets; catalog not replaced');
await mkdir(path.join(root, 'src', 'data'), { recursive: true });
await writeFile(path.join(root, 'src', 'data', 'community-pets.json'), JSON.stringify(imported, null, 2) + '\n');
console.log(`Imported ${imported.length} attributed pets. No remote code executed.`);
