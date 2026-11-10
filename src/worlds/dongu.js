/* Dünya 4 · Döngü Robotu */
import { el, $, $$, wait, hl, txt, codePanel, stepper, varChip, confetti, stars, STAR } from "../core/ui.js";
import { bitSvg } from "../core/bit.js";
import { sfx, beep } from "../core/sound.js";
import { editor } from "../core/editor.js";
import { run, hazirla } from "../core/python.js";

/* 1 · Tekrar → döngü */
function kisalt(ctx) {
  const f = ctx.frame("Bit 5 kez <b>Merhaba</b> demek istiyor. 5 satır mı yazacağız?");
  const cp = codePanel(Array(5).fill('print("Merhaba!")'));
  const st = el("div", "stage");
  st.innerHTML = `<div class="col-center">${bitSvg("mutlu", "bit bit-xl jumpy")}<div class="big-count">5 satır</div></div>`;
  f.grid.append(cp.node, st);
  const b = el("button", "btn", "✨ Döngüyle kısalt");
  f.actions.prepend(b);
  b.onclick = async () => {
    b.disabled = true; beep(520);
    const ls = cp.lines();
    for (let k = ls.length - 1; k >= 1; k--) { ls[k].classList.add("gone"); await wait(150); ls[k].remove(); }
    ls[0].innerHTML = hl("for i in range(5):");
    ls[0].after(el("div", "ln", hl('    print("Merhaba!")')));
    const cnt = $(".big-count", st); cnt.textContent = "2 satır!"; cnt.classList.add("win");
    const bit = $(".bit", st);
    for (let k = 0; k < 5; k++) {
      cp.line(0); await wait(120); cp.line(1); cp.print("Merhaba!"); sfx.tik(k);
      bit.classList.add("hop"); await wait(200); bit.classList.remove("hop"); await wait(160);
    }
    cp.line(-1);
    ctx.say("Aynı iş, <b>2 satır</b>. Buna <b>döngü</b> denir!", "vay");
    f.done(1, STAR + " 5 satır → 2 satır");
  };
}

/* 2 · range = tur sayısı; sayaç 0'dan başlar */
function pist(ctx) {
  const f = ctx.frame("Sayıyı seç, Bit o kadar <b>tur</b> koşsun!");
  let n = 3;
  const sp = stepper(1, 6, n, (v) => (n = v));
  const cp = codePanel([[txt("for tur in range("), sp, txt("):")], "    print(tur)"]);
  const st = el("div", "stage");
  const chip = varChip("tur");
  st.append(chip);
  st.insertAdjacentHTML("beforeend", `<svg class="track" viewBox="0 0 200 200" aria-hidden="true">
    <circle cx="100" cy="100" r="70" fill="none" stroke="var(--track)" stroke-width="26"/>
    <circle cx="100" cy="100" r="70" fill="none" stroke="var(--ink-2)" stroke-width="2" stroke-dasharray="6 8" opacity=".5"/>
    <rect x="96" y="18" width="8" height="26" fill="var(--accent)"/><text x="108" y="14" class="lapnum">başla</text>
    <text class="lap-big" x="100" y="112" text-anchor="middle"></text><text class="lapnum lap-sub" x="100" y="134" text-anchor="middle"></text>
    <g class="runner"><circle r="13" fill="var(--robot)"/><circle r="5" cx="-4" cy="-2" fill="#fff"/><circle r="5" cx="5" cy="-2" fill="#fff"/></g></svg>`);
  f.grid.append(cp.node, st);
  const runner = $(".runner", st), big = $(".lap-big", st), sub = $(".lap-sub", st);
  const place = (a) => runner.setAttribute("transform", `translate(${100 + 70 * Math.sin(a)} ${100 - 70 * Math.cos(a)})`);
  place(0);
  const b = el("button", "btn", "▶ Koş");
  f.actions.prepend(b);
  const denenen = new Set();
  b.onclick = async () => {
    b.disabled = true; sp.lock(true); cp.clear(); big.textContent = ""; sub.textContent = "";
    for (let t = 0; t < n; t++) {
      cp.line(0); chip.set(t); sfx.tik(t); await wait(350);
      cp.line(1); cp.print(t);
      const t0 = performance.now(), D = matchMedia("(prefers-reduced-motion: reduce)").matches ? 1 : 700;
      await new Promise((ok) => { (function s(now) { const k = Math.min(1, (now - t0) / D); place(k * Math.PI * 2); k < 1 ? requestAnimationFrame(s) : ok(); })(t0); });
      big.textContent = t + 1; sub.textContent = "tur bitti";
    }
    cp.line(-1); denenen.add(n); b.disabled = false; sp.lock(false); b.textContent = "▶ Tekrar koş";
    if (denenen.size >= 2) { ctx.say(`Sayaç <b>0'dan</b> başlıyor, ${n}'e gelmeden duruyor!`, "vay"); f.done(1, STAR + " range'i çözdün"); }
    else ctx.say("Şimdi <b>başka bir sayı</b> seç. Ekrana ne yazıyor?");
  };
}

/* 3 · Tahmin: range(4) → 0 1 2 3 */
function tahmin(ctx) {
  const f = ctx.frame("Tahmin et: ekranda <b>hangi sayılar</b> çıkar?");
  const cp = codePanel(["for i in range(4):", "    print(i)"]);
  const st = el("div", "stage", '<div class="steps"></div>');
  f.grid.append(cp.node, st);
  const opts = el("div", "opts");
  ["1 2 3 4", "0 1 2 3", "0 1 2 3 4"].forEach((o, k) => {
    const b = el("button", "opt", o);
    b.onclick = async () => {
      if (k !== 1) {
        b.classList.add("no"); sfx.yanlis();
        ctx.say(k === 0 ? "Neredeyse! Sayaç <b>1'den</b> başlamıyor." : "Öyle olsa <b>5 sayı</b> olurdu. Kaç tur?", "uzgun");
        return;
      }
      b.classList.add("ok"); $$("button", opts).forEach((x) => (x.disabled = true));
      const s = $(".steps", st);
      for (let i = 0; i < 4; i++) {
        cp.line(0); await wait(200); cp.line(1); cp.print(i);
        s.append(el("div", "step-bar", String(i))); s.lastChild.style.height = 40 + i * 30 + "px";
        sfx.tik(i); await wait(250);
      }
      cp.line(-1); ctx.say("Evet! <b>4 tur</b>: 0, 1, 2, 3.", "vay"); f.done(1, STAR + " doğru tahmin");
    };
    opts.append(b);
  });
  f.actions.prepend(opts);
}

/* 4 · Arduino ikizi: aynı döngü iki dilde */
const PARCA = {
  1: "<b>int i = 0</b>: sayaç 0'dan başlar. Python'da kendiliğinden!",
  2: "<b>i &lt; 5</b>: 5'e gelmeden dur. Python'da <b>range(5)</b>.",
  3: "<b>i++</b>: her tur 1 artır. range bunu kendisi yapar.",
  4: "<b>{ }</b> yerine Python'da <b>:</b> ve 4 boşluk.",
  5: "<b>Serial.println</b> yerine Python'da <b>print</b>."
};
function arduino(ctx) {
  const f = ctx.frame("Arduino'daki <b>for</b>'u hatırla! Renkli parçalara dokun.");
  const sol = el("div", "twin");
  sol.innerHTML = `<div class="twin-h">Arduino (C++)</div>
    <div class="code cpp"><div class="ln"><span class="kw">for</span> (<button class="chunk c1" data-k="1">int i = 0</button>; <button class="chunk c2" data-k="2">i &lt; 5</button>; <button class="chunk c3" data-k="3">i++</button>) <button class="chunk c4" data-k="4">{</button></div>
    <div class="ln">  <button class="chunk c5" data-k="5">Serial.println(i);</button></div><div class="ln"><span class="brace4">}</span></div>
    <div class="out"><span class="out-label">Seri ekran</span></div></div>
    <div class="leds">${"<span></span>".repeat(5)}</div>`;
  const sag = el("div", "twin");
  sag.innerHTML = `<div class="twin-h">Python</div>
    <div class="code"><div class="ln"><span class="kw">for</span> <span class="pk" data-k="1 3">i</span> <span class="kw">in</span> <span class="pk" data-k="2 3"><span class="fn">range</span>(<span class="nu">5</span>)</span><span class="pk" data-k="4">:</span></div>
    <div class="ln"><span class="pk" data-k="4">    </span><span class="pk" data-k="5"><span class="fn">print</span>(i)</span></div>
    <div class="out"><span class="out-label">Ekran</span></div></div>`;
  f.grid.append(sol, sag);
  const bulunan = new Set();
  const calis = el("button", "btn", "▶ İkisini de çalıştır");
  calis.hidden = true;
  f.actions.prepend(calis);
  $$(".chunk", sol).forEach((b) => {
    b.onclick = () => {
      const k = b.dataset.k;
      $$(".chunk", sol).forEach((x) => x.classList.toggle("on", x === b));
      $$(".pk", sag).forEach((x) => x.classList.toggle("on", x.dataset.k.split(" ").includes(k)));
      $$(".pk", sag).forEach((x) => x.classList.toggle("c" + k, x.dataset.k.split(" ").includes(k)));
      $(".brace4", sol).classList.toggle("on", k === "4");
      b.classList.add("seen"); bulunan.add(k); sfx.tik(+k);
      ctx.say(PARCA[k] + (bulunan.size < 5 ? "" : " Hepsini buldun!"), bulunan.size < 5 ? "mutlu" : "vay");
      if (bulunan.size === 5) calis.hidden = false;
    };
  });
  calis.onclick = async () => {
    calis.disabled = true;
    $$(".on", f.grid).forEach((x) => x.classList.remove("on"));
    const [ca, py] = $$(".code", f.grid), leds = $$(".leds span", sol);
    const satir = (code, i) => $$(".ln", code).forEach((d, k) => d.classList.toggle("hl", k === i));
    const yaz = (code, t) => $(".out", code).append(el("span", "o", t));
    $$(".o", f.grid).forEach((x) => x.remove()); leds.forEach((l) => l.classList.remove("lit"));
    for (let i = 0; i < 5; i++) {
      satir(ca, 0); satir(py, 0); await wait(300);
      satir(ca, 1); satir(py, 1); yaz(ca, i); yaz(py, i); leds[i].classList.add("lit"); sfx.tik(i); await wait(350);
    }
    satir(ca, -1); satir(py, -1);
    ctx.say("İki dil, <b>aynı</b> 5 tur! Python'da daha kısa.", "vay");
    f.done(1, STAR + " ikizleri buldun");
    calis.disabled = false;
  };
}

/* 7 · Yaz: tek satırı çocuk yazar */
const IPUCU = [
  "Kumbarayı hatırla: her turda <b>kumbara</b> büyüyordu.",
  "Satır şöyle başlar: <code>toplam = toplam + ...</code>",
  "Cevap: <code>toplam = toplam + sayi</code>"
];
function yaz(ctx) {
  const f = ctx.frame("Sıra sende! <b>1'den 10'a</b> kadar sayıları topla.");
  hazirla().catch(() => {});
  const bas = "toplam = 0\nfor sayi in range(1, 11):\n    # buraya bir satır yaz\nprint(toplam)";
  const ed = editor(bas, { satir: 5 });
  const sol = el("div", "write");
  sol.append(ed);
  const st = el("div", "stage");
  st.innerHTML = `<div class="chips"><div class="chip">sayi = <em>1 → 10</em></div><div class="chip">hedef = <em>55</em></div></div><div class="col-center">${bitSvg("mutlu", "bit bit-xl")}<div class="screen-out" aria-live="polite"><span class="out-label">Ekran</span><div class="so-lines"></div></div></div>`;
  f.grid.append(sol, st);
  const msg = el("div", "msg");
  const calis = el("button", "btn", "▶ Çalıştır"), ipucuB = el("button", "btn sec", "💡 İpucu");
  ipucuB.hidden = true;
  f.actions.prepend(calis, ipucuB);
  f.grid.after(msg);
  let deneme = 0, ipucu = 0;
  const bit = (m) => { $(".bit", st).outerHTML = bitSvg(m, "bit bit-xl"); };
  const basarisiz = () => { deneme++; if (deneme >= 3) ipucuB.hidden = false; };
  ipucuB.onclick = () => {
    msg.className = "msg hint"; msg.innerHTML = "💡 " + IPUCU[Math.min(ipucu, 2)];
    if (ipucu >= 2) {
      const kopya = el("button", "btn sec small", "Kutuya yaz");
      kopya.onclick = () => { ed.value = bas.replace("    # buraya bir satır yaz", "    toplam = toplam + sayi"); ed.focus(); };
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
    $(".so-lines", st).innerHTML = r.out.map((o) => `<div>${o.replace(/</g, "&lt;")}</div>`).join("");
    if (r.hata) {
      msg.className = "msg bad"; msg.innerHTML = (r.hata.satir ? `<b>${r.hata.satir}. satır:</b> ` : "") + r.hata.mesaj;
      bit("uzgun"); sfx.yanlis(); basarisiz(); return;
    }
    const son = r.out[r.out.length - 1];
    if (son === "55") {
      msg.className = "msg ok"; msg.innerHTML = "Harika! 1 + 2 + ... + 10 = <b>55</b>.";
      bit("vay"); ctx.say("Kendi kodunu <b>yazdın</b>! Döngü 10 tur toplama yaptı.", "vay");
      f.done(2, stars(2) + " kod yazdın"); return;
    }
    msg.className = "msg bad";
    msg.innerHTML = son === undefined ? "Ekrana hiçbir şey çıkmadı. <code>print</code> satırı duruyor mu?" : son === "0" ? "Ekranda <b>0</b> çıktı: döngünün içinde toplam hiç büyümedi." : `Ekranda <b>${son.replace(/</g, "&lt;")}</b> çıktı. <b>55</b> olmalıydı.`;
    bit("uzgun"); sfx.yanlis(); basarisiz();
  };
}

/* 5 · Listede gezmek */
function meyve(ctx) {
  const f = ctx.frame("Sepete meyve ekle. Döngü hepsini <b>tek tek</b> yıkasın!");
  const sepet = ["🍎", "🍌"];
  const listeSpan = el("span");
  const cp = codePanel([[txt("sepet = ["), listeSpan, txt("]")], "for meyve in sepet:", '    print(meyve, "yıkandı")']);
  const st = el("div", "stage tall");
  const chip = varChip("meyve");
  st.append(chip);
  st.insertAdjacentHTML("beforeend", `<div class="basket"></div><div class="belt"></div>
    <div class="machine"><div class="m-eyes"><span></span><span></span></div><div class="mouth"></div>yıkama</div>`);
  f.grid.append(cp.node, st);
  const ciz = () => {
    listeSpan.innerHTML = sepet.map((m) => `<span class="st">"${m}"</span>`).join(", ");
    $(".basket", st).innerHTML = sepet.map((m) => `<div class="cell">${m}</div>`).join("");
  };
  ciz();
  const ekle = el("div", "add");
  ["🍇", "🍓", "🍊", "🥝"].forEach((m) => {
    const b = el("button", "", m); b.setAttribute("aria-label", "sepete ekle");
    b.onclick = () => { if (sepet.length < 6) { sepet.push(m); ciz(); beep(700); } };
    ekle.append(b);
  });
  const run = el("button", "btn", "▶ Çalıştır");
  f.actions.prepend(ekle, run);
  run.onclick = async () => {
    run.disabled = true; $$("button", ekle).forEach((x) => (x.disabled = true)); cp.clear(); ciz();
    const cells = $$(".cell", st), belt = $(".belt", st), mc = $(".machine", st);
    for (let i = 0; i < sepet.length; i++) {
      cp.line(1); cells.forEach((c, k) => c.classList.toggle("cur", k === i)); chip.set(`"${sepet[i]}"`);
      const fr = el("div", "fruit", sepet[i]); fr.style.left = "10px"; st.append(fr); await wait(300);
      belt.classList.add("go"); cp.line(2); fr.style.left = st.clientWidth - 110 + "px"; await wait(900);
      fr.classList.add("eaten"); mc.classList.remove("eat"); void mc.offsetWidth; mc.classList.add("eat"); sfx.yut();
      belt.classList.remove("go"); cp.print(`${sepet[i]} yıkandı`); cells[i].classList.remove("cur"); cells[i].classList.add("done");
      await wait(300); fr.remove();
    }
    cp.line(-1); chip.set("bitti");
    ctx.say(`${sepet.length} meyve, <b>${sepet.length} tur</b>. Her turda sıradaki meyve!`, "vay");
    f.done(1, STAR + " liste gezildi");
    run.disabled = false; run.textContent = "↺ Baştan"; run.onclick = () => ctx.redo();
  };
}

/* 6 · Biriktirmek */
function kumbara(ctx) {
  const f = ctx.frame("Her turda kumbaraya <b>para</b> düşüyor. Adım adım izle!");
  const paralar = [5, 10, 2, 20];
  const cp = codePanel(["kumbara = 0", "for para in [5, 10, 2, 20]:", "    kumbara = kumbara + para", 'print("Toplam:", kumbara)']);
  const st = el("div", "stage tall");
  const chips = el("div", "chips"), pv = varChip("para"), kv = varChip("kumbara");
  chips.append(pv, kv);
  st.append(chips);
  st.insertAdjacentHTML("beforeend", `<div class="sum"></div>
    <svg class="piggy" viewBox="0 0 170 120" aria-hidden="true"><ellipse cx="85" cy="70" rx="70" ry="44" fill="#ff9fb3"/><rect x="66" y="26" width="38" height="7" rx="3" fill="#a3445a"/>
    <circle cx="140" cy="62" r="16" fill="#ff8aa2"/><circle cx="136" cy="60" r="3" fill="#a3445a"/><circle cx="145" cy="60" r="3" fill="#a3445a"/><circle cx="118" cy="50" r="4" fill="#172036"/>
    <rect x="40" y="100" width="14" height="18" rx="5" fill="#ff8aa2"/><rect x="110" y="100" width="14" height="18" rx="5" fill="#ff8aa2"/></svg>`);
  f.grid.append(cp.node, st);
  const eq = $(".sum", st);
  let adim = 0, toplam = 0, i = -1;
  const b = el("button", "btn", "👣 Bir adım");
  f.actions.prepend(b);
  b.onclick = async () => {
    b.disabled = true;
    if (adim === 0) { cp.line(0); toplam = 0; kv.set(0); ctx.say("Önce kumbara <b>boş</b>: 0 lira."); }
    else if (adim % 2 === 1) {
      i++; cp.line(1); pv.set(paralar[i]);
      const c = el("div", "coin", paralar[i]); st.append(c); await wait(50); c.classList.add("drop"); await wait(700); c.classList.add("in"); sfx.para();
      setTimeout(() => c.remove(), 300);
    } else {
      cp.line(2); const eski = toplam; toplam += paralar[i]; kv.set(toplam);
      eq.innerHTML = `${eski} + ${paralar[i]}<b>= ${toplam}</b>`;
    }
    adim++;
    if (adim > 2 * paralar.length) {
      await wait(300); cp.line(3); cp.print("Toplam: " + toplam);
      ctx.say(`Kumbarada <b>${toplam} lira</b> birikti!`, "vay");
      f.done(1, STAR + " " + toplam + " lira"); b.hidden = true; return;
    }
    b.disabled = false;
  };
}

/* 8 · Görev: Bit'i yıldıza götür (iki seviye) */
const SEVIYE = [
  { w: 7, h: 3, start: [0, 1], star: [5, 1], walls: [], body: ["    ileri()"], moves: [[1, 0]], text: "Görev: Bit'i <b>yıldıza</b> götür. Kaç adım?" },
  { w: 6, h: 5, start: [0, 4], star: [4, 0], walls: [[2, 4], [3, 4], [4, 4], [5, 4], [3, 3], [4, 3], [5, 3], [4, 2], [5, 2], [5, 1]], body: ["    ileri()", "    yukari()"], moves: [[1, 0], [0, -1]], text: "Zor görev: merdiveni çık! Döngüde <b>iki</b> komut var." }
];
function gorev(ctx) {
  let level = 0;
  function render() {
    const L = SEVIYE[level];
    const f = ctx.frame(L.text);
    let n = 1;
    const sp = stepper(1, 9, n, (v) => (n = v));
    const cp = codePanel([[txt("for adim in range("), sp, txt("):")], ...L.body]);
    const st = el("div", "stage");
    const maze = el("div", "maze");
    maze.style.gridTemplateColumns = `repeat(${L.w}, 1fr)`;
    maze.style.maxWidth = L.w * 62 + "px";
    const key = (x, y) => x + "," + y, walls = new Set(L.walls.map(([x, y]) => key(x, y)));
    for (let y = 0; y < L.h; y++) for (let x = 0; x < L.w; x++) {
      const t = el("div", "tile" + (walls.has(key(x, y)) ? " wall" : ""));
      t.dataset.k = key(x, y);
      if (x === L.star[0] && y === L.star[1]) t.innerHTML = STAR;
      maze.append(t);
    }
    st.append(maze);
    f.grid.append(cp.node, st);
    const mover = el("div", "mover", bitSvg());
    st.append(mover);
    const put = (x, y) => {
      const t = maze.querySelector(`[data-k="${key(x, y)}"]`), r = t.getBoundingClientRect(), s = st.getBoundingClientRect(), size = r.width * 0.86;
      mover.style.width = mover.style.height = size + "px";
      mover.style.left = r.left - s.left + (r.width - size) / 2 + "px";
      mover.style.top = r.top - s.top + (r.height - size) / 2 + "px";
    };
    let pos = [...L.start];
    requestAnimationFrame(() => put(...pos));
    const onResize = () => { if (mover.isConnected) put(...pos); else removeEventListener("resize", onResize); };
    addEventListener("resize", onResize);
    const b = el("button", "btn", "▶ Çalıştır");
    f.actions.prepend(b);
    b.onclick = async () => {
      b.disabled = true; sp.lock(true); $$(".trail", maze).forEach((t) => t.classList.remove("trail")); cp.clear();
      pos = [...L.start]; put(...pos); await wait(250);
      let carpti = false;
      dis: for (let k = 0; k < n; k++) {
        cp.line(0); cp.print("adim=" + k); await wait(220);
        for (let m = 0; m < L.moves.length; m++) {
          cp.line(1 + m);
          const nx = pos[0] + L.moves[m][0], ny = pos[1] + L.moves[m][1];
          if (nx < 0 || ny < 0 || nx >= L.w || ny >= L.h || walls.has(key(nx, ny))) {
            mover.classList.add("bump"); sfx.carp(); await wait(400); mover.classList.remove("bump"); carpti = true; break dis;
          }
          maze.querySelector(`[data-k="${key(...pos)}"]`).classList.add("trail");
          pos = [nx, ny]; put(...pos); sfx.tik(k); await wait(460);
        }
      }
      cp.line(-1);
      const kazandi = !carpti && pos[0] === L.star[0] && pos[1] === L.star[1];
      if (kazandi) {
        confetti();
        if (level === 0) {
          ctx.say(`Süper! <b>range(${n})</b> ile ${n} adım.`, "vay");
          f.done(2, stars(2) + " görev tamam");
          f.next.textContent = "Zor görev ➜";
          f.next.onclick = () => { level = 1; render(); };
        } else {
          ctx.say("Merdiveni çıktın! Her turda <b>iki komut</b> çalıştı.", "vay");
          f.done(3, stars(3) + " zor görev tamam");
          f.next.onclick = () => ctx.next();
        }
      } else ctx.say(carpti ? `Bit duvara çarptı! <b>${n}</b> fazla geldi.` : "Yıldıza <b>ulaşamadı</b>. Biraz daha!", "uzgun");
      b.disabled = false; sp.lock(false); b.textContent = "▶ Tekrar dene";
    };
  }
  render();
}

export const dongu = {
  id: "dongu", no: 4, title: "Döngü Robotu", icon: "🔁", color: "#22a6a0",
  screens: [kisalt, pist, tahmin, arduino, meyve, kumbara, yaz, gorev],
  ozet: ["for i in range(5): → 5 tur, 0'dan 4'e", "Arduino: for (int i = 0; i < 5; i++) → aynı 5 tur", "for meyve in sepet: → listeyi tek tek gez", "toplam = toplam + sayi → biriktir"]
};
