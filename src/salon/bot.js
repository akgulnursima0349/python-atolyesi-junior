/* Sohbet Botu (Dünya 6'dan sonra): botun fonksiyonunu oku, mesaja ne cevap vereceğini seç. */
import { wait } from "../core/ui.js";
import { sfx } from "../core/sound.js";
import { tahminEkrani } from "../core/kaliplar.js";
import { sec, sayac, esc } from "./ortak.js";

const KOD = [
  "def cevap(mesaj):",
  "    mesaj = mesaj.lower()",
  '    if "merhaba" in mesaj:',
  '        return "Selam! 👋"',
  '    elif "nasılsın" in mesaj:',
  '        return "Harikayım! 🤖"',
  '    elif "şaka" in mesaj:',
  '        return "Bip bop, şaka! 😄"',
  "    else:",
  '        return "Anlamadım 🤔"'
];
const CEVAP = ["Selam! 👋", "Harikayım! 🤖", "Bip bop, şaka! 😄", "Anlamadım 🤔"];
const KURAL = ["merhaba", "nasılsın", "şaka"];
const SATIR = [[2, 3], [4, 5], [6, 7], [8, 9]];

const MESAJ = ["Merhaba Bit!", "bugün nasılsın?", "MERHABA", "bana bir şaka yap", "hava nasıl?", "merhaba, nasılsın?", "Şaka bilir misin?", "selam", "Nasılsın bakalım"];

/* botun gerçek davranışı (Python koduyla aynı sıra) */
const cevapNo = (m) => { const k = m.toLocaleLowerCase("tr"); const i = KURAL.findIndex((w) => k.includes(w)); return i < 0 ? 3 : i; };

function ipucu(m, secilen) {
  const dogru = cevapNo(m), kucuk = m.toLocaleLowerCase("tr");
  if (dogru < 3 && secilen === 3) return m !== kucuk ? "<b>.lower()</b> önce bütün harfleri küçültür!" : "<b>in</b>, kelimeyi cümlenin <b>içinde</b> de bulur!";
  if (secilen < 3 && !kucuk.includes(KURAL[secilen])) return `Mesajda <b>${KURAL[secilen]}</b> kelimesi tam olarak yok!`;
  if (secilen > dogru) return "Python <b>yukarıdan</b> başlar, ilk uyan kural kazanır!";
  return "Mesajda hangi kelime var? <b>Tekrar</b> bak!";
}

function ekran(m) {
  return (ctx) => {
    const say = sayac(), d = cevapNo(m);
    tahminEkrani(ctx, {
      soru: "Bot bu mesaja <b>ne</b> cevap verir?",
      kod: KOD,
      sahne: (st) => { st.innerHTML = `<div class="chat"><div class="msg-sen">${esc(m)}</div><div class="msg-bot bekle">…</div></div>`; },
      secenekler: CEVAP.map((t, i) => ({ t, dogru: i === d, ipucu: ipucu(m, i), genis: true })),
      oynat: async (cp, st) => {
        for (const i of [0, 1, ...SATIR.slice(0, d).map((s) => s[0]), ...SATIR[d]]) { cp.line(i); sfx.tik(i % 6); await wait(230); }
        cp.line(-1); cp.print(CEVAP[d]);
        const b = st.querySelector(".msg-bot"); b.classList.remove("bekle"); b.textContent = CEVAP[d];
      },
      yanlis: say.hata,
      basari: "Doğru! Bot kuralları <b>sırayla</b> denedi.",
      rozet: "bot okuyucu", yildiz: say.yildiz
    });
  };
}

export const bot = { id: "bot", ad: "Sohbet Botu", ikon: "💬", renk: "#7fc8ff", dunya: "fonk", tur: () => sec(MESAJ, 4).map(ekran) };
