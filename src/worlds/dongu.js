/* Dünya 4 · Döngü Robotu */
import { el, $, $$, wait, hl, txt, codePanel, stepper, varChip, confetti, stars, STAR } from "../core/ui.js";
import { bitSvg } from "../core/bit.js";
import { sfx, beep } from "../core/sound.js";

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

/* 4 · Listede gezmek */
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

/* 5 · Biriktirmek */
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

/* 6 · Görev: Bit'i yıldıza götür (iki seviye) */
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
  screens: [kisalt, pist, tahmin, meyve, kumbara, gorev],
  ozet: ["for i in range(5): → 5 tur, 0'dan 4'e", "for meyve in sepet: → listeyi tek tek gez", "toplam = toplam + sayi → biriktir"]
};
