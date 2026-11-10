/* Dünya 2 · Python'un İlk Sözleri */
import { el, $, $$, wait, codePanel, hl, txt, stepper, varChip, STAR } from "../core/ui.js";
import { bitSvg } from "../core/bit.js";
import { sfx } from "../core/sound.js";
import { tahminEkrani, yazEkrani } from "../core/kaliplar.js";

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;");
const bitSahne = (st, mood = "mutlu") => { st.innerHTML = `<div class="col-center"><div class="speech" aria-live="polite"></div>${bitSvg(mood, "bit bit-xl")}</div>`; };
const konus = (st, t) => { const s = $(".speech", st); s.textContent = t; s.classList.remove("pop"); void s.offsetWidth; s.classList.add("pop", "show"); };

/* 1 · print: Bit konuşsun */
function yazdir(ctx) {
  const f = ctx.frame("<b>print</b> ekrana yazar. Tırnağın içini değiştir!");
  const inp = el("input", "code-input");
  inp.value = "Merhaba!"; inp.maxLength = 24; inp.setAttribute("aria-label", "Tırnağın içindeki yazı"); inp.spellcheck = false;
  const cp = codePanel([[txt("print(\""), inp, txt("\")")]]);
  const st = el("div", "stage"); bitSahne(st);
  f.grid.append(cp.node, st);
  const b = el("button", "btn", "▶ Çalıştır");
  f.actions.prepend(b);
  const boyut = () => { inp.style.width = Math.max(4, inp.value.length + 1) + "ch"; };
  inp.oninput = boyut; boyut();
  b.onclick = async () => {
    const t = inp.value.trim();
    if (!t) { ctx.say("Tırnağın içi <b>boş</b>. Bir şey yaz!", "uzgun"); return; }
    cp.line(0); cp.clear(); await wait(200); cp.print(t); konus(st, t); sfx.tik(2); cp.line(-1);
    ctx.say("Tırnak içindeki her şey <b>aynen</b> yazılır!", "vay");
    f.done(1, STAR + " Bit konuştu");
  };
}

/* 2 · Tırnak tuzağı */
function tirnak(ctx) {
  tahminEkrani(ctx, {
    soru: "Hangisi ekrana <b>Merhaba</b> yazar?",
    sahne: (st) => bitSahne(st),
    secenekler: [
      { t: "print(Merhaba)", ipucu: "Tırnaksız <b>Merhaba</b> bir kutu adı sanılır. Öyle kutu yok!", genis: true },
      { t: 'print("Merhaba")', dogru: true, genis: true },
      { t: 'Print("Merhaba")', ipucu: "Büyük <b>P</b> olmaz. Python <b>print</b>'i küçük yazar.", genis: true }
    ],
    oynat: async (_, st) => { konus(st, "Merhaba"); await wait(300); },
    basari: "Yazılar <b>tırnak</b> içinde olur!",
    rozet: "tırnak ustası"
  });
}

/* 3 · Değişken = etiketli kutu */
function kutu(ctx) {
  const f = ctx.frame("Değişken, <b>etiketli bir kutu</b>. İçine bir isim koy!");
  let isim = null;
  const val = el("span", "st", '"?"');
  const cp = codePanel([[txt("isim = "), val], "print(isim)"]);
  const st = el("div", "stage");
  st.innerHTML = `<div class="vbox-wrap"><div class="drop-card" aria-hidden="true"></div><div class="vbox"><div class="vbox-lid"></div><div class="vbox-body"><span class="vbox-val"></span></div><div class="vbox-tag">isim</div></div></div>`;
  f.grid.append(cp.node, st);
  const picks = el("div", "opts");
  ["Ada", "Can", "Ece", "Bit"].forEach((n) => {
    const b = el("button", "opt", n);
    b.onclick = () => { isim = n; val.textContent = `"${n}"`; $$(".opt", picks).forEach((x) => x.classList.toggle("ok", x === b)); run.disabled = false; sfx.tik(1); };
    picks.append(b);
  });
  const run = el("button", "btn", "▶ Çalıştır");
  run.disabled = true;
  f.actions.prepend(picks, run);
  run.onclick = async () => {
    run.disabled = true; cp.clear();
    const card = $(".drop-card", st), v = $(".vbox-val", st), box = $(".vbox", st);
    v.textContent = ""; box.classList.remove("open");
    cp.line(0); card.textContent = `"${isim}"`; card.classList.remove("drop"); void card.offsetWidth; card.classList.add("drop"); sfx.tik(2);
    await wait(750); v.textContent = `"${isim}"`; card.classList.remove("drop");
    cp.line(1); box.classList.add("open"); await wait(400); cp.print(isim); sfx.tik(4); cp.line(-1);
    ctx.say("<b>print(isim)</b> kutunun <b>içindekini</b> yazar.", "vay");
    f.done(1, STAR + " ilk değişkenin");
    run.disabled = false;
  };
}

/* 4 · Kutu değişir: önce tahmin, sonra adım adım */
function degisir(ctx) {
  tahminEkrani(ctx, {
    soru: "Kutu üç kez değişiyor. Ekranda <b>ne çıkar</b>?",
    kod: ["puan = 0", "puan = 5", "puan = puan + 3", "print(puan)"],
    sahne: (st) => { const c = varChip("puan"); st.append(c); st.append(el("div", "big-count", "?")); },
    secenekler: [
      { t: "0", ipucu: "Sonra kutuya <b>5</b> kondu. 0 gitti!" },
      { t: "5", ipucu: "3. satırda 5'e <b>3 eklendi</b>." },
      { t: "8", dogru: true },
      { t: "53", ipucu: "Sayılar <b>toplanır</b>, yan yana yazılmaz." }
    ],
    oynat: async (cp, st) => {
      const c = $(".chip", st), big = $(".big-count", st), set = (v) => { c.querySelector("em").textContent = v; c.classList.remove("flash"); void c.offsetWidth; c.classList.add("flash"); };
      const adim = [["0", "0"], ["5", "5"], ["8", "5 + 3 = 8"]];
      for (let k = 0; k < 3; k++) { cp.line(k); set(adim[k][0]); big.textContent = adim[k][1]; sfx.tik(k); await wait(650); }
      cp.line(3); cp.print("8"); big.classList.add("win"); await wait(300); cp.line(-1);
    },
    basari: "Kutuda hep <b>son konan</b> değer kalır!",
    rozet: "kutu ustası"
  });
}

/* 5 · Hesap makinesi */
const ISLEM = { "+": "<b>+</b> toplar.", "-": "<b>-</b> çıkarır.", "*": "<b>*</b> çarpar. × yerine yıldız!", "/": "<b>/</b> böler. ÷ yerine eğik çizgi!" };
function hesap(ctx) {
  const f = ctx.frame("Python bir <b>hesap makinesi</b>! 3 farklı işlem dene.");
  let a = 7, b = 2, op = "+";
  const sa = stepper(1, 20, a, (v) => (a = v)), sb = stepper(1, 10, b, (v) => (b = v));
  const opSpan = el("span", "op-span", "+");
  const cp = codePanel([[txt("print("), sa, el("span", "", " "), opSpan, el("span", "", " "), sb, txt(")")]]);
  const st = el("div", "stage");
  st.innerHTML = `<div class="col-center"><div class="calc-eq" aria-live="polite">7 + 2 = ?</div><div class="tried"></div></div>`;
  f.grid.append(cp.node, st);
  const ops = el("div", "opts");
  const denenen = new Set();
  Object.keys(ISLEM).forEach((o) => {
    const btn = el("button", "opt op" + (o === "+" ? " ok" : ""), o);
    btn.setAttribute("aria-label", { "+": "topla", "-": "çıkar", "*": "çarp", "/": "böl" }[o]);
    btn.onclick = () => { op = o; opSpan.textContent = o; $$(".op", ops).forEach((x) => x.classList.toggle("ok", x === btn)); sfx.tik(1); };
    ops.append(btn);
  });
  const run = el("button", "btn", "▶ Hesapla");
  f.actions.prepend(ops, run);
  run.onclick = async () => {
    const o = op, x = a, y = b;
    const r = { "+": x + y, "-": x - y, "*": x * y, "/": x / y }[o];
    const goster = Number.isInteger(r) ? (o === "/" ? r.toFixed(1) : String(r)) : String(Math.round(r * 1000) / 1000);
    cp.line(0); cp.clear(); await wait(200); cp.print(goster); cp.line(-1); sfx.tik(3);
    const eq = $(".calc-eq", st); eq.innerHTML = `${x} ${o} ${y} = <b>${goster}</b>`; eq.classList.remove("pop"); void eq.offsetWidth; eq.classList.add("pop");
    denenen.add(o); $(".tried", st).innerHTML = [...denenen].map((x) => `<span>${x}</span>`).join("");
    if (denenen.size >= 3) { ctx.say("Python hesapta çok hızlı! " + ISLEM[o], "vay"); f.done(1, STAR + " hesap makinesi"); }
    else ctx.say(ISLEM[o] + " Başka bir işlem dene.");
  };
}

/* 6 · Yazıları birleştir */
function birlestir(ctx) {
  const f = ctx.frame("Yazılar <b>+</b> ile yapışır. Çalıştır, izle!");
  let n = 3, adim = 0;
  const sn = stepper(1, 6, n, (v) => (n = v));
  const cp = codePanel(['isim = "Bit"', 'print("Merhaba " + isim)', [txt('print("Ha" * '), sn, txt(")")]]);
  const st = el("div", "stage");
  st.innerHTML = `<div class="bricks"><span class="brick a">"Merhaba "</span><span class="plus">+</span><span class="brick b">"Bit"</span></div><div class="laugh" aria-live="polite"></div>`;
  f.grid.append(cp.node, st);
  const r1 = el("button", "btn", "▶ Birleştir"), r2 = el("button", "btn", "▶ Tekrarla");
  r2.hidden = true;
  f.actions.prepend(r1, r2);
  r1.onclick = async () => {
    r1.disabled = true; cp.line(0); await wait(300); cp.line(1);
    $(".bricks", st).classList.add("snap"); sfx.tik(2); await wait(600);
    cp.print("Merhaba Bit"); cp.line(-1);
    ctx.say("Boşluğa dikkat: <b>\"Merhaba \"</b> sonunda bir boşluk var!", "vay");
    r1.hidden = true; r2.hidden = false; adim = 1;
  };
  r2.onclick = async () => {
    cp.line(2); const t = "Ha".repeat(n); await wait(250); cp.print(t); cp.line(-1);
    const l = $(".laugh", st); l.textContent = t; l.classList.remove("pop"); void l.offsetWidth; l.classList.add("pop"); sfx.tik(n);
    if (adim === 1) { ctx.say("<b>*</b> ile yazı tekrarlanır: " + t + "!", "vay"); f.done(1, STAR + " yazı ustası"); adim = 2; }
  };
}

/* 7 · Yaz: isim kutusunu ekrana yazdır */
function yaz(ctx) {
  yazEkrani(ctx, {
    soru: "Sıra sende! <b>isim</b> kutusunu ekrana yazdır.",
    bas: 'isim = "Bit"\nyas = 10\n# isim kutusunu ekrana yazdır',
    yer: "# isim kutusunu ekrana yazdır", cozum: "print(isim)",
    chips: [["isim", '"Bit"'], ["yas", "10"]],
    ipuclari: ["Ekrana yazdıran komut: <code>print</code>", "Parantezin içine kutunun <b>adını</b> yaz, tırnaksız.", "Cevap: <code>print(isim)</code>"],
    kontrol: (r, kod) => {
      const pr = kod.split("\n").filter((l) => /print\s*\(/.test(l) && !/^\s*#/.test(l));
      const kutuyla = pr.some((l) => /\bisim\b/.test(l.replace(/"[^"]*"|'[^']*'/g, "")));
      if (r.out.some((x) => x.includes("Bit")) && kutuyla) return { ok: true, mesaj: "Harika! Ekranda kutunun içi var: <b>Bit</b>." };
      if (r.out.some((x) => x.includes("Bit"))) return { ok: false, mesaj: "Ekranda Bit var ama elle yazdın. <b>Kutuyu</b> kullan!" };
      if (r.out.some((x) => x.trim() === "isim")) return { ok: false, mesaj: "Ekranda <b>isim</b> yazdı: tırnak kullandın. Kutu adı tırnaksız yazılır." };
      if (!r.out.length) return { ok: false, mesaj: "Ekrana hiçbir şey çıkmadı. <code>print</code> yazdın mı?" };
      return { ok: false, mesaj: `Ekranda <b>${esc(r.out[r.out.length - 1])}</b> çıktı. <b>Bit</b> çıkmalıydı.` };
    },
    basari: "Kutuyu açıp <b>içindekini</b> yazdırdın!"
  });
}

export const ilk = {
  id: "ilk", no: 2, title: "Python'un İlk Sözleri", icon: "💬", color: "#7fc8ff",
  screens: [yazdir, tirnak, kutu, degisir, hesap, birlestir, yaz],
  ozet: ['print("Merhaba") → ekrana yazar', 'isim = "Ada" → kutuya koyar', "puan = puan + 3 → kutu değişir", '"Ha" * 3 → HaHaHa']
};
