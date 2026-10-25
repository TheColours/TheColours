// Renders the "Most Used Languages" card from every non-fork repo the token can see, private ones included —
// public-only cards would show this profile as 100% JavaScript.
const QUERY = `query($after: String) {
  viewer {
    repositories(first: 100, after: $after, isFork: false, ownerAffiliations: [OWNER, COLLABORATOR, ORGANIZATION_MEMBER]) {
      pageInfo { hasNextPage endCursor }
      nodes { languages(first: 100) { edges { size node { name } } } }
    }
  }
}`;

export const fetchTopLangs = async (token, limit = 6) => {
  const totals = {};
  let after = null;
  do {
    const res = await fetch('https://api.github.com/graphql', {
      method: 'POST',
      headers: { Authorization: `bearer ${token}`, 'User-Agent': 'thecolours-profile' },
      body: JSON.stringify({ query: QUERY, variables: { after } }),
    });
    const { data, errors } = await res.json();
    if (!data) throw new Error(errors?.[0]?.message ?? `GitHub API ${res.status}`);
    const { nodes, pageInfo } = data.viewer.repositories;
    for (const { node, size } of nodes.flatMap((r) => r.languages.edges)) totals[node.name] = (totals[node.name] ?? 0) + size;
    after = pageInfo.hasNextPage ? pageInfo.endCursor : null;
  } while (after);

  const sum = Object.values(totals).reduce((a, b) => a + b, 0);
  return Object.entries(totals).sort((a, b) => b[1] - a[1]).slice(0, limit)
    .map(([name, bytes]) => ({ name, pct: (bytes / sum) * 100 }));
};

// GitHub linguist colors, lightened where the original disappears on the dark card.
const COLORS = {
  'C#': '#3FB950', ShaderLab: '#8B9BB4', C: '#A8B9CC', HTML: '#E34C26', HLSL: '#AACE60',
  JavaScript: '#F1E05A', CSS: '#663399', Python: '#3572A5', 'Objective-C': '#438EFF',
};
const colorOf = (name) => COLORS[name] ?? '#A8B3C5';

const FONT = '-apple-system, BlinkMacSystemFont, Segoe UI, Helvetica, Arial, sans-serif';
const W = 460, H = 162, PAD = 22, BAR_W = W - PAD * 2;

export const renderLangs = (top) => {
  let x = PAD;
  const segments = top.map(({ name, pct }) => {
    const w = (pct / 100) * BAR_W;
    const seg = `<rect x="${x.toFixed(1)}" y="52" width="${w.toFixed(1)}" height="10" fill="${colorOf(name)}"/>`;
    x += w;
    return seg;
  }).join('') + `<rect x="${x.toFixed(1)}" y="52" width="${(PAD + BAR_W - x).toFixed(1)}" height="10" fill="#30363D"/>`; // other languages

  const rows = top.map(({ name, pct }, i) => {
    const cx = PAD + (i % 2) * (BAR_W / 2), cy = 90 + Math.floor(i / 2) * 24;
    return `<g class="row" style="animation-delay:${0.4 + i * 0.08}s">
    <circle cx="${cx + 5}" cy="${cy - 4}" r="5" fill="${colorOf(name)}"/>
    <text x="${cx + 18}" y="${cy}" class="name">${name}</text>
    <text x="${cx + BAR_W / 2 - 14}" y="${cy}" class="pct" text-anchor="end">${pct.toFixed(1)}%</text>
  </g>`;
  }).join('\n  ');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="Most used languages">
  <style>
    .title { font: 600 15px ${FONT}; fill: #2F8FFF; }
    .name { font: 500 13px ${FONT}; fill: #F4F7FB; }
    .pct { font: 400 12px ${FONT}; fill: #A8B3C5; }
    .bar { transform-origin: ${PAD}px 0; animation: grow .9s ease-out both; }
    .row { opacity: 0; animation: fade .4s ease-out both; }
    @keyframes grow { from { transform: scaleX(0); } to { transform: scaleX(1); } }
    @keyframes fade { from { opacity: 0; } to { opacity: 1; } }
    @media (prefers-reduced-motion: reduce) { * { animation: none !important; } .row { opacity: 1; } }
  </style>
  <rect x="0.5" y="0.5" width="${W - 1}" height="${H - 1}" rx="12" fill="#131822" stroke="#FFFFFF29"/>
  <text x="${PAD}" y="36" class="title">Most Used Languages</text>
  <clipPath id="bar"><rect x="${PAD}" y="52" width="${BAR_W}" height="10" rx="5"/></clipPath>
  <g clip-path="url(#bar)"><g class="bar">${segments}</g></g>
  ${rows}
</svg>
`;
};
