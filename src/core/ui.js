/* Dünyaların ortak parçaları: kod paneli, sayı seçici, değişken kutusu, konfeti, bekleme. */
export const $ = (s, r = document) => r.querySelector(s);
export const $$ = (s, r = document) => [...r.querySelectorAll(s)];
export function el(tag, cls, html) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (html != null) e.innerHTML = html;
  return e;
}
const azHareket = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
export const wait = (ms) => new Promise((r) => setTimeout(r, azHareket() ? Math.min(ms, 60) : ms));
export const STAR = '<svg class="star" viewBox="0 0 24 24" aria-hidden="true"><path fill="#ffc81e" stroke="#c99500" stroke-width="1.2" d="M12 2.5l2.9 6 6.6.8-4.9 4.6 1.3 6.5L12 17.2 6.1 20.4l1.3-6.5L2.5 9.3l6.6-.8z"/></svg>';
export const stars = (n) => STAR.repeat(n);

/* Python satırını renklendir (sadece görüntü için; çalıştırmaz) */
export function hl(src) {
  return src.replace(/&/g, "&amp;").replace(/</g, "&lt;")
    .replace(/("[^"]*")/g, '<span class="st">$1</span>')
    .replace(/\b(for|in|if|else|elif|while|def|return)\b(?![^<]*<\/span>)/g, '<span class="kw">$1</span>')
    .replace(/\b(print|range|len|input|ileri|yukari|zipla)\b(?![^<]*<\/span>)/g, '<span class="fn">$1</span>')
    .replace(/(^|[^\w#"])(\d+)(?![^<]*<\/span>)/g, '$1<span class="nu">$2</span>')
    .replace(/(#.*)$/, '<span class="cm">$1</span>');
}
export function txt(s) { const t = document.createElement("span"); t.innerHTML = hl(s); return t; }

/* Kod paneli: satırlar (metin ya da düğüm dizisi) + altta "Ekran" çıktısı */
export function codePanel(lines) {
  const c = el("div", "code");
  c.setAttribute("aria-label", "Python kodu");
  for (const l of lines) {
    const d = el("div", "ln");
    if (typeof l === "string") d.innerHTML = hl(l); else d.append(...l);
    c.append(d);
  }
  const out = el("div", "out", '<span class="out-label">Ekran</span>');
  c.append(out);
  return {
    node: c,
    line: (i) => $$(".ln", c).forEach((d, k) => d.classList.toggle("hl", k === i)),
    print: (t) => out.append(el("span", "o", String(t).replace(/</g, "&lt;"))),
    clear: () => { out.innerHTML = '<span class="out-label">Ekran</span>'; },
    lines: () => $$(".ln", c)
  };
}

/* Sayı seçici: [−] 3 [+] */
export function stepper(min, max, val, onChange) {
  const w = el("span", "num-btn");
  const minus = el("button", "", "−"), plus = el("button", "", "+"), o = el("output", "", String(val));
  minus.setAttribute("aria-label", "azalt"); plus.setAttribute("aria-label", "artır");
  const set = (v) => { val = Math.max(min, Math.min(max, v)); o.textContent = val; onChange && onChange(val); };
  minus.onclick = () => set(val - 1);
  plus.onclick = () => set(val + 1);
  w.append(minus, o, plus);
  w.get = () => val;
  w.lock = (b) => { minus.disabled = plus.disabled = b; };
  return w;
}

/* Değişken kutusu: "tur = 3" */
export function varChip(ad, deger = "?") {
  const c = el("div", "chip", `${ad} = <em>${deger}</em>`);
  c.set = (v) => { c.querySelector("em").textContent = v; c.classList.remove("flash"); void c.offsetWidth; c.classList.add("flash"); };
  return c;
}

export function confetti() {
  if (azHareket()) return;
  let c = $("#confetti");
  if (!c) { c = el("canvas", "confetti"); c.id = "confetti"; document.body.append(c); }
  const x = c.getContext("2d");
  c.width = innerWidth; c.height = innerHeight;
  const renk = ["#ff6b3d", "#22a6a0", "#ffd84d", "#7fd6ff", "#b7f08a"];
  const p = Array.from({ length: 120 }, () => ({ x: innerWidth / 2, y: innerHeight / 3, vx: (Math.random() - 0.5) * 14, vy: Math.random() * -12 - 4, r: Math.random() * 6 + 4, c: renk[(Math.random() * 5) | 0], a: Math.random() * 6 }));
  let t = 0;
  (function f() {
    x.clearRect(0, 0, c.width, c.height);
    for (const q of p) { q.vy += 0.4; q.x += q.vx; q.y += q.vy; q.a += 0.2; x.save(); x.translate(q.x, q.y); x.rotate(q.a); x.fillStyle = q.c; x.fillRect(-q.r / 2, -q.r / 4, q.r, q.r / 2); x.restore(); }
    if (++t < 90) requestAnimationFrame(f); else x.clearRect(0, 0, c.width, c.height);
  })();
}
