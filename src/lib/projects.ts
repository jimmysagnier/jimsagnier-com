/**
 * Helper projets : factorise le fallback des 5 projets validés
 * tant que Keystatic n'a pas d'entrées dans la collection.
 *
 * Quand Jim créera des projets dans Keystatic, getProjects() basculera
 * automatiquement sur la collection (plus de fallback).
 */

import { getCollection } from 'astro:content';
import type { UniverseProject } from '../components/UniverseCard.astro';

export const FALLBACK_PROJECTS: UniverseProject[] = [
  {
    slug: 'eurofiscalis-refonte',
    color: 'cyan',
    status: 'live · 34%',
    type: 'work',
    year: '2026',
    role: 'Acquisition · SEO · contenu · pipeline IA',
    title: 'Eurofiscalis, refonte complète',
    summary: `Le gros chantier de l'année. Refonte du site corporate (Astro 6 + Sanity v3), <strong>quinze pays européens</strong> à couvrir avec sept templates d'articles, et derrière, <em>une suite de skills Claude pour automatiser 80% du pipeline éditorial</em>. Avec Max au dev. Go-live <strong>juillet 2026</strong>.`,
    subProjects: [
      { title: 'Stack Astro + Sanity' },
      { title: 'Skill Pipeline SEO' },
      { title: 'Cocons SEO · 15 pays' },
    ],
    stack: ['astro 6', 'sanity v3', 'cloudflare pages', 'claude skills', 'mcp'],
    progress: 34,
    progressLabel: '34% complété',
    progressTarget: 'juillet 2026',
    windowUrl: 'eurofiscalis.com · refonte (preview)',
    windowLabel: '// Sanity studio · article',
  },
  {
    slug: 'crm-eurofiscalis',
    color: 'pink',
    status: 'en cours · v0.2',
    type: 'outil',
    year: '2026',
    role: 'Vibecodé sur mesure · cycle de vente B2B fiscal',
    title: 'CRM Métier Eurofiscalis',
    summary: `Pas de CRM du marché qui comprenne la niche TVA B2B, alors je l'ai construit. <em>Vibecodé avec Claude</em>, pensé pour notre cycle de vente : qualification prospect, suivi des appels, <strong>pipeline par pays et par régime TVA</strong>. Fait pour nous, pas pour tout le monde.`,
    stack: ['vibecoding', 'claude', 'b2b', 'pipeline'],
    progress: 20,
    progressLabel: 'v0.2, en construction',
    progressTarget: 'usage interne',
    windowUrl: 'crm-eurofiscalis · pipeline commercial',
    windowLabel: '// lead · TVA Allemagne',
  },
  {
    slug: 'jimsagnier-com',
    color: 'warm',
    status: 'live · v0.1',
    type: 'perso',
    year: '2026',
    role: 'Design · code · contenu · tout',
    title: 'jimsagnier.com',
    summary: `Ce site. Construit comme un atelier ouvert : <strong>Astro hybride</strong>, <strong>CSS artisanal</strong>, pas de framework, déployé sur Cloudflare Pages. <em>Tout le code est public sur GitHub.</em> C'est aussi un terrain de craft où j'essaie tout ce que je n'ai pas le temps d'essayer ailleurs.`,
    stack: ['astro', 'css artisanal', 'cloudflare', 'typescript'],
    progress: 60,
    progressLabel: 'v0.1, fondations',
    progressTarget: 'itération continue',
    windowUrl: "jimsagnier.com · l'atelier",
    windowLabel: '// home page',
  },
  {
    slug: 'la-puissance-de-leveil',
    color: 'purple',
    status: 'live · entretien',
    type: 'coup-de-main',
    year: '2025–26',
    role: 'Coup de main à Eva Naudet · gratuit',
    title: "La Puissance de l'Éveil",
    summary: `Site personnel d'<strong>Eva Naudet</strong>, coach holistique. <em>HTML pur, fonts variables, AVIF, sticky-scroll, zéro framework</em> : le craft à l'os, pour une amie. C'est ce projet qui m'a remis dans le HTML/CSS pur après des années d'abstractions, et c'est ma référence "craft" pour tout le reste.`,
    stack: ['html', 'css', 'variable fonts', 'avif'],
    progress: 92,
    progressLabel: 'livré · maintenance',
    progressTarget: 'v1 stable',
    windowUrl: 'lapuissancedeleveil.com',
    windowLabel: "// craft à l'os · zéro framework",
  },
  {
    slug: 'second-cerveau-mcp',
    color: 'green',
    status: 'live · v0.4',
    type: 'outil',
    year: '2025–26',
    role: 'Vault Obsidian piloté par Claude',
    title: 'Second Cerveau MCP',
    summary: `Mon vault de <strong>~600 notes</strong> piloté par Claude via MCP. <em>Ingestion de sources, lint sémantique, queries citées, ajouts auto.</em> Tourne en local sur ma machine. C'est la mémoire externe de tout ce que je documente : les notes nourrissent ma rédaction, et la rédaction enrichit les notes.`,
    stack: ['obsidian', 'mcp', 'claude', 'node'],
    progress: 65,
    progressLabel: 'v0.4, itération',
    progressTarget: 'open source bientôt',
    windowUrl: 'obsidian://second-cerveau · ~600 notes',
    windowLabel: '// MCP · query résolu',
  },
];

export async function getProjects(): Promise<UniverseProject[]> {
  const collectionProjects = await getCollection('projets', ({ data }) => !data.archived);
  if (collectionProjects.length === 0) return FALLBACK_PROJECTS;
  collectionProjects.sort((a, b) => (a.data.order ?? 0) - (b.data.order ?? 0));
  return collectionProjects.map((p) => ({
    slug: p.id,
    color: p.data.color,
    status: p.data.status,
    type: p.data.type,
    year: p.data.year,
    role: p.data.role,
    title: p.data.title,
    summary: p.data.summary,
    subProjects: p.data.subProjects,
    stack: p.data.stack,
    progress: p.data.progress,
  }));
}
