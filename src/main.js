import "./styles.css";
import { harita } from "./pages/harita.js";
import { ogretmen } from "./pages/ogretmen.js";
import { playWorld } from "./core/engine.js";
import { bul, durum, durakDurumu } from "./worlds/index.js";
import { testSayfasi } from "./pages/test.js";
import { sonucSayfasi } from "./pages/sonuc.js";
import { sertifikaSayfasi } from "./pages/sertifika.js";

const root = document.getElementById("app");

function route() {
  const h = location.hash.replace(/^#/, "");
  const m = h.match(/^dunya-(\d+)$/);
  if (m) {
    const w = bul(m[1]);
    if (w && (durum(w) === "acik" || durum(w) === "bitti")) {
      document.title = `${w.title} · Python Atölyesi Junior`;
      return playWorld(w, root, {});
    }
    return (location.hash = "harita");
  }
  document.title = "Python Atölyesi Junior";
  window.scrollTo(0, 0);
  if (h === "ogretmen") return ogretmen(root);
  const tm = h.match(/^test-(on|son)$/);
  if (tm) {
    if (durakDurumu(tm[1]) === "kilitli") return (location.hash = "harita");
    document.title = (tm[1] === "on" ? "Başlangıç testi" : "Bitiş testi") + " · Python Atölyesi Junior";
    return testSayfasi(root, tm[1]);
  }
  if (h === "sonuc") return sonucSayfasi(root);
  if (h === "sertifika") {
    if (durakDurumu("sertifika") === "kilitli") return (location.hash = "harita");
    document.title = "Sertifika · Python Atölyesi Junior";
    return sertifikaSayfasi(root);
  }
  harita(root);
}
addEventListener("hashchange", route);
route();
