import "./styles.css";
import { harita } from "./pages/harita.js";
import { ogretmen } from "./pages/ogretmen.js";
import { playWorld } from "./core/engine.js";
import { bul, durum } from "./worlds/index.js";

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
  harita(root);
}
addEventListener("hashchange", route);
route();
