import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import { build } from 'esbuild';
import yaml from 'js-yaml';
import { createReader } from '@keystatic/core/reader';

const root = fileURLToPath(new URL('..', import.meta.url));
const compiled = await build({
  entryPoints: [fileURLToPath(new URL('../keystatic.config.ts', import.meta.url))],
  bundle: true, platform: 'node', format: 'esm', packages: 'external', write: false,
});
const code = compiled.outputFiles[0].text.replace(/from "(@keystatic\/[^\"]+)"/g,
  (_, name) => `from ${JSON.stringify(import.meta.resolve(name))}`);
const { default: config } = await import(`data:text/javascript;base64,${Buffer.from(code).toString('base64')}`);
const field = config.collections.articles.schema.scheduledPublishAt;

test('une sauvegarde CMS conserve 8 h Paris en été et en hiver avec un fuseau explicite', () => {
  for (const iso of ['2026-10-22T06:00:00Z', '2026-10-26T07:00:00Z']) {
    const value = field.validate(field.parse(new Date(iso)));
    const saved = yaml.load(yaml.dump({ scheduledPublishAt: field.serialize(value).value }));
    assert.equal(new Date(saved.scheduledPublishAt).getTime(), Date.parse(iso));
    const hour = new Intl.DateTimeFormat('fr-FR', {
      timeZone: 'Europe/Paris', hour: '2-digit', hourCycle: 'h23',
    }).formatToParts(saved.scheduledPublishAt).find(part => part.type === 'hour').value;
    assert.equal(hour, '08');
  }
  assert.equal(field.serialize(null).value, undefined);
});

test('Keystatic lit les heures et préserve toutes les programmations existantes', async () => {
  const reader = createReader(root, config);
  const directory = new URL('../src/content/articles/', import.meta.url);
  let checked = 0;
  for (const name of readdirSync(directory).filter(name => name.endsWith('.mdoc'))) {
    const data = yaml.load(readFileSync(new URL(name, directory), 'utf8').split(/^---\s*$/m)[1]);
    if (!data.scheduledPublishAt) continue;
    const article = await reader.collections.articles.read(name.slice(0, -5));
    assert.equal(article.scheduledPublishAt, new Date(data.scheduledPublishAt).toISOString().slice(0, -8), name);
    const value = field.validate(field.parse(data.scheduledPublishAt));
    assert.equal(field.serialize(value).value.getTime(), new Date(data.scheduledPublishAt).getTime(), name);
    checked++;
  }
  assert(checked > 0, 'Aucune programmation contrôlée');
});
