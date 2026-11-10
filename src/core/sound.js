/* Kısa efekt sesleri (WebAudio). Tarayıcı ilk dokunuştan sonra ses çalmaya izin verir. */
import { store } from "./store.js";

let ac = null;
export function beep(f = 660, d = 0.08, type = "sine", v = 0.05) {
  if (!store.sound()) return;
  try {
    ac = ac || new (window.AudioContext || window.webkitAudioContext)();
    const o = ac.createOscillator(), g = ac.createGain();
    o.type = type; o.frequency.value = f; g.gain.value = v;
    o.connect(g); g.connect(ac.destination); o.start();
    g.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + d);
    o.stop(ac.currentTime + d);
  } catch (_) {}
}
export const sfx = {
  tik: (k = 0) => beep(500 + k * 70, 0.06),
  dogru: () => { beep(660, 0.09); setTimeout(() => beep(880, 0.09), 90); setTimeout(() => beep(1175, 0.14), 180); },
  yanlis: () => beep(200, 0.16, "square", 0.03),
  carp: () => beep(160, 0.2, "square", 0.04),
  yut: () => beep(330, 0.1, "triangle"),
  para: () => { beep(900, 0.07); beep(1200, 0.1); }
};

const ON = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9v6h4l5 4V5L8 9H4z" fill="currentColor"/><path d="M16 8.5a5 5 0 0 1 0 7M18.5 6a8.5 8.5 0 0 1 0 12" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/></svg>';
const OFF = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9v6h4l5 4V5L8 9H4z" fill="currentColor"/><path d="M16 9l5 6M21 9l-5 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';
export function soundButton() {
  const b = document.createElement("button");
  b.className = "icon-btn";
  const draw = () => { b.innerHTML = store.sound() ? ON : OFF; b.setAttribute("aria-label", store.sound() ? "Sesi kapat" : "Sesi aç"); b.title = b.getAttribute("aria-label"); };
  b.onclick = () => { store.setSound(!store.sound()); draw(); beep(700); };
  draw();
  return b;
}
