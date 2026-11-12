/* İlerleme kaydı: tek anahtar, cihazda. Depolama yoksa bellekte tutar, site yine çalışır. */
const KEY = "atolye-junior-v1";
const VARSAYILAN = { worlds: {}, sound: true, teacher: false, testler: {}, ad: "", oyunlar: {} };
let state = load();

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return { ...VARSAYILAN, ...JSON.parse(raw) };
  } catch (_) { /* depolama kapalı ya da bozuk */ }
  return JSON.parse(JSON.stringify(VARSAYILAN));
}
let degisti = null; /* bulut katmanı buraya bağlanır: her kayıttan sonra çağrılır */
function save(eslenecek = true) { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (_) {} if (eslenecek && degisti) degisti(); }
/* buluta giden kısım: ses ve öğretmen bayrağı cihazda kalır */
const ESLENEN = ["worlds", "testler", "ad", "oyunlar"];

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
  setSound(v) { state.sound = !!v; save(false); },
  teacher: () => state.teacher,
  setTeacher(v) { state.teacher = !!v; save(false); },
  onDegisim(f) { degisti = f; },
  veri: () => Object.fromEntries(ESLENEN.map((k) => [k, JSON.parse(JSON.stringify(state[k] ?? VARSAYILAN[k]))])),
  /* buluttan gelen kaydı cihazdakinin yerine koy (ses tercihi korunur) */
  yukle(v) {
    const t = state.teacher, ses = state.sound;
    state = { ...JSON.parse(JSON.stringify(VARSAYILAN)), sound: ses, teacher: t };
    ESLENEN.forEach((k) => { if (v && v[k] != null) state[k] = v[k]; });
    save(false);
  },
  /* testler: { on|son: { cevaplar: [..], bitti, tarih } } */
  test: (tur) => (state.testler || {})[tur] || null,
  testBitti: (tur) => !!(state.testler && state.testler[tur] && state.testler[tur].bitti),
  testKaydet(tur, cevaplar, bitti) {
    state.testler = state.testler || {};
    state.testler[tur] = { cevaplar: [...cevaplar], bitti: !!bitti, tarih: new Date().toISOString() };
    save();
  },
  /* oyunlar: { id: { en: en iyi tur yıldızı, tur: oynanan tur sayısı } } */
  oyun: (id) => (state.oyunlar || {})[id] || { en: 0, tur: 0 },
  oyunKaydet(id, yildiz) {
    state.oyunlar = state.oyunlar || {};
    const o = state.oyunlar[id] || { en: 0, tur: 0 };
    state.oyunlar[id] = { en: Math.max(o.en, yildiz), tur: o.tur + 1 };
    save();
  },
  ad: () => state.ad || "",
  setAd(v) { state.ad = String(v || "").trim().slice(0, 40); save(); },
  reset() { state = JSON.parse(JSON.stringify({ ...VARSAYILAN, sound: state.sound })); save(); }
};
