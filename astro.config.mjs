// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import markdoc from '@astrojs/markdoc';
import keystatic from '@keystatic/astro';
import sitemap from '@astrojs/sitemap';
import { readdirSync, readFileSync } from 'node:fs';
import yaml from 'js-yaml';

// Dates éditoriales réelles : les pages fixes sans date connue n'ont pas de lastmod.
const articleDates = new Map(readdirSync('src/content/articles').filter((file) => file.endsWith('.mdoc')).map((file) => {
  const content = readFileSync(`src/content/articles/${file}`, 'utf8');
  const frontmatter = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  const data = frontmatter ? yaml.load(frontmatter[1]) : {};
  const date = new Date(data.updatedAt ?? data.publishedAt);
  return [file.replace(/\.mdoc$/, ''), Number.isNaN(date.getTime()) ? undefined : date];
}));

// Keystatic admin uniquement en dev local (pas en build production statique).
// Pour activer Keystatic en prod, basculer en mode GitHub et installer
// un adapter Astro (Cloudflare) avec output: 'server' ou 'hybrid'.
const isDev = process.env.NODE_ENV !== 'production';

export default defineConfig({
  site: 'https://jimsagnier.com',
  build: {
    // Inline le CSS dans le <head> : supprime les requêtes bloquantes pour le
    // rendu (le CSS du site est petit, ~quelques Ko brotli une fois inline).
    inlineStylesheets: 'always',
  },
  integrations: [
    react(),
    markdoc(),
    ...(isDev ? [keystatic()] : []),
    sitemap({
      // Exclure les routes admin Keystatic et API
      filter: (page) =>
        !page.includes('/keystatic') && !page.includes('/api/') && !/\/(?:404|rss\.xml|llms\.txt)\/?$/.test(page),
      i18n: {
        defaultLocale: 'fr',
        locales: { fr: 'fr-FR' },
      },
      changefreq: 'weekly',
      priority: 0.7,
      serialize: (item) => {
        const slug = new URL(item.url).pathname.replace(/^\/|\/$/g, '');
        const date = articleDates.get(slug);
        return date ? { ...item, lastmod: date.toISOString() } : item;
      },
    }),
  ],
});
