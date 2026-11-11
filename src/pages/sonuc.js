/* Önce / sonra: başlangıç ve bitiş testinin kazanım kazanım karşılaştırması. */
import { el } from "../core/ui.js";
import { say } from "../core/bit.js";
import { soundButton } from "../core/sound.js";
import { store } from "../core/store.js";
import { KAZANIMLAR, puanla } from "../data/testler.js";

const ISARET = {
  ok: '<span class="r-mark r-ok" role="img" aria-label="Doğru" title="Doğru">✓</span>',
  no: '<span class="r-mark r-no" role="img" aria-label="Yanlış" title="Yanlış">✗</span>',
  idk: '<span class="r-mark r-idk" role="img" aria-label="Bilmiyorum" title="Bilmiyorum">?</span>',
  yok: '<span class="r-mark r-yok" role="img" aria-label="Çözülmedi" title="Çözülmedi">–</span>'
};

function durumlar(tur) {
  const t = store.test(tur);
  if (!t || !t.bitti) return null;
  const p = puanla(tur, t.cevaplar);
  return p.map((d, i) => (d ? "ok" : t.cevaplar[i] === -1 ? "idk" : "no"));
}

export function sonucSayfasi(root) {
  const on = durumlar("on"), son = durumlar("son");
  if (!son) { location.hash = "harita"; return; }
  const say1 = on ? on.filter((x) => x === "ok").length : null, say2 = son.filter((x) => x === "ok").length;

  root.innerHTML = "";
  const top = el("header", "m-top", '<a class="back" href="#harita">← Harita</a><div class="brand">Sonuçlarım</div>');
  top.append(soundButton());
  const card = el("main", "card narrow r-card");
  root.append(top, card);

  const fark = say1 == null ? 0 : say2 - say1;
  card.append(say(say1 == null ? `Bitiş testinde <b>${say2} / 12</b> doğru!`
    : fark > 0 ? `Başta <b>${say1}</b>, şimdi <b>${say2}</b> doğru. Süpersin!`
      : `Başta <b>${say1}</b>, şimdi <b>${say2}</b> doğru. Aferin!`, "vay"));

  const cubuk = (ad, n, cls) => `<div class="r-bar ${cls}"><span class="r-lbl">${ad}</span>
    <span class="r-track"><span class="r-fill" style="--w:${n == null ? 0 : n / 12}"></span></span><b>${n == null ? "–" : n}</b></div>`;
  card.append(el("div", "r-bars", cubuk("Başta", say1, "once") + cubuk("Sonda", say2, "sonra")));

  const tablo = el("div", "r-table");
  tablo.setAttribute("role", "table");
  tablo.innerHTML = `<div class="r-row r-head" role="row"><span role="columnheader">Konu</span><span role="columnheader">Başta</span><span role="columnheader">Sonda</span></div>` +
    KAZANIMLAR.map((k, i) => {
      const a = on ? on[i] : "yok", b = son[i];
      const yeni = a !== "ok" && b === "ok";
      return `<div class="r-row${yeni ? " yeni" : ""}" role="row"><span role="cell"><i>${k.ikon}</i>${k.kisa}</span><span role="cell">${ISARET[a]}</span><span role="cell">${ISARET[b]}</span></div>`;
    }).join("");
  card.append(tablo);
  const yeniSay = KAZANIMLAR.filter((_, i) => (on ? on[i] : "yok") !== "ok" && son[i] === "ok").length;
  if (on && yeniSay) card.append(el("p", "r-note", `<b>${yeniSay}</b> konuyu kurs boyunca yeni öğrendin.`));

  const a = el("div", "actions center");
  a.innerHTML = '<a class="btn" href="#sertifika">🏅 Sertifikanı al</a><a class="btn sec" href="#harita">Haritaya dön</a>';
  card.append(a);
}
