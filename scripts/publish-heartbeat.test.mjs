import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import worker from '../workers/publish-heartbeat/src/index.js';

const config = readFileSync(new URL('../workers/publish-heartbeat/wrangler.toml', import.meta.url), 'utf8');
const crons = JSON.parse(config.match(/^crons = (\[.*\])$/m)[1]);
const env = {
  GITHUB_OWNER: 'owner', GITHUB_REPO: 'repo', GITHUB_WORKFLOW: 'publish-check.yml',
  GITHUB_REF: 'main', MONITOR_CRON: '0 10 * * *',
};

async function invoke(cron, isoTime, respond) {
  const calls = [];
  const pending = [];
  const previousFetch = globalThis.fetch;
  globalThis.fetch = async (url, options) => {
    calls.push({ url, options });
    return respond ? respond(url) : new Response(null, { status: 204 });
  };
  try {
    await worker.scheduled({ cron, scheduledTime: Date.parse(isoTime) }, env, {
      waitUntil(promise) { pending.push(promise); },
    });
    await Promise.all(pending);
    return calls;
  } finally {
    globalThis.fetch = previousFetch;
  }
}

test('publication à 8 h Paris une seule fois, y compris aux changements d’heure', async () => {
  for (const [date, utcHour] of [
    ['2026-01-15', 7], ['2026-03-28', 7], ['2026-03-29', 6],
    ['2026-10-22', 6], ['2026-10-24', 6], ['2026-10-25', 7], ['2026-10-26', 7],
  ]) {
    let dispatches = 0;
    for (const hour of [6, 7]) {
      const cron = `0 ${hour} * * *`;
      assert(crons.includes(cron), `Cron absent : ${cron}`);
      const calls = await invoke(cron, `${date}T0${hour}:00:00Z`);
      assert.equal(calls.length, hour === utcHour ? 1 : 0, `${date}, ${hour} UTC`);
      for (const call of calls) {
        assert(call.url.endsWith('/actions/workflows/publish-check.yml/dispatches'));
        assert.equal(call.options.method, 'POST');
        assert.deepEqual(JSON.parse(call.options.body), { ref: 'main' });
      }
      dispatches += calls.length;
    }
    assert.equal(dispatches, 1, `${date} : publication manquante ou doublonnée`);
  }
});

test('le passage de rattrapage reste actif été comme hiver', async () => {
  assert(crons.includes('15 14 * * *'));
  for (const date of ['2026-07-01', '2026-12-01']) {
    assert.equal((await invoke('15 14 * * *', `${date}T14:15:00Z`)).length, 1);
  }
});

test('le monitoring conserve son parcours, sans lancer de publication', async () => {
  assert(crons.includes(env.MONITOR_CRON));
  const calls = await invoke(env.MONITOR_CRON, '2026-10-26T10:00:00Z', () => Response.json([]));
  assert.equal(calls.length, 2);
  assert(calls[0].url.includes('/contents/src/content/articles'));
  assert(calls[1].url.includes('/issues?'));
  assert(calls.every(call => !call.url.includes('/dispatches')));
});
