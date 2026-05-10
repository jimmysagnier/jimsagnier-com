// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import markdoc from '@astrojs/markdoc';
import keystatic from '@keystatic/astro';
import sitemap from '@astrojs/sitemap';

// Keystatic admin uniquement en dev local (pas en build production statique).
// Pour activer Keystatic en prod, basculer en mode GitHub et installer
// un adapter Astro (Cloudflare) avec output: 'server' ou 'hybrid'.
const isDev = process.env.NODE_ENV !== 'production';

export default defineConfig({
  site: 'https://jimsagnier.com',
  integrations: [
    react(),
    markdoc(),
    ...(isDev ? [keystatic()] : []),
    sitemap({
      // Exclure les routes admin Keystatic et API
      filter: (page) =>
        !page.includes('/keystatic') && !page.includes('/api/'),
      i18n: {
        defaultLocale: 'fr',
        locales: { fr: 'fr-FR' },
      },
      changefreq: 'weekly',
      priority: 0.7,
      lastmod: new Date(),
    }),
  ],
});
