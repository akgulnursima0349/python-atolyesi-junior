/* Tekrar eden ekran kalıpları: tahmin, sırala, yaz. Her dünya bunları kendi içeriğiyle doldurur. */
import { el, $, $$, wait, codePanel, stars, STAR } from "./ui.js";
import { bitSvg } from "./bit.js";
import { sfx } from "./sound.js";
import { editor } from "./editor.js";
import { run, hazirla } from "./python.js";

/* Tahmin: kod + seçenekler. Yanlış seçeneğin kendi ipucu var; doğru seçilince oynat() animasyonu çalışır.
   o = { soru, kod: [satır], secenekler: [{ t, dogru?, ipucu? }], sahne?: (st) => void, oynat?: async (cp, st) => void,
         basari, rozet, yildiz = 1 } */
export function tahminEkrani(ctx, o) {
  const f = ctx.frame(o.soru);
  const cp = o.kod ? codePanel(o.kod) : null;
  const st = el("div", "stage");
  if (o.sahne) o.sahne(st);
  if (cp) f.grid.append(cp.node, st); else { f.grid.classList.add("one"); f.grid.append(st); }
  const opts = el("div", "opts");
  o.secenekler.forEach((s) => {
    const b = el("button", "opt" + (s.genis ? " wide" : ""), s.t);
    b.onclick = async () => {
      if (!s.dogru) { b.classList.add("no"); sfx.yanlis(); ctx.say(s.ipucu || "Bir daha düşün!", "uzgun"); return; }
      b.classList.add("ok"); $$("button", opts).forEach((x) => (x.disabled = true)); sfx.tik(3);
      if (o.oynat) await o.oynat(cp, st);
      ctx.say(o.basari, "vay"); f.done(o.yildiz || 1, STAR + " " + (o.rozet || "doğru tahmin"));
    };
    opts.append(b);
  });
  f.actions.prepend(opts);
  return { f, cp, st };
}

/* Sırala: kartlara doğru sırayla dokun, "Çalıştır" de.
   o = { soru, kartlar: [doğru sırada metinler], karisik: [görüntülenme sırası (indeks)], kod?: bool,
         calistir: async (secilenIndeksler, st, cp) => bool (doğru mu), sahne?: (st) => void, basari, rozet, yildiz = 1 } */
export function siralaEkrani(ctx, o) {
  const f = ctx.frame(o.soru);
  const sol = el("div", "sirala");
  const havuz = el("div", "havuz"), prog = el("ol", "prog" + (o.kod ? " is-code" : ""));
  sol.append(el("div", "twin-h", "Kartlar"), havuz, el("div", "twin-h", o.kod ? "Program" : "Sıra"), prog);
  const st = el("div", "stage");
  if (o.sahne) o.sahne(st);
  f.grid.append(sol, st);
  const secilen = [];
  const calis = el("button", "btn", "▶ Çalıştır");
  calis.disabled = true;
  f.actions.prepend(calis);
  const ciz = () => {
    havuz.innerHTML = ""; prog.innerHTML = "";
    o.karisik.forEach((i) => {
      if (secilen.includes(i)) return;
      const b = el("button", "kart" + (o.kod ? " is-code" : ""), o.kartlar[i]);
      b.onclick = () => { secilen.push(i); sfx.tik(secilen.length); ciz(); };
      havuz.append(b);
    });
    secilen.forEach((i, k) => {
      const li = el("li");
      const b = el("button", "kart placed" + (o.kod ? " is-code" : ""), o.kartlar[i]);
      b.setAttribute("aria-label", "Geri al: " + b.textContent);
      b.onclick = () => { secilen.splice(k, 1); ciz(); };
      li.append(b); prog.append(li);
    });
    if (!secilen.length) prog.append(el("li", "bos", "Kartlara sırayla dokun"));
    calis.disabled = secilen.length !== o.kartlar.length;
  };
  ciz();
  calis.onclick = async () => {
    calis.disabled = true;
    const dogru = await o.calistir([...secilen], st);
    if (dogru) { ctx.say(o.basari, "vay"); f.done(o.yildiz || 1, STAR + " " + (o.rozet || "sıraladın")); }
    else { sfx.yanlis(); calis.disabled = false; calis.textContent = "▶ Tekrar çalıştır"; }
  };
  return { f, st };
}

/* Yaz: çocuk tek satır yazar; Python çalışır; kontrol() sonucu değerlendirir.
   o = { soru, bas, yer (yer tutucu satır), cozum (tam satır, girintisiyle), ipuclari: [3], chips: [[ad, değer]],
         kontrol: (r, kod) => ({ ok, mesaj }), basari: { bit, mesaj }, yildiz = 2 } */
export function yazEkrani(ctx, o) {
  const f = ctx.frame(o.soru);
  hazirla().catch(() => {});
  const ed = editor(o.bas, { satir: Math.max(4, o.bas.split("\n").length + 1) });
  const sol = el("div", "write");
  sol.append(ed);
  const st = el("div", "stage");
  st.innerHTML = `<div class="chips">${(o.chips || []).map(([a, d]) => `<div class="chip">${a} = <em>${d}</em></div>`).join("")}</div>
    <div class="col-center">${bitSvg("mutlu", "bit bit-xl")}<div class="screen-out" aria-live="polite"><span class="out-label">Ekran</span><div class="so-lines"></div></div></div>`;
  f.grid.append(sol, st);
  const msg = el("div", "msg");
  const calis = el("button", "btn", "▶ Çalıştır"), ipucuB = el("button", "btn sec", "💡 İpucu");
  ipucuB.hidden = true;
  f.actions.prepend(calis, ipucuB);
  f.grid.after(msg);
  let deneme = 0, ipucu = 0;
  const bit = (m) => { $(".bit", st).outerHTML = bitSvg(m, "bit bit-xl"); };
  const basarisiz = () => { deneme++; if (deneme >= 3) ipucuB.hidden = false; bit("uzgun"); sfx.yanlis(); };
  ipucuB.onclick = () => {
    msg.className = "msg hint"; msg.innerHTML = "💡 " + o.ipuclari[Math.min(ipucu, o.ipuclari.length - 1)];
    if (ipucu >= o.ipuclari.length - 1) {
      const kopya = el("button", "btn sec small", "Kutuya yaz");
      kopya.onclick = () => { ed.value = o.bas.replace(o.yer, o.cozum); ed.focus(); };
      msg.append(" ", kopya);
    }
    ipucu++;
  };
  calis.onclick = async () => {
    calis.disabled = true; calis.textContent = "Python hazırlanıyor…";
    let r;
    try { r = await run(ed.value); }
    catch (_) { msg.className = "msg bad"; msg.textContent = "Python yüklenemedi. İnternet bağlantısını kontrol edip tekrar dene."; calis.disabled = false; calis.textContent = "▶ Çalıştır"; return; }
    calis.disabled = false; calis.textContent = "▶ Çalıştır";
    $(".so-lines", st).innerHTML = r.out.map((x) => `<div>${x.replace(/&/g, "&amp;").replace(/</g, "&lt;")}</div>`).join("");
    if (r.hata) { msg.className = "msg bad"; msg.innerHTML = (r.hata.satir ? `<b>${r.hata.satir}. satır:</b> ` : "") + r.hata.mesaj; basarisiz(); return; }
    const k = o.kontrol(r, ed.value);
    if (k.ok) {
      msg.className = "msg ok"; msg.innerHTML = k.mesaj;
      bit("vay"); ctx.say(o.basari, "vay"); f.done(o.yildiz || 2, stars(o.yildiz || 2) + " kod yazdın"); return;
    }
    msg.className = "msg bad"; msg.innerHTML = k.mesaj; basarisiz();
  };
  return { f, st, ed };
}

/* Sahne içinde yazı göster (büyük, ortada) */
export function sahneYazi(st, html, cls = "") { const d = el("div", "stage-text " + cls, html); st.append(d); return d; }
export { wait };
