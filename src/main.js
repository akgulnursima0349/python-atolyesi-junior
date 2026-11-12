import "./styles.css";
import { harita } from "./pages/harita.js";
import { ogretmen } from "./pages/ogretmen.js";
import { playWorld } from "./core/engine.js";
import { bul, durum, durakDurumu } from "./worlds/index.js";
import { testSayfasi } from "./pages/test.js";
import { sonucSayfasi } from "./pages/sonuc.js";
import { sertifikaSayfasi } from "./pages/sertifika.js";
import { salonSayfasi, oyunSayfasi } from "./pages/salon.js";
import { oyunBul, oyunAcik, dunyaOyunu } from "./salon/index.js";
import { bulut, bulutBaslat } from "./cloud/bulut.js";
import { girisSayfasi } from "./pages/giris.js";
import { panelSayfasi, sinifSayfasi } from "./pages/panel.js";

/* dünya bitince açılan oyunu bitiş ekranında haber ver */
const yeniOyun = (w) => { const o = dunyaOyunu(w.id); return o ? `<a class="yeni-oyun" href="#oyun-${o.id}"><span>${o.ikon}</span><span><small>Oyun Salonu'nda açıldı</small><b>${o.ad}</b></span></a>` : ""; };

const root = document.getElementById("app");

function route() {
  const h = location.hash.replace(/^#/, "");
  /* hesaplı modda: giriş yapılmadan hiçbir sayfa açılmaz; panel yalnızca öğretmene */
  if (bulut.mod === "bulut") {
    const rol = bulut.ben.rol;
    if (!rol) { if (h !== "giris") return (location.hash = "giris"); document.title = "Giriş · Python Atölyesi Junior"; return girisSayfasi(root); }
    if (h === "giris" || h === "ogretmen") return (location.hash = rol === "ogretmen" ? "panel" : "harita");
    const pm = h.match(/^panel(?:-(ogretmenler)|\/([\w-]+)(?:\/(ogrenciler))?)?$/);
    if (pm) {
      if (rol !== "ogretmen") return (location.hash = "harita");
      document.title = "Öğretmen paneli · Python Atölyesi Junior"; window.scrollTo(0, 0);
      return pm[2] ? sinifSayfasi(root, pm[2], pm[3] || "ilerleme") : panelSayfasi(root, pm[1] || "siniflar");
    }
  } else if (h === "giris" || h.startsWith("panel")) return (location.hash = "harita");
  const m = h.match(/^dunya-(\d+)$/);
  if (m) {
    const w = bul(m[1]);
    if (w && (durum(w) === "acik" || durum(w) === "bitti")) {
      document.title = `${w.title} · Python Atölyesi Junior`;
      return playWorld(w, root, { sonEk: yeniOyun });
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
  if (h === "salon") { document.title = "Oyun Salonu · Python Atölyesi Junior"; return salonSayfasi(root); }
  const om = h.match(/^oyun-(\w+)$/);
  if (om) {
    const o = oyunBul(om[1]);
    if (!o || !oyunAcik(o)) return (location.hash = "salon");
    document.title = `${o.ad} · Python Atölyesi Junior`;
    return oyunSayfasi(root, o);
  }
  if (h === "sertifika") {
    if (durakDurumu("sertifika") === "kilitli") return (location.hash = "harita");
    document.title = "Sertifika · Python Atölyesi Junior";
    return sertifikaSayfasi(root);
  }
  harita(root);
}
addEventListener("hashchange", route);
if (bulut.mod === "bulut") {
  root.innerHTML = '<p class="acilis">Yükleniyor…</p>';
  bulutBaslat().finally(route);
} else route();
