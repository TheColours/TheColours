// Renders the animated pixel idle-RPG card shown in the profile README.
const P = 6;
const pix = (rows, colors, ox, oy) => rows.flatMap((r, y) => [...r].map((c, x) => c === '.' ? '' :
  `<rect x="${ox + x * P}" y="${oy + y * P}" width="${P}" height="${P}" fill="${colors[c]}"/>`)).filter(Boolean).join('');
const hero = pix([
  '..HHHH..W.',
  '.HHHHHH.W.',
  '.HSSSSH.W.',
  '.HSSKSK.W.',
  '..SSSS..W.',
  '.BBBBBBGGG',
  'BBBBBBBS..',
  '.BBBBB....',
  '.LL..LL...',
  '.LL..LL...',
], { H: '#6FB6FF', S: '#F2C79B', K: '#0D1117', B: '#A98BFF', L: '#3B4A6B', W: '#E6EDF3', G: '#FFB86B' }, 0, 0);
const slime = pix([
  '...SSS...',
  '..SSSSS..',
  '.SWWSSSS.',
  '.SKSKSSS.',
  'SSSSSSSSS',
  'SSSSSSSSS',
  '.DDDDDDD.',
], { S: '#5FE0B0', W: '#C9FBE8', K: '#0D1117', D: '#3FB88F' }, 0, 0);

const FONT = '-apple-system, BlinkMacSystemFont, Segoe UI, Helvetica, Arial, sans-serif';
const ground = Array.from({ length: 15 }, (_, i) => `<rect x="${286 + i * 12}" y="152" width="8" height="3" rx="1.5" fill="#21262D"/>`).join('');
const fmt = (n) => n.toLocaleString('en-US');

// Level L needs L² views; the slime guarding it has one HP per view between (L-1)² and L².
export const levelOf = (views) => {
  const level = Math.floor(Math.sqrt(views)) + 1;
  const span = 2 * level - 1;
  const progress = views - (level - 1) ** 2;
  return { level, span, progress, left: span - progress };
};

// `counted` means this request was a real visit, so the card plays the hit that visit landed.
export const renderCard = ({ views, counted }) => {
  const { level, span, progress, left } = levelOf(views);
  const leveledUp = counted && views > 0 && progress === 0;
  const prevSpan = 2 * level - 3;

  // XP bar and slime HP as 0..1 fractions, before and after this visit's hit.
  const xpTo = progress / span;
  const xpFrom = !counted ? xpTo : leveledUp ? (prevSpan - 1) / prevSpan : (progress - 1) / span;
  const hpFrom = !counted ? left / span : leveledUp ? 1 / prevSpan : (left + 1) / span;
  const hpTo = leveledUp ? 0 : left / span;

  const hit = !counted ? '' : `
  .lunge { animation: lunge .5s ease-out .5s 1 both; }
  .slimehit { transform-origin: 50% 100%; animation: ${leveledUp ? 'die 1.6s ease-in .6s 1 both' : 'squash .4s ease-out .65s 1 both'}; }
  .dmg { animation: rise 1s ease-out .65s 1 both; }${leveledUp ? `
  .lvup { animation: pop 1.8s ease-out 1s 1 both; }` : ''}
  @keyframes lunge { 0%,100% { transform: translateX(0); } 40% { transform: translateX(22px); } }
  @keyframes squash { 0%,100% { transform: translateX(0) scale(1,1); } 30% { transform: translateX(6px) scale(1.18,.78); } }
  @keyframes die {
    0% { transform: scale(1,1); opacity: 1; } 10% { transform: translateX(6px) scale(1.18,.78); opacity: 1; }
    30%,55% { transform: translateY(6px) scale(.2,0); opacity: 0; }
    75% { transform: scale(1.12,.88); opacity: 1; } 100% { transform: scale(1,1); opacity: 1; }
  }
  @keyframes rise { 0% { opacity: 0; transform: translateY(0); } 15% { opacity: 1; } 100% { opacity: 0; transform: translateY(-22px); } }
  @keyframes pop { 0% { opacity: 0; transform: translateY(6px); } 15%,70% { opacity: 1; transform: translateY(0); } 100% { opacity: 0; transform: translateY(-6px); } }`;

  // On level up the bar fills, then resets to the new level's empty bar; the new slime spawns with full HP.
  const bars = leveledUp ? `
  @keyframes xp { 0%,15% { transform: scaleX(${xpFrom}); } 30%,60% { transform: scaleX(1); } 61%,100% { transform: scaleX(0); } }
  @keyframes hp { 0%,15% { transform: scaleX(${hpFrom}); } 25%,60% { transform: scaleX(0); } 80%,100% { transform: scaleX(1); } }
  .xp { animation: xp 2.4s ease-out .5s 1 both; } .hp { animation: hp 2.4s ease-out .5s 1 both; }` : `
  @keyframes xp { from { transform: scaleX(${xpFrom}); } to { transform: scaleX(${xpTo}); } }
  @keyframes hp { from { transform: scaleX(${hpFrom}); } to { transform: scaleX(${hpTo}); } }
  .xp { animation: xp .4s ease-out .7s 1 both; } .hp { animation: hp .4s ease-out .7s 1 both; }`;

  return `<svg width="495" height="195" viewBox="0 0 495 195" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${fmt(views)} profile visitors, level ${level}, ${left} more to level ${level + 1}">
<title>Numbers go up.</title>
<style>
  .fb { transform-box: fill-box; }
  .bob { animation: bob .8s ease-in-out infinite alternate; }
  .breathe { transform-origin: 50% 100%; animation: breathe 1.2s ease-in-out infinite alternate; }
  .xp, .hp { transform-origin: 0 50%; transform: scaleX(${xpTo}); }
  .hp { transform: scaleX(${leveledUp ? 1 : hpTo}); }
  .dmg, .lvup { opacity: 0; }
  @keyframes bob { to { transform: translateY(-3px); } }
  @keyframes breathe { to { transform: scale(1.04,.95); } }${bars}${hit}
  @media (prefers-reduced-motion: reduce) { * { animation: none !important; } }
</style>
<rect x=".5" y=".5" width="494" height="194" rx="11.5" fill="#131822" stroke="rgba(255,255,255,0.16)"/>
<text x="24" y="46" fill="#8B949E" font-size="11" letter-spacing=".4" font-family="${FONT}">IDLE / FIGHT / LEVEL UP</text>
<text x="24" y="78" fill="#E6EDF3" font-size="22" font-weight="700" font-family="${FONT}">Numbers go up.</text>
<text x="24" y="101" fill="#8B949E" font-size="12.5" font-family="${FONT}">Every visit lands a hit.</text>
<text x="24" y="136" font-size="12" letter-spacing=".4" font-family="${FONT}"><tspan fill="#58A6FF" font-weight="700">${fmt(views)} VISITORS</tspan><tspan fill="#8B949E"> · LV ${level}</tspan></text>
<rect x="24" y="146" width="200" height="6" rx="3" fill="#21262D"/>
<rect class="xp fb" x="24" y="146" width="200" height="6" rx="3" fill="#58A6FF"/>
<text x="24" y="170" fill="#8B949E" font-size="11" font-family="${FONT}"><tspan fill="#E6EDF3" font-weight="700">${fmt(left)}</tspan> more ${left === 1 ? 'visit' : 'visits'} to LV ${level + 1}</text>
${ground}
<g transform="translate(300 92)"><g class="lunge fb"><g class="bob fb" shape-rendering="crispEdges">${hero}</g></g></g>
<rect x="384" y="94" width="54" height="5" rx="2.5" fill="#21262D"/>
<rect class="hp fb" x="384" y="94" width="54" height="5" rx="2.5" fill="#F27CA8"/>
<g transform="translate(384 110)"><g class="slimehit fb"><g class="breathe fb" shape-rendering="crispEdges">${slime}</g></g></g>
<text class="dmg fb" x="428" y="88" fill="#E6EDF3" font-size="14" font-weight="700" font-family="${FONT}">-1</text>
<text class="lvup fb" x="372" y="84" fill="#5FE0B0" font-size="14" font-weight="800" letter-spacing=".4" font-family="${FONT}">LEVEL UP!</text>
</svg>
`;
};
