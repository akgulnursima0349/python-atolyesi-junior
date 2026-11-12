/* Dünya 5 · Vagonlar ve Dolaplar */
import { el, $, $$, wait, codePanel, hl, txt, stepper, varChip, STAR } from "../core/ui.js";
import { sfx } from "../core/sound.js";
import { tahminEkrani, yazEkrani } from "../core/kaliplar.js";

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;");
const satirYaz = (cp, i, s) => { cp.lines()[i].innerHTML = hl(s); };
const liste = (a) => "[" + a.map((x) => `"${x}"`).join(", ") + "]";

/* Tren çizimi: lokomotif + numaralı vagonlar */
function tren(dizi, { tikla, numara = true } = {}) {
  const t = el("div", "train");
  t.append(el("div", "loco", "🚂"));
  dizi.forEach((x, i) => {
    const v = el(tikla ? "button" : "div", "wagon", `<span class="cargo">${x}</span>${numara ? `<span class="wno">${i}</span>` : ""}`);
    if (tikla) { v.setAttribute("aria-label", `${i} numaralı vagon`); v.onclick = () => tikla(i, v); }
    t.append(v);
  });
  return t;
}

/* 1 · Tren = liste */
function trenEkrani(ctx) {
  const f = ctx.frame("Liste bir <b>tren</b>. Bir vagona dokun!");
  const T = ["🐶", "🐱", "🐰"];
  const cp = codePanel([`tren = ${liste(T)}`, "print(tren[?])"]);
  const st = el("div", "stage");
  const gorulen = new Set();
  st.append(tren(T, {
    tikla: (i, v) => {
      $$(".wagon", st).forEach((x) => x.classList.toggle("cur", x === v));
      satirYaz(cp, 1, `print(tren[${i}])`); cp.clear(); cp.line(1); cp.print(T[i]); sfx.tik(i);
      gorulen.add(i);
      if (gorulen.size === 3) { ctx.say("Vagon numarası <b>0'dan</b> başlar! İlk vagon tren[0].", "vay"); f.done(1, STAR + " treni tanıdın"); }
      else ctx.say(i === 0 ? "İlk vagonun numarası <b>0</b>! Başka vagona dokun." : `Bu <b>${i}</b> numaralı vagon. Başkasını dene!`);
    }
  }));
  f.grid.append(cp.node, st);
}

/* 2 · Tahmin: tren[2] */
function vagonTahmin(ctx) {
  const T = ["🍎", "🍌", "🍇", "🍓"];
  tahminEkrani(ctx, {
    soru: "Ekranda <b>hangi meyve</b> çıkar?",
    kod: [`tren = ${liste(T)}`, "print(tren[2])"],
    sahne: (st) => st.append(tren(T, { numara: false })),
    secenekler: [
      { t: "🍌", ipucu: "Sayma <b>1'den</b> başlamaz! 0, 1, 2…" },
      { t: "🍇", dogru: true },
      { t: "🍓", ipucu: "O <b>tren[3]</b> olurdu." }
    ],
    oynat: async (cp, st) => {
      const w = $$(".wagon", st);
      for (let i = 0; i <= 2; i++) { w[i].append(el("span", "wno", String(i))); w[i].classList.add("cur"); sfx.tik(i); await wait(400); if (i < 2) w[i].classList.remove("cur"); }
      cp.line(1); cp.print("🍇"); await wait(300); cp.line(-1);
    },
    basari: "Evet! 0, 1, <b>2</b> → üzüm.",
    rozet: "vagon sayacı"
  });
}

/* 3 · Vagon ekle / çıkar */
function eklec(ctx) {
  const f = ctx.frame("<b>append</b> sona vagon ekler, <b>pop</b> sonuncuyu çıkarır.");
  const T = ["🐶", "🐱"];
  let secili = "🐸", mesgul = false;
  const cp = codePanel([`tren = ${liste(T)}`, 'tren.append("🐸")', "print(len(tren))"]);
  const st = el("div", "stage col");
  const chip = varChip("len(tren)", T.length);
  st.append(chip);
  const yer = el("div", "train-wrap");
  st.append(yer);
  const ciz = () => { yer.innerHTML = ""; yer.append(tren(T)); chip.set(T.length); satirYaz(cp, 0, `tren = ${liste(T)}`); };
  ciz();
  f.grid.append(cp.node, st);
  const hayvan = el("div", "add");
  ["🐸", "🐼", "🐯", "🐵"].forEach((h) => {
    const b = el("button", h === secili ? "on" : "", h); b.setAttribute("aria-label", "vagona koyulacak hayvan");
    b.onclick = () => { secili = h; $$("button", hayvan).forEach((x) => x.classList.toggle("on", x === b)); satirYaz(cp, 1, `tren.append("${h}")`); sfx.tik(1); };
    hayvan.append(b);
  });
  const ekle = el("button", "btn", "➕ append"), cikar = el("button", "btn sec", "➖ pop");
  f.actions.prepend(hayvan, ekle, cikar);
  const yapilan = new Set();
  const bitir = () => { if (yapilan.size === 2) { ctx.say("Liste <b>büyüyüp küçülebilir</b>! len vagonları sayar.", "vay"); f.done(1, STAR + " vagon ustası"); } };
  ekle.onclick = async () => {
    if (mesgul) return;
    if (T.length >= 6) { ctx.say("Tren <b>doldu</b>! Biraz <b>pop</b> yap.", "uzgun"); sfx.yanlis(); return; }
    mesgul = true; const h = secili;
    satirYaz(cp, 1, `tren.append("${h}")`); cp.line(1); T.push(h); ciz(); $$(".wagon", yer).pop().classList.add("enter"); sfx.tik(T.length);
    await wait(500); cp.line(2); cp.clear(); cp.print(T.length); await wait(300); cp.line(-1);
    yapilan.add("e"); if (yapilan.size < 2) ctx.say("Yeni vagon <b>sona</b> eklendi. Şimdi <b>pop</b> dene!"); bitir(); mesgul = false;
  };
  cikar.onclick = async () => {
    if (mesgul) return;
    if (!T.length) { ctx.say("Tren <b>boş</b>! Önce append yap.", "uzgun"); sfx.yanlis(); return; }
    mesgul = true;
    satirYaz(cp, 1, "tren.pop()"); cp.line(1); const son = $$(".wagon", yer).pop(); son.classList.add("leave"); sfx.tik(1);
    await wait(450); T.pop(); ciz(); cp.line(2); cp.clear(); cp.print(T.length); await wait(300); cp.line(-1);
    yapilan.add("c"); if (yapilan.size < 2) ctx.say("Son vagon <b>çıkarıldı</b>. Şimdi <b>append</b> dene!"); bitir(); mesgul = false;
  };
}

/* 4 · Dilimleme makası */
function makas(ctx) {
  const K = "PYTHON", HEDEF = [["THO", 2, 5], ["PY", 0, 2]];
  let h = 0, a = 1, b = 3;
  const f = ctx.frame(`Makasla kes: <b>${HEDEF[0][0]}</b> harflerini bul!`);
  const sa = stepper(0, 6, a, (v) => { a = v; goster(); }), sb = stepper(0, 6, b, (v) => { b = v; goster(); });
  const cp = codePanel(['kelime = "PYTHON"', [txt("print(kelime["), sa, txt(":"), sb, txt("])")]]);
  const st = el("div", "stage col");
  st.innerHTML = `<div class="chip">hedef = <em>"${HEDEF[0][0]}"</em></div><div class="slice-row">${[...K].map((c, i) => `<div class="sl"><span class="slc">${c}</span><span class="wno">${i}</span></div>`).join("")}<div class="sl end"><span class="wno">6</span></div></div><div class="cut-out" aria-live="polite"></div>`;
  f.grid.append(cp.node, st);
  function goster() {
    $$(".sl:not(.end)", st).forEach((d, i) => d.classList.toggle("in", i >= a && i < b));
    $$(".sl", st).forEach((d, i) => { d.classList.toggle("cut-a", i === a); d.classList.toggle("cut-b", i === b); });
    const kes = K.slice(a, b);
    cp.clear(); cp.print(kes || "(boş)"); $(".cut-out", st).textContent = kes ? `"${kes}"` : '""';
    if (h < HEDEF.length && kes === HEDEF[h][0]) {
      sfx.dogru(); h++;
      if (h < HEDEF.length) {
        $(".chip em", st).textContent = `"${HEDEF[h][0]}"`;
        ctx.say(`Kestin! Bitiş harfi <b>dahil değil</b>. Şimdi <b>${HEDEF[h][0]}</b>!`, "vay");
      } else { ctx.say("<b>[başla:bitiş]</b> ile istediğin parçayı kesersin!", "vay"); f.done(1, STAR + " makas ustası"); }
    }
  }
  goster();
}

/* 5 · Sözlük = etiketli dolap */
const DOLAP = { elma: 3, muz: 5, "çilek": 8 };
const MEYVE = { elma: "🍎", muz: "🍌", "çilek": "🍓" };
function dolap(ctx) {
  const f = ctx.frame("Sözlük bir <b>dolap</b>. Etiketli çekmeceye dokun!");
  const cp = codePanel(['dolap = {"elma": 3, "muz": 5, "çilek": 8}', 'print(dolap["?"])']);
  const st = el("div", "stage");
  const d = el("div", "cabinet");
  const gorulen = new Set();
  Object.keys(DOLAP).forEach((k) => {
    const c = el("button", "drawer", `<span class="dlabel">"${k}"</span><span class="dval">${MEYVE[k]} × ${DOLAP[k]}</span>`);
    c.setAttribute("aria-label", k + " çekmecesi");
    c.onclick = () => {
      $$(".drawer", d).forEach((x) => x.classList.toggle("open", x === c));
      satirYaz(cp, 1, `print(dolap["${k}"])`); cp.clear(); cp.line(1); cp.print(DOLAP[k]); sfx.tik(DOLAP[k]);
      gorulen.add(k);
      if (gorulen.size === 2) { ctx.say("Sözlükte her şeyin bir <b>etiketi</b> var. Etiketle bulursun!", "vay"); f.done(1, STAR + " dolabı açtın"); }
      else ctx.say(`<b>"${k}"</b> etiketinde ${DOLAP[k]} var. Başka çekmece aç!`);
    };
    d.append(c);
  });
  st.append(d);
  f.grid.append(cp.node, st);
}

/* 6 · Tahmin: çekmeceye yeni değer */
function dolapTahmin(ctx) {
  tahminEkrani(ctx, {
    soru: "Çekmeceye yeni değer kondu. Ekranda <b>ne çıkar</b>?",
    kod: ['dolap = {"elma": 3, "muz": 5}', 'dolap["elma"] = 7', 'print(dolap["elma"])'],
    sahne: (st) => {
      const d = el("div", "cabinet");
      d.innerHTML = `<div class="drawer open" data-k="elma"><span class="dlabel">"elma"</span><span class="dval">🍎 × 3</span></div><div class="drawer"><span class="dlabel">"muz"</span><span class="dval">🍌 × 5</span></div>`;
      st.append(d);
    },
    secenekler: [
      { t: "3", ipucu: "Çekmeceye <b>7</b> kondu, 3 gitti!" },
      { t: "7", dogru: true },
      { t: "10", ipucu: "Toplanmadı! 7 eskisinin <b>yerine</b> kondu." }
    ],
    oynat: async (cp, st) => {
      cp.line(1); const v = $('.drawer[data-k="elma"] .dval', st); v.classList.add("swap"); await wait(300); v.textContent = "🍎 × 7"; sfx.tik(4); await wait(400);
      cp.line(2); cp.print("7"); await wait(300); cp.line(-1);
    },
    basari: "Etikete yeni değer koyunca <b>eskisi gider</b>!",
    rozet: "dolap ustası"
  });
}

/* 7 · Yaz: sepete çilek ekle */
function yaz(ctx) {
  yazEkrani(ctx, {
    soru: 'Sıra sende! Sepete <b>append</b> ile <b>"çilek"</b> ekle.',
    bas: 'sepet = ["elma", "muz"]\n# sepete "çilek" ekle\nprint(sepet)',
    yer: '# sepete "çilek" ekle', cozum: 'sepet.append("çilek")',
    chips: [["sepet", '["elma", "muz"]']],
    ipuclari: ["Treni hatırla: sona eklemek için <b>append</b>.", "Şöyle başlar: <code>sepet.append(</code>", 'Cevap: <code>sepet.append("çilek")</code>'],
    kontrol: (r, kod) => {
      const son = r.out[r.out.length - 1] || "";
      if (/'elma', 'muz', 'çilek'\]/.test(son) && /\.append\s*\(/.test(kod)) return { ok: true, mesaj: "Harika! Sepette artık <b>3 meyve</b> var." };
      if (/çilek/.test(son) && !/\.append\s*\(/.test(kod)) return { ok: false, mesaj: "Sepette çilek var ama <b>append</b> kullanmadın. Onunla dene!" };
      if (!son) return { ok: false, mesaj: "Ekrana hiçbir şey çıkmadı. <code>print(sepet)</code> duruyor mu?" };
      return { ok: false, mesaj: `Ekranda <b>${esc(son)}</b> çıktı. Sonunda <b>'çilek'</b> olmalı.` };
    },
    basari: "Listeye kendin <b>eleman ekledin</b>!"
  });
}

export const listeDunyasi = {
  id: "liste", no: 5, title: "Vagonlar ve Dolaplar", icon: "tren", color: "#ff8fab",
  screens: [trenEkrani, vagonTahmin, eklec, makas, dolap, dolapTahmin, yaz],
  ozet: ["tren[0] → ilk vagon (sayım 0'dan)", 'tren.append("🐸") → sona ekle', "kelime[1:4] → parça kes", 'dolap["muz"] → etiketle bul']
};
