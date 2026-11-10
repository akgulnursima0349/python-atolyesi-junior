/* Dünya 1 · Bilgisayarın Dili */
import { el, $, $$, wait, codePanel, hl, STAR } from "../core/ui.js";
import { bitSvg } from "../core/bit.js";
import { sfx } from "../core/sound.js";
import { tahminEkrani, siralaEkrani } from "../core/kaliplar.js";

/* 1 · Program = sıralı komutlar */
const ADIMLAR = ["🪥 Fırçayı al", "🧴 Macunu sür", "😁 Dişlerini fırçala", "💧 Ağzını çalkala"];
const KOMIK = {
  1: "Macunu nereye süreyim? Elimde <b>fırça yok</b>!",
  2: "<b>Macunsuz</b> fırçaladım! Hiç köpürmedi.",
  3: "Daha fırçalamadan <b>çalkaladım</b>!"
};
function tarif(ctx) {
  siralaEkrani(ctx, {
    soru: "Bit dişlerini fırçalayacak. Adımları <b>sırayla</b> seç!",
    kartlar: ADIMLAR, karisik: [2, 0, 3, 1],
    sahne: (st) => { st.innerHTML = `<div class="col-center">${bitSvg("mutlu", "bit bit-xl")}<div class="act-emoji" aria-live="polite"></div></div>`; },
    calistir: async (sira, st) => {
      const em = $(".act-emoji", st);
      for (let k = 0; k < sira.length; k++) {
        em.textContent = ADIMLAR[sira[k]]; em.classList.remove("pop"); void em.offsetWidth; em.classList.add("pop"); sfx.tik(k);
        await wait(650);
        if (sira[k] !== k) { em.textContent = "🤪"; ctx.say(KOMIK[sira[k]] || "Sıra karıştı!", "uzgun"); return false; }
      }
      em.textContent = "✨😁✨";
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

/* 5 · Diller merdiveni */
const BASAMAK = [
  { ad: "Python", kod: 'print("Merhaba")', soz: "<b>Python</b>: insanlar için kolay." },
  { ad: "C", kod: 'printf("Merhaba");', soz: "<b>C</b>: biraz daha zor." },
  { ad: "Assembly", kod: "mov rdi, mesaj\ncall puts", soz: "<b>Assembly</b>: makineye çok yakın." },
  { ad: "Makine dili", kod: "01001101 01100101\n01110010 01101000", soz: "<b>Makine dili</b>: sadece 0 ve 1!" }
];
function merdiven(ctx) {
  const f = ctx.frame("Aynı <b>Merhaba</b> programı. Merdivenden in, dili değişsin!");
  const cp = codePanel([BASAMAK[0].kod]);
  const st = el("div", "stage stairs-stage");
  st.innerHTML = `<div class="stairs">${BASAMAK.map((b, i) => `<div class="stair" style="--i:${i}"><span>${b.ad}</span></div>`).join("")}</div>
    <div class="stair-bit">${bitSvg("mutlu")}</div><div class="stair-labels"><span>İnsana yakın</span><span>Makineye yakın</span></div>`;
  const etiket = el("div", "twin-h", BASAMAK[0].ad);
  const sol = el("div", "twin"); sol.append(etiket, cp.node);
  f.grid.append(sol, st);
  let i = 0;
  const yerlestir = () => {
    $$(".stair", st).forEach((s, k) => s.classList.toggle("cur", k === i));
    const s = $$(".stair", st)[i], bit = $(".stair-bit", st), r = s.getBoundingClientRect(), sr = st.getBoundingClientRect();
    bit.style.left = r.left - sr.left + r.width / 2 - 26 + "px"; bit.style.top = r.top - sr.top - 50 + "px";
  };
  requestAnimationFrame(yerlestir);
  const inB = el("button", "btn", "⬇ Bir basamak in");
  f.actions.prepend(inB);
  inB.onclick = () => {
    i++; sfx.tik(i);
    etiket.textContent = BASAMAK[i].ad;
    cp.lines().forEach((l) => l.remove());
    const out = $(".out", cp.node);
    BASAMAK[i].kod.split("\n").forEach((t) => out.before(el("div", "ln" + (i === 3 ? " bin" : ""), i < 2 ? hl(t) : t)));
    yerlestir(); ctx.say(BASAMAK[i].soz, i === 3 ? "vay" : "mutlu");
    if (i === 3) { inB.hidden = true; ctx.say("Bilgisayar sonunda hep <b>0 ve 1</b> okur!", "vay"); f.done(1, STAR + " en alta indin"); }
  };
  const onResize = () => { if (st.isConnected) yerlestir(); else removeEventListener("resize", onResize); };
  addEventListener("resize", onResize);
}

/* 6 · İki çevirmen: yorumlayıcı ve derleyici */
function cevirmen(ctx) {
  const SAT = ["1. satır", "2. satır", "3. satır ❗", "4. satır"];
  tahminEkrani(ctx, {
    soru: "<b>3. satırda</b> hata var. Hangi çevirmen <b>hiç</b> çalıştırmaz?",
    sahne: (st) => {
      st.classList.add("lanes-stage");
      st.innerHTML = ["satir", "hepsi"].map((k) => `<div class="lane" data-k="${k}"><div class="lane-h">${k === "satir" ? "🗣️ Satır satır çevirir" : "📚 Hepsini birden çevirir"}</div>
        <div class="lane-rows">${SAT.map((s) => `<span class="lrow">${s}</span>`).join("")}</div><div class="lane-res"></div></div>`).join("");
    },
    secenekler: [
      { t: "📚 Hepsini birden çeviren", dogru: true, genis: true },
      { t: "🗣️ Satır satır çeviren", genis: true, ipucu: "O, hataya kadar olan satırları <b>çalıştırır</b>." }
    ],
    oynat: async (_, st) => {
      const [a, b] = $$(".lane", st), ra = $$(".lrow", a), rb = $$(".lrow", b);
      for (let k = 0; k < 3; k++) { ra[k].classList.add(k === 2 ? "bad" : "good"); sfx.tik(k); await wait(380); }
      $(".lane-res", a).textContent = "2 satır çalıştı, sonra durdu";
      for (let k = 0; k < 4; k++) { rb[k].classList.add(k === 2 ? "bad" : "scan"); await wait(220); }
      $(".lane-res", b).textContent = "Hata bulundu: hiçbir satır çalışmadı";
      sfx.yanlis(); await wait(400);
    },
    basari: "Python <b>satır satır</b> çevirir. Ona <b>yorumlayıcı</b> denir.",
    rozet: "çevirmenleri tanıdın"
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
  id: "dil", no: 1, title: "Bilgisayarın Dili", icon: "💡", color: "#ffb347",
  screens: [tarif, lambalar, harfler, lambaTahmin, merdiven, cevirmen, siraliPrint],
  ozet: ["Program = sırayla yapılan komutlar", "Bilgisayar her şeyi 0 ve 1 ile saklar", "Python satır satır çalışır (yorumlayıcı)"]
};
