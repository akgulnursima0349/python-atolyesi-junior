/* Oyun Salonu sayfası ve bir oyunun turu. */
import { el, $, stars, confetti } from "../core/ui.js";
import { say, bitSvg } from "../core/bit.js";
import { sfx, soundButton } from "../core/sound.js";
import { store } from "../core/store.js";
import { playWorld } from "../core/engine.js";
import { gorselEtiketi } from "../core/gorseller.js";
import { ikon } from "../core/ikon.js";
import { OYUNLAR, oyunAcik, oyunDunyasi } from "../salon/index.js";

const KILIT = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="11" width="14" height="10" rx="2.5" fill="currentColor"/><path d="M8 11V8a4 4 0 0 1 8 0v3" stroke="currentColor" stroke-width="2.4" fill="none"/></svg>';

export function salonSayfasi(root) {
  root.innerHTML = "";
  const top = el("header", "m-top", '<a class="back" href="#harita">← Harita</a><div class="brand">Oyun <span>Salonu</span></div>');
  top.append(soundButton());
  const card = el("main", "card salon");
  root.append(top, card);
  const acikSay = OYUNLAR.filter(oyunAcik).length;
  card.append(say(acikSay === OYUNLAR.length ? "Bütün oyunlar açık! Hangisini <b>oynayalım</b>?" : "Her dünya bitince <b>yeni bir oyun</b> açılır!", "mutlu"));
  const grid = el("div", "salon-grid");
  OYUNLAR.forEach((o) => {
    const acik = oyunAcik(o), w = oyunDunyasi(o), kayit = store.oyun(o.id);
    const kart = el(acik ? "a" : "button", "oyun-kart" + (acik ? "" : " kilitli"));
    kart.style.setProperty("--c", o.renk);
    kart.dataset.oyun = o.id;
    const resim = gorselEtiketi("oyun-" + o.id, "oyun-resim");
    kart.innerHTML = `<span class="oyun-ust">${resim || `<span class="oyun-ikon">${acik ? ikon(o.ikon) : KILIT}</span>`}</span>
      <span class="oyun-ad">${o.ad}</span>
      <span class="oyun-alt">${acik ? (kayit.tur ? `En iyi: ${stars(kayit.en)}${kayit.en ? "" : "–"}` : "Yeni!") : `Dünya ${w.no} bitince açılır`}</span>`;
    if (acik) kart.href = "#oyun-" + o.id;
    else kart.onclick = () => { sfx.yanlis(); $(".say", card).replaceWith(say(`Bu oyun <b>${w.title}</b> bitince açılır.`, "uzgun")); };
    kart.setAttribute("aria-label", `${o.ad}${acik ? "" : ", kilitli"}`);
    grid.append(kart);
  });
  card.append(grid);
}

export function oyunSayfasi(root, o) {
  const tur = {
    id: "oyun-" + o.id, title: o.ad, ust: "Oyun Salonu",
    geri: { href: "#salon", ad: "Salon", aria: "Oyun Salonu'na dön" },
    screens: o.tur(),
    bitis(card, yildiz, tekrar) {
      const n = tur.screens.length, onceki = store.oyun(o.id).en;
      store.oyunKaydet(o.id, yildiz);
      const rekor = yildiz > onceki && store.oyun(o.id).tur > 1;
      const mood = yildiz === n ? "vay" : "mutlu";
      card.innerHTML = `<div class="end">${bitSvg(mood, "bit bit-xl")}
        <h2>${yildiz === n ? "Kusursuz tur!" : yildiz >= n / 2 ? "Güzel tur!" : "Tur bitti!"}</h2>
        <p class="end-stars">${stars(yildiz)} <b>${yildiz} / ${n} yıldız</b></p>
        <p class="t-sub">${rekor ? "Yeni <b>rekor</b>!" : yildiz === n ? "Hepsini <b>ilk denemede</b> bildin." : "İlk denemede bilinen her soru bir yıldız."}</p>
        <div class="actions center"><button class="btn" id="birDaha">🔁 Bir tur daha</button><a class="btn sec" href="#salon">Oyun Salonu</a></div></div>`;
      if (yildiz === n) confetti();
      sfx.dogru();
      $("#birDaha", card).onclick = () => { tur.screens = o.tur(); tekrar(); };
    }
  };
  playWorld(tur, root);
}
