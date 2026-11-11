/* Kursun 10 dünyası. screens: null → içerik henüz hazırlanıyor (haritada görünür, sırada atlanır). */
import { dongu } from "./dongu.js";
import { dil } from "./dil.js";
import { ilk } from "./ilk.js";
import { karar } from "./karar.js";
import { listeDunyasi } from "./liste.js";
import { fonk } from "./fonk.js";
import { yz } from "./yz.js";
import { rakam } from "./rakam.js";
import { penguen } from "./penguen.js";
import { ressam } from "./ressam.js";
import { store } from "../core/store.js";

export const WORLDS = [
  dil,
  ilk,
  karar,
  dongu,
  listeDunyasi,
  fonk,
  yz,
  rakam,
  penguen,
  ressam
];

export const hazir = (w) => Array.isArray(w.screens) && w.screens.length > 0;

/* Durum: "bitti" | "acik" | "kilitli" | "hazirlaniyor".
   Çocukta: hazır olan dünyalar sırayla açılır (hazırlanan dünyalar atlanır). Öğretmen modunda hazır olan her dünya açık. */
export function durum(w) {
  if (!hazir(w)) return "hazirlaniyor";
  if (store.worldDone(w.id)) return "bitti";
  if (store.teacher()) return "acik";
  if (!store.testBitti("on")) return "kilitli";
  const onceki = WORLDS.slice(0, WORLDS.indexOf(w)).filter(hazir);
  return onceki.every((x) => store.worldDone(x.id)) ? "acik" : "kilitli";
}
/* Kurs yolunun dünya dışındaki durakları */
export const tumuBitti = () => WORLDS.filter(hazir).every((w) => store.worldDone(w.id));
export function durakDurumu(ad) {
  const t = store.teacher();
  if (ad === "on") return store.testBitti("on") ? "bitti" : "acik";
  if (ad === "son") return store.testBitti("son") ? "bitti" : t || tumuBitti() ? "acik" : "kilitli";
  if (ad === "sertifika") return store.ad() && store.testBitti("son") ? "bitti" : t || store.testBitti("son") ? "acik" : "kilitli";
  return "kilitli";
}
export const bul = (no) => WORLDS.find((w) => String(w.no) === String(no));
