/* Başlangıç ve bitiş testi: ekran başına bir soru, doğru/yanlış gösterilmez (ölçüyoruz).
   Her cevap hemen kaydedilir; sayfa yenilenirse kalınan sorudan devam edilir. */
import { el, $, hl, wait, confetti } from "../core/ui.js";
import { say, bitSvg } from "../core/bit.js";
import { sfx, soundButton } from "../core/sound.js";
import { store } from "../core/store.js";
import { FORM } from "../data/testler.js";

const AD = { on: "Başlangıç testi", son: "Bitiş testi" };
const HARF = ["A", "B", "C", "D"];

export function testSayfasi(root, tur) {
  const sorular = FORM[tur];
  const kayit = store.test(tur);
  let cevaplar = kayit && !kayit.bitti ? [...kayit.cevaplar] : [];
  let mesgul = false;

  root.innerHTML = "";
  const top = el("header", "w-top");
  const back = el("a", "back", "← <span>Harita</span>"); back.href = "#harita"; back.setAttribute("aria-label", "Haritaya dön");
  const title = el("div", "w-title", `<span>${tur === "on" ? "Başlarken" : "Bitirirken"}</span>${AD[tur]}`);
  const dots = el("div", "dots");
  top.append(back, title, dots, soundButton());
  const card = el("main", "card test-card");
  root.append(top, card);

  const drawDots = () => {
    dots.innerHTML = sorular.map((_, i) => `<span class="dot ${i < cevaplar.length ? "on" : i === cevaplar.length ? "now" : ""}"></span>`).join("");
  };

  function giris() {
    drawDots();
    card.innerHTML = "";
    const devam = cevaplar.length > 0;
    card.append(say(devam ? `Kaldığın yerden devam: <b>${cevaplar.length + 1}. soru</b>.`
      : tur === "on" ? "Önce <b>12 kısa soru</b>. Bilmiyorsan <b>Bilmiyorum</b>'a bas!"
        : "Son kez <b>12 soru</b>. Bakalım ne kadar öğrendin!", "mutlu"));
    const kutu = el("div", "t-intro");
    kutu.innerHTML = `${bitSvg("vay", "bit bit-xl")}<div class="t-rules"><span>❓ 12 soru</span><span>🤷 Bilmiyorum serbest</span><span>⏱️ Acele yok</span></div>`;
    const a = el("div", "actions center");
    const b = el("button", "btn", devam ? "Devam et ➜" : "Başla ➜");
    b.onclick = soru;
    a.append(b);
    card.append(kutu, a);
    b.focus({ preventScroll: true });
  }

  function soru() {
    const i = cevaplar.length;
    if (i >= sorular.length) return bitir();
    drawDots();
    const s = sorular[i];
    card.innerHTML = "";
    card.append(say(s.soru, "mutlu"));
    const govde = el("div", "t-body");
    const no = el("div", "t-no", `${i + 1} / ${sorular.length}`);
    govde.append(no);
    if (s.kod) {
      const c = el("div", "code t-code");
      c.setAttribute("aria-label", "Python kodu: " + s.kod.join(" / "));
      s.kod.forEach((l) => c.append(el("div", "ln", hl(l) || " ")));
      govde.append(c);
    }
    if (s.resim) govde.append(el("div", "t-pic", s.resim));
    const opts = el("div", "t-opts");
    opts.setAttribute("role", "group");
    opts.setAttribute("aria-label", "Seçenekler");
    s.secenek.forEach((t, k) => {
      const b = el("button", "t-opt", `<i>${HARF[k]}</i><span>${t.replace(/</g, "&lt;")}</span>`);
      b.onclick = () => sec(k, b);
      opts.append(b);
    });
    const bilmem = el("button", "btn sec t-idk", "🤷 Bilmiyorum");
    bilmem.onclick = () => sec(-1, bilmem);
    govde.append(opts);
    const alt = el("div", "actions center");
    alt.append(bilmem);
    card.append(govde, alt);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function sec(k, b) {
    if (mesgul) return;
    mesgul = true;
    b.classList.add("picked");
    $$all(".t-opt, .t-idk").forEach((x) => (x.disabled = true));
    sfx.tik(cevaplar.length % 6);
    cevaplar.push(k);
    store.testKaydet(tur, cevaplar, cevaplar.length >= sorular.length);
    await wait(320);
    mesgul = false;
    soru();
  }
  const $$all = (s) => [...card.querySelectorAll(s)];

  function bitir() {
    drawDots();
    if (tur === "son") { confetti(); sfx.dogru(); location.hash = "sonuc"; return; }
    card.innerHTML = "";
    sfx.dogru();
    card.append(say("Teşekkürler! Kursun sonunda <b>tekrar soracağım</b>.", "vay"));
    const end = el("div", "end");
    end.innerHTML = `${bitSvg("vay", "bit bit-xl")}<h2>Hazırsın!</h2><p class="t-sub">Şimdi <b>Dünya 1</b> açıldı. Maceraya başla!</p>
      <div class="actions center"><a class="btn" href="#harita">Haritaya dön ➜</a></div>`;
    card.append(end);
  }

  /* bitmiş test yeniden çözülmez: sonuca ya da haritaya gider */
  if (kayit && kayit.bitti) { location.hash = tur === "son" ? "sonuc" : "harita"; return; }
  giris();
}
