import { getCollection } from 'astro:content';
import { getSiteSettings } from '../lib/site';
import type { APIRoute } from 'astro';
export const GET: APIRoute = async () => {
  const settings = getSiteSettings();
  const now = new Date();
  const articles = await getCollection('articles', ({ data }) => !data.draft && (!data.scheduledPublishAt || data.scheduledPublishAt <= now) && data.publishedAt <= now);
  articles.sort((a, b) => b.data.publishedAt.getTime() - a.data.publishedAt.getTime());
  const lines = ["# L'Atelier de Jim Sagnier", '', '> Bibliothèque personnelle : projets, pratiques et idées autour du SEO, de l’acquisition B2B, de l’IA appliquée et du web.', '', 'Jim Sagnier est Lead acquisition chez Eurofiscalis, basé à Lyon. Il documente sa pratique et les projets auxquels il contribue. Il n’est pas fiscaliste. Ce site ne propose pas de prestations commerciales.', '', '## Repères', `- [À propos](${settings.baseUrl}/a-propos/)`, `- [Bibliothèque](${settings.baseUrl}/journal/)`, `- [Projets](${settings.baseUrl}/projets/)`, `- [Flux RSS](${settings.baseUrl}/rss.xml)`, '', '## Articles publiés', ...articles.map((article) => `- [${article.data.title.replace(/[\[\]\r\n]/g, ' ')}](${settings.baseUrl}/${article.id}/) : ${article.data.summary.replace(/[\r\n]/g, ' ')}`), '', '## Lecture', 'Les récits relatent une pratique personnelle. Les résultats observés dans un projet ne garantissent pas les mêmes résultats ailleurs.', ''];
  return new Response(lines.join('\n'), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
