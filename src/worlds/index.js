/* Kursun 10 dünyası. screens: null → içerik henüz hazırlanıyor (haritada görünür, sırada atlanır). */
import { dongu } from "./dongu.js";
import { dil } from "./dil.js";
import { ilk } from "./ilk.js";
import { karar } from "./karar.js";
import { listeDunyasi } from "./liste.js";
import { fonk } from "./fonk.js";
import { store } from "../core/store.js";

export const WORLDS = [
  dil,
  ilk,
  karar,
  dongu,
  listeDunyasi,
  fonk,
  { id: "yz", no: 7, title: "Yapay Zekânın Alet Çantası", icon: "🧰", color: "#ffd84d", screens: null },
  { id: "rakam", no: 8, title: "Rakam Okuyan Yapay Zekâ", icon: "✏️", color: "#7fd6d1", screens: null },
  { id: "penguen", no: 9, title: "Penguen Dedektifi", icon: "🐧", color: "#9fb8ff", screens: null },
  { id: "ressam", no: 10, title: "Yapay Zekâ Ressamı", icon: "🎨", color: "#ff9d7a", screens: null }
];

export const hazir = (w) => Array.isArray(w.screens) && w.screens.length > 0;

/* Durum: "bitti" | "acik" | "kilitli" | "hazirlaniyor".
   Çocukta: hazır olan dünyalar sırayla açılır (hazırlanan dünyalar atlanır). Öğretmen modunda hazır olan her dünya açık. */
export function durum(w) {
  if (!hazir(w)) return "hazirlaniyor";
  if (store.worldDone(w.id)) return "bitti";
  if (store.teacher()) return "acik";
  const onceki = WORLDS.slice(0, WORLDS.indexOf(w)).filter(hazir);
  return onceki.every((x) => store.worldDone(x.id)) ? "acik" : "kilitli";
}
export const bul = (no) => WORLDS.find((w) => String(w.no) === String(no));
