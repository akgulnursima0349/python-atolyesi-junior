/* Dünya 9 · Penguen Dedektifi (karar ağacı) */
import { el, $, $$, wait, codePanel, STAR } from "../core/ui.js";
import { sfx } from "../core/sound.js";
import { tahminEkrani, yazEkrani } from "../core/kaliplar.js";
import { PENGUEN } from "../ml/penguen-veri.js";
import { penguenCiz } from "../core/cizim.js";

const TUR = {
  Adelie: { renk: "#ff8a5c", ad: "Adelie", not: "küçük gagalı, kısa yüzgeçli" },
  Chinstrap: { renk: "#a477ff", ad: "Chinstrap", not: "çene çizgili, uzun gagalı" },
  Gentoo: { renk: "#22a6a0", ad: "Gentoo", not: "en büyükleri, uzun yüzgeçli" }
};
const TURLER = Object.keys(TUR);
const virgul = (n, d = 1) => n.toFixed(d).replace(".", ",");
const ortalama = (t, i) => { const g = PENGUEN.filter((p) => p[0] === t); return g.reduce((s, p) => s + p[i], 0) / g.length; };
const penguenSvg = (tur, cls = "") => penguenCiz(tur, cls + (tur === "Gentoo" ? " Gentoo-b" : ""));

/* Bir grubu türlere göre sayan yığılmış çubuk */
function cubuk(grup, etiket) {
  const say = {}; grup.forEach((p) => (say[p[0]] = (say[p[0]] || 0) + 1));
  const n = grup.length || 1;
  return `<div class="split"><div class="split-h">${etiket} <small>(${grup.length})</small></div><div class="split-bar">${TURLER.filter((t) => say[t]).map((t) => `<span style="--w:${say[t] / n};--c:${TUR[t].renk}" title="${t}: ${say[t]}">${say[t] / n > 0.12 ? say[t] : ""}</span>`).join("")}</div></div>`;
}
const efsane = () => `<div class="legend">${TURLER.map((t) => `<span><i style="background:${TUR[t].renk}"></i>${t}</span>`).join("")}</div>`;

/* 1 · Üç penguen türü */
function turler(ctx) {
  const f = ctx.frame("Üç penguen türü var. Her birine <b>dokun</b>, tanı!");
  f.grid.classList.add("one");
  const st = el("div", "stage");
  const kartlar = el("div", "peng-cards");
  const gorulen = new Set();
  TURLER.forEach((t) => {
    const b = el("button", "peng-card", `${penguenSvg(t)}<b>${t}</b><span class="peng-info">${TUR[t].not}<br>gaga ≈ ${virgul(ortalama(t, 1), 0)} mm · yüzgeç ≈ ${virgul(ortalama(t, 2), 0)} mm</span>`);
    b.onclick = () => {
      b.classList.add("open"); sfx.tik(gorulen.size + 1); gorulen.add(t);
      if (gorulen.size === 3) { ctx.say("Gaga ve yüzgeç <b>uzunluğu</b> türleri ayırmaya yarar!", "vay"); f.done(1, STAR + " penguen uzmanı"); }
      else ctx.say(`<b>${t}</b>: ${TUR[t].not}. Diğerlerine de dokun!`);
    };
    b.style.setProperty("--c", TUR[t].renk);
    kartlar.append(b);
  });
  st.append(kartlar); f.grid.append(st);
}

/* 2 · İlk soruyu seç */
const SORU = [
  { t: "Yüzgeç > 206 mm mi?", f: (p) => p[2] > 206, iyi: true },
  { t: "Gaga > 43 mm mi?", f: (p) => p[1] > 43 },
  { t: "Gaga > 50 mm mi?", f: (p) => p[1] > 50 }
];
function ilkSoru(ctx) {
  const f = ctx.frame("Dedektif ilk <b>hangi soruyu</b> sormalı? Bir soru seç!");
  f.grid.classList.add("one");
  const st = el("div", "stage col");
  st.innerHTML = `${cubuk(PENGUEN, "Bütün penguenler")}<div class="split-q"></div><div class="split-two"></div>${efsane()}`;
  f.grid.append(st);
  const opts = el("div", "opts");
  SORU.forEach((s) => {
    const b = el("button", "opt wide", s.t);
    b.onclick = () => {
      $(".split-q", st).textContent = s.t;
      $(".split-two", st).innerHTML = cubuk(PENGUEN.filter(s.f), "Evet") + cubuk(PENGUEN.filter((p) => !s.f(p)), "Hayır");
      $$(".opt", opts).forEach((x) => x.classList.remove("ok", "no"));
      if (s.iyi) { b.classList.add("ok"); ctx.say("Süper! <b>Evet</b> grubu neredeyse hep Gentoo.", "vay"); f.done(1, STAR + " iyi soru"); }
      else { b.classList.add("no"); sfx.yanlis(); ctx.say("İki grup da hâlâ <b>karışık</b>. Daha iyi bir soru var!", "uzgun"); }
    };
    opts.append(b);
  });
  f.actions.prepend(opts);
}

/* 3 · Ağacı kur */
function agac(ctx) {
  const f = ctx.frame("<b>Hayır</b> dalı karışık. İkinci soruyu seç, ağaç büyüsün!");
  f.grid.classList.add("one");
  const st = el("div", "stage col");
  const sol = PENGUEN.filter((p) => p[2] <= 206);
  st.innerHTML = `<div class="tree">
    <div class="tnode q">Yüzgeç &gt; 206?</div>
    <div class="tkids"><div class="tbranch"><span class="tlab">Hayır</span><div class="tnode mixed" id="t2">❓ Karışık: ${sol.length}</div><div class="tkids" id="t2k" hidden></div></div>
    <div class="tbranch"><span class="tlab">Evet</span><div class="tnode leaf" style="--c:${TUR.Gentoo.renk}">Gentoo</div></div></div></div>
    <div class="split-two"></div>`;
  f.grid.append(st);
  const opts = el("div", "opts");
  [["Gaga > 43 mm mi?", (p) => p[1] > 43, true], ["Yüzgeç > 190 mm mi?", (p) => p[2] > 190, false]].forEach(([t, fn, iyi]) => {
    const b = el("button", "opt wide", t);
    b.onclick = () => {
      $(".split-two", st).innerHTML = cubuk(sol.filter(fn), "Evet") + cubuk(sol.filter((p) => !fn(p)), "Hayır");
      if (!iyi) { b.classList.add("no"); sfx.yanlis(); ctx.say("Bu soru Adelie ile Chinstrap'ı <b>ayıramıyor</b>.", "uzgun"); return; }
      $$(".opt", opts).forEach((x) => (x.disabled = true)); b.classList.add("ok");
      $("#t2", st).className = "tnode q"; $("#t2", st).textContent = "Gaga > 43?";
      const k = $("#t2k", st); k.hidden = false;
      k.innerHTML = `<div class="tbranch"><span class="tlab">Hayır</span><div class="tnode leaf" style="--c:${TUR.Adelie.renk}">Adelie</div></div><div class="tbranch"><span class="tlab">Evet</span><div class="tnode leaf" style="--c:${TUR.Chinstrap.renk}">Chinstrap</div></div>`;
      const dogru = PENGUEN.filter((p) => (p[2] > 206 ? "Gentoo" : p[1] > 43 ? "Chinstrap" : "Adelie") === p[0]).length;
      ctx.say(`Ağaç hazır! 342 penguenin <b>%${virgul((100 * dogru) / PENGUEN.length)}</b>'ünü doğru biliyor.`, "vay");
      f.done(1, STAR + " ağaç ustası");
    };
    opts.append(b);
  });
  f.actions.prepend(opts);
}

/* 4 · Ağaca sor: gizemli penguen dallarda ilerler */
const GIZEMLI = [{ gaga: 47, yuzgec: 217, tur: "Gentoo" }, { gaga: 49, yuzgec: 195, tur: "Chinstrap" }];
function sor(ctx) {
  const f = ctx.frame("Gizemli penguen geldi! Her soruda <b>Evet</b> ya da <b>Hayır</b> de.");
  f.grid.classList.add("one");
  const st = el("div", "stage col");
  f.grid.append(st);
  const evet = el("button", "btn ok-btn", "Evet ✔"), hayir = el("button", "btn no-btn", "Hayır ✘");
  f.actions.prepend(evet, hayir);
  let pi = 0, adim = 0;
  const ciz = () => {
    const P = GIZEMLI[pi];
    st.innerHTML = `<div class="myst">${penguenSvg(null, "myst-p")}<div class="myst-data"><b>Penguen ${pi + 1}</b><span>gaga: <b>${P.gaga} mm</b></span><span>yüzgeç: <b>${P.yuzgec} mm</b></span></div></div>
      <div class="ask-q">${adim === 0 ? `Yüzgeç <b>${P.yuzgec}</b> &gt; 206 mı?` : `Gaga <b>${P.gaga}</b> &gt; 43 mü?`}</div>`;
    evet.disabled = hayir.disabled = false;
  };
  const cevap = async (e) => {
    const P = GIZEMLI[pi], dogru = adim === 0 ? P.yuzgec > 206 : P.gaga > 43;
    if (e !== dogru) { sfx.yanlis(); ctx.say(adim === 0 ? `${P.yuzgec}, 206'dan büyük mü? <b>Tekrar bak!</b>` : `${P.gaga}, 43'ten büyük mü? <b>Tekrar bak!</b>`, "uzgun"); return; }
    sfx.tik(adim + 1);
    const yaprak = adim === 0 ? (e ? "Gentoo" : null) : e ? "Chinstrap" : "Adelie";
    if (!yaprak) { adim = 1; ciz(); ctx.say("Doğru! Şimdi <b>gaga</b> sorusu."); return; }
    evet.disabled = hayir.disabled = true;
    $(".myst-p", st).outerHTML = penguenSvg(yaprak, "myst-p reveal");
    $(".ask-q", st).innerHTML = `Bu bir <b style="color:${TUR[yaprak].renk}">${yaprak}</b>!`;
    await wait(1000); pi++; adim = 0;
    if (pi < GIZEMLI.length) { ciz(); ctx.say("Bir gizemli penguen daha geldi!"); }
    else { ctx.say("Karar ağacı soru soru <b>ilerler</b>, sonunda cevap verir!", "vay"); f.done(1, STAR + " penguen dedektifi"); }
  };
  evet.onclick = () => cevap(true); hayir.onclick = () => cevap(false);
  ciz();
}

/* 5 · Tahmin: eğitimde %100 alan ağaç yeni penguenlerde de %100 alır mı? (scikit-learn ile hesaplandı) */
function sinav(ctx) {
  tahminEkrani(ctx, {
    soru: "Çok dallı ağaç eğitimde <b>%100</b> aldı. Yeni penguenlerde?",
    sahne: (st) => { st.innerHTML = `<div class="exam"><div class="exam-row"><span>Eğitim (gördükleri)</span><div class="acc-bar"><span style="width:100%"></span></div><b>%100</b></div><div class="exam-row"><span>Yeni penguenler</span><div class="acc-bar q"><span></span></div><b class="exam-q">?</b></div></div>`; },
    secenekler: [
      { t: "Yine %100 alır", genis: true, ipucu: "Görmediği penguenler <b>sürpriz</b> olabilir!" },
      { t: "Biraz düşer", dogru: true, genis: true },
      { t: "%0 alır", genis: true, ipucu: "O kadar değil: kurallar çoğunlukla <b>işe yarıyor</b>." }
    ],
    oynat: async (_, st) => { const b = $(".acc-bar.q span", st); b.style.width = "94.2%"; await wait(500); $(".exam-q", st).textContent = "%94,2"; },
    basari: "%94,2! Modeli hep <b>görmediği</b> verilerle sınarız.",
    rozet: "adil sınav"
  });
}

/* 6 · Orman: 5 ağaç oy verir (scikit-learn RandomForest, 5 ağaç, derinlik 2) */
const ORMAN = [
  { f: 1, t: 207.5, h: { f: 1, t: 199.5, h: "Adelie", e: "Chinstrap" }, e: { f: 0, t: 41.7, h: "Adelie", e: "Gentoo" } },
  { f: 1, t: 206.5, h: { f: 1, t: 193.5, h: "Adelie", e: "Chinstrap" }, e: { f: 1, t: 210.5, h: "Gentoo", e: "Gentoo" } },
  { f: 0, t: 42.4, h: { f: 0, t: 40.9, h: "Adelie", e: "Adelie" }, e: { f: 0, t: 51.2, h: "Gentoo", e: "Chinstrap" } },
  { f: 0, t: 42.3, h: { f: 0, t: 40.9, h: "Adelie", e: "Adelie" }, e: { f: 1, t: 206.5, h: "Chinstrap", e: "Gentoo" } },
  { f: 1, t: 206.5, h: { f: 1, t: 190.5, h: "Adelie", e: "Adelie" }, e: { f: 1, t: 212.5, h: "Gentoo", e: "Gentoo" } }
];
const agactaSor = (n, x) => (typeof n === "string" ? n : agactaSor(x[n.f] > n.t ? n.e : n.h, x));
function orman(ctx) {
  const f = ctx.frame("Bir ağaç yanılabilir. <b>Beş ağaç</b> oylasın!");
  f.grid.classList.add("one");
  const x = [45.5, 200];
  const st = el("div", "stage col");
  st.innerHTML = `<div class="myst">${penguenSvg(null)}<div class="myst-data"><b>Zor penguen</b><span>gaga: <b>45,5 mm</b></span><span>yüzgeç: <b>200 mm</b></span></div></div>
    <div class="forest">${ORMAN.map((_, i) => `<div class="ftree"><span class="ft-ico">🌳</span><b class="ft-vote">?</b><small>ağaç ${i + 1}</small></div>`).join("")}</div><div class="nb-votes"></div>`;
  f.grid.append(st);
  const b = el("button", "btn", "🗳️ Oylat");
  f.actions.prepend(b);
  b.onclick = async () => {
    b.disabled = true; const say = {};
    for (let i = 0; i < ORMAN.length; i++) {
      const v = agactaSor(ORMAN[i], x); say[v] = (say[v] || 0) + 1;
      const ft = $$(".ftree", st)[i]; $(".ft-vote", ft).textContent = v; ft.style.setProperty("--c", TUR[v].renk); ft.classList.add("voted"); sfx.tik(i);
      $(".nb-votes", st).innerHTML = Object.entries(say).sort((a, b) => b[1] - a[1]).map(([e, n]) => `<div class="vote"><b>${e}</b><span style="--w:${n / 5};--c:${TUR[e].renk}"></span><i>${n}</i></div>`).join("");
      await wait(500);
    }
    const kazanan = Object.entries(say).sort((a, b) => b[1] - a[1])[0];
    ctx.say(`Çoğunluk <b>${kazanan[0]}</b> dedi! Buna <b>rastgele orman</b> denir.`, "vay");
    f.done(1, STAR + " orman bekçisi");
  };
}

/* 7 · Yaz: ağacın ilk kuralını if ile */
function yaz(ctx) {
  yazEkrani(ctx, {
    soru: "Sıra sende! Ağacın kuralını <b>if</b> ile yaz.",
    bas: 'yuzgec = 215\ngaga = 48\n# yuzgec 206\'dan büyükse "Gentoo" yazdır',
    yer: '# yuzgec 206\'dan büyükse "Gentoo" yazdır', cozum: 'if yuzgec > 206:\n    print("Gentoo")',
    chips: [["yuzgec", "215"], ["gaga", "48"]],
    ipuclari: ["Karar Veren Robot'u hatırla: <code>if ... :</code>", "Koşul: <code>if yuzgec > 206:</code> sonra alt satır 4 boşluk içeride.", 'Cevap: <code>if yuzgec > 206:</code> ve altında <code>    print("Gentoo")</code>'],
    kontrol: (r, kod) => {
      const son = r.out[r.out.length - 1] || "";
      if (son.trim() === "Gentoo" && /\bif\b/.test(kod)) return { ok: true, mesaj: "Harika! Kendi karar ağacı kuralını yazdın: <b>Gentoo</b> 🐧" };
      if (son.trim() === "Gentoo") return { ok: false, mesaj: "Cevap doğru ama <b>if</b> ile kural yazmalısın." };
      if (!son) return { ok: false, mesaj: "Ekran boş. Koşulun altına <code>print</code> yazdın mı?" };
      return { ok: false, mesaj: `Ekranda <b>${son.replace(/</g, "&lt;")}</b> çıktı. <b>Gentoo</b> çıkmalıydı.` };
    },
    basari: "Karar ağaçları aslında <b>if</b> sorularından oluşur!"
  });
}

export const penguen = {
  id: "penguen", no: 9, title: "Penguen Dedektifi", icon: "dedektif", color: "#9fb8ff",
  screens: [turler, ilkSoru, agac, sor, sinav, orman, yaz],
  ozet: ["Karar ağacı: soru soru ilerler", "İyi soru grupları temiz ayırır", "Model görmediği verilerle sınanır", "Rastgele orman: birçok ağaç oy verir"]
};
