/**
 * Site config helper.
 *
 * Lit le singleton `settings` géré dans Keystatic
 * (src/content/settings/site.yaml). Si le fichier n'existe pas encore
 * ou n'est pas valide, fallback sur les valeurs par défaut ci-dessous,
 * ça permet au site de booter même avant que Jim ait ouvert Keystatic.
 */

import fs from 'node:fs';
import path from 'node:path';
import yaml from 'js-yaml';

export interface SocialLink {
  platform: string;
  url: string;
}

export interface SiteSettings {
  title: string;
  tagline: string;
  description: string;
  baseUrl: string;
  defaultOgImage?: string;
  sameAs: SocialLink[];
}

const DEFAULT_SETTINGS: SiteSettings = {
  title: "L'Atelier de Jim Sagnier",
  tagline: "L'atelier d'un acquisitionneur qui écrit et qui vibecode.",
  description:
    "Acquisition B2B, IA, SEO et expérimentation web. Le journal d'un responsable acquisition qui code à côté.",
  baseUrl: 'https://jimsagnier.com',
  defaultOgImage: undefined,
  sameAs: [],
};

let cached: SiteSettings | null = null;

export function getSiteSettings(): SiteSettings {
  if (cached) return cached;

  const settingsPath = path.join(
    process.cwd(),
    'src/content/settings/site.yaml'
  );

  try {
    if (fs.existsSync(settingsPath)) {
      const raw = yaml.load(fs.readFileSync(settingsPath, 'utf-8'));
      if (raw && typeof raw === 'object') {
        cached = { ...DEFAULT_SETTINGS, ...(raw as Partial<SiteSettings>) };
        return cached;
      }
    }
  } catch (err) {
    console.warn('[site.ts] Erreur lecture settings, fallback default:', err);
  }

  cached = DEFAULT_SETTINGS;
  return cached;
}

/**
 * Person schema markup data, Jim lui-même.
 * Hardcodé ici, pas configurable via Keystatic (ça change rarement).
 * Les liens sociaux viennent du singleton settings.
 */
export interface PersonInfo {
  name: string;
  givenName: string;
  familyName: string;
  jobTitle: string;
  worksFor: string;
  description: string;
  image: string;
  url: string;
  sameAs: string[];
}

export function getJimPerson(): PersonInfo {
  const settings = getSiteSettings();
  return {
    name: 'Jim Sagnier',
    givenName: 'Jim',
    familyName: 'Sagnier',
    jobTitle: 'Responsable acquisition',
    worksFor: 'Eurofiscalis',
    description:
      "Responsable acquisition chez Eurofiscalis, vibecodeur, et coup de main aux projets indépendants.",
    image: `${settings.baseUrl}/images/jim-avatar.webp`,
    url: settings.baseUrl,
    sameAs: settings.sameAs.map((s) => s.url),
  };
}
