/* Ana sayfa: 10 dünyalı yol haritası */
import { el, $, $$, STAR, stars } from "../core/ui.js";
import { say } from "../core/bit.js";
import { soundButton, sfx } from "../core/sound.js";
import { store } from "../core/store.js";
import { WORLDS, durum } from "../worlds/index.js";

const KILIT = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="11" width="14" height="10" rx="2.5" fill="currentColor"/><path d="M8 11V8a4 4 0 0 1 8 0v3" stroke="currentColor" stroke-width="2.4" fill="none"/></svg>';
const X_DIZISI = [0.18, 0.5, 0.82, 0.5]; // yolun kıvrımı: sol, orta, sağ, orta…

export function harita(root) {
  root.innerHTML = "";
  const top = el("header", "m-top");
  top.innerHTML = `<div class="brand">Python Atölyesi <span>Junior</span></div>
    ${store.teacher() ? '<a class="teacher-tag" href="#ogretmen">Öğretmen modu</a>' : ""}
    <div class="score">${STAR}<span>${store.totalStars()}</span></div>`;
  top.append(soundButton());

  const acik = WORLDS.find((w) => durum(w) === "acik");
  const selam = acik ? `Merhaba, ben <b>Bit</b>! Sıradaki dünya: <b>${acik.title}</b>.` : "Bütün hazır dünyaları bitirdin. Yenileri yolda!";
  const hello = el("div", "map-hello");
  hello.append(say(selam, acik ? "mutlu" : "vay"));

  const map = el("div", "map");
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.classList.add("map-path");
  svg.setAttribute("aria-hidden", "true");
  map.append(svg);

  WORLDS.forEach((w, i) => {
    const d = durum(w);
    const row = el("div", "m-row");
    row.style.setProperty("--x", X_DIZISI[i % X_DIZISI.length]);
    const node = el("button", `node ${d}`);
    node.style.setProperty("--c", w.color);
    node.dataset.no = w.no;
    const etiket = { bitti: stars(Math.min(3, Math.ceil(store.worldStars(w.id) / 3))), acik: "Başla!", kilitli: "Kilitli", hazirlaniyor: "Yakında" }[d];
    node.innerHTML = `<span class="orb"><span class="ico">${d === "kilitli" ? KILIT : w.icon}</span><span class="no">${w.no}</span></span>
      <span class="n-title">${w.title}</span><span class="n-state">${etiket}</span>`;
    node.setAttribute("aria-label", `Dünya ${w.no}: ${w.title}, ${{ bitti: "bitti", acik: "açık", kilitli: "kilitli", hazirlaniyor: "hazırlanıyor" }[d]}`);
    node.onclick = () => {
      if (d === "acik" || d === "bitti") { location.hash = "dunya-" + w.no; return; }
      sfx.yanlis();
      const b = $(".map-hello .say", root);
      b.replaceWith(say(d === "kilitli" ? "Önce <b>önceki dünyayı</b> bitir!" : `<b>${w.title}</b> hazırlanıyor. Yakında!`, "uzgun"));
    };
    row.append(node);
    map.append(row);
  });

  const foot = el("footer", "m-foot", '<a href="#ogretmen">Öğretmen</a>');
  root.append(top, hello, map, foot);

  /* nodları birleştiren kesikli yol */
  const ciz = () => {
    if (!svg.isConnected) return removeEventListener("resize", ciz);
    const r = map.getBoundingClientRect();
    const pts = $$(".orb", map).map((o) => { const b = o.getBoundingClientRect(); return [b.left - r.left + b.width / 2, b.top - r.top + b.height / 2]; });
    svg.setAttribute("viewBox", `0 0 ${r.width} ${r.height}`);
    let dd = `M${pts[0][0]} ${pts[0][1]}`;
    for (let k = 1; k < pts.length; k++) {
      const [x0, y0] = pts[k - 1], [x1, y1] = pts[k], my = (y0 + y1) / 2;
      dd += ` C${x0} ${my} ${x1} ${my} ${x1} ${y1}`;
    }
    svg.innerHTML = `<path d="${dd}" fill="none" stroke="var(--path)" stroke-width="10" stroke-linecap="round" stroke-dasharray="2 20"/>`;
  };
  requestAnimationFrame(ciz);
  addEventListener("resize", ciz);
  const acikNode = $(".node.acik", map);
  if (acikNode) setTimeout(() => acikNode.scrollIntoView({ block: "center", behavior: "smooth" }), 300);
}
