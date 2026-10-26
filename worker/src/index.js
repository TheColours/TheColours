import { DurableObject } from 'cloudflare:workers';
import { renderCard } from './card.js';
import { fetchTopLangs, renderLangs } from './langs.js';

// Single instance; storage operations inside one Durable Object run one at a time.
// Also holds pre-rendered SVGs so every data center serves them without calling slow upstream APIs.
export class ViewCounter extends DurableObject {
  async hit(count) {
    const views = (await this.ctx.storage.get('views')) ?? 0;
    if (!count) return views;
    await this.ctx.storage.put('views', views + 1);
    return views + 1;
  }

  getSvg(key) { return this.ctx.storage.get(key); }
  putSvg(key, svg) { return this.ctx.storage.put(key, svg); }
}

const SVG = 'image/svg+xml; charset=utf-8';
const TOKSCALE_URL = 'https://tokscale.ai/api/embed/TheColours/svg?compact=1&tokens=compact&cost=compact';

const RENDERERS = {
  'langs.svg': async (env) => renderLangs(await fetchTopLangs(env.GITHUB_TOKEN)),
  'tokscale.svg': async () => {
    const res = await fetch(TOKSCALE_URL);
    if (!res.ok) throw new Error(`Tokscale ${res.status}`);
    return res.text();
  },
};

const store = (env) => env.VIEW_COUNTER.get(env.VIEW_COUNTER.idFromName('TheColours'));

// Keeps the last good SVG when an upstream fails.
const refresh = async (env, key) => {
  const svg = await RENDERERS[key](env);
  await store(env).putSvg(key, svg);
  return svg;
};

// Serves the stored copy; only renders inline the very first time, before the cron has run.
const cached = async (env, key) => new Response((await store(env).getSvg(key)) ?? (await refresh(env, key)), {
  headers: { 'Content-Type': SVG, 'Cache-Control': 'public, max-age=1800' },
});

export default {
  async fetch(request, env, ctx) {
    const { pathname } = new URL(request.url);
    const key = pathname.slice(1);
    if (Object.hasOwn(RENDERERS, key)) return cached(env, key);
    if (pathname !== '/card.svg') return new Response('Not found', { status: 404 });

    // Only GitHub's image proxy counts, like github-profile-views-counter, so direct hits and previews don't inflate the number.
    const fromGitHub = (request.headers.get('User-Agent') ?? '').startsWith('github-camo');
    const views = await store(env).hit(fromGitHub);

    return new Response(renderCard({ views, counted: fromGitHub }), {
      headers: {
        'Content-Type': SVG,
        'Cache-Control': 'max-age=0, no-cache, no-store, must-revalidate',
      },
    });
  },

  async scheduled(event, env, ctx) {
    ctx.waitUntil(Promise.allSettled(Object.keys(RENDERERS).map((key) => refresh(env, key))));
  },
};
