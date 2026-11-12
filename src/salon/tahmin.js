/* Çıktıyı Tahmin Et (Dünya 2'den sonra): kodu oku, ekranda ne çıkacağını seç. */
import { wait } from "../core/ui.js";
import { sfx } from "../core/sound.js";
import { tahminEkrani } from "../core/kaliplar.js";
import { karistir, sec, sayac } from "./ortak.js";

/* d: doğru; y: [yanlış seçenek, o yanlışa özel ipucu] */
const HAVUZ = [
  { kod: ['print("3" + "3")'], d: "33", y: [["6", "Tırnak varsa <b>metin</b>: yan yana yapışır!"], ["Hata verir", "Metinler <b>+</b> ile birleşebilir!"]] },
  { kod: ["print(3 + 3)"], d: "6", y: [["33", "Tırnak yok, bunlar <b>sayı</b>. Gerçekten toplar!"], ["3 + 3", "Python işlemi <b>yapar</b>, sonucu yazar!"]] },
  { kod: ['print("ha" * 3)'], d: "hahaha", y: [["ha3", "Metin × sayı: metin o kadar <b>tekrarlanır</b>!"], ["Hata verir", "Metin sayıyla <b>çarpılabilir</b>!"]] },
  { kod: ["x = 5", "x = x + 2", "print(x)"], d: "7", y: [["5", "İkinci satır kutuyu <b>değiştirdi</b>!"], ["x + 2", "Kutunun <b>içindeki</b> sayıya bak!"]] },
  { kod: ['ad = "Ece"', 'print("Merhaba " + ad)'], d: "Merhaba Ece", y: [["Merhaba ad", "<b>ad</b> tırnaksız, yani kutunun içi yazılır!"], ["Merhaba + ad", "<b>+</b> metinleri birleştirir!"]] },
  { kod: ["print(2 * 5)"], d: "10", y: [["25", "<b>*</b> çarpma işareti!"], ["2 * 5", "Python işlemi <b>yapar</b>, sonucu yazar!"]] },
  { kod: ["a = 4", "b = a", "a = 9", "print(b)"], d: "4", y: [["9", "b, a'nın <b>o anki</b> değerini aldı!"], ["a", "Kutunun <b>içi</b> yazılır, adı değil!"]] },
  { kod: ['print("Bit" + "!")'], d: "Bit!", y: [["Bit + !", "<b>+</b> metinleri yapıştırır!"], ["Bit", "Ünlem de <b>eklenir</b>!"]] },
  { kod: ["puan = 10", "puan = puan * 2", "print(puan)"], d: "20", y: [["10", "İkinci satır puanı <b>ikiye</b> katladı!"], ["12", "<b>*</b> çarpma, toplama değil!"]] }
];

function ekran(p) {
  return (ctx) => {
    const say = sayac();
    const secenekler = karistir([{ t: p.d, dogru: true }, ...p.y.map(([t, ipucu]) => ({ t, ipucu }))]);
    tahminEkrani(ctx, {
      soru: "Bu kod ekrana <b>ne</b> yazar?",
      kod: p.kod, secenekler,
      sahne: (st) => { st.innerHTML = '<div class="big-q" aria-hidden="true">❓</div>'; },
      oynat: async (cp, st) => {
        for (let i = 0; i < p.kod.length; i++) { cp.line(i); sfx.tik(i); await wait(260); }
        cp.line(-1); cp.print(p.d);
        st.innerHTML = `<div class="big-q win">${p.d.replace(/</g, "&lt;")}</div>`;
      },
      yanlis: say.hata,
      basari: "Doğru! Python da <b>aynısını</b> yazdı.",
      rozet: "doğru tahmin", yildiz: say.yildiz
    });
  };
}

export const tahminOyunu = { id: "tahmin", ad: "Çıktıyı Tahmin Et", ikon: "🔮", renk: "#ffd84d", dunya: "ilk", tur: () => sec(HAVUZ, 5).map(ekran) };
