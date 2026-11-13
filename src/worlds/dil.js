/* Dünya 1 · Bilgisayarın Dili */
import { el, $, $$, wait, codePanel, STAR } from "../core/ui.js";
import { bitSvg } from "../core/bit.js";
import { sfx } from "../core/sound.js";
import { tahminEkrani, siralaEkrani } from "../core/kaliplar.js";
import { DIS, banyo } from "../core/cizim.js";

/* 1 · Program = sıralı komutlar */
const ADIM = [["firca", "Fırçayı al"], ["macun", "Macunu sür"], ["fircala", "Dişlerini fırçala"], ["calkala", "Ağzını çalkala"]];
const KOMIK = {
  1: "Macunu nereye süreyim? Elimde <b>fırça yok</b>!",
  2: "<b>Macunsuz</b> fırçaladım! Hiç köpürmedi.",
  3: "Daha fırçalamadan <b>çalkaladım</b>!"
};
function tarif(ctx) {
  siralaEkrani(ctx, {
    soru: "Bit dişlerini fırçalayacak. Adımları <b>sırayla</b> seç!",
    kartlar: ADIM.map(([k, t]) => `<span class="k-ik">${DIS[k]()}</span>${t}`), karisik: [2, 0, 3, 1],
    sahne: (st) => {
      st.classList.add("dis-stage");
      st.innerHTML = `<div class="dis-sahne">${banyo()}<div class="dis-bit">${bitSvg("mutlu", "bit")}</div>
        <div class="dis-balon" aria-live="polite"><div class="dis-resim">${DIS.firca("dis-soluk")}</div><span class="dis-yazi">Hazırım!</span></div>
        <ol class="dis-adimlar">${ADIM.map(() => "<li></li>").join("")}</ol></div>`;
    },
    calistir: async (sira, st) => {
      const res = $(".dis-resim", st), yazi = $(".dis-yazi", st), noktalar = $$(".dis-adimlar li", st), balon = $(".dis-balon", st);
      noktalar.forEach((n) => (n.className = ""));
      balon.classList.remove("ok", "bad");
      for (let k = 0; k < sira.length; k++) {
        const [ad, t] = ADIM[sira[k]];
        res.innerHTML = DIS[ad](); yazi.textContent = t;
        balon.classList.remove("pop"); void balon.offsetWidth; balon.classList.add("pop"); sfx.tik(k);
        await wait(700);
        if (sira[k] !== k) {
          res.innerHTML = DIS.karmasa(); yazi.textContent = "Olmadı!"; balon.classList.add("bad"); noktalar[k].className = "bad";
          $(".dis-bit", st).innerHTML = bitSvg("uzgun", "bit");
          ctx.say(KOMIK[sira[k]] || "Sıra karıştı!", "uzgun");
          await wait(500); $(".dis-bit", st).innerHTML = bitSvg("mutlu", "bit");
          return false;
        }
        noktalar[k].className = "ok";
      }
      res.innerHTML = DIS.parlak(); yazi.textContent = "Pırıl pırıl!"; balon.classList.add("ok");
      $(".dis-bit", st).innerHTML = bitSvg("vay", "bit");
      return true;
    },
    basari: "Bilgisayar da böyle: komutları <b>sırayla</b> yapar.",
    rozet: "ilk programın"
  });
}

/* 2 · Lamba sayıları: 16 8 4 2 1 */
function lambalar(ctx) {
  const HEDEF = [5, 12, 21];
  let h = 0;
  const f = ctx.frame(`Yanan lamba = 1, sönük = 0. <b>${HEDEF[0]}</b> sayısını yap!`);
  f.grid.classList.add("one");
  const st = el("div", "stage");
  const DEG = [16, 8, 4, 2, 1], on = [0, 0, 0, 0, 0];
  st.innerHTML = `<div class="chip">hedef = <em>${HEDEF[0]}</em></div><div class="lamp-board">
    <div class="lamps">${DEG.map((d, i) => `<button class="lamp" data-i="${i}" aria-label="${d} değerli lamba" aria-pressed="false"><span class="bulb"></span><span class="lv">${d}</span><span class="bit01">0</span></button>`).join("")}</div>
    <div class="lamp-sum" aria-live="polite">= 0</div></div>`;
  f.grid.append(st);
  const sum = () => DEG.reduce((t, d, i) => t + d * on[i], 0);
  const ciz = () => {
    $$(".lamp", st).forEach((b, i) => { b.classList.toggle("on", !!on[i]); b.setAttribute("aria-pressed", on[i] ? "true" : "false"); $(".bit01", b).textContent = on[i]; });
    const parts = DEG.filter((_, i) => on[i]);
    $(".lamp-sum", st).innerHTML = (parts.length > 1 ? parts.join(" + ") + " " : "") + "= <b>" + sum() + "</b>";
  };
  $$(".lamp", st).forEach((b) => {
    b.onclick = async () => {
      if (h >= HEDEF.length) return;
      const i = +b.dataset.i; on[i] = 1 - on[i]; sfx.tik(i); ciz();
      if (sum() === HEDEF[h]) {
        sfx.dogru(); $(".lamp-sum", st).classList.add("win"); h++;
        await wait(700); $(".lamp-sum", st).classList.remove("win");
        if (h < HEDEF.length) {
          on.fill(0); ciz(); $(".chip em", st).textContent = HEDEF[h];
          ctx.say(`Süper! Şimdi <b>${HEDEF[h]}</b> sayısını yap.`, "vay");
        } else { ctx.say("Bilgisayar sayıları <b>lambalarla</b> böyle tutar!", "vay"); f.done(1, STAR + " 3 sayı yaptın"); }
      }
    };
  });
  ciz();
}

/* 3 · Harfler de sayı */
function harfler(ctx) {
  const f = ctx.frame("Adını yaz. Bilgisayar onu <b>sayılara</b> çevirsin!");
  f.grid.classList.add("one");
  const st = el("div", "stage tall col");
  const form = el("form", "name-form", `<input id="ad-kutu" maxlength="8" autocomplete="off" spellcheck="false" placeholder="Adın" aria-label="Adın"><button class="btn">Bilgisayara çevir</button>`);
  const rows = el("div", "letter-rows");
  st.append(form, rows);
  f.grid.append(st);
  form.onsubmit = async (e) => {
    e.preventDefault();
    const ad = [...$("#ad-kutu", form).value.trim()].filter((c) => /\S/.test(c)).slice(0, 8);
    if (!ad.length) { ctx.say("Önce <b>adını</b> yaz!", "uzgun"); return; }
    $("button", form).disabled = true; rows.innerHTML = "";
    for (let k = 0; k < ad.length; k++) {
      const n = ad[k].codePointAt(0), b = n.toString(2).padStart(8, "0");
      const r = el("div", "letter-row", `<span class="lt">${ad[k].replace(/</g, "&lt;")}</span><span class="ar">→</span><span class="num">${n}</span><span class="ar">→</span><span class="bits">${[...b].map((x) => `<i class="${x === "1" ? "on" : ""}">${x}</i>`).join("")}</span>`);
      rows.append(r); sfx.tik(k); await wait(380);
    }
    $("button", form).disabled = false;
    ctx.say("Her harf bir <b>sayı</b>, her sayı <b>0 ve 1</b>!", "vay");
    f.done(1, STAR + " adın 0 ve 1 oldu");
  };
}

/* 4 · Tahmin: 4-2-1 lambalarıyla 3 */
const mini = (d) => `<span class="minis">${d.map((x) => `<span class="mini${x ? " on" : ""}"></span>`).join("")}</span>`;
function lambaTahmin(ctx) {
  tahminEkrani(ctx, {
    soru: "Lambalar <b>4, 2, 1</b>. Hangisi <b>3</b> eder?",
    sahne: (st) => { st.innerHTML = `<div class="lamp-board"><div class="lamps">${[4, 2, 1].map((d) => `<div class="lamp big"><span class="bulb"></span><span class="lv">${d}</span></div>`).join("")}</div><div class="lamp-sum">= ?</div></div>`; },
    secenekler: [
      { t: mini([0, 1, 1]), dogru: true },
      { t: mini([1, 1, 0]), ipucu: "Bu <b>4 + 2 = 6</b> eder." },
      { t: mini([1, 0, 0]), ipucu: "Bu sadece <b>4</b> eder." }
    ],
    oynat: async (_, st) => {
      const l = $$(".lamp", st);
      l[1].classList.add("on"); sfx.tik(1); await wait(400); l[2].classList.add("on"); sfx.tik(2); await wait(300);
      $(".lamp-sum", st).innerHTML = "2 + 1 = <b>3</b>";
    },
    basari: "Doğru! <b>2 + 1 = 3</b>. Bilgisayar böyle sayar."
  });
}

/* 5 · Diller merdiveni: aynı program, her dilde gerçek hâli */
const BASAMAK = [
  { ad: "Python", kod: ['print("Merhaba")'], not: ["Tek satır", "Noktalı virgül yok", "Süslü parantez yok"], soz: "<b>Python</b>: tek satır yeter. İnsanlar için kolay!" },
  { ad: "C", kod: ["#include <stdio.h>", "", "int main() {", '    printf("Merhaba\\n");', "    return 0;", "}"], not: ["Önce kütüphane eklenir", "main olmadan çalışmaz", "Her komutun sonunda ;", "{ } ile bloklar"], soz: "<b>C</b>: aynı iş için <b>5 satır</b>! <code>main</code>, <code>;</code> ve <code>{ }</code> şart." },
  { ad: "Assembly", kod: ["section .data", '  mesaj db "Merhaba", 0', "section .text", "  global main", "main:", "  mov rdi, mesaj", "  call puts", "  ret"], not: ["İşlemciye tek tek talimat", "Kutular (yazmaçlar) ile çalışır", "Okuması çok zor"], soz: "<b>Assembly</b>: işlemciye <b>tek tek</b> talimat. Makineye çok yakın." },
  { ad: "Makine dili", kod: ["01001000 10001101 00111101 00001010", "00000000 00000000 00000000 11101000", "00000000 00000000 00000000 00000000", "11000011 01001101 01100101 01110010", "01101000 01100001 01100010 01100001", "00001010 00000000 01010101 01001000", "10001001 11100101 01001000 10000011", "11101100 00010000 10111111 00000001", "00000000 00000000 00000000 11000011", "01011101 11000011 00000000 00000000"], not: ["Sadece 0 ve 1", "En uzunu", "İnsan okuyamaz, işlemci anlar"], soz: "<b>Makine dili</b>: sadece 0 ve 1! İşlemci sonunda bunu okur." }
];
const SATIR = BASAMAK.map((b) => b.kod.filter((t) => t.trim()).length);
const escH = (t) => t.replace(/&/g, "&amp;").replace(/</g, "&lt;");
function merdiven(ctx) {
  const f = ctx.frame("Aynı <b>Merhaba</b> programı. Merdivenden in, dili değişsin!");
  const cp = codePanel([BASAMAK[0].kod[0]]);
  const st = el("div", "stage stairs-stage");
  st.innerHTML = `<div class="stairs">${BASAMAK.map((b, i) => `<div class="stair" style="--i:${i}"><span>${b.ad}</span></div>`).join("")}</div>
    <div class="stair-bit">${bitSvg("mutlu")}</div><div class="stair-labels"><span>İnsana yakın</span><span>Makineye yakın</span></div>`;
  const etiket = el("div", "twin-h lang-h", "");
  const notlar = el("ul", "lang-not");
  const cmp = el("div", "lang-cmp", `<div class="twin-h">Kaç satır?</div>${BASAMAK.map((b, i) => `<div class="lc-row" data-i="${i}"><span>${b.ad}</span><i style="--w:${SATIR[i] / Math.max(...SATIR)}"></i><b>${SATIR[i]}</b></div>`).join("")}`);
  const sol = el("div", "twin"); sol.append(etiket, cp.node, notlar, cmp);
  f.grid.append(sol, st);
  let i = 0;
  const yaz = () => {
    const b = BASAMAK[i];
    etiket.innerHTML = `${b.ad} <span class="lang-say">${SATIR[i]} satır</span>`;
    notlar.innerHTML = b.not.map((n) => `<li>${escH(n)}</li>`).join("");
    $$(".lc-row", cmp).forEach((r, k) => { r.classList.toggle("on", k <= i); r.classList.toggle("cur", k === i); });
  };
  const yerlestir = () => {
    $$(".stair", st).forEach((s, k) => s.classList.toggle("cur", k === i));
    const s = $$(".stair", st)[i], bit = $(".stair-bit", st), r = s.getBoundingClientRect(), sr = st.getBoundingClientRect();
    bit.style.left = r.left - sr.left + r.width / 2 - 26 + "px"; bit.style.top = r.top - sr.top - 50 + "px";
  };
  yaz();
  requestAnimationFrame(yerlestir);
  const inB = el("button", "btn", "⬇ Bir basamak in");
  f.actions.prepend(inB);
  inB.onclick = () => {
    i++; sfx.tik(i);
    cp.lines().forEach((l) => l.remove());
    const out = $(".out", cp.node);
    BASAMAK[i].kod.forEach((t) => out.before(el("div", "ln" + (i === 3 ? " bin" : ""), escH(t) || " ")));
    yaz(); yerlestir(); ctx.say(BASAMAK[i].soz, i === 3 ? "vay" : "mutlu");
    if (i === 3) { inB.hidden = true; ctx.say("Aşağı indikçe program <b>uzadı</b> ve okuması <b>zorlaştı</b>. Bilgisayar sonunda hep <b>0 ve 1</b> okur!", "vay"); f.done(1, STAR + " en alta indin"); }
  };
  const onResize = () => { if (st.isConnected) yerlestir(); else removeEventListener("resize", onResize); };
  addEventListener("resize", onResize);
}

/* 6 · İki çevirmen: aynı programı (3. satırda hata) ikisi de çalıştırır, çocuk farkı görür */
const PROG = ['print("Merhaba!")', 'print("Ben Bit.")', 'prnt("Nasılsın?")', 'print("Hoşça kal!")'];
const CIKTI = ["Merhaba!", "Ben Bit."];
const CEVIRMEN = [
  { k: "satir", ad: "Satır satır çeviren", ne: "Bir satırı çevirir, <b>hemen</b> çalıştırır. Sonra sıradakine geçer.", ik: "🗣️" },
  { k: "hepsi", ad: "Hepsini birden çeviren", ne: "Önce <b>bütün</b> programı okur. Hata yoksa çalıştırır.", ik: "📚" }
];
function cevirmen(ctx) {
  const f = ctx.frame("İki çevirmen aynı programı çalıştıracak. <b>3. satırda</b> yazım hatası var! İkisini de çalıştır.");
  f.grid.classList.add("one");
  const st = el("div", "stage cev-stage");
  st.innerHTML = CEVIRMEN.map((c) => `<div class="cev" data-k="${c.k}">
      <div class="cev-h"><span class="cev-ik">${c.ik}</span><div><b>${c.ad}</b><small>${c.ne}</small></div></div>
      <ol class="cev-kod">${PROG.map((t, i) => `<li><span class="cev-no">${i + 1}</span><code>${escH(t)}</code></li>`).join("")}</ol>
      <div class="cev-ekran" aria-live="polite"><span class="out-label">Ekran</span><div class="cev-out"></div></div>
      <button class="btn cev-calis">▶ Çalıştır</button></div>`).join("");
  f.grid.append(st);
  const calisti = new Set();
  const soruSor = () => {
    ctx.say("İkisini de gördün! Peki <b>Python</b> hangisi gibi çalışır?");
    const opts = el("div", "opts");
    [["Satır satır çeviren", true], ["Hepsini birden çeviren", false]].forEach(([t, dogru]) => {
      const b = el("button", "opt wide", t);
      b.onclick = () => {
        if (!dogru) { b.classList.add("no"); sfx.yanlis(); ctx.say("Python'da hatadan <b>önceki</b> satırlar ekrana yazar. Hangi çevirmende öyle oldu?", "uzgun"); return; }
        b.classList.add("ok"); $$("button", opts).forEach((x) => (x.disabled = true));
        ctx.say("Evet! Python <b>satır satır</b> çevirir: buna <b>yorumlayıcı</b> denir. C ise <b>hepsini birden</b> çevirir: buna <b>derleyici</b> denir.", "vay");
        f.done(1, STAR + " çevirmenleri tanıdın");
      };
      opts.append(b);
    });
    f.actions.prepend(opts);
  };
  $$(".cev", st).forEach((kutu) => {
    const btn = $(".cev-calis", kutu);
    btn.onclick = async () => {
      btn.disabled = true;
      const sat = $$(".cev-kod li", kutu), out = $(".cev-out", kutu);
      sat.forEach((s) => (s.className = "")); out.innerHTML = ""; kutu.classList.remove("hata");
      if (kutu.dataset.k === "satir") {
        for (let k = 0; k < 3; k++) {
          sat[k].className = "now"; sfx.tik(k); await wait(450);
          if (k === 2) { sat[k].className = "bad"; out.insertAdjacentHTML("beforeend", '<div class="cev-err">❌ 3. satırda hata: <code>prnt</code> diye bir komut yok</div>'); break; }
          sat[k].className = "good"; out.insertAdjacentHTML("beforeend", `<div>${CIKTI[k]}</div>`); await wait(150);
        }
      } else {
        for (let k = 0; k < 4; k++) { sat[k].className = k === 2 ? "bad" : "scan"; sfx.tik(k); await wait(260); }
        await wait(250);
        out.innerHTML = '<div class="cev-err">❌ 3. satırda hata. <b>Hiçbir satır</b> çalışmadı.</div>';
      }
      kutu.classList.add("hata"); sfx.yanlis(); await wait(300);
      btn.disabled = false; btn.textContent = "↺ Tekrar çalıştır";
      calisti.add(kutu.dataset.k);
      if (calisti.size === 1) ctx.say(kutu.dataset.k === "satir" ? "Hatadan önce <b>2 satır</b> ekrana yazdı! Şimdi diğerini çalıştır." : "Ekran <b>bomboş</b>! Hiçbir satır çalışmadı. Şimdi diğerini çalıştır.");
      else if (calisti.size === 2 && !$(".opts", f.actions)) soruSor();
    };
  });
}

/* 7 · Son görev: print satırlarını sırala */
const HEDEF_SATIR = ["Merhaba!", "Ben Bit.", "Hadi başlayalım!"];
function siraliPrint(ctx) {
  siralaEkrani(ctx, {
    soru: "Ekranda bu sıra çıksın. Satırları <b>sırala</b>!",
    kod: true,
    kartlar: HEDEF_SATIR.map((t) => `print("${t}")`), karisik: [1, 2, 0],
    sahne: (st) => {
      st.classList.add("col");
      st.innerHTML = `<div class="two-screens"><div class="screen-out"><span class="out-label">Hedef ekran</span>${HEDEF_SATIR.map((t) => `<div>${t}</div>`).join("")}</div>
        <div class="screen-out sonuc"><span class="out-label">Senin ekranın</span><div class="so-lines"></div></div></div>`;
    },
    calistir: async (sira, st) => {
      const ekr = $(".so-lines", st); ekr.innerHTML = "";
      for (const i of sira) { ekr.append(el("div", "", HEDEF_SATIR[i])); sfx.tik(i); await wait(450); }
      const ok = sira.every((v, k) => v === k);
      $(".sonuc", st).classList.toggle("ok", ok); $(".sonuc", st).classList.toggle("bad", !ok);
      if (!ok) ctx.say("Sıra karıştı! Hedefe <b>benzemiyor</b>. Karta dokunup geri al.", "uzgun");
      return ok;
    },
    basari: "Program <b>yukarıdan aşağı</b>, sırayla çalışır!",
    rozet: "ilk Python programın", yildiz: 2
  });
}

export const dil = {
  id: "dil", no: 1, title: "Bilgisayarın Dili", icon: "binary", color: "#ffb347",
  screens: [tarif, lambalar, harfler, lambaTahmin, merdiven, cevirmen, siraliPrint],
  ozet: ["Program = sırayla yapılan komutlar", "Bilgisayar her şeyi 0 ve 1 ile saklar", "Python satır satır çalışır (yorumlayıcı)"]
};
