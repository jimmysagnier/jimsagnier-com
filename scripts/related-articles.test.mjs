import { test } from 'node:test';
import assert from 'node:assert/strict';
import { getRelatedArticles } from '../src/lib/related-articles.ts';

const now = new Date('2026-10-12T12:00:00Z');
const article = (id, data = {}) => ({ id, data: {
  draft: false, publishedAt: new Date('2026-09-01'), topics: ['seo'], projectIds: [], ...data,
} });
const ids = (source, candidates) => getRelatedArticles(source, candidates, now).map(a => a.id);

test('les lectures manuelles gardent leur ordre, même sans sujet commun', () => {
  const source = article('source', { relatedArticles: ['ancien', 'autre', 'recent'] });
  const candidates = [source, article('recent'), article('autre', { topics: [] }),
    article('ancien', { publishedAt: new Date('2025-01-01') }), article('automatique')];
  assert.deepEqual(ids(source, candidates), ['ancien', 'autre', 'recent']);
});

test('une sélection partielle est complétée sans doublon ni lien vers soi', () => {
  const source = article('source', { relatedArticles: ['source', 'choisi', 'choisi'] });
  assert.deepEqual(ids(source, [source, article('choisi'), article('recent', {
    publishedAt: new Date('2026-10-01'),
  }), article('ancien')]), ['choisi', 'recent', 'ancien']);
});

test('brouillons, dates futures et références absentes ne prennent aucune place', () => {
  const source = article('source', { relatedArticles: ['absent', 'brouillon', 'programme'] });
  const candidates = [source, article('brouillon', { draft: true }), article('programme', {
    scheduledPublishAt: new Date('2026-10-13'),
  }), article('publication-future', { publishedAt: new Date('2026-10-13') }),
  article('disponible-maintenant', { scheduledPublishAt: now }), article('public')];
  assert.deepEqual(ids(source, candidates), ['disponible-maintenant', 'public']);
});

test('sans sélection, les sujets puis les projets et la date gardent leur rôle', () => {
  const source = article('source', { projectIds: ['eva'] });
  assert.deepEqual(ids(source, [article('recent', { publishedAt: new Date('2026-10-01') }),
    article('projet-seul', { topics: [], projectIds: ['eva'] }),
    article('sujet-et-projet', { projectIds: ['eva'] }), article('sans-affinite', { topics: [] })]),
  ['sujet-et-projet', 'recent', 'projet-seul']);
});

test('un article sans complément disponible ne produit aucun lien', () => {
  const source = article('source', { topics: [], relatedArticles: ['absent'] });
  assert.deepEqual(ids(source, [source, article('autre')]), []);
});
