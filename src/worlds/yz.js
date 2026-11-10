/* Dünya 7 · Yapay Zekânın Alet Çantası */
import { el, $, $$, wait, codePanel, hl, STAR } from "../core/ui.js";
import { bitSvg } from "../core/bit.js";
import { sfx } from "../core/sound.js";
import { tahminEkrani, siralaEkrani, yazEkrani } from "../core/kaliplar.js";
import { MEYVE, meyveX, meyveVeri, knn } from "../ml/modeller.js";
import { grafik } from "../ml/grafik.js";

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;");
const EMO = { elma: "🍎", portakal: "🍊" };
const satirYaz = (cp, i, s) => { cp.lines()[i].innerHTML = hl(s); };
const meyveGrafik = () => grafik({ xmin: 115, xmax: 210, ymin: 0, ymax: 11, xetiket: "ağırlık (gram)", yetiket: "kabuk pürüzü" });

/* 1 · Kural yazmayız, örnek gösteririz */
function ornek(ctx) {
  const f = ctx.frame("Yapay zekâya kural yazmayız, <b>örnek</b> gösteririz!");
  f.grid.classList.add("one");
  const ORN = [[140, 2, "elma"], [175, 8, "portakal"], [130, 1, "elma"], [185, 10, "portakal"]];
  const st = el("div", "stage col");
  st.innerHTML = `<div class="ex-cards">${ORN.map(([a, p, t], i) => `<button class="ex-card" data-i="${i}"><span class="ex-e">${EMO[t]}</span><span>${a} g</span><span>pürüz ${p}</span></button>`).join("")}</div>
    <div class="brain"><span class="brain-ico">🧠</span><span class="brain-n">0 örnek</span></div><div class="ask" hidden></div>`;
  f.grid.append(st);
  let n = 0;
  const sor = el("button", "btn", "❓ Yeni meyveyi sor");
  sor.hidden = true;
  f.actions.prepend(sor);
  $$(".ex-card", st).forEach((b) => {
    b.onclick = () => {
      b.disabled = true; b.classList.add("fed"); n++; sfx.tik(n);
      $(".brain-n", st).textContent = n + " örnek"; $(".brain", st).classList.remove("pop"); void st.offsetWidth; $(".brain", st).classList.add("pop");
      if (n === 4) { sor.hidden = false; ctx.say("Model 4 örnek gördü. Şimdi <b>yeni</b> bir meyve soralım!"); }
    };
  });
  sor.onclick = async () => {
    sor.disabled = true;
    const a = $(".ask", st); a.hidden = false;
    a.innerHTML = `<span class="mystery">❔</span><span>170 g, pürüz 7</span><span class="arrow">→</span><span class="answer"></span>`;
    await wait(700); const r = knn(meyveVeri(), meyveX(170, 7), 3).tahmin;
    $(".answer", a).textContent = EMO[r] + " " + r; sfx.dogru();
    ctx.say("Kuralı model <b>kendisi buldu</b>: ağır ve pürüzlü ise portakal!", "vay");
    f.done(1, STAR + " ilk modelin öğrendi");
  };
}

/* 2 · Tablo (Pandas) */
const TABLO = MEYVE.filter((_, i) => [0, 8, 1, 9, 2, 12].includes(i));
function tablo(ctx) {
  const f = ctx.frame("Veriler bir <b>tabloda</b> durur. Bir sütun başlığına dokun!");
  const cp = codePanel(["import pandas as pd", 'df = pd.read_csv("meyveler.csv")', 'print(df["agirlik"])']);
  const st = el("div", "stage col");
  const SUT = [["agirlik", "ağırlık"], ["puruz", "pürüz"], ["tur", "tür"]];
  st.innerHTML = `<table class="df"><thead><tr><th></th>${SUT.map(([k, t]) => `<th><button data-k="${k}">${t}</button></th>`).join("")}</tr></thead>
    <tbody>${TABLO.map(([a, p, t], i) => `<tr><td class="idx">${i}</td><td data-k="agirlik">${a}</td><td data-k="puruz">${p}</td><td data-k="tur">${EMO[t]} ${t}</td></tr>`).join("")}</tbody></table>`;
  f.grid.append(cp.node, st);
  const ort = el("button", "btn sec", "📊 Ortalama ağırlık");
  f.actions.prepend(ort);
  let sutun = false, ortalama = false;
  const bitti = () => { if (sutun && ortalama) { ctx.say("<b>Pandas</b> ile tabloyu tek satırda okuruz!", "vay"); f.done(1, STAR + " tablo ustası"); } };
  $$("th button", st).forEach((b) => {
    b.onclick = () => {
      const k = b.dataset.k;
      $$("[data-k]", st).forEach((x) => x.classList.toggle("col-on", x.dataset.k === k));
      satirYaz(cp, 2, `print(df["${k}"])`); cp.clear(); cp.line(2);
      TABLO.forEach(([a, p, t]) => cp.print(k === "agirlik" ? a : k === "puruz" ? p : t)); sfx.tik(2);
      sutun = true; if (!ortalama) ctx.say("Bir sütunun hepsi geldi! Şimdi <b>ortalamayı</b> hesapla."); bitti();
    };
  });
  ort.onclick = () => {
    const o = TABLO.reduce((s, r) => s + r[0], 0) / TABLO.length;
    satirYaz(cp, 2, 'print(df["agirlik"].mean())'); cp.clear(); cp.line(2); cp.print(o.toFixed(1)); sfx.tik(4);
    $$("[data-k]", st).forEach((x) => x.classList.toggle("col-on", x.dataset.k === "agirlik"));
    ortalama = true; if (!sutun) ctx.say(`Ortalama ağırlık <b>${o.toFixed(1)} gram</b>. Şimdi bir başlığa dokun.`); bitti();
  };
}

/* 3 · Grafik (Matplotlib) */
function cizim(ctx) {
  const f = ctx.frame("Tabloyu <b>grafiğe</b> çevirelim. Her meyve bir nokta!");
  const cp = codePanel(["import matplotlib.pyplot as plt", 'plt.scatter(df["agirlik"], df["puruz"])', "plt.show()"]);
  const st = el("div", "stage");
  const g = meyveGrafik();
  st.append(g.svg);
  f.grid.append(cp.node, st);
  const b = el("button", "btn", "📈 Çiz");
  f.actions.prepend(b);
  b.onclick = async () => {
    b.disabled = true; cp.line(1);
    for (const [a, p, t] of MEYVE) { g.nokta(a, p, { cls: t + " grow", etiket: `${a} g, pürüz ${p}` }); sfx.tik(t === "elma" ? 1 : 4); await wait(110); }
    cp.line(2); await wait(300); cp.line(-1);
    g.katman.ust.innerHTML = `<text x="${g.X(135)}" y="${g.Y(4.8)}" class="plot-note elma" text-anchor="middle">🍎 elmalar</text><text x="${g.X(182)}" y="${g.Y(10.6)}" class="plot-note portakal" text-anchor="middle">🍊 portakallar</text>`;
    ctx.say("Elmalar <b>bir köşede</b>, portakallar <b>öbür köşede</b>!", "vay");
    f.done(1, STAR + " ilk grafiğin");
  };
}

/* 4 · Tahmin: yeni meyve nereye düştü? */
function yeniMeyve(ctx) {
  let g;
  tahminEkrani(ctx, {
    soru: "Gri nokta yeni bir meyve. Sence <b>ne</b>?",
    sahne: (st) => {
      g = meyveGrafik(); st.append(g.svg);
      MEYVE.forEach(([a, p, t]) => g.nokta(a, p, { cls: t }));
      g.nokta(172, 7.5, { r: 9, cls: "yeni" });
    },
    secenekler: [
      { t: "🍎 elma", ipucu: "Etrafına bak: yanında hep <b>turuncu</b> noktalar var!" },
      { t: "🍊 portakal", dogru: true }
    ],
    oynat: async () => {
      const r = knn(meyveVeri(), meyveX(172, 7.5), 3);
      for (const n of r.komsular) { const [a, p] = MEYVE[n.i]; g.cizgi(172, 7.5, a, p, "near"); sfx.tik(2); await wait(300); }
    },
    basari: "En yakın komşuları portakal. Yapay zekâ da <b>böyle</b> düşünür!",
    rozet: "komşu dedektifi"
  });
}

/* 5 · İlk model: kaydırıcılarla yeni meyve */
function model(ctx) {
  const f = ctx.frame("Kaydırıcılarla yeni meyve yap. Model <b>ne</b> diyor?");
  const cp = codePanel(["model = KNeighborsClassifier(n_neighbors=3)", "model.fit(X, y)", "print(model.predict([[150, 3]]))"]);
  const st = el("div", "stage col");
  const g = meyveGrafik();
  MEYVE.forEach(([a, p, t]) => g.nokta(a, p, { cls: t }));
  const yeni = g.nokta(150, 3, { r: 9, cls: "yeni" });
  st.append(g.svg);
  st.insertAdjacentHTML("beforeend", `<div class="sliders"><label>⚖️ <input type="range" id="w" min="120" max="205" value="150" aria-label="ağırlık"><b class="sv">150 g</b></label>
    <label>🪨 <input type="range" id="p" min="1" max="10" value="3" aria-label="pürüz"><b class="sv">3</b></label></div><div class="verdict" aria-live="polite"></div>`);
  f.grid.append(cp.node, st);
  const gorulen = new Set();
  const guncelle = () => {
    const a = +$("#w", st).value, p = +$("#p", st).value;
    $$(".sv", st)[0].textContent = a + " g"; $$(".sv", st)[1].textContent = p;
    yeni.setAttribute("cx", g.X(a)); yeni.setAttribute("cy", g.Y(p));
    const r = knn(meyveVeri(), meyveX(a, p), 3);
    g.katman.cizgi.innerHTML = "";
    r.komsular.forEach((n) => g.cizgi(a, p, MEYVE[n.i][0], MEYVE[n.i][1], "near " + n.y));
    satirYaz(cp, 2, `print(model.predict([[${a}, ${p}]]))`); cp.clear(); cp.print(`['${r.tahmin}']`);
    $(".verdict", st).innerHTML = `${EMO[r.tahmin]} <b>${r.tahmin}</b> <small>(${Object.entries(r.oylar).map(([k, v]) => `${v} ${k}`).join(", ")})</small>`;
    if (!gorulen.has(r.tahmin)) { gorulen.add(r.tahmin); sfx.tik(gorulen.size * 2); }
    if (gorulen.size === 2 && f.next.hidden) { ctx.say("Model, <b>en yakın 3 komşunun</b> oyuna bakıyor!", "vay"); f.done(1, STAR + " model ustası"); }
    else if (gorulen.size < 2) ctx.say("Bu bir <b>elma</b>. Kaydırıcılarla bir <b>portakal</b> yap!");
  };
  $("#w", st).oninput = guncelle; $("#p", st).oninput = guncelle;
  guncelle();
}

/* 6 · Sırala: kur, eğit, sor */
function sirala(ctx) {
  siralaEkrani(ctx, {
    soru: "Modelle çalışmanın <b>3 adımı</b> var. Sırala!",
    kod: true,
    kartlar: ["model = KNeighborsClassifier()", "model.fit(X, y)", "model.predict([[170, 8]])"], karisik: [2, 0, 1],
    sahne: (st) => { st.innerHTML = `<div class="pipeline">${[["🏗️", "kur"], ["📚", "eğit"], ["❓", "sor"]].map(([e, t]) => `<div class="pipe-step"><span>${e}</span><b>${t}</b></div>`).join('<span class="pipe-ar">→</span>')}</div>`; },
    calistir: async (sira, st) => {
      const s = $$(".pipe-step", st);
      s.forEach((x) => x.classList.remove("on", "bad"));
      for (let k = 0; k < 3; k++) {
        const dogru = sira[k] === k;
        s[k].classList.add(dogru ? "on" : "bad"); sfx.tik(k); await wait(450);
        if (!dogru) { ctx.say(sira[k] === 2 ? "Eğitmeden <b>soramazsın</b>! Önce kur, sonra eğit." : "Kurmadan <b>eğitemezsin</b>! Önce modeli kur.", "uzgun"); return false; }
      }
      return true;
    },
    basari: "Kur, <b>eğit</b>, sor: her yapay zekâ böyle çalışır!",
    rozet: "fit ve predict"
  });
}

/* 7 · Yaz: modele sor (görünmeyen hazır kodda küçük bir KNN sınıfı var) */
const ONEK = `class KNeighborsClassifier:
    def __init__(self, n_neighbors=3):
        self.k = n_neighbors
    def fit(self, X, y):
        self.X = X
        self.y = y
    def predict(self, sorular):
        cevap = []
        for s in sorular:
            d = []
            for i in range(len(self.X)):
                a = self.X[i]
                d.append([(a[0] - s[0]) * (a[0] - s[0]) / 100 + (a[1] - s[1]) * (a[1] - s[1]), self.y[i]])
            d.sort()
            oy = {}
            for j in range(min(self.k, len(d))):
                oy[d[j][1]] = oy.get(d[j][1], 0) + 1
            en = None
            for e in oy:
                if en is None or oy[e] > oy[en]:
                    en = e
            cevap.append(en)
        return cevap`;
function yaz(ctx) {
  yazEkrani(ctx, {
    soru: "Sıra sende! <b>175 g, pürüz 8</b> meyveyi modele sor.",
    onek: ONEK,
    bas: 'X = [[140, 2], [130, 1], [175, 8], [185, 10]]\ny = ["elma", "elma", "portakal", "portakal"]\nmodel = KNeighborsClassifier(n_neighbors=1)\nmodel.fit(X, y)\n# 175 gram, pürüzü 8 olan meyveyi modele sor ve yazdır',
    yer: "# 175 gram, pürüzü 8 olan meyveyi modele sor ve yazdır", cozum: "print(model.predict([[175, 8]]))",
    chips: [["hedef", "['portakal']"]],
    ipuclari: ["Modele soru sormak için <code>model.predict</code> kullanılır.", "Sorular çift köşeli parantezle verilir: <code>[[175, 8]]</code>", "Cevap: <code>print(model.predict([[175, 8]]))</code>"],
    kontrol: (r, kod) => {
      const son = r.out[r.out.length - 1] || "";
      if (/portakal/.test(son) && /predict/.test(kod)) return { ok: true, mesaj: "Harika! Model cevap verdi: <b>portakal</b> 🍊" };
      if (/elma/.test(son)) return { ok: false, mesaj: "Model <b>elma</b> dedi. Sorduğun sayılar 175 ve 8 mi?" };
      if (!son) return { ok: false, mesaj: "Ekran boş. Cevabı <code>print</code> ile yazdırdın mı?" };
      return { ok: false, mesaj: `Ekranda <b>${esc(son)}</b> çıktı. Modele <code>predict</code> ile sor.` };
    },
    basari: "Bir yapay zekâ modeline <b>kendin</b> soru sordun!"
  });
}

export const yz = {
  id: "yz", no: 7, title: "Yapay Zekânın Alet Çantası", icon: "🧰", color: "#ffd84d",
  screens: [ornek, tablo, cizim, yeniMeyve, model, sirala, yaz],
  ozet: ["Yapay zekâ örneklerden öğrenir", 'df["agirlik"] → tablodan sütun (Pandas)', "plt.scatter → nokta grafiği (Matplotlib)", "model.fit → eğit, model.predict → sor"]
};
