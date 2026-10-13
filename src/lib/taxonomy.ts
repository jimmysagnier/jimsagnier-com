/** Sujets, séries et projets : axes indépendants du territoire éditorial. */
export const TOPICS = [
  { slug: 'acquisition-b2b', label: 'Acquisition B2B', aliases: ['commercial B2B', 'acquisition', 'vente B2B'] },
  { slug: 'seo', label: 'SEO', aliases: ['référencement', 'maillage', 'maillage interne', 'indexation'] },
  { slug: 'ia-appliquee', label: 'IA appliquée', aliases: ['IA', 'Claude', 'LLM', 'MCP', 'skills', 'vibecoding'] },
  { slug: 'web-outils', label: 'Web & outils', aliases: ['web', 'CMS', 'Astro', 'performance', 'craft', 'design'] },
  { slug: 'ecriture-contenu', label: 'Écriture & contenu', aliases: ['contenu', 'contenu éditorial', 'rédaction', 'transcréation', 'écriture'] },
] as const;
export const PROJECT_IDS = ['eurofiscalis-refonte', 'crm-eurofiscalis', 'jimsagnier-com', 'la-puissance-de-leveil', 'second-cerveau-mcp', 'mycockpit', 'athla', 'intento', 'trakkeon'] as const;
export const SERIES = [
  { id: 'serie-eva', label: "Le site d'Eva, de Wix au sur-mesure" },
  { id: 'saga-eurofiscalis-s1', label: 'Eurofiscalis : la refonte' },
  { id: 'saga-eurofiscalis-s2', label: 'Eurofiscalis : la fabrique de contenu' },
  { id: 'saga-eurofiscalis-s3', label: 'Eurofiscalis : les outils' },
  { id: 'saga-eurofiscalis-s4', label: 'Eurofiscalis : après la migration' },
  { id: 'saga-eurofiscalis-s5', label: 'Eurofiscalis : SEO et recherche avec IA' },
] as const;
export function getTopicLabel(slug: string): string {
  return TOPICS.find((topic) => topic.slug === slug)?.label ?? slug;
}
export function normalizeTopic(value: string): string | undefined {
  const normalize = (text: string) => text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
  const wanted = normalize(value);
  return TOPICS.find((topic) => [topic.slug, topic.label, ...topic.aliases].some((alias) => normalize(alias) === wanted))?.slug;
}
