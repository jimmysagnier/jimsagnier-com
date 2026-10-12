interface ArticleForRecommendations {
  id: string;
  data: {
    draft: boolean;
    publishedAt: Date;
    scheduledPublishAt?: Date;
    topics?: readonly string[];
    projectIds?: readonly string[];
    relatedArticles?: readonly string[];
  };
}

/** Les choix éditoriaux passent en premier, puis les affinités habituelles. */
export function getRelatedArticles<T extends ArticleForRecommendations>(
  article: T,
  articles: readonly T[],
  now = new Date(),
): T[] {
  const available = articles.filter(candidate =>
    candidate.id !== article.id && !candidate.data.draft &&
    candidate.data.publishedAt <= now &&
    (!candidate.data.scheduledPublishAt || candidate.data.scheduledPublishAt <= now),
  );
  const byId = new Map(available.map(candidate => [candidate.id, candidate]));
  const selected = new Map<string, T>();
  for (const id of article.data.relatedArticles ?? []) {
    const candidate = byId.get(id);
    if (candidate) selected.set(id, candidate);
    if (selected.size === 3) return [...selected.values()];
  }

  const automatic = available
    .filter(candidate => !selected.has(candidate.id))
    .map(candidate => ({
      article: candidate,
      score: (candidate.data.topics ?? []).filter(topic => article.data.topics?.includes(topic)).length * 2
        + (candidate.data.projectIds ?? []).filter(project => article.data.projectIds?.includes(project)).length,
    }))
    .filter(candidate => candidate.score > 0)
    .sort((a, b) => b.score - a.score
      || b.article.data.publishedAt.getTime() - a.article.data.publishedAt.getTime()
      || a.article.id.localeCompare(b.article.id));

  for (const candidate of automatic) {
    selected.set(candidate.article.id, candidate.article);
    if (selected.size === 3) break;
  }
  return [...selected.values()];
}
