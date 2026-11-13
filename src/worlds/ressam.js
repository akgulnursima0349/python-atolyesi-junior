/* Dünya 10 · Yapay Zekâ Ressamı (K-Means) */
import { el, $, $$, wait, codePanel, hl, txt, stepper, confetti, STAR } from "../core/ui.js";
import { sfx } from "../core/sound.js";
import { tahminEkrani, siralaEkrani } from "../core/kaliplar.js";
import { uzaklik, enYakinMerkez, merkezleriTasi, kmeans } from "../ml/modeller.js";
import { grafik, svgEl } from "../ml/grafik.js";
import { yildizYolu, kmeansMini } from "../core/cizim.js";

const RENK = ["#ff6b3d", "#22a6a0", "#a477ff", "#ffb800", "#4d9bff"];
const virgul = (n) => n.toFixed(1).replace(".", ",");
/* üç kümeli sabit nokta bulutu (tekrarlanabilir) */
function bulut() {
  let s = 11; const r = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  const M = [[2.5, 7.5], [7.5, 7], [5, 2.5]], P = [];
  M.forEach(([x, y]) => { for (let i = 0; i < 11; i++) P.push([x + (r() - 0.5) * 2.6, y + (r() - 0.5) * 2.6]); });
  return P;
}
const alan = () => grafik({ xmin: 0, xmax: 10, ymin: 0, ymax: 10, eksen: false, W: 320, H: 280 });
function boya(g, P, atama, merkezler, izler) {
  g.katman.cizgi.innerHTML = ""; g.katman.nokta.innerHTML = ""; g.katman.ust.innerHTML = "";
  /* yıldızların geçmiş yerleri: kesik çizgili iz ve soluk yıldız */
  (izler || []).forEach((iz, i) => {
    if (iz.length < 2) return;
    g.katman.ust.append(svgEl("polyline", { points: iz.map(([x, y]) => `${g.X(x)},${g.Y(y)}`).join(" "), class: "km-iz", stroke: RENK[i] }));
    iz.slice(0, -1).forEach(([x, y]) => g.katman.ust.append(svgEl("polygon", { points: yildizYolu(g.X(x), g.Y(y), 7), fill: "none", stroke: RENK[i], "stroke-width": 1.5, opacity: 0.45 })));
  });
  P.forEach((p, i) => {
    if (atama && merkezler) g.cizgi(p[0], p[1], merkezler[atama[i]][0], merkezler[atama[i]][1], "kln").style.stroke = RENK[atama[i]];
    const c = g.nokta(p[0], p[1], { r: 6, cls: "kpt" }); if (atama) c.style.fill = RENK[atama[i]];
  });
  (merkezler || []).forEach((m, i) => {
    g.katman.ust.append(svgEl("polygon", { points: yildizYolu(g.X(m[0]), g.Y(m[1]), 13), fill: RENK[i], stroke: "#fff", "stroke-width": 2.5, "stroke-linejoin": "round", class: "kstar" }));
  });
}

/* 1 · Noktaları grupla: 3 merkez koy */
function grupla(ctx) {
  const f = ctx.frame("Boş yerlere dokunup <b>3 yıldız</b> koy. Noktalar en yakına boyansın!");
  f.grid.classList.add("one");
  const P = bulut(), g = alan(), st = el("div", "stage");
  st.append(g.svg); f.grid.append(st);
  let M = [];
  boya(g, P);
  const bastan = el("button", "btn sec", "↺ Baştan"); f.actions.prepend(bastan);
  bastan.onclick = () => { M = []; boya(g, P); ctx.say("Boş yerlere dokunup <b>3 yıldız</b> koy."); };
  g.svg.addEventListener("pointerdown", (e) => {
    if (M.length >= 3) return;
    M.push(g.veriKoordinati(e)); sfx.tik(M.length);
    const atama = M.length === 3 ? P.map((p) => enYakinMerkez(p, M)) : null;
    boya(g, P, atama, M);
    if (M.length === 3) { ctx.say("Her nokta <b>en yakın yıldızın</b> rengini aldı. İşte gruplar!", "vay"); f.done(1, STAR + " ilk grupların"); }
  });
}

/* 2 · Merkezler kayıyor: K-Means adım adım */
function adimAdim(ctx) {
  const f = ctx.frame("Yıldızlar kötü yerde. <b>Adım adım</b> düzelsinler!");
  const cp = codePanel(["for tur in range(10):", "    noktalari_boya()", "    yildizlari_tasi()"]);
  const P = bulut(), g = alan(), st = el("div", "stage col");
  const faz = el("div", "km-faz", '<span class="on">1 · Boya</span><span>2 · Taşı</span>');
  st.append(faz, g.svg, el("div", "dg-note", "Tur: 0"));
  f.grid.append(cp.node, st);
  let M = [[1, 1], [5, 9], [9, 3]], atama = null, tur = 0, boyaSirasi = true;
  const izler = M.map((m) => [m]);
  const fazGoster = () => $$("span", faz).forEach((x, k) => x.classList.toggle("on", k === (boyaSirasi ? 0 : 1)));
  boya(g, P, null, M);
  const b = el("button", "btn", "👣 Bir adım"); f.actions.prepend(b);
  b.onclick = async () => {
    b.disabled = true;
    if (boyaSirasi) {
      cp.line(1); const yeni = P.map((p) => enYakinMerkez(p, M));
      const degisti = !atama || yeni.some((v, i) => v !== atama[i]);
      atama = yeni; boya(g, P, atama, M, izler); sfx.tik(2);
      if (!degisti) { cp.line(-1); ctx.say("Hiçbir nokta renk değiştirmedi: K-Means <b>bitti</b>!", "vay"); f.done(1, STAR + " K-Means ustası"); b.hidden = true; return; }
      ctx.say("Noktalar en yakın yıldıza <b>boyandı</b>. Şimdi yıldızlar taşınsın!");
    } else {
      cp.line(2); tur++; const yeni = merkezleriTasi(P, atama, M);
      const adimSay = 8;
      for (let s = 1; s <= adimSay; s++) { const ara = M.map((m, i) => [m[0] + ((yeni[i][0] - m[0]) * s) / adimSay, m[1] + ((yeni[i][1] - m[1]) * s) / adimSay]); boya(g, P, atama, ara, izler.map((iz, i) => [...iz, ara[i]])); await wait(40); }
      M = yeni; yeni.forEach((m, i) => izler[i].push(m)); sfx.tik(5); $(".dg-note", st).textContent = "Tur: " + tur;
      ctx.say("Yıldızlar kendi grubunun <b>ortasına</b> kaydı. Tekrar boya!");
    }
    boyaSirasi = !boyaSirasi; fazGoster(); b.disabled = false;
  };
}

/* 3 · Tahmin: k'yı kim söyler? */
function kimSoyler(ctx) {
  tahminEkrani(ctx, {
    soru: "K-Means'e <b>kaç grup</b> istediğimizi kim söyler?",
    kod: ["from sklearn.cluster import KMeans", "model = KMeans(n_clusters=3)", "model.fit(noktalar)"],
    sahne: (st) => { st.innerHTML = '<div class="col-center"><div class="big-count">k = ?</div></div>'; },
    secenekler: [
      { t: "Biz söyleriz", dogru: true, genis: true },
      { t: "Kendisi bulur", genis: true, ipucu: "Hayır! Koddaki <b>n_clusters</b> sayısına bak." },
      { t: "Noktalar söyler", genis: true, ipucu: "Noktalar konuşamaz 🙂 Sayıyı <b>kodda</b> veririz." }
    ],
    oynat: async (cp, st) => { cp.line(1); $(".big-count", st).textContent = "k = 3"; await wait(500); cp.line(-1); },
    basari: "<b>n_clusters=3</b> ile grup sayısını <b>biz</b> veririz!",
    rozet: "k bilgesi"
  });
}

/* 4 · Şarj istasyonu yeri */
const EVLER = [[1.5, 8], [2.5, 9], [1, 6.5], [3, 7.5], [2, 5.5], [7, 2], [8.5, 3], [7.5, 1], [9, 1.5], [6.5, 3.5], [8, 4.5], [5, 5]];
function sarj(ctx) {
  const f = ctx.frame("Mahalleye <b>2 şarj istasyonu</b> koy. Haritaya dokun!");
  f.grid.classList.add("one");
  const g = alan(), st = el("div", "stage col");
  st.append(g.svg); st.append(el("div", "compare"));
  f.grid.append(st);
  const ort = (S) => EVLER.reduce((t, e) => t + Math.min(...S.map((s) => uzaklik(e, s))), 0) / EVLER.length;
  const ciz = (S, cls) => {
    g.katman.cizgi.innerHTML = "";
    EVLER.forEach((e) => { if (S.length) { const s = S[enYakinMerkez(e, S)]; g.cizgi(e[0], e[1], s[0], s[1], "road-l " + cls); } });
    g.katman.nokta.innerHTML = "";
    EVLER.forEach((e) => { const t = svgEl("text", { x: g.X(e[0]), y: g.Y(e[1]) + 7, class: "house", "text-anchor": "middle" }); t.textContent = "🏠"; g.katman.nokta.append(t); });
    g.katman.ust.innerHTML = "";
    S.forEach((s) => { const t = svgEl("text", { x: g.X(s[0]), y: g.Y(s[1]) + 8, class: "station " + cls, "text-anchor": "middle" }); t.textContent = "⚡"; g.katman.ust.append(t); });
  };
  let S = [], senin = null;
  ciz(S, "");
  const yz = el("button", "btn", "🤖 Yapay zekâ yerleştirsin"); yz.hidden = true;
  f.actions.prepend(yz);
  g.svg.addEventListener("pointerdown", (e) => {
    if (senin !== null || S.length >= 2) return;
    S.push(g.veriKoordinati(e)); sfx.tik(S.length); ciz(S, "you");
    if (S.length === 2) { senin = ort(S); $(".compare", st).innerHTML = `<span>Senin ortalama yolun: <b>${virgul(senin)} km</b></span>`; yz.hidden = false; ctx.say("Şimdi yapay zekâ <b>K-Means</b> ile yerleştirsin!"); }
  });
  yz.onclick = async () => {
    yz.disabled = true;
    const r = kmeans(EVLER, 2, { tur: 15 }); await wait(300);
    ciz(r.merkezler, "ai"); const o = ort(r.merkezler); sfx.dogru();
    $(".compare", st).innerHTML = `<span>Senin: <b>${virgul(senin)} km</b></span><span>Yapay zekâ: <b>${virgul(o)} km</b></span>`;
    ctx.say(o < senin - 0.05 ? "Yapay zekâ yolu <b>kısalttı</b>: istasyonlar grupların ortasında!" : "Harika! Sen de yapay zekâ kadar <b>iyi</b> yerleştirdin!", "vay");
    f.done(1, STAR + " şehir planlamacı");
  };
}

/* ---------- resim yardımcıları ---------- */
function ornekResim(W = 240, H = 160) {
  const c = el("canvas"); c.width = W; c.height = H; const x = c.getContext("2d");
  const gok = x.createLinearGradient(0, 0, 0, H); gok.addColorStop(0, "#5ec2ff"); gok.addColorStop(0.6, "#ffd2a1"); x.fillStyle = gok; x.fillRect(0, 0, W, H);
  x.fillStyle = "#ffde59"; x.beginPath(); x.arc(W * 0.78, H * 0.3, 22, 0, 7); x.fill();
  x.fillStyle = "#3aa76d"; x.beginPath(); x.moveTo(0, H); x.quadraticCurveTo(W * 0.3, H * 0.45, W * 0.6, H); x.fill();
  x.fillStyle = "#2c8c5a"; x.beginPath(); x.moveTo(W * 0.35, H); x.quadraticCurveTo(W * 0.75, H * 0.5, W, H * 0.8); x.lineTo(W, H); x.fill();
  x.fillStyle = "#8b5a2b"; x.fillRect(W * 0.18, H * 0.48, 8, 30);
  x.fillStyle = "#1f7a4a"; x.beginPath(); x.arc(W * 0.18 + 4, H * 0.45, 18, 0, 7); x.fill();
  ["#ff5c8a", "#ffffff", "#a477ff"].forEach((r, i) => { x.fillStyle = r; x.beginPath(); x.arc(W * (0.45 + i * 0.08), H * (0.86 - i * 0.03), 5, 0, 7); x.fill(); });
  x.fillStyle = "#ffffff"; x.beginPath(); x.ellipse(W * 0.35, H * 0.2, 26, 9, 0, 0, 7); x.fill();
  return c;
}
function piksel(canvas) {
  const d = canvas.getContext("2d").getImageData(0, 0, canvas.width, canvas.height).data, P = [];
  for (let i = 0; i < d.length; i += 4) P.push([d[i], d[i + 1], d[i + 2]]);
  return P;
}
function renkAzalt(canvas, k) {
  const P = piksel(canvas), ornek = P.filter((_, i) => i % 7 === 0);
  const { merkezler } = kmeans(ornek, k, { tur: 10 });
  const out = el("canvas"); out.width = canvas.width; out.height = canvas.height;
  const x = out.getContext("2d"), img = x.createImageData(out.width, out.height);
  const atama = P.map((p) => enYakinMerkez(p, merkezler));
  P.forEach((_, i) => { const m = merkezler[atama[i]]; img.data[i * 4] = m[0]; img.data[i * 4 + 1] = m[1]; img.data[i * 4 + 2] = m[2]; img.data[i * 4 + 3] = 255; });
  x.putImageData(img, 0, 0);
  return { out, merkezler, atama };
}
const hex = (m) => "#" + m.map((v) => Math.round(v).toString(16).padStart(2, "0")).join("");

/* 5 · Renkler de nokta */
function renkler(ctx) {
  const f = ctx.frame("Her piksel bir <b>renk noktası</b>. k renge indir!");
  let k = 3;
  const sp = stepper(2, 8, k, (v) => (k = v));
  const cp = codePanel([[txt("model = KMeans(n_clusters="), sp, txt(")")], "model.fit(pikseller)", "yeni = model.cluster_centers_[model.labels_]"]);
  const st = el("div", "stage col");
  const orj = ornekResim();
  st.innerHTML = '<div class="img-pair"><figure><figcaption>Orijinal</figcaption></figure><figure class="out"><figcaption>k = ?</figcaption></figure></div><div class="palette"></div>';
  $(".img-pair figure", st).append(orj);
  f.grid.append(cp.node, st);
  const denenen = new Set();
  const b = el("button", "btn", "🎨 Renkleri bul");
  f.actions.prepend(b);
  b.onclick = async () => {
    b.disabled = true; sp.lock(true); const kk = k; cp.line(1); await wait(50);
    const r = renkAzalt(orj, kk);
    const fig = $(".out", st); fig.innerHTML = `<figcaption>k = ${kk}</figcaption>`; fig.append(r.out);
    $(".palette", st).innerHTML = r.merkezler.map((m) => `<i style="background:${hex(m)}"></i>`).join("");
    cp.line(-1); sfx.tik(kk); denenen.add(kk); b.disabled = false; sp.lock(false);
    if (denenen.size >= 2) { ctx.say("K-Means benzer renkleri <b>grupladı</b>. Her grup tek renk oldu!", "vay"); f.done(1, STAR + " renk avcısı"); }
    else ctx.say(`Resim <b>${kk} renge</b> indi! Şimdi başka bir k dene.`);
  };
}

/* 6 · Pop-art: kendi fotoğrafın */
const PALET = [["#16004d", "#ff2e88", "#ffd400", "#00e0ff"], ["#002b36", "#ff6b3d", "#7bff7b", "#fff6a8"], ["#2b0057", "#00c2a8", "#ff9f1c", "#ffffff"], ["#111111", "#ff0054", "#00bbf9", "#fee440"]];
function popart(ctx) {
  const f = ctx.frame("Bir fotoğraf seç. Yapay zekâ onu <b>pop-art</b> yapsın!");
  f.grid.classList.add("one");
  const st = el("div", "stage col");
  st.innerHTML = '<div class="pop-grid"></div>';
  f.grid.append(st);
  const yukle = el("label", "btn", '📁 Fotoğraf seç<input type="file" accept="image/*" hidden>');
  const ornek = el("button", "btn sec", "🖼️ Örnek resim");
  f.actions.prepend(yukle, ornek);
  const uret = async (kaynak) => {
    const W = 200, oran = kaynak.height / kaynak.width, c = el("canvas"); c.width = W; c.height = Math.max(40, Math.round(W * oran));
    c.getContext("2d").drawImage(kaynak, 0, 0, c.width, c.height);
    ctx.say("Renkler <b>gruplanıyor</b>…"); await wait(30);
    const { merkezler, atama } = renkAzalt(c, 4);
    const sira = merkezler.map((m, i) => ({ i, p: m[0] * 0.3 + m[1] * 0.59 + m[2] * 0.11 })).sort((a, b) => a.p - b.p).map((o) => o.i);
    const grid = $(".pop-grid", st); grid.innerHTML = "";
    PALET.forEach((pal) => {
      const o = el("canvas"); o.width = c.width; o.height = c.height; const x = o.getContext("2d"), img = x.createImageData(o.width, o.height);
      atama.forEach((a, i) => { const h = pal[sira.indexOf(a)], r = parseInt(h.slice(1, 3), 16), g = parseInt(h.slice(3, 5), 16), b = parseInt(h.slice(5, 7), 16); img.data.set([r, g, b, 255], i * 4); });
      x.putImageData(img, 0, 0); grid.append(o);
    });
    confetti(); sfx.dogru();
    ctx.say("İşte senin <b>pop-art</b> tablon! 4 renk, 4 farklı palet.", "vay");
    f.done(2, STAR + STAR + " yapay zekâ sanatçısı");
  };
  ornek.onclick = () => uret(ornekResim(240, 180));
  $("input", yukle).onchange = (e) => {
    const file = e.target.files && e.target.files[0]; if (!file) return;
    const img = new Image();
    img.onload = () => { uret(img); URL.revokeObjectURL(img.src); };
    img.onerror = () => ctx.say("Bu dosya <b>açılamadı</b>. Başka bir fotoğraf dene.", "uzgun");
    img.src = URL.createObjectURL(file);
  };
}

/* 7 · Sırala: K-Means adımları (her adımın küçük resmi) */
const KM_ADIM = ["k tane yıldız koy", "Noktaları en yakın yıldıza boya", "Yıldızı grubun ortasına taşı", "Değişmeyene kadar tekrarla"];
function sirala(ctx) {
  siralaEkrani(ctx, {
    soru: "K-Means nasıl çalışır? Adımları <b>sırala</b>!",
    kartlar: KM_ADIM.map((t, i) => `<span class="km-kart">${kmeansMini(i, "")}</span>${t}`), karisik: [2, 0, 3, 1],
    sahne: (st) => { st.innerHTML = `<div class="km-sahne">${KM_ADIM.map((t, i) => `<figure>${kmeansMini(i)}<figcaption>${i + 1}. adım</figcaption></figure>`).join("")}</div>`; },
    calistir: async (sira, st) => {
      const fig = $$(".km-sahne figure", st);
      fig.forEach((x) => (x.className = ""));
      for (let k = 0; k < sira.length; k++) {
        sfx.tik(k); await wait(420);
        if (sira[k] !== k) { fig[k].className = "bad"; ctx.say("Sıra karıştı! Önce <b>yıldızlar</b>, en son <b>tekrar</b>.", "uzgun"); return false; }
        fig[k].className = "on";
      }
      return true;
    },
    basari: "Kursu bitirdin! Artık bir <b>yapay zekâ kaşifisin</b>!",
    rozet: "K-Means adımları", yildiz: 2
  });
}

export const ressam = {
  id: "ressam", no: 10, title: "Yapay Zekâ Ressamı", icon: "palet", color: "#ff9d7a",
  screens: [grupla, adimAdim, kimSoyler, sarj, renkler, popart, sirala],
  ozet: ["K-Means benzerleri gruplar", "k (n_clusters) grup sayısını biz veririz", "Merkezler grubun ortasına taşınır", "Renkleri gruplayınca pop-art olur"]
};
