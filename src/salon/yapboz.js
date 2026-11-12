/* Kod Yapbozu (Dünya 1'den sonra): karışık satırları doğru sıraya diz. Ekranda çıkması gereken yazı hedef olarak görünür. */
import { hl, wait } from "../core/ui.js";
import { sfx } from "../core/sound.js";
import { siralaEkrani } from "../core/kaliplar.js";
import { karistir, sec, sayac, esc } from "./ortak.js";

const HAVUZ = [
  { kod: ['print("1. Uyan")', 'print("2. Dişlerini fırçala")', 'print("3. Okula git")'], cikti: ["1. Uyan", "2. Dişlerini fırçala", "3. Okula git"],
    ipucu: "Bilgisayar satırları <b>yukarıdan aşağı</b> çalıştırır!" },
  { kod: ["pil = 100", "pil = pil - 30", "print(pil)"], cikti: ["70"],
    ipucu: "Kutuyu kullanmadan önce <b>oluşturmalısın</b>!" },
  { kod: ["for i in range(3):", '    print("Zıpla")', 'print("Bitti")'], cikti: ["Zıpla", "Zıpla", "Zıpla", "Bitti"],
    ipucu: "Döngü <b>önce</b> gelir, içindeki satır hemen altında!" },
  { kod: ["sicaklik = 30", "if sicaklik > 25:", '    print("Fan açık")'], cikti: ["Fan açık"],
    ipucu: "Önce sıcaklık kutusu, sonra <b>if</b>, en son içerisi!" },
  { kod: ['ad = "Bit"', 'selam = "Merhaba " + ad', "print(selam)"], cikti: ["Merhaba Bit"],
    ipucu: "<b>ad</b> kutusu olmadan selam kurulamaz!" },
  { kod: ['sepet = ["elma"]', 'sepet.append("muz")', "print(sepet)"], cikti: ["['elma', 'muz']"],
    ipucu: "Önce sepet olmalı, sonra içine <b>ekle</b>!" },
  { kod: ["def selam():", '    print("Selam!")', "selam()"], cikti: ["Selam!"],
    ipucu: "Önce fonksiyonu <b>tanımla</b>, sonra çağır!" },
  { kod: ["toplam = 0", "for s in [2, 3, 5]:", "    toplam = toplam + s", "print(toplam)"], cikti: ["10"],
    ipucu: "<b>toplam = 0</b> en başta, print en sonda!" }
];

function ekran(p) {
  return (ctx) => {
    const say = sayac();
    let karisik;
    do karisik = karistir(p.kod.map((_, i) => i)); while (karisik.every((v, i) => v === i));
    const { f } = siralaEkrani(ctx, {
      soru: "Satırları doğru <b>sıraya</b> diz, hedef yazıyı çıkar!",
      kartlar: p.kod.map((l) => hl(l)), karisik, kod: true,
      sahne: (st) => {
        st.innerHTML = `<div class="hedef-cikti"><span class="out-label">Ekranda çıkmalı</span>${p.cikti.map((l) => `<div>${esc(l)}</div>`).join("")}</div>`;
      },
      calistir: async (secilen, st) => {
        if (!secilen.every((v, i) => v === i)) { say.hata(); ctx.say(p.ipucu, "uzgun"); return false; }
        const kutu = st.querySelector(".hedef-cikti");
        kutu.classList.add("tamam");
        for (const d of kutu.querySelectorAll("div")) { d.classList.add("yandi"); sfx.tik(2); await wait(220); }
        return true;
      },
      basari: "Kod <b>çalıştı</b>! Ekran tam istediğimiz gibi.",
      rozet: "yapboz çözüldü", yildiz: say.yildiz
    });
    f.grid.classList.add("yap");
  };
}

export const yapboz = { id: "yapboz", ad: "Kod Yapbozu", ikon: "🧩", renk: "#8fd694", dunya: "dil", tur: () => sec(HAVUZ, 3).map(ekran) };
