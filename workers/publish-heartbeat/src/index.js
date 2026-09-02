// Battement de cœur de la publication programmée pour jimsagnier.com.
//
// Pourquoi ce Worker existe :
// Les articles ont un champ `scheduledPublishAt`. Un article n'apparaît en ligne
// que si un BUILD tourne APRÈS sa date (le build exclut les articles encore
// datés dans le futur). Entre deux publications de contenu, plus personne ne
// pousse : il faut donc un déclencheur automatique et récurrent qui relance un
// build. L'ancien déclencheur était un cron GitHub Actions, que GitHub désactive
// automatiquement après 60 jours d'inactivité (état `disabled_inactivity`) et ne
// réactive pas sur un push. Résultat : l'article du 1er sept. 2026 n'est jamais
// sorti. Un Cloudflare Cron Trigger, lui, ne se désactive jamais pour inactivité.
//
// Ce que fait le Worker : à chaque tick du cron (voir wrangler.toml), il déclenche
// le workflow GitHub `publish-check` (workflow_dispatch). Ce workflow vérifie
// s'il y a un article dû (fenêtre de rattrapage de 30 jours) et, si oui,
// rebuild + redeploie le site sur Cloudflare Pages.
//
// Déploiement (une seule fois) :
//   1. Créer un GitHub fine-grained PAT : dépôt jimsagnier-com, permission
//      "Actions: Read and write". (Repository → Settings → n'est pas nécessaire ;
//      le token se crée dans GitHub → Settings → Developer settings →
//      Fine-grained tokens.)
//   2. cd workers/publish-heartbeat && npx wrangler secret put GITHUB_TOKEN
//      (coller le token quand demandé)
//   3. npx wrangler deploy
//
// Test manuel après déploiement : ouvrir l'URL du Worker (GET) déclenche aussi
// le workflow, ou lancer `publish-check` à la main depuis l'onglet Actions.

export default {
  // Appelé par le Cloudflare Cron Trigger.
  async scheduled(event, env, ctx) {
    ctx.waitUntil(triggerPublish(env));
  },

  // Déclenchement manuel de secours (utile pour tester le câblage).
  async fetch(request, env) {
    try {
      await triggerPublish(env);
      return new Response('publish-check dispatched\n', { status: 200 });
    } catch (err) {
      return new Response(`error: ${err.message}\n`, { status: 500 });
    }
  },
};

async function triggerPublish(env) {
  const {
    GITHUB_OWNER,
    GITHUB_REPO,
    GITHUB_WORKFLOW,
    GITHUB_REF,
    GITHUB_TOKEN,
  } = env;

  if (!GITHUB_TOKEN) {
    throw new Error('GITHUB_TOKEN manquant (npx wrangler secret put GITHUB_TOKEN)');
  }

  const url =
    `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}` +
    `/actions/workflows/${GITHUB_WORKFLOW}/dispatches`;

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${GITHUB_TOKEN}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': 'jimsagnier-publish-heartbeat',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ ref: GITHUB_REF || 'main' }),
  });

  // workflow_dispatch réussi = 204 No Content.
  if (res.status !== 204) {
    const text = await res.text();
    throw new Error(`workflow_dispatch a échoué : ${res.status} ${text}`);
  }
}
