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
const dashColors = ['#6FB6FF', '#A98BFF', '#FFB86B', '#5FE0B0'];
const dashes = dashColors.map((c, i) => `<rect class="dash d${i}" x="${24 + i * 20}" y="164" width="14" height="4" rx="2" fill="${c}"/>`).join('');
const ground = Array.from({ length: 15 }, (_, i) => `<rect x="${286 + i * 12}" y="152" width="8" height="3" rx="1.5" fill="#21262D"/>`).join('');

export const renderCard = ({ views, level }) => `<svg width="495" height="195" viewBox="0 0 495 195" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${views.toLocaleString('en-US')} profile visitors, level ${level}: a pixel knight auto-battles a slime">
<title>Numbers go up.</title>
<style>
  * { animation-duration: 6s; animation-iteration-count: infinite; }
  .fb { transform-box: fill-box; }
  .lunge { animation-name: lunge; animation-timing-function: ease-out; }
  .bob { animation: bob .8s ease-in-out infinite alternate; }
  .slime { transform-origin: 50% 100%; animation-name: slime; }
  .hp { transform-origin: 0 50%; animation-name: hp; animation-timing-function: steps(1, end); }
  .hpwrap { animation-name: hpwrap; }
  .dmg { opacity: 0; animation-timing-function: ease-out; }
  .h1 { animation-name: h1; } .h2 { animation-name: h2; } .h3 { animation-name: h3; } .lv { animation-name: lv; }
  .dash { opacity: .18; animation-timing-function: steps(1, end); }
  .d0 { animation-name: d0; } .d1 { animation-name: d1; } .d2 { animation-name: d2; } .d3 { animation-name: d3; }
  @keyframes bob { to { transform: translateY(-3px); } }
  @keyframes lunge { 0%,14%,39%,64%,100% { transform: translateX(0); } 16.7%,41.7%,66.7% { transform: translateX(22px); } 20%,45%,70% { transform: translateX(0); } }
  @keyframes slime {
    0%,16%,41%,66% { transform: translateX(0) scale(1,1); opacity: 1; }
    17.5%,42.5%,67.5% { transform: translateX(6px) scale(1.18,.78); opacity: 1; }
    21%,46% { transform: translateX(0) scale(1,1); opacity: 1; }
    71% { transform: translateX(0) scale(1.1,.9); opacity: 1; }
    77%,86% { transform: translateY(6px) scale(.2,0); opacity: 0; }
    93% { transform: scale(1.12,.88); opacity: 1; }
    97%,100% { transform: scale(1,1); opacity: 1; }
  }
  @keyframes hp { 0%,17% { transform: scaleX(1); } 17.5% { transform: scaleX(.66); } 42.5% { transform: scaleX(.33); } 67.5% { transform: scaleX(0); } 90%,100% { transform: scaleX(1); } }
  @keyframes hpwrap { 0%,70%,90%,100% { opacity: 1; } 75%,88% { opacity: 0; } }
  @keyframes h1 { 0%,16.6% { opacity: 0; transform: translateY(0); } 17.5% { opacity: 1; } 28%,100% { opacity: 0; transform: translateY(-22px); } }
  @keyframes h2 { 0%,41.6% { opacity: 0; transform: translateY(0); } 42.5% { opacity: 1; } 53%,100% { opacity: 0; transform: translateY(-22px); } }
  @keyframes h3 { 0%,66.6% { opacity: 0; transform: translateY(0); } 67.5% { opacity: 1; } 79%,100% { opacity: 0; transform: translateY(-24px); } }
  @keyframes lv { 0%,74% { opacity: 0; transform: translateY(6px); } 77%,86% { opacity: 1; transform: translateY(0); } 92%,100% { opacity: 0; transform: translateY(-6px); } }
  @keyframes d0 { 0%,17% { opacity: .18; } 17.5%,94% { opacity: 1; } 95%,100% { opacity: .18; } }
  @keyframes d1 { 0%,42% { opacity: .18; } 42.5%,94% { opacity: 1; } 95%,100% { opacity: .18; } }
  @keyframes d2 { 0%,67% { opacity: .18; } 67.5%,94% { opacity: 1; } 95%,100% { opacity: .18; } }
  @keyframes d3 { 0%,76% { opacity: .18; } 77%,94% { opacity: 1; } 95%,100% { opacity: .18; } }
  @media (prefers-reduced-motion: reduce) { * { animation: none !important; } .dash { opacity: 1; } }
</style>
<rect x=".5" y=".5" width="494" height="194" rx="11.5" fill="#0D1117" stroke="#30363D"/>
<text x="24" y="50" fill="#8B949E" font-size="11" letter-spacing=".4" font-family="${FONT}">IDLE / FIGHT / LEVEL UP</text>
<text x="24" y="84" fill="#E6EDF3" font-size="22" font-weight="700" font-family="${FONT}">Numbers go up.</text>
<text x="24" y="108" fill="#8B949E" font-size="12.5" font-family="${FONT}">Every visit lands a hit.</text>
<text x="24" y="150" font-size="12" letter-spacing=".4" font-family="${FONT}"><tspan fill="#58A6FF" font-weight="700">${views.toLocaleString('en-US')} VISITORS</tspan><tspan fill="#8B949E"> · LV ${level}</tspan></text>
${dashes}
${ground}
<g transform="translate(300 92)"><g class="lunge fb"><g class="bob fb" shape-rendering="crispEdges">${hero}</g></g></g>
<g class="hpwrap">
  <rect x="384" y="94" width="54" height="5" rx="2.5" fill="#21262D"/>
  <rect class="hp fb" x="384" y="94" width="54" height="5" rx="2.5" fill="#F27CA8"/>
</g>
<g transform="translate(384 110)"><g class="slime fb" shape-rendering="crispEdges">${slime}</g></g>
<text class="dmg h1 fb" x="430" y="90" fill="#E6EDF3" font-size="14" font-weight="700" font-family="${FONT}">12</text>
<text class="dmg h2 fb" x="430" y="90" fill="#F2D36B" font-size="14" font-weight="700" font-family="${FONT}">27</text>
<text class="dmg h3 fb" x="412" y="88" fill="#F27CA8" font-size="15" font-weight="800" font-family="${FONT}">CRIT 64!</text>
<text class="dmg lv fb" x="384" y="128" fill="#5FE0B0" font-size="13" font-weight="700" font-family="${FONT}">+1 VIEW</text>
</svg>
`;
