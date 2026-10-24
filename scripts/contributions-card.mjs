// Builds assets/contributions.svg: a Tokscale-style card with the recent GitHub contribution heatmap.
// Usage: node scripts/contributions-card.mjs [username] [output]
import { writeFileSync } from 'node:fs';

const user = process.argv[2] ?? 'TheColours';
const output = process.argv[3] ?? new URL('../assets/contributions.svg', import.meta.url);

const WEEKS = 30;
const CELL = 11;
const GAP = 3;
const WIDTH = 495;
const HEIGHT = 195;
const FONT = 'Figtree, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif';
const LEVEL_FILLS = ['#FFFFFF', '#2F8FFF', '#2F8FFF', '#2F8FFF', '#2F8FFF'];
const LEVEL_OPACITY = [0.07, 0.3, 0.5, 0.75, 1];

const res = await fetch(`https://github.com/users/${user}/contributions`);
if (!res.ok) throw new Error(`GitHub responded ${res.status}`);
const html = await res.text();

const counts = new Map();
for (const [, id, text] of html.matchAll(/<tool-tip[^>]*for="([^"]+)"[^>]*>([^<]+)<\/tool-tip>/g)) {
  counts.set(id, Number(text.match(/^(\d+) contributions?/)?.[1] ?? 0));
}

const days = [];
for (const [tag] of html.matchAll(/<td[^>]*data-date="[^"]+"[^>]*>/g)) {
  const date = tag.match(/data-date="([^"]+)"/)[1];
  const level = Number(tag.match(/data-level="(\d)"/)?.[1] ?? 0);
  const id = tag.match(/id="([^"]+)"/)?.[1];
  days.push({ date, level, count: counts.get(id) ?? 0 });
}
if (days.length === 0) throw new Error('No contribution days found; GitHub markup may have changed');
days.sort((a, b) => a.date.localeCompare(b.date));

const total = days.reduce((sum, d) => sum + d.count, 0);
const last = new Date(`${days.at(-1).date}T00:00:00Z`);
const start = new Date(last);
start.setUTCDate(start.getUTCDate() - last.getUTCDay() - (WEEKS - 1) * 7);
const startKey = start.toISOString().slice(0, 10);

const gridWidth = WEEKS * (CELL + GAP) - GAP;
const gridX = (WIDTH - gridWidth) / 2;
const gridY = 62;
const cells = days
  .filter((d) => d.date >= startKey)
  .map((d) => {
    const offset = Math.round((Date.parse(`${d.date}T00:00:00Z`) - start) / 86400000);
    const x = gridX + Math.floor(offset / 7) * (CELL + GAP);
    const y = gridY + (offset % 7) * (CELL + GAP);
    return `<rect x="${x}" y="${y}" width="${CELL}" height="${CELL}" rx="2.5" fill="${LEVEL_FILLS[d.level]}" fill-opacity="${LEVEL_OPACITY[d.level]}"><title>${d.date}: ${d.count}</title></rect>`;
  });

const legendX = WIDTH - 18 - 5 * (CELL + GAP) + GAP;
const legend = LEVEL_OPACITY.map(
  (opacity, level) =>
    `<rect x="${legendX + level * (CELL + GAP)}" y="${HEIGHT - 27}" width="${CELL}" height="${CELL}" rx="2.5" fill="${LEVEL_FILLS[level]}" fill-opacity="${opacity}"/>`,
);

const updated = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
const text = (x, y, fill, size, content, extra = '') =>
  `<text x="${x}" y="${y}" fill="${fill}" font-size="${size}" font-family="${FONT}"${extra}>${content}</text>`;

const svg = `<svg width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${total.toLocaleString('en-US')} GitHub contributions in the last year by @${user}">
  <title>${total.toLocaleString('en-US')} GitHub contributions in the last year</title>
  <rect width="${WIDTH}" height="${HEIGHT}" rx="12" fill="#131822"/>
  <rect x="0.5" y="0.5" width="${WIDTH - 1}" height="${HEIGHT - 1}" rx="11.5" fill="none" stroke="rgba(255,255,255,0.16)"/>
  ${text(18, 28, '#F4F7FB', 16, 'Contributions', ' font-weight="600"')}
  ${text(WIDTH - 18, 28, '#A8B3C5', 11, `Last ${WEEKS} weeks`, ' font-weight="600" text-anchor="end"')}
  <line x1="18" y1="44" x2="${WIDTH - 18}" y2="44" stroke="rgba(255,255,255,0.09)"/>
  ${cells.join('\n  ')}
  ${text(18, HEIGHT - 18, '#2F8FFF', 13, total.toLocaleString('en-US'), ' font-weight="600"')}
  ${text(18 + 7.5 * total.toLocaleString('en-US').length + 6, HEIGHT - 18, '#A8B3C5', 10, `in the last year · Updated ${updated} (UTC)`)}
  ${text(legendX - 8, HEIGHT - 18, '#A8B3C5', 10, 'Less', ' text-anchor="end"')}
  ${legend.join('\n  ')}
</svg>
`;

writeFileSync(output, svg);
console.log(`Wrote ${cells.length} days, ${total} contributions in the last year`);
