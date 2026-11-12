/* Dünya 3 · Karar Veren Robot */
import { el, $, $$, wait, codePanel, hl, STAR } from "../core/ui.js";
import { bitSvg } from "../core/bit.js";
import { sfx } from "../core/sound.js";
import { yazEkrani } from "../core/kaliplar.js";

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;");
const satirYaz = (cp, i, s) => { cp.lines()[i].innerHTML = hl(s); };
const atla = (cp, idx) => cp.lines().forEach((d, k) => d.classList.toggle("skip", idx.includes(k)));

/* 1 · Yol ayrımı: if */
function yol(ctx) {
  const f = ctx.frame("Bit havaya göre <b>karar</b> verecek. Havayı seç, çalıştır!");
  let hava = "yağmur";
  const cp = codePanel(['hava = "yağmur"', 'if hava == "yağmur":', '    print("Şemsiye aldım")', 'print("Okula gittim")']);
  const st = el("div", "stage");
  st.innerHTML = `<div class="weather" aria-hidden="true">🌧️</div><div class="col-center"><div class="umbrella" aria-hidden="true">☂️</div>${bitSvg("mutlu", "bit bit-xl")}</div><div class="cond" aria-live="polite"></div>`;
  f.grid.append(cp.node, st);
  const sec = el("div", "opts");
  const denenen = new Set();
  [["🌧️ Yağmur", "yağmur"], ["☀️ Güneş", "güneş"]].forEach(([t, v]) => {
    const b = el("button", "opt" + (v === hava ? " ok" : ""), t);
    b.onclick = () => { hava = v; satirYaz(cp, 0, `hava = "${v}"`); $(".weather", st).textContent = v === "yağmur" ? "🌧️" : "☀️"; st.classList.toggle("sunny", v !== "yağmur"); $$(".opt", sec).forEach((x) => x.classList.toggle("ok", x === b)); atla(cp, []); $(".umbrella", st).classList.remove("on"); $(".cond", st).textContent = ""; sfx.tik(1); };
    sec.append(b);
  });
  const run = el("button", "btn", "▶ Çalıştır");
  f.actions.prepend(sec, run);
  run.onclick = async () => {
    run.disabled = true; $$(".opt", sec).forEach((x) => (x.disabled = true)); cp.clear(); atla(cp, []); $(".umbrella", st).classList.remove("on");
    const h = hava, kosul = h === "yağmur";
    cp.line(0); await wait(350);
    cp.line(1); $(".cond", st).innerHTML = `hava == "yağmur" → <b class="${kosul ? "t" : "f"}">${kosul ? "True" : "False"}</b>`; await wait(700);
    if (kosul) { cp.line(2); $(".umbrella", st).classList.add("on"); cp.print("Şemsiye aldım"); sfx.tik(2); await wait(600); }
    else { atla(cp, [2]); await wait(400); }
    cp.line(3); cp.print("Okula gittim"); sfx.tik(3); await wait(400); cp.line(-1);
    denenen.add(h); run.disabled = false; $$(".opt", sec).forEach((x) => (x.disabled = false));
    if (denenen.size === 2) { ctx.say("<b>if</b>: koşul doğruysa içerdeki satır çalışır.", "vay"); f.done(1, STAR + " ilk kararın"); }
    else ctx.say(kosul ? "Şemsiye aldı! Şimdi <b>güneşli</b> havayı dene." : "Şemsiye satırı <b>atlandı</b>! Şimdi yağmuru dene.");
  };
}

/* 2 · Doğru mu yanlış mı? */
const KART = [
  { k: "5 > 3", d: true, n: "5, 3'ten <b>büyük</b>. Doğru!" },
  { k: "2 > 7", d: false, n: "2, 7'den büyük mü? <b>Hayır!</b>" },
  { k: "4 == 4", d: true, n: "<b>==</b> eşit mi diye sorar. 4, 4'e eşit!" },
  { k: "10 < 9", d: false, n: "10, 9'dan <b>küçük değil</b>!" }
];
function dogruYanlis(ctx) {
  const f = ctx.frame("Python karşılaştırır. Doğruysa <b>True</b>, yanlışsa <b>False</b>!");
  f.grid.classList.add("one");
  const st = el("div", "stage tf-stage");
  st.innerHTML = `<div class="basket-tf t"><b>True</b><span>doğru</span><div class="bin"></div></div><div class="tf-card" aria-live="polite"></div><div class="basket-tf f"><b>False</b><span>yanlış</span><div class="bin"></div></div>`;
  f.grid.append(st);
  let i = 0;
  const card = $(".tf-card", st);
  const goster = () => { card.textContent = KART[i].k; card.className = "tf-card pop"; };
  goster();
  const tb = el("button", "btn ok-btn", "True ✔"), fb = el("button", "btn no-btn", "False ✘");
  f.actions.prepend(tb, fb);
  const cevap = async (v) => {
    const K = KART[i];
    if (v !== K.d) { card.classList.remove("pop"); card.classList.add("shake"); sfx.yanlis(); ctx.say(K.n, "uzgun"); setTimeout(() => card.classList.remove("shake"), 400); return; }
    tb.disabled = fb.disabled = true; sfx.tik(i);
    $(`.basket-tf.${v ? "t" : "f"} .bin`, st).append(el("span", "mini-card", K.k));
    ctx.say(K.n, "vay"); card.className = "tf-card fly-" + (v ? "t" : "f");
    await wait(500); i++;
    if (i < KART.length) { goster(); tb.disabled = fb.disabled = false; }
    else { card.textContent = ""; tb.hidden = fb.hidden = true; ctx.say("Karşılaştırmalar hep <b>True</b> ya da <b>False</b> verir!", "vay"); f.done(1, STAR + " 4 kartı ayırdın"); }
  };
  tb.onclick = () => cevap(true); fb.onclick = () => cevap(false);
}

/* 3 · else ve fan */
function fan(ctx) {
  const f = ctx.frame("Sıcaklığı değiştir. <b>25'i geçince</b> fan çalışsın!");
  const cp = codePanel(["sicaklik = 20", "if sicaklik > 25:", '    print("Fan açık")', "else:", '    print("Fan kapalı")']);
  const st = el("div", "stage col");
  st.innerHTML = `<div class="thermo" aria-live="polite">20°C</div><svg class="fan" viewBox="0 0 100 100" aria-hidden="true"><g class="blades"><ellipse cx="50" cy="27" rx="11" ry="22" fill="var(--robot)"/><ellipse cx="50" cy="27" rx="11" ry="22" fill="var(--robot)" transform="rotate(120 50 50)"/><ellipse cx="50" cy="27" rx="11" ry="22" fill="var(--robot)" transform="rotate(240 50 50)"/></g><circle cx="50" cy="50" r="9" fill="var(--ink)"/></svg>
    <label class="slider-row"><span>🥶</span><input type="range" id="sic" min="0" max="40" value="20" aria-label="Sıcaklık"><span>🥵</span></label>`;
  f.grid.append(cp.node, st);
  const gorulen = new Set();
  const guncelle = () => {
    const v = +$("#sic", st).value, acik = v > 25;
    satirYaz(cp, 0, `sicaklik = ${v}`); $(".thermo", st).textContent = v + "°C";
    cp.lines().forEach((d, k) => { d.classList.toggle("hl", acik ? k === 2 : k === 4); d.classList.toggle("skip", acik ? k === 4 : k === 2); });
    cp.clear(); cp.print(acik ? "Fan açık" : "Fan kapalı");
    $(".fan", st).classList.toggle("spin", acik);
    if (!gorulen.has(acik)) { gorulen.add(acik); sfx.tik(acik ? 4 : 1); }
    if (gorulen.size === 2 && !f.next.offsetParent) { ctx.say("<b>else</b>: koşul yanlışsa bu yol çalışır.", "vay"); f.done(1, STAR + " fanı yönettin"); }
  };
  $("#sic", st).oninput = guncelle;
  guncelle();
}

/* 4 · elif ve trafik ışığı */
const ISIK = { "kırmızı": ["Dur", 2], "sarı": ["Hazırlan", 4], "yeşil": ["Geç", 6] };
function trafik(ctx) {
  const f = ctx.frame("Işığa dokun. Araba <b>hangi yolu</b> seçecek?");
  const cp = codePanel(['isik = "kırmızı"', 'if isik == "kırmızı":', '    print("Dur")', 'elif isik == "sarı":', '    print("Hazırlan")', "else:", '    print("Geç")']);
  const st = el("div", "stage");
  st.innerHTML = `<div class="tlight">${Object.keys(ISIK).map((r) => `<button class="tl ${r === "kırmızı" ? "red" : r === "sarı" ? "yellow" : "green"}" data-r="${r}" aria-label="${r}"></button>`).join("")}</div><div class="road"><span class="car">🚗</span></div>`;
  f.grid.append(cp.node, st);
  const gorulen = new Set();
  let mesgul = false;
  $$(".tl", st).forEach((b) => {
    b.onclick = async () => {
      if (mesgul) return; mesgul = true;
      const r = b.dataset.r, [soz, satir] = ISIK[r], car = $(".car", st);
      $$(".tl", st).forEach((x) => x.classList.toggle("lit", x === b)); car.className = "car"; cp.clear();
      satirYaz(cp, 0, `isik = "${r}"`); cp.line(0); await wait(300);
      const kontrol = r === "kırmızı" ? [1] : r === "sarı" ? [1, 3] : [1, 3, 5];
      for (const k of kontrol) { cp.line(k); await wait(380); }
      cp.line(satir); cp.print(soz); sfx.tik(satir);
      car.classList.add(r === "kırmızı" ? "stop" : r === "sarı" ? "ready" : "go");
      await wait(900); cp.line(-1); mesgul = false;
      gorulen.add(r);
      if (gorulen.size === 3) { ctx.say("<b>elif</b> ile ikiden fazla yol olur!", "vay"); f.done(1, STAR + " trafiği yönettin"); }
      else ctx.say(`<b>${soz}</b>! Başka bir ışığa dokun.`);
    };
  });
}

/* 5 · Girinti */
function girinti(ctx) {
  const f = ctx.frame("Son satırı <b>içeri al, dışarı al</b>. Ne değişiyor?");
  let iceride = false;
  const cp = codePanel(["puan = 3", "if puan > 5:", '    print("Kazandın!")', 'print("Oyun bitti")']);
  cp.node.classList.add("block-view");
  const st = el("div", "stage col");
  st.innerHTML = `<div class="screen-out"><span class="out-label">Ekran</span><div class="so-lines"><div class="muted">çalıştır, gör</div></div></div><div class="if-note" aria-live="polite"></div>`;
  f.grid.append(cp.node, st);
  const sonSatir = () => cp.lines()[3];
  const cizBlok = () => { cp.lines().forEach((d, k) => d.classList.toggle("in-block", k === 2 || (k === 3 && iceride))); };
  cizBlok();
  const tog = el("button", "btn sec", "⇥ İçeri al"), run = el("button", "btn", "▶ Çalıştır");
  f.actions.prepend(tog, run);
  const sonuclar = new Set();
  tog.onclick = () => {
    iceride = !iceride; sonSatir().innerHTML = hl((iceride ? "    " : "") + 'print("Oyun bitti")'); cizBlok();
    tog.textContent = iceride ? "⇤ Dışarı al" : "⇥ İçeri al"; sfx.tik(iceride ? 3 : 1); cp.clear();
  };
  run.onclick = async () => {
    run.disabled = true; cp.clear();
    const so = $(".so-lines", st); so.innerHTML = "";
    cp.line(0); await wait(300); cp.line(1); await wait(400);
    atla(cp, iceride ? [2, 3] : [2]); await wait(300);
    if (!iceride) { cp.line(3); cp.print("Oyun bitti"); so.innerHTML = "<div>Oyun bitti</div>"; }
    else so.innerHTML = '<div class="muted">(boş)</div>';
    sfx.tik(2); await wait(350); cp.line(-1); atla(cp, []);
    $(".if-note", st).innerHTML = iceride ? "puan > 5 yanlış → içerdeki <b>iki satır</b> da atlandı" : "puan > 5 yanlış → sadece içerdeki satır atlandı";
    sonuclar.add(iceride); run.disabled = false;
    if (sonuclar.size === 2) { ctx.say("<b>İçerdeki</b> satırlar sadece koşul doğruysa çalışır!", "vay"); f.done(1, STAR + " girintiyi çözdün"); }
    else ctx.say(iceride ? "Ekran boş kaldı! Şimdi <b>dışarı al</b>, tekrar çalıştır." : "Şimdi son satırı <b>içeri al</b>, tekrar çalıştır.");
  };
}

/* 6 · Hata avcısı */
const HATA = [
  { kod: ["sayi = 7", "if sayi > 5", '    print("Büyük")'], h: 1, n: "Satırın sonunda <b>:</b> eksik!" },
  { kod: ['renk = "mavi"', 'if renk = "mavi":', '    print("Gökyüzü")'], h: 1, n: "Karşılaştırma <b>==</b> ile yapılır, tek = değil!" },
  { kod: ["yas = 11", "if yas > 10:", 'print("Büyüksün")'], h: 2, n: "Bu satır <b>4 boşluk içeride</b> olmalı!" }
];
function hataAvcisi(ctx) {
  const f = ctx.frame("Kodda bir hata var. Hatalı <b>satıra dokun</b>!");
  f.grid.classList.add("one");
  const wrap = el("div", "bug-wrap");
  f.grid.append(wrap);
  let i = 0;
  const ciz = () => {
    const H = HATA[i];
    wrap.innerHTML = `<div class="bug-count">${i + 1} / ${HATA.length}</div>`;
    const c = el("div", "code bug-code");
    H.kod.forEach((s, k) => {
      const b = el("button", "ln bugline", hl(s));
      b.onclick = async () => {
        if (k !== H.h) { b.classList.add("nope"); sfx.yanlis(); ctx.say("Bu satır doğru. <b>Başka yere</b> bak!", "uzgun"); setTimeout(() => b.classList.remove("nope"), 400); return; }
        b.classList.add("found"); sfx.tik(3); ctx.say(H.n, "vay");
        $$(".bugline", c).forEach((x) => (x.disabled = true));
        await wait(1300); i++;
        if (i < HATA.length) { ciz(); ctx.say("Bir hata daha var. Hatalı <b>satıra dokun</b>!"); }
        else { ctx.say("3 hatayı da yakaladın. Gerçek bir <b>hata avcısı</b>sın!", "vay"); f.done(1, STAR + " hata avcısı"); }
      };
      c.append(b);
    });
    wrap.append(c);
  };
  ciz();
}

/* 7 · Yaz: fan */
function yaz(ctx) {
  yazEkrani(ctx, {
    soru: "Sıra sende! Sıcaksa ekrana <b>Fan açık</b> yazdır.",
    bas: 'sicaklik = 30\nif sicaklik > 25:\n    # buraya: ekrana "Fan açık" yazdır',
    yer: '    # buraya: ekrana "Fan açık" yazdır', cozum: '    print("Fan açık")',
    chips: [["sicaklik", "30"]],
    ipuclari: ["Ekrana yazdırmak için <code>print</code> kullan.", 'Yazı tırnak içinde olur: <code>"Fan açık"</code>', 'Cevap: <code>    print("Fan açık")</code>'],
    kontrol: (r) => {
      if (r.out.some((x) => x.trim() === "Fan açık")) return { ok: true, mesaj: "Harika! Sıcaklık 30, fan <b>açıldı</b>." };
      if (r.out.some((x) => x.trim().toLocaleLowerCase("tr") === "fan açık")) return { ok: false, mesaj: "Neredeyse! Harfler aynı olmalı: <b>Fan açık</b>" };
      if (!r.out.length) return { ok: false, mesaj: "Ekrana hiçbir şey çıkmadı. <code>print</code> yazdın mı?" };
      return { ok: false, mesaj: `Ekranda <b>${esc(r.out[r.out.length - 1])}</b> çıktı. <b>Fan açık</b> çıkmalıydı.` };
    },
    basari: "Bit artık <b>karar veren</b> bir robot!"
  });
}

export const karar = {
  id: "karar", no: 3, title: "Karar Veren Robot", icon: "yol", color: "#b39dff",
  screens: [yol, dogruYanlis, fan, trafik, girinti, hataAvcisi, yaz],
  ozet: ['if hava == "yağmur": → koşul doğruysa çalışır', "else: → koşul yanlışsa çalışır", "elif → üçüncü bir yol", "içerdeki satırlar 4 boşluk girintili"]
};
