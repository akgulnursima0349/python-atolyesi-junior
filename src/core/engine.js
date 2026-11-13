/* Ekran motoru: bir dünyanın ekranlarını sırayla oynatır.
   Her ekran bir fonksiyondur: (ctx) => void.  ctx.frame(cümle, ruh) ekranı kurar ve şunu döndürür:
     { grid, actions, next, done(yıldız, rozet) }
   "Devam" düğmesi yalnızca done() çağrılınca görünür. */
import { el, $, wait, stars, STAR, confetti } from "./ui.js";
import { say, bitSvg } from "./bit.js";
import { sfx, soundButton } from "./sound.js";
import { store } from "./store.js";
import { gorselEtiketi } from "./gorseller.js";

export function playWorld(world, root, opts = {}) {
  let at = 0, kazanilan = 0;
  /* her ekranın yıldızı bir kez tutulur: geri dönüp tekrar bitirmek yıldızı artırmaz */
  /* anahtar: "ekran:çerçeve" (bir ekran birkaç tur çerçeve açabilir, her turun yıldızı ayrı) */
  let puan = {}, cerceve = 0;
  const topla = () => { kazanilan = Object.values(puan).reduce((t, n) => t + n, 0); };
  root.innerHTML = "";
  const top = el("header", "w-top");
  const geri = world.geri || { href: "#harita", ad: "Harita", aria: "Haritaya dön" };
  const back = el("a", "back", `← <span>${geri.ad}</span>`); back.href = geri.href; back.setAttribute("aria-label", geri.aria);
  const title = el("div", "w-title", `<span>${world.ust || "Dünya " + world.no}</span>${world.title}`);
  const dots = el("div", "dots"), sc = el("div", "score");
  top.append(back, title, dots, sc, soundButton());
  const card = el("main", "card");
  root.append(top, card);

  const drawTop = () => {
    dots.innerHTML = world.screens.map((_, i) => `<span class="dot ${i < at ? "on" : i === at ? "now" : ""}"></span>`).join("");
    sc.innerHTML = STAR + `<span>${kazanilan}</span>`;
  };

  const ctx = {
    card,
    get stars() { return kazanilan; },
    frame(text, mood) {
      const anahtar = at + ":" + cerceve++;
      card.innerHTML = "";
      card.append(say(text, mood));
      const grid = el("div", "grid"), actions = el("div", "actions");
      const next = el("button", "btn next", "Devam ➜");
      next.hidden = true;
      next.onclick = () => go(at + 1);
      card.append(grid, actions);
      actions.append(next);
      if (at > 0 && !world.bitis) {
        const geriB = el("button", "btn sec geri-btn", "← Geri");
        geriB.setAttribute("aria-label", "Önceki ekrana dön");
        geriB.onclick = () => go(at - 1);
        actions.append(geriB);
      }
      if (puan[anahtar] !== undefined) next.hidden = false; // daha önce bitirilmiş ekran
      let bitti = false;
      const done = (n = 1, rozet) => {
        if (!bitti) {
          bitti = true; puan[anahtar] = Math.max(puan[anahtar] || 0, n); topla(); drawTop(); sfx.dogru();
          if (rozet) actions.insertBefore(el("span", "badge", rozet), next);
        }
        next.hidden = false;
        next.focus({ preventScroll: true });
      };
      return { grid, actions, next, done };
    },
    /* Bit'in cümlesini değiştir */
    say(text, mood) { const old = $(".say", card); if (old) old.replaceWith(say(text, mood)); },
    redo: () => go(at),
    next: () => go(at + 1)
  };

  function go(i) {
    at = i; cerceve = 0;
    if (at >= world.screens.length) return finish();
    drawTop();
    world.screens[at](ctx);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function finish() {
    if (world.bitis) {
      dots.innerHTML = world.screens.map(() => '<span class="dot on"></span>').join("");
      return world.bitis(card, kazanilan, () => { puan = {}; topla(); go(0); });
    }
    store.completeWorld(world.id, kazanilan);
    dots.innerHTML = world.screens.map(() => '<span class="dot on"></span>').join("");
    const kapak = gorselEtiketi("dunya-" + world.no, "end-cover").replace('loading="lazy"', 'loading="eager"');
    card.innerHTML = `<div class="end">${kapak || bitSvg("vay", "bit bit-xl")}
      <h2>${world.title} bitti!</h2>
      <p class="end-stars">${stars(Math.min(kazanilan, 10))} <b>${kazanilan} yıldız</b></p>
      <ul>${(world.ozet || []).map((s) => `<li>${s}</li>`).join("")}</ul>
      ${opts.sonEk ? opts.sonEk(world) : ""}
      <div class="actions center"><a class="btn" href="#harita">Haritaya dön ➜</a><button class="btn sec" id="again">↺ Baştan oyna</button></div></div>`;
    confetti(); sfx.dogru();
    $("#again", card).onclick = () => { puan = {}; topla(); go(0); };
  }

  /* Dünyanın kapısı: kapak görseli, adı ve Başla. Oyun turlarında (bitis tanımlı) yoktur. */
  function kapi() {
    dots.innerHTML = world.screens.map(() => '<span class="dot"></span>').join("");
    sc.innerHTML = STAR + `<span>${kazanilan}</span>`;
    const bitti = store.worldDone(world.id);
    const kapak = gorselEtiketi("dunya-" + world.no, "kapi-kapak").replace('loading="lazy"', 'loading="eager"');
    card.innerHTML = "";
    const k = el("div", "kapi");
    k.innerHTML = `${kapak || bitSvg("mutlu", "bit bit-xl")}
      <p class="kapi-no">Dünya ${world.no}</p>
      <h2>${world.title}</h2>`;
    const b = el("button", "btn kapi-basla", bitti ? "Tekrar oyna ➜" : "Başla ➜");
    b.onclick = () => { sfx.tik(2); go(0); };
    const a = el("div", "actions center"); a.append(b);
    card.append(say(bitti ? `Bu dünyayı <b>bitirdin</b>. İstersen tekrar oyna!` : `<b>${world.screens.length} kısa adım</b> var. Haydi başlayalım!`, "mutlu"), k, a);
    b.focus({ preventScroll: true });
  }

  if (world.bitis) go(0); else kapi();
  return { go };
}
