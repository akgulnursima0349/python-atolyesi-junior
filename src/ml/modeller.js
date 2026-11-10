/* Tarayıcıda çalışan küçük yapay zekâ modelleri: en yakın komşu (KNN), K-Means ve rakam yardımcıları. */

export const uzaklik = (a, b) => { let t = 0; for (let i = 0; i < a.length; i++) { const d = a[i] - b[i]; t += d * d; } return Math.sqrt(t); };

/* KNN: veri = [{ x: [..], y: etiket }] → { tahmin, komsular, oylar } */
export function knn(veri, x, k = 3) {
  const s = veri.map((v, i) => ({ i, d: uzaklik(v.x, x), y: v.y })).sort((a, b) => a.d - b.d).slice(0, k);
  const oylar = {};
  s.forEach((n) => (oylar[n.y] = (oylar[n.y] || 0) + 1));
  /* eşitlikte en yakın komşunun etiketi kazanır */
  const en = Math.max(...Object.values(oylar));
  const tahmin = s.find((n) => oylar[n.y] === en).y;
  return { tahmin, komsular: s, oylar };
}

/* ---------- meyveler (Notebook 01'deki elma-portakal verisi) ---------- */
export const MEYVE = [
  [140, 2, "elma"], [130, 1, "elma"], [150, 3, "elma"], [145, 2, "elma"], [135, 1, "elma"], [160, 3, "elma"], [125, 2, "elma"], [155, 4, "elma"],
  [170, 8, "portakal"], [180, 9, "portakal"], [165, 7, "portakal"], [190, 9, "portakal"], [175, 8, "portakal"], [185, 10, "portakal"], [160, 7, "portakal"], [200, 9, "portakal"]
];
/* ağırlık (gram) ve pürüz (1–10) farklı ölçekte: ağırlığı 10'a bölerek yakınlaştırırız */
export const meyveX = (agirlik, puruz) => [agirlik / 10, puruz];
export const meyveVeri = () => MEYVE.map(([a, p, y]) => ({ x: meyveX(a, p), y }));

/* ---------- rakamlar ---------- */
let RAKAMLAR = null;
export async function rakamlar() {
  if (RAKAMLAR) return RAKAMLAR;
  const { RAKAM } = await import("./rakam-veri.js");
  const tum = RAKAM.split("|").map((r) => ({ x: [...r.slice(0, 64)].map((c) => parseInt(c, 17)), y: Number(r[64]) }));
  /* her 10. örnek test için ayrılır (modelin görmediği rakamlar) */
  RAKAMLAR = { egitim: tum.filter((_, i) => i % 10 !== 0), test: tum.filter((_, i) => i % 10 === 0), tum };
  return RAKAMLAR;
}

/* Tuvaldeki çizimi scikit-learn rakamları gibi 8x8, 0–16 değerli 64 sayıya çevirir:
   çizimi kutuya al, kare yap, ortala, küçült. */
export function tuvaldenRakam(canvas) {
  const W = canvas.width, H = canvas.height, d = canvas.getContext("2d").getImageData(0, 0, W, H).data;
  let x0 = W, y0 = H, x1 = -1, y1 = -1;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (d[(y * W + x) * 4] > 60) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
  if (x1 < 0) return null;
  const boy = Math.max(x1 - x0, y1 - y0) + 1, kenar = boy * 1.25;
  const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2, sx = cx - kenar / 2, sy = cy - kenar / 2;
  const out = new Array(64).fill(0), hucre = kenar / 8;
  for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) {
    let t = 0, n = 0;
    for (let yy = 0; yy < hucre; yy += Math.max(1, hucre / 6)) for (let xx = 0; xx < hucre; xx += Math.max(1, hucre / 6)) {
      const px = Math.floor(sx + c * hucre + xx), py = Math.floor(sy + r * hucre + yy);
      n++;
      if (px >= 0 && py >= 0 && px < W && py < H) t += d[(py * W + px) * 4];
    }
    out[r * 8 + c] = Math.min(16, Math.round((t / n / 255) * 16 * 1.6));
  }
  return out;
}

/* 8x8 rakamı ızgara olarak çiz (div'ler) */
export function rakamIzgara(x, { sayi = false, kucuk = false } = {}) {
  const g = document.createElement("div");
  g.className = "dgrid" + (kucuk ? " small" : "") + (sayi ? " nums" : "");
  g.innerHTML = x.map((v) => `<i style="--v:${v / 16}">${sayi ? v : ""}</i>`).join("");
  return g;
}

/* ---------- K-Means ---------- */
export function enYakinMerkez(p, merkezler) {
  let en = 0, ed = Infinity;
  merkezler.forEach((m, i) => { const d = uzaklik(p, m); if (d < ed) { ed = d; en = i; } });
  return en;
}
export function merkezleriTasi(noktalar, atama, merkezler) {
  return merkezler.map((m, i) => {
    const g = noktalar.filter((_, j) => atama[j] === i);
    if (!g.length) return m;
    return m.map((_, k) => g.reduce((t, p) => t + p[k], 0) / g.length);
  });
}
/* Basit K-Means (k-means++ başlangıcı, sabit tohumla tekrarlanabilir) */
export function kmeans(noktalar, k, { tur = 12, tohum = 7 } = {}) {
  let s = tohum;
  const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  const merk = [noktalar[Math.floor(rnd() * noktalar.length)]];
  while (merk.length < k) {
    const d = noktalar.map((p) => Math.min(...merk.map((m) => uzaklik(p, m))) ** 2), top = d.reduce((a, b) => a + b, 0);
    let r = rnd() * top, i = 0;
    while (r > d[i] && i < d.length - 1) { r -= d[i]; i++; }
    merk.push(noktalar[i]);
  }
  let merkezler = merk.map((m) => [...m]), atama = [];
  for (let t = 0; t < tur; t++) {
    atama = noktalar.map((p) => enYakinMerkez(p, merkezler));
    merkezler = merkezleriTasi(noktalar, atama, merkezler);
  }
  return { merkezler, atama };
}
