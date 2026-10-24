import { DurableObject } from 'cloudflare:workers';
import { renderCard } from './card.js';

// Single counter instance; storage operations inside one Durable Object run one at a time.
export class ViewCounter extends DurableObject {
  async hit(count) {
    const views = (await this.ctx.storage.get('views')) ?? 0;
    if (!count) return views;
    await this.ctx.storage.put('views', views + 1);
    return views + 1;
  }
}

export default {
  async fetch(request, env) {
    const { pathname } = new URL(request.url);
    if (pathname !== '/card.svg') return new Response('Not found', { status: 404 });

    // Only GitHub's image proxy counts, like github-profile-views-counter, so direct hits and previews don't inflate the number.
    const fromGitHub = (request.headers.get('User-Agent') ?? '').startsWith('github-camo');
    const counter = env.VIEW_COUNTER.get(env.VIEW_COUNTER.idFromName('TheColours'));
    const views = await counter.hit(fromGitHub);

    return new Response(renderCard({ views, counted: fromGitHub }), {
      headers: {
        'Content-Type': 'image/svg+xml; charset=utf-8',
        'Cache-Control': 'max-age=0, no-cache, no-store, must-revalidate',
      },
    });
  },
};
