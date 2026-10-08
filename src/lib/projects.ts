/**
 * Helper projets : registre des projets validés par Jim
 * tant que Keystatic n'a pas d'entrées dans la collection.
 *
 * Quand Jim créera des projets dans Keystatic, getProjects() basculera
 * chaque entrée du registre correspondante, sans masquer les autres projets.
 */

import { getCollection } from 'astro:content';
import type { UniverseProject } from '../components/UniverseCard.astro';

export type ProjectStatus = 'en-cours' | 'live' | 'entretien' | 'termine' | 'archive';
export type SiteProject = UniverseProject & { status: ProjectStatus; version?: string; group?: 'applications' | 'saas' | 'web' | 'notes'; kind?: string; initial?: string; cardSummary?: string };

export const PROJECT_GROUPS = { applications: 'Applications macOS', saas: 'Outils SaaS', web: 'Web & projets', notes: 'Connaissance & IA' } as const;
const PRESENTATION: Record<string, Partial<SiteProject>> = {
  'eurofiscalis-refonte': {group:'web',kind:'Web · Acquisition',initial:'E',cardSummary:'Je contribue aux choix SEO et éditoriaux de la refonte, avec Kévin au design et Max au développement.'},
  'crm-eurofiscalis': {group:'web',kind:'Outil interne · B2B',initial:'CRM',cardSummary:'Un CRM sur mesure, pensé pour notre cycle de vente B2B chez Eurofiscalis.'},
  'jimsagnier-com': {group:'web',kind:'Site personnel',initial:'JS',cardSummary:'Mon atelier ouvert : une bibliothèque pour documenter ce que je construis et ce que j’apprends.'},
  'la-puissance-de-leveil': {group:'web',kind:'Web · Coup de main',initial:'É',cardSummary:'Un coup de main à Eva Naudet pour concevoir un site qui respecte sa voix.'},
  'second-cerveau-mcp': {group:'notes',kind:'Connaissance · IA',initial:'SC',cardSummary:'Je relie mes notes et mes outils pour retrouver mes idées et travailler avec l’IA.'},
};

export const FALLBACK_PROJECTS: SiteProject[] = [
  {slug:'mycockpit',title:'MyCockpit',color:'green',status:'en-cours',type:'outil',group:'applications',kind:'Application macOS',initial:'MC',summary:'Mon application pour piloter les contenus de plusieurs sites : idées, tâches, performance SEO et suivi des actions.',role:'Je développe cet outil pour organiser mon travail éditorial et SEO.'},
  {slug:'athla',title:'Athla',color:'green',status:'en-cours',type:'outil',group:'applications',kind:'Application macOS',initial:'A',summary:'Mon application de chat IA et mon environnement de travail personnel.',role:'Je construis un espace pour travailler avec l’IA. Le détail du projet sera documenté ici.'},
  {slug:'intento',title:'Intento',color:'green',status:'en-cours',type:'outil',group:'saas',kind:'SaaS · SEO sémantique',initial:'i',summary:'Un outil de recherche et d’optimisation sémantique : intentions de recherche, SERP et analyse des contenus.',role:'Je développe l’outil à partir de mes besoins en recherche SEO.'},
  {slug:'trakkeon',title:'Trakkeon',color:'green',status:'en-cours',type:'outil',group:'saas',kind:'SaaS · À venir',initial:'T',summary:'Un outil de suivi des positions à partir de Google Search Console et Bing Webmaster Tools.',role:'Un projet en préparation. Son contexte et ses choix seront documentés au fil du travail.'},
  {
    slug: 'eurofiscalis-refonte',
    color: 'cyan',
    status: 'live',
    type: 'work',
    year: '2026',
    role: 'Acquisition · SEO · contenu · pipeline IA',
    title: 'Eurofiscalis, refonte complète',
    summary: `Le gros chantier de l'année. Passage de WordPress à <strong>Astro 6 + Payload CMS</strong> (self-hosted), et <strong>2700 pages en 7 langues</strong> migrées sans perdre le référencement. Derrière, <em>une suite de skills Claude qui automatise l'essentiel du pipeline éditorial</em>, et des taux de TVA dynamiques mis à jour d'un seul endroit. Avec Kévin au design et Max au dev. En production.`,
    subProjects: [
      { title: 'Stack Astro + Payload' },
      { title: 'Skill Pipeline SEO' },
      { title: 'Architecture des cocons SEO' },
    ],
    stack: ['astro 6', 'payload cms', 'cloudflare pages', 'claude skills', 'mcp'],
    progress: 100,
    progressLabel: 'en production',
    progressTarget: '2700 pages · 7 langues',
    windowUrl: 'eurofiscalis.com · en production',
    windowLabel: '// Payload · article',
  },
  {
    slug: 'crm-eurofiscalis',
    color: 'pink',
    status: 'en-cours',
    version: 'v0.2',
    type: 'outil',
    year: '2026',
    role: 'Vibecodé sur mesure · cycle de vente B2B fiscal',
    title: 'CRM Métier Eurofiscalis',
    summary: `Pas de CRM du marché qui comprenne la niche TVA B2B, alors je l'ai construit. <em>Vibecodé avec Claude</em>, pensé pour notre cycle de vente : qualification prospect, suivi des appels, <strong>pipeline par pays et par régime TVA</strong>. Fait pour nous, pas pour tout le monde.`,
    stack: ['vibecoding', 'claude', 'b2b', 'pipeline'],
    progressLabel: 'v0.2, en construction',
    progressTarget: 'usage interne',
    windowUrl: 'crm-eurofiscalis · pipeline commercial',
    windowLabel: '// lead · TVA Allemagne',
  },
  {
    slug: 'jimsagnier-com',
    color: 'warm',
    status: 'live',
    version: 'v0.1',
    type: 'perso',
    year: '2026',
    role: 'Design · code · contenu · tout',
    title: 'jimsagnier.com',
    summary: `Ce site. Construit comme un atelier ouvert : <strong>Astro statique</strong>, <strong>CSS artisanal</strong>, pas de framework, déployé sur Cloudflare Pages. <em>Tout le code est public sur GitHub.</em> C'est aussi un terrain de craft où j'essaie tout ce que je n'ai pas le temps d'essayer ailleurs.`,
    stack: ['astro', 'css artisanal', 'cloudflare', 'typescript'],
    progressLabel: 'v0.1, fondations',
    progressTarget: 'itération continue',
    windowUrl: "jimsagnier.com · l'atelier",
    windowLabel: '// home page',
  },
  {
    slug: 'la-puissance-de-leveil',
    color: 'purple',
    status: 'termine',
    type: 'coup-de-main',
    year: '2026',
    role: 'Coup de main à Eva Naudet · gratuit',
    title: "La Puissance de l'Éveil",
    summary: `Site personnel d'<strong>Eva Naudet</strong>, coach holistique. <em>HTML pur, fonts variables, AVIF, sticky-scroll, zéro framework</em> : le craft à l'os, pour une amie. C'est ce projet qui m'a remis dans le HTML/CSS pur après des années d'abstractions, et c'est ma référence "craft" pour tout le reste.`,
    stack: ['html', 'css', 'variable fonts', 'avif'],
    progress: 100,
    progressLabel: 'livré',
    timeSpent: '38h · 5 semaines',
    windowUrl: 'lapuissancedeleveil.com',
    windowLabel: "// craft à l'os · zéro framework",
  },
  {
    slug: 'second-cerveau-mcp',
    color: 'green',
    status: 'live',
    version: 'v0.4',
    type: 'outil',
    year: '2025–26',
    role: 'Vault Obsidian piloté par Claude',
    title: 'Second Cerveau MCP',
    summary: `Mon vault de <strong>~600 notes</strong> piloté par Claude via MCP. <em>Ingestion de sources, lint sémantique, queries citées, ajouts auto.</em> Tourne en local sur ma machine. C'est la mémoire externe de tout ce que je documente : les notes nourrissent ma rédaction, et la rédaction enrichit les notes.`,
    stack: ['obsidian', 'mcp', 'claude', 'node'],
    progressLabel: 'v0.4, itération',
    progressTarget: 'open source bientôt',
    windowUrl: 'obsidian://second-cerveau · ~600 notes',
    windowLabel: '// MCP · query résolu',
  },
];

/** Relations explicites : un outil cité ne désigne pas le projet concerné. */
export async function getArticlesForProject(slug: string) {
  const now = new Date();
  const articles = await getCollection('articles', ({ data }) =>
    !data.draft && data.publishedAt <= now && (!data.scheduledPublishAt || data.scheduledPublishAt <= now) && data.projectIds.includes(slug as typeof data.projectIds[number])
  );
  articles.sort((a, b) => b.data.publishedAt.getTime() - a.data.publishedAt.getTime());
  return articles;
}

export async function getProjects(): Promise<SiteProject[]> {
  const collectionProjects = await getCollection('projets');
  const registry = new Map(FALLBACK_PROJECTS.map((project) => [project.slug, {...project, ...PRESENTATION[project.slug]}]));
  for (const p of collectionProjects) {
    if (p.data.archived || p.data.status === 'archive') { registry.delete(p.id); continue; }
    registry.set(p.id, {
      ...registry.get(p.id),
      slug: p.id, color: p.data.color, status: p.data.status, type: p.data.type,
      year: p.data.year, role: p.data.role, title: p.data.title, summary: p.data.summary,
      subProjects: p.data.subProjects, stack: p.data.stack, progress: p.data.progress,
    });
  }
  const order = new Map(collectionProjects.map((p) => [p.id, p.data.order]));
  return [...registry.values()].sort((a, b) => (order.get(a.slug) ?? 0) - (order.get(b.slug) ?? 0));
}
