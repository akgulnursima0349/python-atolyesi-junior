/* Dünya 6 · Makineler ve Fabrikalar */
import { el, $, $$, wait, codePanel, hl, txt, stepper, varChip, STAR } from "../core/ui.js";
import { bitSvg } from "../core/bit.js";
import { sfx } from "../core/sound.js";
import { tahminEkrani, yazEkrani } from "../core/kaliplar.js";

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;");
const satirYaz = (cp, i, s) => { cp.lines()[i].innerHTML = hl(s); };
const makine = (ad, giris = "") => `<div class="machine-box"><div class="mb-in">${giris}</div><div class="mb-body"><span class="mb-gear">⚙️</span><span class="mb-name">${ad}</span><div class="mb-lights"><i></i><i></i><i></i></div></div><div class="mb-out" aria-live="polite"></div></div>`;
const calistirMakine = async (st) => { const m = $(".machine-box", st); m.classList.remove("run"); void m.offsetWidth; m.classList.add("run"); await wait(600); };

/* 1 · Fonksiyon makinesi: tanımlamak çalıştırmaz, çağırmak çalıştırır */
function makineEkrani(ctx) {
  const f = ctx.frame("Fonksiyon, <b>adı olan</b> bir komut paketi. Düğmeye bas!");
  const cp = codePanel(["def selam_ver():", '    print("Merhaba!")', '    print("Ben Bit.")', "", "selam_ver()"]);
  const st = el("div", "stage");
  st.innerHTML = makine("selam_ver");
  f.grid.append(cp.node, st);
  let kac = 0, mesgul = false;
  const b = el("button", "btn", "🔴 selam_ver() çağır");
  f.actions.prepend(b);
  b.onclick = async () => {
    if (mesgul) return; mesgul = true; b.disabled = true;
    cp.line(4); await wait(300); cp.line(0); await calistirMakine(st);
    for (const [k, t] of [[1, "Merhaba!"], [2, "Ben Bit."]]) { cp.line(k); cp.print(t); $(".mb-out", st).append(el("span", "pop", t)); sfx.tik(k); await wait(450); }
    cp.line(-1); kac++; mesgul = false; b.disabled = false;
    if (kac === 2) { ctx.say("Tanımlamak çalıştırmaz, <b>çağırmak</b> çalıştırır! İstediğin kadar.", "vay"); f.done(1, STAR + " ilk fonksiyonun"); }
    else ctx.say("Paket çalıştı! Bir kez daha <b>çağır</b>.");
  };
}

/* 2 · Parametre: makineye isim kartı */
function parametre(ctx) {
  const f = ctx.frame("Makineye bir <b>isim</b> ver, o selam versin!");
  const cp = codePanel(["def selam_ver(isim):", '    print("Merhaba " + isim)', "", 'selam_ver("?")']);
  const st = el("div", "stage");
  st.innerHTML = makine("selam_ver", '<span class="in-card"></span>');
  f.grid.append(cp.node, st);
  const gorulen = new Set();
  let mesgul = false;
  const picks = el("div", "opts");
  ["Ada", "Can", "Ece"].forEach((n) => {
    const b = el("button", "opt", n);
    b.onclick = async () => {
      if (mesgul) return; mesgul = true; $$(".opt", picks).forEach((x) => (x.disabled = true));
      satirYaz(cp, 3, `selam_ver("${n}")`); cp.line(3); cp.clear(); $(".mb-out", st).innerHTML = "";
      const kart = $(".in-card", st); kart.textContent = `"${n}"`; kart.classList.remove("feed"); void kart.offsetWidth; kart.classList.add("feed");
      await wait(500); cp.line(0); await calistirMakine(st); cp.line(1);
      cp.print("Merhaba " + n); $(".mb-out", st).append(el("span", "pop", "Merhaba " + n)); sfx.tik(2);
      await wait(400); cp.line(-1); gorulen.add(n); mesgul = false; $$(".opt", picks).forEach((x) => (x.disabled = false));
      if (gorulen.size === 2) { ctx.say("Parantezdeki bilgiye <b>parametre</b> denir. Makine her seferinde farklı çalışır!", "vay"); f.done(1, STAR + " parametre ustası"); }
      else ctx.say("Şimdi <b>başka bir isim</b> ver!");
    };
    picks.append(b);
  });
  f.actions.prepend(picks);
}

/* 3 · return: kare makinesi */
function geriVer(ctx) {
  const f = ctx.frame("<b>return</b> sonucu geri verir. Kutuya koyabiliriz!");
  let n = 4;
  const sp = stepper(1, 9, n, (v) => (n = v));
  const cp = codePanel(["def kare(sayi):", "    return sayi * sayi", "", [txt("sonuc = kare("), sp, txt(")")], "print(sonuc)"]);
  const st = el("div", "stage");
  st.innerHTML = makine("kare", '<span class="in-card"></span>');
  const kutu = varChip("sonuc");
  st.append(kutu);
  f.grid.append(cp.node, st);
  const gorulen = new Set();
  const b = el("button", "btn", "▶ Çalıştır");
  f.actions.prepend(b);
  b.onclick = async () => {
    b.disabled = true; sp.lock(true); const x = n;
    cp.clear(); $(".mb-out", st).innerHTML = ""; kutu.set("?");
    cp.line(3); const kart = $(".in-card", st); kart.textContent = x; kart.classList.remove("feed"); void kart.offsetWidth; kart.classList.add("feed");
    await wait(500); cp.line(0); await calistirMakine(st); cp.line(1);
    $(".mb-out", st).append(el("span", "pop", `${x} × ${x} = ${x * x}`)); sfx.tik(3); await wait(600);
    cp.line(3); kutu.set(x * x); await wait(400); cp.line(4); cp.print(x * x); await wait(300); cp.line(-1);
    gorulen.add(x); b.disabled = false; sp.lock(false);
    if (gorulen.size === 2) { ctx.say("Makine sonucu <b>geri verdi</b>, biz de kutuya koyduk!", "vay"); f.done(1, STAR + " return ustası"); }
    else ctx.say("Sonuç <b>sonuc</b> kutusuna düştü. Başka sayı dene!");
  };
}

/* 4 · Tahmin */
function fonkTahmin(ctx) {
  tahminEkrani(ctx, {
    soru: "Ekranda <b>ne çıkar</b>?",
    kod: ["def ikiyle_carp(x):", "    return x * 2", "", "print(ikiyle_carp(5) + 1)"],
    sahne: (st) => { st.innerHTML = makine("ikiyle_carp", '<span class="in-card"></span>'); },
    secenekler: [
      { t: "10", ipucu: "Sonda bir <b>+ 1</b> daha var!" },
      { t: "11", dogru: true },
      { t: "12", ipucu: "5 × 2 = 10, sonra <b>+ 1</b>." },
      { t: "7", ipucu: "Makine <b>2 ile çarpar</b>, toplamaz." }
    ],
    oynat: async (cp, st) => {
      cp.line(3); const k = $(".in-card", st); k.textContent = "5"; k.classList.add("feed"); await wait(500);
      cp.line(1); await calistirMakine(st); $(".mb-out", st).append(el("span", "pop", "10")); await wait(400);
      cp.line(3); $(".mb-out", st).append(el("span", "pop", "10 + 1 = 11")); cp.print("11"); await wait(400); cp.line(-1);
    },
    basari: "Makine <b>10</b> verdi, üstüne <b>1</b> eklendi: 11!",
    rozet: "makine okuyucu"
  });
}

/* 5 · Sınıf = robot kalıbı */
const RENK = { "kırmızı": "#ff6b6b", "mavi": "#4d9bff", "yeşil": "#3ccf6e", "mor": "#a477ff" };
function kalip(ctx) {
  const f = ctx.frame("<b>class</b> bir kalıp. Kalıptan <b>3 robot</b> üret!");
  const cp = codePanel(["class Robot:", "    def __init__(self, renk):", "        self.renk = renk", "", 'r1 = Robot("?")']);
  const st = el("div", "stage col factory");
  st.innerHTML = `<div class="blueprint">${bitSvg("mutlu")}<span>Robot kalıbı</span></div><div class="robots" aria-live="polite"></div>`;
  f.grid.append(cp.node, st);
  let sayi = 0, mesgul = false;
  const picks = el("div", "opts");
  Object.keys(RENK).forEach((r) => {
    const b = el("button", "opt color-pick", `<i style="background:${RENK[r]}"></i>${r}`);
    b.onclick = async () => {
      if (mesgul || sayi >= 3) return; mesgul = true; sayi++;
      satirYaz(cp, 4, `r${sayi} = Robot("${r}")`); cp.line(4); await wait(250); cp.line(0); await wait(300); cp.line(2);
      const bot = el("div", "made-bot", `<div style="--rc:${RENK[r]}">${bitSvg("mutlu")}</div><span>r${sayi}</span><small>${r}</small>`);
      $(".robots", st).append(bot); sfx.tik(sayi); await wait(450); cp.line(-1); mesgul = false;
      if (sayi === 3) { $$(".opt", picks).forEach((x) => (x.disabled = true)); ctx.say("Bir kalıp, <b>üç robot</b>! Her biri bir <b>nesne</b>.", "vay"); f.done(1, STAR + " fabrika ustası"); }
      else ctx.say(`<b>r${sayi}</b> üretildi! Bir robot daha üret.`);
    };
    picks.append(b);
  });
  f.actions.prepend(picks);
}

/* 6 · Metot: robotun yetenekleri */
function yetenek(ctx) {
  const f = ctx.frame("Robotların <b>yetenekleri</b> var. Robot seç, yetenek çağır!");
  const cp = codePanel(["r1 = Robot(\"kırmızı\")", "r2 = Robot(\"mavi\")", "r1.zipla()"]);
  const st = el("div", "stage");
  st.innerHTML = `<div class="robots big">${[["r1", "kırmızı"], ["r2", "mavi"]].map(([n, r]) => `<div class="made-bot" data-r="${n}"><div style="--rc:${RENK[r]}">${bitSvg("mutlu")}</div><span>${n}</span></div>`).join("")}</div>`;
  f.grid.append(cp.node, st);
  let rob = "r1", mesgul = false;
  const cagrilar = new Set();
  const rsec = el("div", "opts");
  ["r1", "r2"].forEach((n) => {
    const b = el("button", "opt" + (n === rob ? " ok" : ""), n);
    b.onclick = () => { rob = n; $$(".opt", rsec).forEach((x) => x.classList.toggle("ok", x === b)); sfx.tik(1); };
    rsec.append(b);
  });
  const msec = el("div", "opts");
  [["zipla", "🦘"], ["dans_et", "💃"], ["selam_ver", "👋"]].forEach(([m, e]) => {
    const b = el("button", "opt wide", `${e} .${m}()`);
    b.onclick = async () => {
      if (mesgul) return; mesgul = true; const r = rob;
      satirYaz(cp, 2, `${r}.${m}()`); cp.line(2); cp.clear();
      const bot = $(`.made-bot[data-r="${r}"]`, st); bot.classList.remove("zipla", "dans_et", "selam_ver"); void bot.offsetWidth; bot.classList.add(m);
      cp.print({ zipla: `${r} zıpladı!`, dans_et: `${r} dans etti!`, selam_ver: `${r}: Merhaba!` }[m]); sfx.tik(cagrilar.size + 1);
      await wait(800); cp.line(-1); mesgul = false;
      cagrilar.add(r + m);
      if (cagrilar.size === 3) { ctx.say("Nokta koyup <b>yetenek</b> çağırdın! Buna <b>metot</b> denir.", "vay"); f.done(1, STAR + " robot yöneticisi"); }
      else ctx.say("Harika! Başka bir <b>robot ya da yetenek</b> dene.");
    };
    msec.append(b);
  });
  f.actions.prepend(rsec, msec);
}

/* 7 · Yaz: fonksiyonu çağır */
function yaz(ctx) {
  yazEkrani(ctx, {
    soru: 'Sıra sende! Fonksiyonu <b>"Bit"</b> ile çağır.',
    bas: 'def selam_ver(isim):\n    print("Merhaba " + isim)\n\n# selam_ver fonksiyonunu "Bit" ile çağır',
    yer: '# selam_ver fonksiyonunu "Bit" ile çağır', cozum: 'selam_ver("Bit")',
    chips: [["hedef", '"Merhaba Bit"']],
    ipuclari: ["Fonksiyonu çağırmak için adını yaz, sonra <b>parantez</b>.", 'Parantezin içine isim, tırnakla: <code>"Bit"</code>', 'Cevap: <code>selam_ver("Bit")</code>'],
    kontrol: (r) => {
      if (r.out.some((x) => x.trim() === "Merhaba Bit")) return { ok: true, mesaj: "Harika! Makine çalıştı: <b>Merhaba Bit</b>." };
      if (!r.out.length) return { ok: false, mesaj: "Ekran boş: fonksiyonu tanımladın ama <b>çağırmadın</b>." };
      if (r.out.some((x) => x.startsWith("Merhaba"))) return { ok: false, mesaj: `Ekranda <b>${esc(r.out[r.out.length - 1])}</b> çıktı. İsim olarak <b>"Bit"</b> ver.` };
      return { ok: false, mesaj: `Ekranda <b>${esc(r.out[r.out.length - 1])}</b> çıktı. <b>Merhaba Bit</b> çıkmalıydı.` };
    },
    basari: "Kendi makineni <b>çalıştırdın</b>!"
  });
}

export const fonk = {
  id: "fonk", no: 6, title: "Makineler ve Fabrikalar", icon: "fabrika", color: "#8fd694",
  screens: [makineEkrani, parametre, geriVer, fonkTahmin, kalip, yetenek, yaz],
  ozet: ["def selam_ver(): → komut paketi tanımla", 'selam_ver("Ada") → parametreyle çağır', "return → sonucu geri ver", 'r1 = Robot("mavi") → kalıptan nesne üret']
};
