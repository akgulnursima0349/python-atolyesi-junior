/* Dünya 8 · Rakam Okuyan Yapay Zekâ (en yakın komşu, scikit-learn rakamları) */
import { el, $, $$, wait, codePanel, hl, txt, stepper, STAR } from "../core/ui.js";
import { sfx } from "../core/sound.js";
import { tahminEkrani, siralaEkrani } from "../core/kaliplar.js";
import { rakamlar, knn, uzaklik, tuvaldenRakam, rakamIzgara } from "../ml/modeller.js";

const satirYaz = (cp, i, s) => { cp.lines()[i].innerHTML = hl(s); };
const yukleniyor = (st) => { st.innerHTML = '<div class="loading-dots" aria-label="Yükleniyor"><i></i><i></i><i></i></div>'; };

/* 1 · Rakam = 64 sayı */
async function altmisDort(ctx) {
  const f = ctx.frame("Bilgisayar bu resmi <b>64 sayı</b> olarak görür. Düğmeye bas!");
  const cp = codePanel(["from sklearn.datasets import load_digits", "rakamlar = load_digits()", "print(rakamlar.images[3])"]);
  const st = el("div", "stage col"); yukleniyor(st);
  f.grid.append(cp.node, st);
  const b = el("button", "btn", "🔢 Sayı olarak gör");
  b.disabled = true;
  f.actions.prepend(b);
  const R = await rakamlar();
  b.disabled = false;
  const ornek = R.tum[3];
  let sayi = false;
  const ciz = () => { st.innerHTML = ""; st.append(rakamIzgara(ornek.x, { sayi })); st.append(el("div", "dg-note", sayi ? "8 satır × 8 sütun = 64 sayı · 0 siyah, 16 beyaz" : `Bu bir <b>${ornek.y}</b>`)); };
  ciz();
  b.onclick = () => {
    sayi = !sayi; ciz(); sfx.tik(sayi ? 4 : 1); b.textContent = sayi ? "🖼️ Resim olarak gör" : "🔢 Sayı olarak gör";
    if (sayi) { cp.line(2); cp.clear(); cp.print("[[0, 0, 7, 15, 13, 1, 0, 0] ...]"); ctx.say("Beyaz yerler <b>büyük</b>, siyah yerler <b>0</b>. Hepsi sayı!", "vay"); f.done(1, STAR + " 64 sayı"); }
  };
}

/* 2 · Benzerlik: fark puanı */
async function benzerlik(ctx) {
  const f = ctx.frame("Hangisi soldaki rakama <b>en çok benziyor</b>?");
  f.grid.classList.add("one");
  const st = el("div", "stage col"); yukleniyor(st);
  f.grid.append(st);
  const R = await rakamlar();
  const hedef = R.tum[3];
  const enYakin = (etiket) => R.egitim.filter((d) => d.y === etiket && d !== hedef).map((d) => ({ d, f: uzaklik(d.x, hedef.x) })).sort((a, b) => a.f - b.f)[0];
  const aday = [enYakin(8), enYakin(3), enYakin(1)].map((a) => ({ ...a, f: Math.round(a.f) }));
  st.innerHTML = '<div class="sim-row"><div class="sim-target"><span class="sim-h">Hedef</span></div><div class="sim-vs">?</div><div class="sim-cands"></div></div>';
  $(".sim-target", st).append(rakamIzgara(hedef.x));
  const enKucuk = Math.min(...aday.map((a) => a.f));
  aday.forEach((a) => {
    const b = el("button", "sim-cand");
    b.append(rakamIzgara(a.d.x, { kucuk: true }));
    b.append(el("span", "sim-score", ""));
    b.onclick = () => {
      $$(".sim-cand", st).forEach((x, i) => { x.querySelector(".sim-score").textContent = "fark " + aday[i].f; x.classList.add("scored"); });
      if (a.f === enKucuk) {
        b.classList.add("ok"); $$(".sim-cand", st).forEach((x) => (x.disabled = true));
        ctx.say("Fark puanı <b>en küçük</b> olan en çok benzeyendir!", "vay"); f.done(1, STAR + " benzerlik gözü");
      } else { b.classList.add("no"); sfx.yanlis(); ctx.say("Fark puanlarına bak: <b>en küçüğü</b> hangisi?", "uzgun"); }
    };
    $(".sim-cands", st).append(b);
  });
}

/* 3 · Komşular oy verir */
async function komsular(ctx) {
  const f = ctx.frame("Model en yakın <b>k</b> rakama bakar. Onlar <b>oy</b> verir!");
  let k = 5;
  const sp = stepper(1, 9, k, (v) => (k = v));
  const cp = codePanel([[txt("model = KNeighborsClassifier(n_neighbors="), sp, txt(")")], "model.fit(X_egitim, y_egitim)", "print(model.predict([gizemli]))"]);
  const st = el("div", "stage col"); yukleniyor(st);
  f.grid.append(cp.node, st);
  const b = el("button", "btn", "👥 Komşuları bul");
  b.disabled = true;
  f.actions.prepend(b);
  const R = await rakamlar();
  b.disabled = false;
  const giz = R.test[7];
  st.innerHTML = '<div class="nb-top"><div class="nb-target"><span class="sim-h">Gizemli</span></div><div class="nb-votes"></div></div><div class="nb-list"></div>';
  $(".nb-target", st).append(rakamIzgara(giz.x));
  b.onclick = async () => {
    b.disabled = true; sp.lock(true); const kk = k;
    const r = knn(R.egitim, giz.x, kk), list = $(".nb-list", st), oy = $(".nb-votes", st);
    list.innerHTML = ""; oy.innerHTML = ""; cp.clear(); cp.line(1); const say = {};
    for (const n of r.komsular) {
      const c = el("div", "nb-item"); c.append(rakamIzgara(R.egitim[n.i].x, { kucuk: true })); c.append(el("b", "", String(n.y)));
      list.append(c); say[n.y] = (say[n.y] || 0) + 1; sfx.tik(n.y);
      oy.innerHTML = Object.entries(say).sort((a, b) => b[1] - a[1]).map(([e, v]) => `<div class="vote"><b>${e}</b><span style="--w:${v / kk}"></span><i>${v}</i></div>`).join("");
      await wait(Math.max(160, 900 / kk));
    }
    cp.line(2); cp.print(`[${r.tahmin}]`); await wait(200); cp.line(-1);
    b.disabled = false; sp.lock(false); b.textContent = "👥 Tekrar bul";
    ctx.say(`${kk} komşudan çoğu <b>${r.tahmin}</b> dedi. Tahmin: <b>${r.tahmin}</b>!`, "vay");
    f.done(1, STAR + " oy sayıcı");
  };
}

/* 4 · Kendi rakamını çiz */
async function ciz(ctx) {
  const f = ctx.frame("Bir rakam <b>çiz</b>. Yapay zekâ bilecek mi?");
  const sol = el("div", "draw-wrap");
  const cv = el("canvas", "draw"); cv.width = 240; cv.height = 240; cv.setAttribute("aria-label", "Çizim alanı");
  sol.append(cv);
  const st = el("div", "stage col"); st.innerHTML = '<div class="guess"><div class="guess-mini"></div><div class="guess-big">?</div></div><div class="nb-list"></div>';
  f.grid.append(sol, st);
  const temizle = el("button", "btn sec", "🧽 Temizle"), tahminB = el("button", "btn", "🤖 Tahmin et");
  f.actions.prepend(temizle, tahminB);
  const c = cv.getContext("2d");
  const sil = () => { c.fillStyle = "#000"; c.fillRect(0, 0, 240, 240); };
  sil();
  c.strokeStyle = "#fff"; c.lineWidth = 22; c.lineCap = "round"; c.lineJoin = "round";
  let basili = false;
  const konum = (e) => { const r = cv.getBoundingClientRect(); return [((e.clientX - r.left) * 240) / r.width, ((e.clientY - r.top) * 240) / r.height]; };
  cv.addEventListener("pointerdown", (e) => { basili = true; cv.setPointerCapture(e.pointerId); const [x, y] = konum(e); c.beginPath(); c.moveTo(x, y); c.lineTo(x + 0.1, y); c.stroke(); });
  cv.addEventListener("pointermove", (e) => { if (!basili) return; const [x, y] = konum(e); c.lineTo(x, y); c.stroke(); });
  cv.addEventListener("pointerup", () => (basili = false));
  temizle.onclick = () => { sil(); $(".guess-big", st).textContent = "?"; $(".guess-mini", st).innerHTML = ""; $(".nb-list", st).innerHTML = ""; };
  tahminB.disabled = true;
  const R = await rakamlar();
  tahminB.disabled = false;
  let sayac = 0;
  tahminB.onclick = async () => {
    const x = tuvaldenRakam(cv);
    if (!x) { ctx.say("Önce bir rakam <b>çiz</b>!", "uzgun"); sfx.yanlis(); return; }
    const r = knn(R.tum, x, 3);
    const mini = $(".guess-mini", st); mini.innerHTML = ""; mini.append(rakamIzgara(x, { kucuk: true }));
    const big = $(".guess-big", st); big.textContent = r.tahmin; big.classList.remove("pop"); void big.offsetWidth; big.classList.add("pop"); sfx.dogru();
    const list = $(".nb-list", st); list.innerHTML = "";
    r.komsular.forEach((n) => { const it = el("div", "nb-item"); it.append(rakamIzgara(R.tum[n.i].x, { kucuk: true })); it.append(el("b", "", String(n.y))); list.append(it); });
    sayac++;
    if (sayac >= 2) { ctx.say(`Ben <b>${r.tahmin}</b> dedim! Çizimini 8×8'e küçültüp komşularına baktım.`, "vay"); f.done(2, STAR + STAR + " yapay zekâ seni okudu"); }
    else ctx.say(`Ben <b>${r.tahmin}</b> dedim! Temizle, <b>başka</b> bir rakam çiz.`, "vay");
  };
}

/* 5 · Tahmin: model neden yanıldı? */
async function yanilma(ctx) {
  const R = await rakamlar();
  const yanlis = R.test.map((t) => ({ t, r: knn(R.egitim, t.x, 3) })).find((o) => o.r.tahmin !== o.t.y) || { t: R.test[0], r: knn(R.egitim, R.test[0].x, 3) };
  tahminEkrani(ctx, {
    soru: `Bu bir <b>${yanlis.t.y}</b>, ama model <b>${yanlis.r.tahmin}</b> dedi. Neden?`,
    sahne: (st) => {
      st.classList.add("col");
      const row = el("div", "nb-top"); const a = el("div", "nb-target", '<span class="sim-h">Gerçek: ' + yanlis.t.y + "</span>"); a.append(rakamIzgara(yanlis.t.x)); row.append(a);
      const list = el("div", "nb-list");
      yanlis.r.komsular.forEach((n) => { const it = el("div", "nb-item"); it.append(rakamIzgara(R.egitim[n.i].x, { kucuk: true })); it.append(el("b", "", String(n.y))); list.append(it); });
      st.append(row, el("div", "dg-note", "En yakın 3 komşusu:"), list);
    },
    secenekler: [
      { t: "Çizim başka bir rakama çok benziyor", dogru: true, genis: true },
      { t: "Model yoruldu", genis: true, ipucu: "Modeller <b>yorulmaz</b>; hep aynı hesabı yapar." },
      { t: "Rastgele tahmin etti", genis: true, ipucu: "Rastgele değil: <b>en yakın komşulara</b> baktı." }
    ],
    basari: "Komşuları ona benziyordu. Model de <b>yanılabilir</b>!",
    rozet: "hata dedektifi"
  });
}

/* 6 · Doğruluk: görmediği rakamlarla sına */
async function dogruluk(ctx) {
  const f = ctx.frame("Modeli <b>görmediği</b> 180 rakamla sınayalım. Bir k seç!");
  f.grid.classList.add("one");
  const st = el("div", "stage col"); yukleniyor(st);
  f.grid.append(st);
  const R = await rakamlar();
  st.innerHTML = '<div class="acc"><div class="acc-bar"><span></span></div><div class="acc-num">%0</div></div><div class="acc-hist"></div><div class="dg-note">Yanlış bildikleri:</div><div class="wrongs"></div>';
  const denenen = new Set();
  const opts = el("div", "opts");
  [1, 3, 25].forEach((k) => {
    const b = el("button", "opt", "k = " + k);
    b.onclick = async () => {
      $$(".opt", opts).forEach((x) => (x.disabled = true));
      const bar = $(".acc-bar span", st), num = $(".acc-num", st), ws = $(".wrongs", st);
      ws.innerHTML = ""; let dogru = 0;
      for (let i = 0; i < R.test.length; i++) {
        const t = R.test[i], r = knn(R.egitim, t.x, k);
        if (r.tahmin === t.y) dogru++;
        else { const w = el("div", "nb-item bad"); w.append(rakamIzgara(t.x, { kucuk: true })); w.append(el("b", "", `${t.y}→${r.tahmin}`)); ws.append(w); }
        if (i % 12 === 11 || i === R.test.length - 1) { bar.style.width = (100 * (i + 1)) / R.test.length + "%"; num.textContent = `%${((100 * dogru) / (i + 1)).toFixed(1).replace(".", ",")}`; await wait(40); }
      }
      const yuzde = ((100 * dogru) / R.test.length).toFixed(1).replace(".", ",");
      $(".acc-hist", st).insertAdjacentHTML("beforeend", `<span>k = ${k}: <b>%${yuzde}</b></span>`);
      sfx.tik(denenen.size + 2); denenen.add(k);
      $$(".opt", opts).forEach((x) => (x.disabled = false)); b.disabled = true;
      if (denenen.size >= 2) { ctx.say(`180 rakamın neredeyse hepsini bildi! En iyisi <b>%${yuzde}</b> civarı.`, "vay"); f.done(1, STAR + " model sınavı"); }
      else ctx.say(`<b>%${yuzde}</b> doğru! Şimdi <b>başka bir k</b> dene.`);
    };
    opts.append(b);
  });
  f.actions.prepend(opts);
}

/* 7 · Sırala: çizimden tahmine */
function sirala(ctx) {
  siralaEkrani(ctx, {
    soru: "Yapay zekâ bir rakamı nasıl okur? <b>Sırala!</b>",
    kartlar: ["✏️ Rakamı çiz", "🔲 8×8'e küçült", "🔢 64 sayıya çevir", "👥 En yakın komşuları bul", "🗳️ Oyları say"], karisik: [3, 1, 4, 0, 2],
    sahne: (st) => { st.innerHTML = '<div class="col-center"><div class="big-count">✏️ → ❓</div></div>'; },
    calistir: async (sira, st) => {
      const bc = $(".big-count", st);
      for (let k = 0; k < sira.length; k++) {
        bc.textContent = ["✏️", "🔲", "🔢", "👥", "🗳️"][sira[k]]; sfx.tik(k); await wait(380);
        if (sira[k] !== k) { bc.textContent = "🤔"; ctx.say("Sıra karıştı! Önce <b>çizim</b>, en son <b>oylar</b>.", "uzgun"); return false; }
      }
      bc.textContent = "✏️ → 7 ✅"; return true;
    },
    basari: "Çiz, küçült, sayıya çevir, komşulara sor: <b>işte YZ!</b>",
    rozet: "rakam okuyucu", yildiz: 2
  });
}

export const rakam = {
  id: "rakam", no: 8, title: "Rakam Okuyan Yapay Zekâ", icon: "✏️", color: "#7fd6d1",
  screens: [altmisDort, benzerlik, komsular, ciz, yanilma, dogruluk, sirala],
  ozet: ["Resim = 8×8 = 64 sayı", "Fark puanı küçükse resimler benzer", "KNN: en yakın k komşu oy verir", "Model görmediği verilerle sınanır"]
};
