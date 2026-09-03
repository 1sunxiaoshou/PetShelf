import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import AdmZip from 'adm-zip';
import { getAnimationStates, getFramePosition, getPetAtlas } from '../src/constants/petAtlas.js';
import { filterPets, readFavorites } from '../src/utils/demoCatalog.js';

const pets = JSON.parse(await readFile(new URL('../src/data/community-pets.json', import.meta.url)));
test('both atlas versions and unsupported versions', () => {
  assert.equal(getPetAtlas().height, 1872);
  assert.equal(getPetAtlas(2).height, 2288);
  assert.throws(() => getPetAtlas(3));
  assert.throws(() => getPetAtlas('2'));
});
test('V2 look directions cross rows 9 and 10 without cropping', () => {
  const state = getAnimationStates(2).at(-1);
  assert.equal(getAnimationStates(1).length, 9);
  assert.equal(getAnimationStates(2).length, 10);
  for (let i = 0; i < 16; i++) assert.deepEqual(getFramePosition(state, i), { row: 9 + Math.floor(i / 8), column: i % 8 });
});
test('every standard animation frame stays inside its atlas', () => {
  for (const version of [1, 2]) for (const state of getAnimationStates(version)) {
    for (let i = 0; i < state.columns.length; i++) {
      const pos = getFramePosition(state, i);
      assert.ok(pos.column < 8 && pos.row < getPetAtlas(version).rows);
    }
  }
});
test('search, sorting, favorites and empty results are local and non-mutating', () => {
  const order = pets.map((pet) => pet.id);
  assert.equal(filterPets(pets, '  MINTY ', 'featured').length, 1);
  assert.equal(filterPets(pets, 'no-pet-matches-this', 'featured').length, 0);
  assert.equal(filterPets(pets, '', 'featured', []).length, 0);
  assert.equal(filterPets(pets, '', 'featured', [pets[0].id]).length, 1);
  assert.equal(filterPets(pets, '', 'v2')[0].spriteVersionNumber, 2);
  assert.deepEqual(pets.map((pet) => pet.id), order);
});
test('favorites handle malformed or denied browser storage', () => {
  for (const value of ['null', '{}', 'bad-json']) assert.deepEqual(readFavorites({ getItem: () => value }), []);
  assert.deepEqual(readFavorites({ getItem: () => '["a",42]' }), ['a']);
  assert.deepEqual(readFavorites({ getItem: () => { throw Error('denied'); } }), []);
});
test('all 12 source images, licenses and downloadable packages are intact', async () => {
  assert.equal(pets.length, 12);
  assert.equal(new Set(pets.map((p) => p.id)).size, 12);
  assert.ok(pets.some((p) => p.spriteVersionNumber === 1));
  assert.ok(pets.some((p) => p.spriteVersionNumber === 2));
  for (const pet of pets) {
    const base = new URL('../public/pets/community/' + pet.id + '/', import.meta.url);
    const image = await readFile(new URL('spritesheet.webp', base));
    assert.equal(createHash('sha256').update(image).digest('hex'), pet.sha256);
    assert.ok((await readFile(new URL('LICENSE.txt', base), 'utf8')).includes(pet.author));
    const zip = new AdmZip(await readFile(new URL('pet.zip', base)));
    assert.deepEqual(zip.getEntries().map((e) => e.entryName).sort(), ['LICENSE.txt', 'pet.json', 'spritesheet.webp']);
    assert.deepEqual(zip.readFile('spritesheet.webp'), image);
    assert.deepEqual(zip.readFile('pet.json'), await readFile(new URL('pet.json', base)));
    assert.equal((JSON.parse(zip.readAsText('pet.json')).spriteVersionNumber ?? 1), pet.spriteVersionNumber);
  }
});

test('product UI does not include implementation brief copy', async () => {
  const files = ['App.jsx', 'components/AppHeader.jsx', 'components/PetCard.jsx', 'components/UploadDialog.jsx', 'components/pet/PetInfoCard.jsx', 'components/pet/PetPreviewStage.jsx', 'data/pets.js'];
  const source = (await Promise.all(files.map((file) => readFile(new URL('../src/' + file, import.meta.url), 'utf8')))).join('\n');
  for (const text of ['展示 Demo', '社区原作', '图像与清单保持原样', '支持 V1', 'V2 优先', '9 组动作', 'demo-notes.html', 'preview-version', 'atlas-badge']) {
    assert.ok(!source.includes(text), 'Unexpected UI copy: ' + text);
  }
});
