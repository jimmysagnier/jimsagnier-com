import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import assert from 'node:assert/strict';
import yaml from 'js-yaml';
import { isArticlePage } from '../workers/publish-heartbeat/src/index.js';
const root = 'dist';
const files = (dir) => readdirSync(dir, {withFileTypes:true}).flatMap(item => item.isDirectory() ? files(join(dir,item.name)) : [join(dir,item.name)]);
const htmlFiles = files(root).filter(path => path.endsWith('.html'));
const errors = [];
const routeFile = (path) => { const direct=join(root,path); return existsSync(direct) && !path.endsWith('/') && /\.[a-z0-9]+$/i.test(path) ? direct : join(root,path,'index.html'); };
for (const path of htmlFiles) {
 const html=readFileSync(path,'utf8');
 for (const match of html.matchAll(/<(?:a|img|link|script)\b[^>]*\b(?:href|src)="([^"]+)"/g)) {
  const href=match[1].replaceAll('&amp;','&');
  if (!href.startsWith('/') || href.startsWith('//')) continue;
  const target = new URL(href,'https://jimsagnier.com');
  const file=routeFile(decodeURIComponent(target.pathname));
  if (!existsSync(file)) errors.push(`${path}: missing ${href}`);
 }
 for (const match of html.matchAll(/<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)) { try {JSON.parse(match[1]);} catch {errors.push(`${path}: invalid JSON-LD`);} }
}
const articles = readdirSync('src/content/articles').filter(name=>name.endsWith('.mdoc')).map(name=>({id:name.slice(0,-5),data:yaml.load(readFileSync(join('src/content/articles',name),'utf8').match(/^---\r?\n([\s\S]*?)\r?\n---/)[1])}));
const now=new Date();
const isPublic=({data})=> !data.draft && (!data.scheduledPublishAt || new Date(data.scheduledPublishAt)<=now) && new Date(data.publishedAt)<=now;
const published=articles.filter(isPublic);
const articleIds = new Set(articles.map(article => article.id));
const publishedIds = new Set(published.map(article => article.id));
const journal=readFileSync(join(root,'journal/index.html'),'utf8');
const rss=readFileSync(join(root,'rss.xml'),'utf8');
const llms=readFileSync(join(root,'llms.txt'),'utf8');
for (const article of articles) {
 const manual = article.data.relatedArticles ?? [];
 assert(manual.length <= 3, `Too many manual recommendations: ${article.id}`);
 assert.equal(new Set(manual).size, manual.length, `Duplicate manual recommendation: ${article.id}`);
 for (const id of manual) {
  assert(articleIds.has(id), `Unknown manual recommendation ${id} in ${article.id}`);
  assert(id !== article.id, `Self recommendation: ${article.id}`);
 }
 const output=join(root,article.id,'index.html');
 if (isPublic(article)) {
  assert(existsSync(output), `Published route missing: ${article.id}`);
  const html=readFileSync(output,'utf8');
  const recommendations = html.match(/<section\b[^>]*class="reading-links"[^>]*>\s*<h2\b[^>]*>Pour continuer à explorer<\/h2>([\s\S]*?)<\/section>/)?.[1] ?? '';
  const recommendedIds = [...recommendations.matchAll(/href="\/([^/]+)\/"/g)].map(match => match[1]);
  const expectedManual = manual.filter(id => publishedIds.has(id));
  assert.deepEqual(recommendedIds.slice(0, expectedManual.length), expectedManual, `Manual recommendation order changed: ${article.id}`);
  assert(recommendedIds.length <= 3, `Too many rendered recommendations: ${article.id}`);
  assert.equal(new Set(recommendedIds).size, recommendedIds.length, `Duplicate rendered recommendation: ${article.id}`);
  for (const id of recommendedIds) assert(id !== article.id && publishedIds.has(id), `Unavailable recommendation ${id} in ${article.id}`);
  assert(isArticlePage(html,`https://jimsagnier.com/${article.id}/`), `Monitoring rejected article ${article.id}`);
  assert(journal.includes(`href="/${article.id}/"`), `Journal HTML missing ${article.id}`);
  assert(rss.includes(`/${article.id}/`), `RSS missing ${article.id}`);
  assert(llms.includes(`/${article.id}/`), `LLMS missing ${article.id}`);
  assert(html.includes('property="og:type" content="article"'), `OG type missing ${article.id}`);
 } else {
  assert(!existsSync(output), `Private article route leaked: ${article.id}`);
  for (const path of htmlFiles) assert(!readFileSync(path,'utf8').includes(`href="/${article.id}`), `Private article linked from ${path}`);
 }
}
assert(!isArticlePage(readFileSync(join(root,'index.html'),'utf8'),'https://jimsagnier.com/inexistante/'), 'Home fallback accepted by monitoring');
assert(existsSync(join(root,'404.html')), '404 missing');
assert(!journal.includes('role="tablist"'), 'Invalid tab filter roles');
assert(journal.includes('Afficher les articles suivants'), 'Load-more control missing');
assert.equal(errors.length,0,errors.join('\n'));
console.log(`Verified ${htmlFiles.length} HTML files, ${published.length} public articles, assets, internal routes, JSON-LD, private links, RSS, llms and monitoring fallback.`);
