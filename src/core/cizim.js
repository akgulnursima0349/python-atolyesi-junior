/* Satır içi çizimler (SVG): diş fırçalama adımları, banyo sahnesi, penguen türleri, K-Means küçük resimleri.
   Dosya eklemeden zengin görsel: kurs internetsiz ve hafif kalır. */

const svg = (vb, ic, cls = "") => `<svg class="${cls}" viewBox="${vb}" aria-hidden="true">${ic}</svg>`;

/* ---------- Diş fırçalama ---------- */
const kil = Array.from({ length: 5 }, (_, i) => `<rect x="${71 + i * 4}" y="29" width="3" height="14" rx="1.5" fill="#fff" stroke="#9ccfff" stroke-width=".8"/>`).join("");
const fircaG = (macun) => `<g transform="rotate(-32 52 50)">
  <rect x="10" y="44" width="62" height="12" rx="6" fill="#4d9bff"/><rect x="16" y="47" width="34" height="3" rx="1.5" fill="#fff" opacity=".55"/>
  <rect x="68" y="42" width="24" height="15" rx="5" fill="#3b86e8"/>${kil}
  ${macun ? '<path d="M71 24C75 16 79 31 83 23S89 27 92 23" fill="none" stroke="#fff" stroke-width="7" stroke-linecap="round"/><path d="M71 24C75 16 79 31 83 23S89 27 92 23" fill="none" stroke="#ff5d7a" stroke-width="2" stroke-linecap="round"/>' : ""}</g>`;
const tup = `<g><rect x="6" y="70" width="40" height="18" rx="4" fill="#fff" stroke="#c9d6e3" stroke-width="1.5"/><rect x="14" y="70" width="8" height="18" fill="#d7262e"/>
  <path d="M46 73 L54 75 V83 L46 85Z" fill="#e7edf3"/><rect x="54" y="74" width="7" height="10" rx="2" fill="#d7262e"/></g>`;
const kopuk = [[12, 24, 8], [86, 22, 10], [92, 52, 6], [18, 74, 7], [74, 80, 9], [50, 14, 6], [6, 48, 5]]
  .map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#e6f6ff" stroke="#9fd6ff" stroke-width="1.5"/><circle cx="${x - r / 3}" cy="${y - r / 3}" r="${r / 4}" fill="#fff"/>`).join("");
const disler = (parla) => `<rect x="14" y="30" width="72" height="42" rx="21" fill="#8b2a3d"/><rect x="20" y="60" width="60" height="10" rx="5" fill="#e0607a"/>
  ${[0, 1, 2, 3, 4].map((i) => `<rect x="${21.5 + i * 11.6}" y="33" width="10.2" height="13" rx="3.5" fill="#fff"/>`).join("")}
  ${[0, 1, 2, 3].map((i) => `<rect x="${27 + i * 11.6}" y="53" width="10.2" height="10" rx="3.5" fill="#fff"/>`).join("")}
  ${parla ? [[10, 18], [88, 16], [92, 76], [8, 80]].map(([x, y]) => `<path d="M${x} ${y - 9}L${x + 2.5} ${y - 2.5}L${x + 9} ${y}L${x + 2.5} ${y + 2.5}L${x} ${y + 9}L${x - 2.5} ${y + 2.5}L${x - 9} ${y}L${x - 2.5} ${y - 2.5}Z" fill="#ffc81e"/>`).join("") : ""}`;
const bardak = `<path d="M50 3C46 11 46 15 50 15S54 11 50 3Z" fill="#6cc3ff"/><path d="M34 9C31 14 31 17 34 17S37 14 34 9Z" fill="#6cc3ff" opacity=".8"/><path d="M66 9C63 14 63 17 66 17S69 14 66 9Z" fill="#6cc3ff" opacity=".8"/>
  <path d="M26 24H74L67 92H33Z" fill="#e3f3ff" stroke="#7fb8e6" stroke-width="3" stroke-linejoin="round"/><path d="M30 48Q40 44 50 48T70 48L67 89H33Z" fill="#6cc3ff" opacity=".85"/><path d="M33 30L37 86" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".7"/>`;
const karmasa = `<path d="M22 60C10 52 18 36 32 42C34 26 56 26 58 40C72 32 88 46 76 58C90 66 78 84 64 76C58 90 36 90 34 76C18 82 8 68 22 60Z" fill="#fff" stroke="#c9d6e3" stroke-width="2"/>
  <path d="M28 58C40 50 52 66 72 56" fill="none" stroke="#ff5d7a" stroke-width="3" stroke-linecap="round"/><text x="50" y="30" text-anchor="middle" font-size="22" font-weight="800" fill="#d7262e">?!</text>`;

export const DIS = {
  firca: (cls) => svg("0 0 100 100", fircaG(false), cls),
  macun: (cls) => svg("0 0 100 100", fircaG(true) + tup, cls),
  fircala: (cls) => svg("0 0 100 100", disler(false) + kopuk, cls),
  calkala: (cls) => svg("0 0 100 100", bardak, cls),
  parlak: (cls) => svg("0 0 100 100", disler(true), cls),
  karmasa: (cls) => svg("0 0 100 100", karmasa, cls)
};

/* banyo arka planı: fayans duvar, ayna, lavabo */
export const banyo = (cls = "banyo") => svg("0 0 320 220", `
  <defs><pattern id="fayans" width="32" height="32" patternUnits="userSpaceOnUse"><rect width="32" height="32" fill="#eaf5fc"/><path d="M32 0V32H0" fill="none" stroke="#d4e7f3" stroke-width="2"/></pattern></defs>
  <rect width="320" height="220" fill="url(#fayans)"/><rect y="150" width="320" height="70" fill="#d9ecf8"/>
  <rect x="96" y="14" width="128" height="92" rx="18" fill="#bfe1f5" stroke="#8fb9d4" stroke-width="5"/><path d="M118 40L146 22M120 62L168 28" stroke="#fff" stroke-width="6" stroke-linecap="round" opacity=".65"/>
  <rect x="150" y="112" width="20" height="16" rx="4" fill="#b8c7d6"/><path d="M160 112V100H182" fill="none" stroke="#b8c7d6" stroke-width="7" stroke-linecap="round"/>
  <path d="M86 132H234Q232 170 200 176H120Q88 170 86 132Z" fill="#fff" stroke="#c9d6e3" stroke-width="3"/><rect x="80" y="126" width="160" height="10" rx="5" fill="#f3f8fc" stroke="#c9d6e3" stroke-width="2"/>
  <rect x="246" y="102" width="16" height="30" rx="5" fill="#ffb347"/><rect x="250" y="94" width="8" height="10" rx="2" fill="#e08a1e"/>
  <rect x="34" y="86" width="22" height="46" rx="3" fill="#e3f3ff" stroke="#9fc3dd" stroke-width="2"/><rect x="40" y="70" width="4" height="34" rx="2" fill="#ff8a5c" transform="rotate(-10 42 87)"/><rect x="47" y="72" width="4" height="32" rx="2" fill="#4d9bff" transform="rotate(8 49 88)"/>`, cls);

/* ---------- Penguenler ---------- */
const GOVDE = "#1f2633";
const ortak = (ayak) => `<ellipse cx="40" cy="98" rx="24" ry="3.5" fill="#000" opacity=".12"/>
  <path d="M15 52C6 62 6 78 12 84C16 74 18 64 20 58Z" fill="${GOVDE}"/><path d="M65 52C74 62 74 78 68 84C64 74 62 64 60 58Z" fill="${GOVDE}"/>
  <ellipse cx="40" cy="62" rx="25" ry="35" fill="${GOVDE}"/><ellipse cx="40" cy="68" rx="17" ry="27" fill="#fff"/>
  <ellipse cx="31" cy="96" rx="8" ry="3.6" fill="${ayak}"/><ellipse cx="49" cy="96" rx="8" ry="3.6" fill="${ayak}"/>
  <circle cx="40" cy="28" r="19" fill="${GOVDE}"/>`;
const goz = (x, y, halka) => `${halka ? `<circle cx="${x}" cy="${y}" r="4.4" fill="#fff"/>` : ""}<circle cx="${x}" cy="${y}" r="2.2" fill="#111"/><circle cx="${x + .8}" cy="${y - .8}" r=".8" fill="#fff"/>`;
const TURCIZ = {
  Adelie: () => ortak("#f4a7b9") + goz(33, 26, true) + goz(47, 26, true) + `<path d="M36 32H44L40 38.5Z" fill="#2b2b2b"/><path d="M37.5 32H42.5L40 34.5Z" fill="#c0392b" opacity=".6"/>`,
  Chinstrap: () => ortak("#f4a7b9") + `<path d="M23 30C24 20 56 20 57 30C57 42 49 47 40 47S23 42 23 30Z" fill="#fff"/><path d="M26 37Q40 48 54 37" fill="none" stroke="${GOVDE}" stroke-width="1.8" stroke-linecap="round"/>` + goz(34, 28, false) + goz(46, 28, false) + `<path d="M36.5 32H43.5L40 37.5Z" fill="#2b2b2b"/>`,
  Gentoo: () => ortak("#ff7a2e") + `<ellipse cx="31" cy="21" rx="6.5" ry="3.4" fill="#fff" transform="rotate(-28 31 21)"/><ellipse cx="49" cy="21" rx="6.5" ry="3.4" fill="#fff" transform="rotate(28 49 21)"/><path d="M34 17Q40 14.5 46 17" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round"/>` + goz(33, 27, false) + goz(47, 27, false) + `<path d="M34.5 31.5H45.5L40 39Z" fill="#ff5a1f"/><path d="M34.5 31.5H45.5L40 34Z" fill="#2b2b2b" opacity=".35"/>`
};
/* tur = "Adelie" | "Chinstrap" | "Gentoo" | null (gizemli: siluet) */
export function penguenCiz(tur, cls = "") {
  if (!tur || !TURCIZ[tur]) {
    return svg("0 0 80 102", `<ellipse cx="40" cy="98" rx="24" ry="3.5" fill="#000" opacity=".12"/><path d="M15 52C6 62 6 78 12 84C16 74 18 64 20 58Z M65 52C74 62 74 78 68 84C64 74 62 64 60 58Z" fill="#8794a8"/>
      <ellipse cx="40" cy="62" rx="25" ry="35" fill="#8794a8"/><circle cx="40" cy="28" r="19" fill="#8794a8"/><path d="M36 32H44L40 38Z" fill="#6b778a"/>
      <text x="40" y="74" text-anchor="middle" font-size="30" font-weight="800" fill="#fff">?</text>`, "peng siluet " + cls);
  }
  return svg("0 0 80 102", TURCIZ[tur](), "peng " + cls);
}

/* ---------- K-Means küçük resimleri ---------- */
const KR = ["#ff6b3d", "#22a6a0", "#a477ff"];
const NOKTA = [[20, 24], [26, 18], [16, 32], [28, 30], [70, 22], [78, 30], [66, 34], [74, 16], [44, 70], [52, 78], [38, 80], [56, 66]];
const GRUP = [0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2];
export const yildizYolu = (x, y, r = 7) => {
  const p = [];
  for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + (i * Math.PI) / 5, rr = i % 2 ? r * 0.45 : r; p.push(`${(x + rr * Math.cos(a)).toFixed(1)},${(y + rr * Math.sin(a)).toFixed(1)}`); }
  return p.join(" ");
};
const yld = (x, y, c) => `<polygon points="${yildizYolu(x, y, 8)}" fill="${c}" stroke="#fff" stroke-width="1.6" stroke-linejoin="round"/>`;
/* adim: 0 yıldız koy, 1 boya, 2 taşı, 3 tekrar (bitti) */
export function kmeansMini(adim, cls = "km-mini") {
  const ilk = [[30, 60], [50, 12], [84, 70]], son = [[22, 26], [72, 25], [47, 73]];
  const M = adim >= 2 ? son : ilk;
  let ic = `<rect width="100" height="96" rx="12" fill="#fff8f3"/>`;
  if (adim >= 2) ic += ilk.map(([x, y], i) => `<line x1="${x}" y1="${y}" x2="${son[i][0]}" y2="${son[i][1]}" stroke="${KR[i]}" stroke-width="1.5" stroke-dasharray="3 3" opacity=".8"/><polygon points="${yildizYolu(x, y, 5)}" fill="none" stroke="${KR[i]}" stroke-width="1" opacity=".5"/>`).join("");
  if (adim >= 1) ic += NOKTA.map(([x, y], i) => `<line x1="${x}" y1="${y}" x2="${M[GRUP[i]][0]}" y2="${M[GRUP[i]][1]}" stroke="${KR[GRUP[i]]}" stroke-width=".8" opacity=".35"/>`).join("");
  ic += NOKTA.map(([x, y], i) => `<circle cx="${x}" cy="${y}" r="4" fill="${adim >= 1 ? KR[GRUP[i]] : "#9aa6b8"}" stroke="#fff" stroke-width="1"/>`).join("");
  ic += M.map(([x, y], i) => yld(x, y, KR[i])).join("");
  if (adim === 3) ic += `<g transform="translate(78 78)"><circle r="12" fill="#2bb673"/><path d="M-5 0L-1.5 4L5.5 -4" fill="none" stroke="#fff" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></g>`;
  return svg("0 0 100 96", ic, cls);
}
