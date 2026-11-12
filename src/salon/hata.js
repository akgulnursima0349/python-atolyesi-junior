/* Hata Avcısı (Dünya 3'ten sonra): hatalı satıra dokun. */
import { el, $$, hl, STAR } from "../core/ui.js";
import { sfx } from "../core/sound.js";
import { sec, sayac } from "./ortak.js";

/* h: hatalı satırın sırası, n: bulununca Bit'in açıklaması */
const HAVUZ = [
  { kod: ["sayi = 8", "if sayi > 5", '    print("Büyük")'], h: 1, n: "Satırın sonunda <b>:</b> eksik!" },
  { kod: ['renk = "kırmızı"', 'if renk = "kırmızı":', '    print("Dur!")'], h: 1, n: "Karşılaştırma <b>==</b> ile yapılır!" },
  { kod: ["puan = 90", "if puan > 50:", 'print("Harika")'], h: 2, n: "Bu satır <b>4 boşluk içeride</b> olmalı!" },
  { kod: ['ad = "Bit"', 'print("Merhaba)'], h: 1, n: "Tırnak <b>kapanmamış</b>!" },
  { kod: ['Print("Selam")', 'print("Nasılsın?")'], h: 0, n: "<b>print</b> küçük harfle yazılır!" },
  { kod: ["hiz = 3", "print(hız)"], h: 1, n: "Kutunun adı <b>hiz</b>, burada hız yazılmış!" },
  { kod: ["for i in range(3)", '    print("Zıpla")'], h: 0, n: "for satırının sonunda <b>:</b> eksik!" },
  { kod: ['hava = "güneşli"', 'if hava == "güneşli":', '    print("Şapka tak")', "else", '    print("Şemsiye al")'], h: 3, n: "<b>else</b> sonunda da <b>:</b> olmalı!" },
  { kod: ["sayi = 4", "if sayi > 10:", '    print("Büyük")', "  else:", '    print("Küçük")'], h: 3, n: "<b>else</b>, if ile aynı hizada durur!" },
  { kod: ['sepet = ["elma", "muz"', "print(sepet)"], h: 0, n: "Köşeli parantez <b>]</b> kapanmamış!" }
];

function ekran(p) {
  return (ctx) => {
    const say = sayac();
    const f = ctx.frame("Kodda bir hata var. Hatalı <b>satıra dokun</b>!");
    f.grid.classList.add("one");
    const wrap = el("div", "bug-wrap");
    const c = el("div", "code bug-code");
    p.kod.forEach((s, k) => {
      const b = el("button", "ln bugline", hl(s));
      b.dataset.k = k;
      b.onclick = () => {
        if (k !== p.h) {
          say.hata(); b.classList.add("nope"); sfx.yanlis();
          ctx.say("Bu satır doğru. <b>Başka yere</b> bak!", "uzgun");
          setTimeout(() => b.classList.remove("nope"), 400); return;
        }
        b.classList.add("found"); sfx.tik(3);
        $$(".bugline", c).forEach((x) => (x.disabled = true));
        ctx.say(p.n, "vay"); f.done(say.yildiz(), STAR + " hata avlandı");
      };
      c.append(b);
    });
    wrap.append(c);
    f.grid.append(wrap);
  };
}

export const hataOyunu = { id: "hata", ad: "Hata Avcısı", ikon: "bocek", renk: "#ff9d7a", dunya: "karar", tur: () => sec(HAVUZ, 4).map(ekran) };
