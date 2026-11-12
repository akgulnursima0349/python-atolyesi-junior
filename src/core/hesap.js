/* Üst şeritteki hesap parçası: öğrencinin takma adı ve kayıt durumu, öğretmende Panel; ikisinde de Çıkış. */
import { ikon } from "./ikon.js";
import { el } from "./ui.js";
import { bulut, bulutDinle, cikis } from "../cloud/bulut.js";

const DURUM = {
  kaydedildi: ["✓", "İlerlemen kaydedildi"],
  kaydediliyor: ["…", "Kaydediliyor"],
  hata: ["!", "Kaydedilemedi, tekrar denenecek"],
  hazir: ["", ""]
};

export function hesapParcasi({ panel = true } = {}) {
  if (bulut.mod !== "bulut" || !bulut.ben.rol) return null;
  const k = el("div", "hesap");
  const cik = el("button", "hesap-cik", ikon("cikis") + "<span>Çıkış</span>");
  cik.onclick = async () => { cik.disabled = true; await cikis(); location.hash = "giris"; };
  if (bulut.ben.rol === "ogrenci") {
    const ad = el("span", "hesap-ad");
    ad.textContent = bulut.ben.takma_ad;
    const d = el("span", "hesap-durum");
    const ciz = () => {
      if (!d.isConnected && k.dataset.bagli) return sil();
      const [i, t] = DURUM[bulut.durum] || DURUM.hazir;
      d.dataset.d = bulut.durum; d.textContent = i; d.title = bulut.durum === "hata" ? bulut.hata || t : t; d.setAttribute("aria-label", t);
    };
    const sil = bulutDinle(ciz);
    ciz(); k.dataset.bagli = "1";
    k.append(el("span", "hesap-ikon", ikon("kisi")), ad, d);
  } else if (panel) {
    const p = el("a", "hesap-panel", ikon("panel") + "Panel"); p.href = "#panel";
    k.append(p);
  }
  k.append(cik);
  return k;
}
