/* İlerleme kaydı: tek anahtar, cihazda. Depolama yoksa bellekte tutar, site yine çalışır. */
const KEY = "atolye-junior-v1";
const VARSAYILAN = { worlds: {}, sound: true, teacher: false, testler: {}, ad: "" };
let state = load();

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return { ...VARSAYILAN, ...JSON.parse(raw) };
  } catch (_) { /* depolama kapalı ya da bozuk */ }
  return JSON.parse(JSON.stringify(VARSAYILAN));
}
function save() { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (_) {} }

export const store = {
  get: () => state,
  worldDone: (id) => !!(state.worlds[id] && state.worlds[id].done),
  worldStars: (id) => (state.worlds[id] && state.worlds[id].stars) || 0,
  completeWorld(id, stars) {
    const w = state.worlds[id] || {};
    state.worlds[id] = { done: true, stars: Math.max(w.stars || 0, stars) };
    save();
  },
  totalStars: () => Object.values(state.worlds).reduce((t, w) => t + (w.stars || 0), 0),
  sound: () => state.sound,
  setSound(v) { state.sound = !!v; save(); },
  teacher: () => state.teacher,
  setTeacher(v) { state.teacher = !!v; save(); },
  /* testler: { on|son: { cevaplar: [..], bitti, tarih } } */
  test: (tur) => (state.testler || {})[tur] || null,
  testBitti: (tur) => !!(state.testler && state.testler[tur] && state.testler[tur].bitti),
  testKaydet(tur, cevaplar, bitti) {
    state.testler = state.testler || {};
    state.testler[tur] = { cevaplar: [...cevaplar], bitti: !!bitti, tarih: new Date().toISOString() };
    save();
  },
  ad: () => state.ad || "",
  setAd(v) { state.ad = String(v || "").trim().slice(0, 40); save(); },
  reset() { state = JSON.parse(JSON.stringify({ ...VARSAYILAN, sound: state.sound })); save(); }
};
