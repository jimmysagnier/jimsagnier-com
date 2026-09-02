// Battement de cœur de la publication programmée de jimsagnier.com + monitoring.
//
// POURQUOI (publication) :
// Un article n'apparaît en ligne que si un BUILD tourne APRÈS sa date. Entre deux
// publications, plus personne ne pousse : il faut un déclencheur récurrent. L'ancien
// était un cron GitHub Actions, que GitHub désactive après 60 jours d'inactivité
// (état `disabled_inactivity`) et ne réactive pas sur un push. Résultat : l'article
// du 1er sept. 2026 n'est jamais sorti. Un Cloudflare Cron Trigger, lui, ne se
// désactive jamais pour inactivité.
//
// POURQUOI (monitoring) :
// Même robuste, la publication pourrait retomber en panne silencieuse (Worker
// supprimé, jeton révoqué, échec de build...). Une fois par jour, on vérifie donc,
// INDÉPENDAMMENT du mécanisme de publication, que chaque article censé être en ligne
// l'est réellement. Sinon, on ouvre une alerte (issue GitHub → notification e-mail).
//
// Déclenchement manuel (via l'URL du Worker) :
//   (défaut)   -> déclenche le workflow de publication
//   ?monitor   -> lance le contrôle de monitoring maintenant

export default {
  async scheduled(event, env, ctx) {
    if (event.cron === env.MONITOR_CRON) {
      ctx.waitUntil(runMonitor(env));
    } else {
      ctx.waitUntil(triggerPublish(env));
    }
  },

  async fetch(request, env) {
    const url = new URL(request.url);
    try {
      if (url.searchParams.has('monitor')) {
        const r = await runMonitor(env);
        return new Response(`monitor: ${r}\n`, { status: 200 });
      }
      await triggerPublish(env);
      return new Response('publish-check dispatched\n', { status: 200 });
    } catch (err) {
      return new Response(`error: ${err.message}\n`, { status: 500 });
    }
  },
};

// --- Publication -----------------------------------------------------------

async function triggerPublish(env) {
  const { GITHUB_OWNER, GITHUB_REPO, GITHUB_WORKFLOW, GITHUB_REF } = env;
  const url =
    `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}` +
    `/actions/workflows/${GITHUB_WORKFLOW}/dispatches`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { ...ghHeaders(env, true), 'Content-Type': 'application/json' },
    body: JSON.stringify({ ref: env.GITHUB_REF || 'main' }),
  });
  if (res.status !== 204) {
    throw new Error(`workflow_dispatch a échoué : ${res.status} ${await res.text()}`);
  }
}

// --- Monitoring ------------------------------------------------------------

async function runMonitor(env) {
  const { GITHUB_OWNER, GITHUB_REPO, SITE_BASE_URL } = env;
  const ref = env.GITHUB_REF || 'main';
  const GRACE_MS = 3 * 60 * 60 * 1000; // 3h de marge après l'heure prévue
  const now = Date.now();

  // 1. Lister les articles du dépôt (source de vérité de ce qui DOIT être en ligne).
  const listUrl =
    `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}` +
    `/contents/src/content/articles?ref=${ref}`;
  const listRes = await fetch(listUrl, { headers: ghHeaders(env, true) });
  if (!listRes.ok) throw new Error(`liste des articles : ${listRes.status}`);
  const files = await listRes.json();

  const overdue = [];
  for (const f of files) {
    if (!f.name || !/\.(md|mdoc|mdx)$/.test(f.name)) continue;
    const slug = f.name.replace(/\.(md|mdoc|mdx)$/, '');

    const raw = await (await fetch(f.download_url)).text();
    const fm = raw.split(/^---\s*$/m)[1] || raw; // bloc frontmatter
    if (/^\s*draft:\s*true/m.test(fm)) continue; // brouillon : pas censé être en ligne

    const m = fm.match(/scheduledPublishAt:\s*([^\n]+)/);
    if (!m) continue;
    const sched = new Date(m[1].trim());
    if (isNaN(sched.getTime())) continue;
    if (sched.getTime() > now - GRACE_MS) continue; // pas encore dû (avec la marge)

    // L'article est dû : sa page doit répondre 200.
    const pageRes = await fetch(`${SITE_BASE_URL}/${slug}/`, { redirect: 'manual' });
    if (pageRes.status !== 200) {
      overdue.push({ slug, scheduled: m[1].trim(), status: pageRes.status });
    }
  }

  // 2. Gérer l'alerte (issue GitHub), sans doublon.
  const existing = await findOpenAlertIssue(env);

  if (overdue.length > 0) {
    if (!existing) {
      await createIssue(
        env,
        `⚠️ Publication en retard : ${overdue.length} article(s)`,
        buildAlertBody(overdue)
      );
    }
    return `ALERTE ouverte : ${overdue.length} article(s) en retard`;
  }

  // Tout est OK : refermer une éventuelle alerte encore ouverte.
  if (existing) {
    await closeIssue(env, existing.number, 'Publication revenue à la normale, tous les articles dus sont en ligne.');
    return 'OK : alerte précédente refermée';
  }
  return 'OK : aucun article en retard';
}

const ALERT_MARKER = '⚠️ Publication en retard';

async function findOpenAlertIssue(env) {
  const { GITHUB_OWNER, GITHUB_REPO } = env;
  const res = await fetch(
    `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/issues?state=open&per_page=50`,
    { headers: ghHeaders(env, true) }
  );
  if (!res.ok) return null;
  const issues = await res.json();
  return issues.find((i) => typeof i.title === 'string' && i.title.startsWith(ALERT_MARKER)) || null;
}

function buildAlertBody(overdue) {
  const lines = overdue
    .map((o) => `- \`${o.slug}\` (programmé ${o.scheduled}, la page répond ${o.status})`)
    .join('\n');
  return [
    "Le mécanisme de publication automatique n'a pas mis ces articles en ligne alors que leur date est passée :",
    '',
    lines,
    '',
    'À vérifier :',
    "1. Le Worker Cloudflare `jimsagnier-publish-heartbeat` existe et ses crons tournent.",
    '2. Le secret `GITHUB_TOKEN` du Worker est toujours valide.',
    '3. Le dernier run de `publish-check` / `deploy` dans l\'onglet Actions.',
    '',
    'Déblocage manuel : onglet **Actions** → **Publish Check** → **Run workflow**.',
    '',
    "_(Issue ouverte automatiquement par le monitoring. Elle se refermera seule quand tout sera revenu à la normale.)_",
  ].join('\n');
}

// --- Helpers GitHub issues -------------------------------------------------

async function createIssue(env, title, body) {
  const { GITHUB_OWNER, GITHUB_REPO } = env;
  const res = await fetch(
    `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/issues`,
    {
      method: 'POST',
      headers: { ...ghHeaders(env, true), 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, body }),
    }
  );
  if (!res.ok) throw new Error(`création issue : ${res.status} ${await res.text()}`);
  return (await res.json()).number;
}

async function closeIssue(env, number, comment) {
  const { GITHUB_OWNER, GITHUB_REPO } = env;
  if (comment) {
    const cRes = await fetch(
      `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/issues/${number}/comments`,
      {
        method: 'POST',
        headers: { ...ghHeaders(env, true), 'Content-Type': 'application/json' },
        body: JSON.stringify({ body: comment }),
      }
    );
    if (!cRes.ok) throw new Error(`commentaire issue : ${cRes.status} ${await cRes.text()}`);
  }
  const res = await fetch(
    `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/issues/${number}`,
    {
      method: 'PATCH',
      headers: { ...ghHeaders(env, true), 'Content-Type': 'application/json' },
      body: JSON.stringify({ state: 'closed' }),
    }
  );
  if (!res.ok) throw new Error(`fermeture issue : ${res.status} ${await res.text()}`);
}

function ghHeaders(env, auth) {
  const h = {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'User-Agent': 'jimsagnier-publish-heartbeat',
  };
  if (auth) h.Authorization = `Bearer ${env.GITHUB_TOKEN}`;
  return h;
}
