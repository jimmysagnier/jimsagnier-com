/**
 * Helpers JSON-LD schema.org pour le SEO structuré.
 *
 * Émet uniquement les types pertinents pour ce site :
 *   WebSite, Person, BreadcrumbList,
 *   BlogPosting, HowTo, FAQPage, CreativeWork.
 *
 * Sortie systématiquement en `@graph` pour pouvoir empiler
 * plusieurs entités dans un seul script JSON-LD.
 */

import type { CollectionEntry } from 'astro:content';
import { getJimPerson, getSiteSettings, type PersonInfo } from './site';

export type SchemaNode = Record<string, unknown>;

// ---------- bricks ----------

export function websiteNode(): SchemaNode {
  const s = getSiteSettings();
  return {
    '@type': 'WebSite',
    '@id': `${s.baseUrl}#website`,
    url: s.baseUrl,
    name: s.title,
    description: s.description,
    inLanguage: 'fr-FR',
    publisher: { '@id': `${s.baseUrl}#person` },
  };
}

export function personNode(): SchemaNode {
  const p: PersonInfo = getJimPerson();
  const s = getSiteSettings();
  return {
    '@type': 'Person',
    '@id': `${s.baseUrl}#person`,
    name: p.name,
    givenName: p.givenName,
    familyName: p.familyName,
    jobTitle: p.jobTitle,
    worksFor: { '@type': 'Organization', name: p.worksFor },
    description: p.description,
    image: p.image,
    url: p.url,
    sameAs: p.sameAs,
  };
}

export function breadcrumbNode(
  items: { name: string; url: string }[]
): SchemaNode {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.name,
      item: it.url,
    })),
  };
}

// ---------- pages ----------

interface ArticleArgs {
  article: CollectionEntry<'articles'>;
  url: string; // canonical absolute URL of the article
}

export function blogPostingNode({ article, url }: ArticleArgs): SchemaNode {
  const s = getSiteSettings();
  const data = article.data;
  const ogImage =
    data.seo?.ogImage ??
    data.coverImage.src ??
    s.defaultOgImage ??
    `${s.baseUrl}/images/jim-avatar.webp`;

  return {
    '@type': 'BlogPosting',
    '@id': `${url}#article`,
    isPartOf: { '@id': `${s.baseUrl}#website` },
    headline: data.title,
    description: data.seo?.description ?? data.summary,
    image: ogImage.startsWith('http') ? ogImage : `${s.baseUrl}${ogImage}`,
    datePublished: data.publishedAt.toISOString(),
    dateModified: (data.updatedAt ?? data.publishedAt).toISOString(),
    author: { '@id': `${s.baseUrl}#person` },
    publisher: { '@id': `${s.baseUrl}#person` },
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    keywords: [data.territory],
    inLanguage: 'fr-FR',
    url,
  };
}

export function howToNode({ article, url }: ArticleArgs): SchemaNode {
  const data = article.data;
  return {
    '@type': 'HowTo',
    '@id': `${url}#howto`,
    name: data.title,
    description: data.summary,
    totalTime: data.howTo?.totalTime,
    step: (data.howTo?.steps ?? []).map((s, i) => ({
      '@type': 'HowToStep',
      position: i + 1,
      name: s.name,
      text: s.text,
    })),
  };
}

export function faqPageNode({ article }: ArticleArgs): SchemaNode {
  return {
    '@type': 'FAQPage',
    mainEntity: (article.data.faq ?? []).map((q) => ({
      '@type': 'Question',
      name: q.question,
      acceptedAnswer: { '@type': 'Answer', text: q.answer },
    })),
  };
}

interface ProjetArgs {
  projet: CollectionEntry<'projets'>;
  url: string;
}

export function creativeWorkNode({ projet, url }: ProjetArgs): SchemaNode {
  const s = getSiteSettings();
  const data = projet.data;
  return {
    '@type': 'CreativeWork',
    '@id': `${url}#creativework`,
    name: data.title,
    description: data.summary,
    creator: { '@id': `${s.baseUrl}#person` },
    keywords: data.stack,
    creativeWorkStatus: data.status,
    inLanguage: 'fr-FR',
    url,
  };
}

// ---------- assembleur ----------

/**
 * Sérialise un graph de noeuds en JSON-LD prêt à injecter
 * dans un <script type="application/ld+json">.
 */
export function serializeGraph(nodes: SchemaNode[]): string {
  const graph = {
    '@context': 'https://schema.org',
    '@graph': nodes,
  };
  return JSON.stringify(graph);
}
