import { getCollection } from 'astro:content';
import { getSiteSettings } from '../lib/site';
import type { APIRoute } from 'astro';
const escape = (value: string) => value.replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' }[char]!));
export const GET: APIRoute = async () => {
  const settings = getSiteSettings();
  const now = new Date();
  const articles = await getCollection('articles', ({ data }) => !data.draft && (!data.scheduledPublishAt || data.scheduledPublishAt <= now) && data.publishedAt <= now);
  articles.sort((a, b) => b.data.publishedAt.getTime() - a.data.publishedAt.getTime());
  const items = articles.map((article) => {
    const url = `${settings.baseUrl}/${article.id}/`;
    return `<item><title>${escape(article.data.title)}</title><link>${escape(url)}</link><guid isPermaLink="true">${escape(url)}</guid><description>${escape(article.data.summary)}</description><pubDate>${article.data.publishedAt.toUTCString()}</pubDate></item>`;
  }).join('');
  return new Response(`<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>${escape(settings.title)}</title><link>${escape(settings.baseUrl)}</link><description>${escape(settings.description)}</description><language>fr-fr</language>${items}</channel></rss>`, { headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' } });
};
