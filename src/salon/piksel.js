/* Piksel Sanatı (Dünya 4'ten sonra): range sayılarını ayarla, döngü hedef kareleri boyasın. */
import { el, $, $$, wait, hl, stepper, STAR } from "../core/ui.js";
import { sfx } from "../core/sound.js";
import { rastgele, sayac, karistir } from "./ortak.js";

const N = 8;
/* Her desen: parametre adları, kod satırları (S(ad) = sayı seçici), boyanan kareler */
const DESEN = {
  yatay: {
    adlar: ["a", "b", "y"], soru: "Sayıları ayarla: döngü <b>yatay çizgiyi</b> boyasın!",
    satirlar: ["for x in range({a}, {b}):", "    boya(x, {y})"], etiket: { a: "başla", b: "bitir", y: "y" },
    kareler: ({ a, b, y }) => { const r = []; for (let x = a; x < b; x++) r.push([x, y]); return r; },
    hedef: () => { const a = rastgele(0, 4); return { a, b: rastgele(a + 2, 8), y: rastgele(1, 7) }; }
  },
  dikey: {
    adlar: ["a", "b", "x"], soru: "Sayıları ayarla: döngü <b>dikey çizgiyi</b> boyasın!",
    satirlar: ["for y in range({a}, {b}):", "    boya({x}, y)"], etiket: { a: "başla", b: "bitir", x: "x" },
    kareler: ({ a, b, x }) => { const r = []; for (let y = a; y < b; y++) r.push([x, y]); return r; },
    hedef: () => { const a = rastgele(0, 4); return { a, b: rastgele(a + 2, 8), x: rastgele(1, 7) }; }
  },
  kare: {
    adlar: ["a", "b", "c", "d"], soru: "İç içe döngü! Sayıları ayarla, <b>kareyi</b> boya.",
    satirlar: ["for y in range({a}, {b}):", "    for x in range({c}, {d}):", "        boya(x, y)"], etiket: { a: "y başla", b: "y bitir", c: "x başla", d: "x bitir" },
    kareler: ({ a, b, c, d }) => { const r = []; for (let y = a; y < b; y++) for (let x = c; x < d; x++) r.push([x, y]); return r; },
    hedef: () => { const a = rastgele(0, 4), c = rastgele(0, 4); return { a, b: rastgele(a + 2, Math.min(8, a + 4)), c, d: rastgele(c + 2, Math.min(8, c + 4)) }; }
  },
  capraz: {
    adlar: ["a", "b"], soru: "Bu sefer <b>çapraz</b>! boya(i, i) ile merdiven yap.",
    satirlar: ["for i in range({a}, {b}):", "    boya(i, i)"], etiket: { a: "başla", b: "bitir" },
    kareler: ({ a, b }) => { const r = []; for (let i = a; i < b; i++) r.push([i, i]); return r; },
    hedef: () => { const a = rastgele(0, 3); return { a, b: rastgele(a + 3, 8) }; }
  }
};
const BASLANGIC = { a: 0, b: 1, c: 0, d: 1, x: 0, y: 0 };
const anahtar = (k) => k.map(([x, y]) => x + "," + y).sort().join(" ");

function ekran(tip) {
  return (ctx) => {
    const D = DESEN[tip], say = sayac();
    let hedef;
    do hedef = D.hedef(); while (anahtar(D.kareler(hedef)) === anahtar(D.kareler(BASLANGIC)));
    const f = ctx.frame(D.soru);
    const deger = { ...BASLANGIC };
    const sec = {};
    /* kod: sayılar sarı kutucukta; aşağıdaki seçicilerle değişir */
    const kod = el("div", "code px-code");
    kod.setAttribute("aria-label", "Python kodu");
    const ciz = () => {
      kod.innerHTML = D.satirlar.map((l) => `<div class="ln">${hl(l.replace(/\{(\w)\}/g, "§$1§")).replace(/§(\w)§/g, (_, a) => `<span class="pv" data-ad="${a}">${deger[a]}</span>`)}</div>`).join("");
    };
    ciz();
    const ctrl = el("div", "px-ctrl");
    D.adlar.forEach((ad) => {
      const ust = ad === "b" || ad === "d" ? N : N - 1;
      const lab = el("label", "", `<span>${D.etiket[ad]}</span>`);
      sec[ad] = stepper(0, ust, deger[ad], (v) => { deger[ad] = v; ciz(); const p = $(`.pv[data-ad="${ad}"]`, kod); if (p) p.classList.add("flash"); });
      lab.append(sec[ad]); ctrl.append(lab);
    });
    const sol = el("div", "px-left");
    const kutu = el("div", "");
    kutu.append(kod, ctrl);
    sol.append(kutu);
    const cp = { lines: () => $$(".ln", kod), line: (i) => $$(".ln", kod).forEach((d, k) => d.classList.toggle("hl", k === i)) };
    const st = el("div", "stage col piksel");
    st.dataset.cevap = JSON.stringify(D.adlar.map((a) => hedef[a]));
    const hedefK = new Set(D.kareler(hedef).map(([x, y]) => x + "," + y));
    let izgara = '<div class="px-wrap"><span></span>' + Array.from({ length: N }, (_, i) => `<b>${i}</b>`).join("");
    for (let y = 0; y < N; y++) {
      izgara += `<b>${y}</b>`;
      for (let x = 0; x < N; x++) izgara += `<i class="px${hedefK.has(x + "," + y) ? " hedef" : ""}" data-x="${x}" data-y="${y}"></i>`;
    }
    st.innerHTML = izgara + '</div><div class="px-legend"><span><i class="px hedef"></i> hedef</span><span><i class="px boyali"></i> boyanan</span></div>';
    f.grid.append(sol, st);
    const calis = el("button", "btn", "▶ Boya");
    f.actions.prepend(calis);
    calis.onclick = async () => {
      calis.disabled = true; Object.values(sec).forEach((s) => s.lock(true));
      $$(".px.boyali", st).forEach((c) => c.classList.remove("boyali"));
      const k = D.kareler(deger);
      const son = cp.lines().length - 1;
      for (const [x, y] of k) {
        cp.line(son); const c = $(`.px[data-x="${x}"][data-y="${y}"]`, st);
        if (c) c.classList.add("boyali");
        sfx.tik(x % 6); await wait(110);
      }
      cp.line(-1); ciz();
      const boyanan = new Set(k.map(([x, y]) => x + "," + y));
      const eksik = [...hedefK].filter((h) => !boyanan.has(h)).length, fazla = [...boyanan].filter((b) => !hedefK.has(b)).length;
      if (!eksik && !fazla) { ctx.say("Tam isabet! Döngü hedefi <b>boyadı</b>.", "vay"); f.done(say.yildiz(), STAR + " piksel ustası"); calis.hidden = true; return; }
      say.hata(); sfx.yanlis();
      ctx.say(!k.length ? "range <b>boş</b> kaldı: başlangıç bitişten küçük olmalı!"
        : fazla && !eksik ? "<b>Fazla</b> kare boyadın. Sayıları küçült!"
          : eksik && !fazla ? "<b>Eksik</b> kaldı. Biraz daha uzat!" : "<b>Yanlış</b> yere boyadın. Sayılara tekrar bak!", "uzgun");
      calis.disabled = false; calis.textContent = "▶ Tekrar boya"; Object.values(sec).forEach((s) => s.lock(false));
    };
  };
}

export const piksel = {
  id: "piksel", ad: "Piksel Sanatı", ikon: "🎨", renk: "#ff8fab", dunya: "dongu",
  tur: () => [...karistir(["yatay", "dikey"]), Math.random() < 0.5 ? "kare" : "capraz"].map(ekran)
};
