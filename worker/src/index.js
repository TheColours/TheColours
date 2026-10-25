import { DurableObject } from 'cloudflare:workers';
import { renderCard } from './card.js';
import { fetchTopLangs, renderLangs } from './langs.js';

// Single counter instance; storage operations inside one Durable Object run one at a time.
export class ViewCounter extends DurableObject {
  async hit(count) {
    const views = (await this.ctx.storage.get('views')) ?? 0;
    if (!count) return views;
    await this.ctx.storage.put('views', views + 1);
    return views + 1;
  }
}

const SVG = 'image/svg+xml; charset=utf-8';
const LANGS_TTL = 6 * 60 * 60;

// Language totals change slowly, so one GitHub query per data center every few hours is plenty.
const langs = async (request, env, ctx) => {
  const cache = caches.default;
  const hit = await cache.match(request);
  if (hit) return hit;

  const res = new Response(renderLangs(await fetchTopLangs(env.GITHUB_TOKEN)), {
    headers: { 'Content-Type': SVG, 'Cache-Control': `public, max-age=${LANGS_TTL}` },
  });
  ctx.waitUntil(cache.put(request, res.clone()));
  return res;
};

export default {
  async fetch(request, env, ctx) {
    const { pathname } = new URL(request.url);
    if (pathname === '/langs.svg') return langs(request, env, ctx);
    if (pathname !== '/card.svg') return new Response('Not found', { status: 404 });

    // Only GitHub's image proxy counts, like github-profile-views-counter, so direct hits and previews don't inflate the number.
    const fromGitHub = (request.headers.get('User-Agent') ?? '').startsWith('github-camo');
    const counter = env.VIEW_COUNTER.get(env.VIEW_COUNTER.idFromName('TheColours'));
    const views = await counter.hit(fromGitHub);

    return new Response(renderCard({ views, counted: fromGitHub }), {
      headers: {
        'Content-Type': SVG,
        'Cache-Control': 'max-age=0, no-cache, no-store, must-revalidate',
      },
    });
  },
};
