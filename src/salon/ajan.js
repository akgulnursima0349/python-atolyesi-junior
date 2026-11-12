/* Gizli Ajan (Dünya 5'ten sonra): harf vagonlarından şifreli mesajı çöz. Kod hangi vagon numaralarını istiyorsa sırayla dokun. */
import { el, $, $$, wait, STAR } from "../core/ui.js";
import { sfx } from "../core/sound.js";
import { karistir, sec, sayac } from "./ortak.js";

const KELIME = ["kedi", "elma", "kalem", "kitap", "deniz", "güneş", "zeka", "limon", "fare", "uçak"];
const HARFLER = "abcçdefghıijklmnoöprsştuüvyz";

/* sondanMi: kelimenin bir harfi listenin sonuna konur ve h[-1] ile istenir */
function soru(kelime, sondanMi) {
  const harf = [...kelime];
  const tuzak = karistir([...HARFLER].filter((h) => !harf.includes(h))).slice(0, 2);
  let liste = karistir([...harf, ...tuzak]);
  let sondaki = null;
  if (sondanMi) {
    sondaki = harf[Math.floor(Math.random() * harf.length)];
    liste = [...liste.filter((h) => h !== sondaki), sondaki];
  }
  const istek = harf.map((h) => (h === sondaki ? -1 : liste.indexOf(h)));
  return { kelime, liste, istek };
}

function ekran(kelime, sondanMi) {
  return (ctx) => {
    const say = sayac();
    const q = soru(kelime, sondanMi);
    const f = ctx.frame(sondanMi ? "Dikkat: <b>h[-1]</b> sondaki vagon demek!" : "Kod hangi vagonları istiyor? Onlara <b>sırayla</b> dokun!");
    f.grid.classList.add("one");
    const st = el("div", "stage col ajan");
    const slot = (i) => `<span class="aj-slot" data-s="${i}"><code>h[${i}]</code><b></b></span>`;
    st.innerHTML = `<div class="aj-code" aria-label="Kod: print, harfleri birleştir"><span class="kw-p">print(</span>${q.istek.map((i) => slot(i)).join('<span class="aj-plus">+</span>')}<span class="kw-p">)</span></div>
      <div class="aj-train" role="group" aria-label="Harf vagonları">${q.liste.map((h, i) => `<button class="aj-wagon" data-i="${i}"><small>${i}</small><span>${h}</span></button>`).join("")}</div>
      <div class="aj-msg" aria-live="polite"></div>`;
    f.grid.append(st);
    let at = 0;
    $$(".aj-wagon", st).forEach((b) => {
      b.onclick = async () => {
        if (at >= q.istek.length) return;
        const i = +b.dataset.i, iste = q.istek[at];
        const hedefI = iste < 0 ? q.liste.length + iste : iste;
        if (i !== hedefI) {
          say.hata(); sfx.yanlis(); b.classList.add("nope"); setTimeout(() => b.classList.remove("nope"), 400);
          ctx.say(iste < 0 ? "<b>-1</b>: listenin <b>en sonundaki</b> vagon!" : `Vagon numaraları <b>0</b>'dan başlar. <b>${iste}</b> numarayı bul!`, "uzgun");
          return;
        }
        const s = $$(".aj-slot", st)[at];
        $("b", s).textContent = q.liste[i]; s.classList.add("dolu");
        b.classList.add("hop"); setTimeout(() => b.classList.remove("hop"), 250);
        sfx.tik(at); at++;
        if (at === q.istek.length) {
          $$(".aj-wagon", st).forEach((x) => (x.disabled = true));
          await wait(250);
          $(".aj-msg", st).innerHTML = `Gizli mesaj: <b>${q.kelime}</b>`;
          ctx.say("Şifre çözüldü! Harika bir <b>ajansın</b>.", "vay");
          f.done(say.yildiz(), STAR + " şifre çözüldü");
        } else if (at === 1) ctx.say("Güzel! Sıradaki <b>numaraya</b> bak.");
      };
    });
  };
}

export const ajan = {
  id: "ajan", ad: "Gizli Ajan", ikon: "🕵️", renk: "#7fd6d1", dunya: "liste",
  tur: () => sec(KELIME, 3).map((k, i) => ekran(k, i === 2))
};
