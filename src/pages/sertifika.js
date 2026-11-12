/* Kurs sonu sertifikası: ad bu cihazda saklanır, yazdırma görünümü A4 yatay tek sayfa. */
import { el, $, confetti } from "../core/ui.js";
import { say, bitSvg } from "../core/bit.js";
import { sfx, soundButton } from "../core/sound.js";
import { store } from "../core/store.js";
import { WORLDS } from "../worlds/index.js";
import { gorsel, gorselEtiketi } from "../core/gorseller.js";
import { ikon } from "../core/ikon.js";

const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export function sertifikaSayfasi(root) {
  root.innerHTML = "";
  const top = el("header", "m-top no-print", '<a class="back" href="#harita">← Harita</a><div class="brand">Sertifika</div>');
  top.append(soundButton());
  const card = el("main", "card cert-wrap");
  root.append(top, card);

  function adSor(mesaj) {
    card.classList.add("narrow");
    card.innerHTML = "";
    card.append(say(mesaj || "Sertifikana hangi ad yazılsın?", "mutlu"));
    const form = el("form", "t-form", `<label for="c-ad">Adın ve soyadın</label>
      <div class="row"><input id="c-ad" maxlength="40" autocomplete="off" value="${esc(store.ad())}"><button class="btn">Hazırla ➜</button></div>`);
    form.onsubmit = (e) => {
      e.preventDefault();
      const v = $("#c-ad", form).value.trim();
      if (v.length < 2) { sfx.yanlis(); return adSor("Adını yazmayı <b>unutma</b>!"); }
      store.setAd(v); sfx.dogru(); confetti(); goster();
    };
    card.append(form);
    $("#c-ad", card).focus({ preventScroll: true });
  }

  function goster() {
    card.classList.remove("narrow");
    card.innerHTML = "";
    const ust = el("div", "no-print");
    ust.append(say(`Tebrikler <b>${esc(store.ad())}</b>! Sertifikan hazır.`, "vay"));
    card.append(ust);
    const tarih = new Date().toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" });
    const resim = gorselEtiketi("sertifika", "cert-art").replace('loading="lazy"', 'loading="eager"'); // yazdırırken hazır olsun
    const cert = el("section", "cert" + (resim ? " resimli" : ""));
    cert.setAttribute("aria-label", "Sertifika");
    cert.innerHTML = `
      ${resim}
      <div class="cert-in">
        <div class="cert-top">${bitSvg("vay", "bit cert-bit")}${gorsel("logo") ? `<img class="cert-logo" src="${gorsel("logo")}" alt="">` : ""}<div><p class="cert-kicker">Sivas Robotik Akademi · Başarı Sertifikası</p><p class="cert-course">Python Atölyesi <span>Junior</span></p></div></div>
        <p class="cert-small">Bu sertifika</p>
        <h2 class="cert-name">${esc(store.ad())}</h2>
        <p class="cert-text">adlı öğrencinin <b>10 dünyanın hepsini</b> bitirip <b>${store.totalStars()} yıldız</b> topladığını gösterir.</p>
        <div class="cert-worlds" aria-hidden="true">${WORLDS.map((w) => `<span style="--c:${w.color}">${ikon(w.icon)}</span>`).join("")}</div>
        <div class="cert-foot"><div><b>${tarih}</b><span>Tarih</span></div><div><b class="sign"></b><span>Eğitmen</span></div></div>
      </div>`;
    card.append(cert);
    const a = el("div", "actions center no-print");
    const yaz = el("button", "btn", ikon("yazici") + "Yazdır");
    yaz.onclick = () => window.print();
    const degis = el("button", "btn sec", "Adı değiştir");
    degis.onclick = () => adSor();
    const geri = el("a", "btn sec", "Haritaya dön"); geri.href = "#harita";
    a.append(yaz, degis, geri);
    card.append(a, el("p", "cert-tip no-print", "Tablette: Yazdır → <b>PDF olarak kaydet</b>."));
  }

  store.ad() ? goster() : adSor();
}
