/* Başlangıç (A) ve bitiş (B) testleri: aynı 12 kazanım, eş sorular.
   Soru: { k: kazanım, soru (≤12 kelime), kod?: [satırlar], resim?: html, secenek: [..], dogru: sıra } */

export const KAZANIMLAR = [
  { k: 1, kisa: "Program nedir?", ikon: "📋" },
  { k: 2, kisa: "Bilgisayarın dili", ikon: "💡" },
  { k: 3, kisa: "Değişken ve metin", ikon: "📦" },
  { k: 4, kisa: "Karar (if / else)", ikon: "🔀" },
  { k: 5, kisa: "Döngü (for)", ikon: "🔁" },
  { k: 6, kisa: "Listeler", ikon: "🚃" },
  { k: 7, kisa: "Fonksiyonlar", ikon: "⚙️" },
  { k: 8, kisa: "Hata bulma", ikon: "🐞" },
  { k: 9, kisa: "Sınıf ve nesne", ikon: "🏭" },
  { k: 10, kisa: "Yapay zekâ nasıl öğrenir?", ikon: "🧠" },
  { k: 11, kisa: "Görmediği verilerle sınav", ikon: "📝" },
  { k: 12, kisa: "Model türleri", ikon: "🐧" }
];

const adimlar = (a) => `<div class="t-steps">${a.map((s, i) => `<span><b>${i + 1}</b>${s}</span>`).join("")}</div>`;
const emoji = (s) => `<div class="t-emoji">${s}</div>`;
const satir = (a) => `<div class="t-cards">${a.map(([b, t]) => `<span><b>${b}</b>${t}</span>`).join("")}</div>`;
/* etiketsiz noktalar (tek renk) */
const NOKTA = [[18, 22], [26, 30], [22, 40], [30, 20], [70, 25], [78, 34], [84, 22], [74, 18], [48, 70], [56, 78], [44, 82], [60, 68]];
const noktalar = `<svg class="t-dots" viewBox="0 0 100 100" aria-hidden="true">${NOKTA.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="5"/>`).join("")}</svg>`;

export const ON_TEST = [
  { k: 1, soru: "Bit'e sırayla verilen komutlara ne denir?", resim: adimlar(["Fırçayı al", "Macunu sür", "Fırçala"]),
    secenek: ["Program", "Ekran", "Kablo", "Fare"], dogru: 0 },
  { k: 2, soru: "Bilgisayarın işlemcisi hangisini anlar?",
    secenek: ["Türkçe 🗣️", "0 ve 1 💡", "Resimler 🖼️", "Emojiler 😀"], dogru: 1 },
  { k: 3, soru: "Bu kod ekrana ne yazar?", kod: ['a = "5"', 'b = "2"', "print(a + b)"],
    secenek: ["52", "7", "a + b", "Hata verir"], dogru: 0 },
  { k: 4, soru: "Bu kod ekrana ne yazar?", kod: ["sicaklik = 18", "if sicaklik > 25:", '    print("Fan açık")', "else:", '    print("Fan kapalı")'],
    secenek: ["Fan açık", "Fan kapalı", "İkisi de", "Hiçbiri"], dogru: 1 },
  { k: 5, soru: "Ekrana kaç yıldız çıkar?", kod: ["for i in range(4):", '    print("*")'],
    secenek: ["3", "5", "4", "Sonsuz"], dogru: 2 },
  { k: 6, soru: "Bu kod ekrana ne yazar?", kod: ['renkler = ["kırmızı", "mavi", "yeşil"]', "print(renkler[1])"],
    secenek: ["kırmızı", "mavi", "yeşil", "1"], dogru: 1 },
  { k: 7, soru: "Bu kod ekrana ne yazar?", kod: ["def ucle_carp(x):", "    return x * 3", "", "print(ucle_carp(4))"],
    secenek: ["4", "7", "x * 3", "12"], dogru: 3 },
  { k: 8, soru: "Bu kodda hata hangi satırda?", kod: ["puan = 90", "if puan > 50", '    print("Harika")'],
    secenek: ["1. satır", "2. satır", "3. satır", "Hata yok"], dogru: 1 },
  { k: 9, soru: "Bu satırda Robot nedir?", kod: ['r1 = Robot("mavi")'],
    secenek: ["Bir sayı", "Robot kalıbı (sınıf)", "Bir renk", "Bir hata"], dogru: 1 },
  { k: 10, soru: "Yapay zekâ nasıl öğrenir?", resim: emoji("🍎 🍎 🍊 🍊"),
    secenek: ["Fişe takılınca", "Ekranı büyüyünce", "Örneklere bakarak", "Hiç öğrenmez"], dogru: 2 },
  { k: 11, soru: "Modeli neden görmediği verilerle sınarız?",
    secenek: ["Daha hızlı olsun diye", "Renkli olsun diye", "Gerek yok", "Gerçekten öğrendi mi görmek için"], dogru: 3 },
  { k: 12, soru: "Etiket yok. Benzer noktaları gruplamak istiyoruz. Hangisi?", resim: noktalar,
    secenek: ["K-Means", "Karar ağacı", "print", "if"], dogru: 0 }
];

export const SON_TEST = [
  { k: 1, soru: "Hangisi bir program?",
    secenek: ["Klavye ⌨️", "Ekran 🖥️", "Sıralı komutlar 📋", "Fare 🖱️"], dogru: 2 },
  { k: 2, soru: "Python kodunu satır satır çalıştıran hangisi?",
    secenek: ["Yorumlayıcı", "Klavye", "Hoparlör", "Yazıcı"], dogru: 0 },
  { k: 3, soru: "Bu kod ekrana ne yazar?", kod: ["a = 5", "b = 2", "print(a + b)"],
    secenek: ["52", "7", "a + b", "Hata verir"], dogru: 1 },
  { k: 4, soru: "Bu kod ekrana ne yazar?", kod: ['hava = "yağmur"', 'if hava == "yağmur":', '    print("Şemsiye al")', "else:", '    print("Şapka tak")'],
    secenek: ["Şemsiye al", "Şapka tak", "İkisi de", "Hiçbiri"], dogru: 0 },
  { k: 5, soru: "Bu kod ekrana hangi sayıları yazar?", kod: ["for i in range(3):", "    print(i)"],
    secenek: ["1 2 3", "0 1 2 3", "0 1 2", "3"], dogru: 2 },
  { k: 6, soru: "Bu kod ekrana ne yazar?", kod: ['sepet = ["elma", "armut", "muz"]', "print(sepet[0])"],
    secenek: ["armut", "muz", "0", "elma"], dogru: 3 },
  { k: 7, soru: "Bu kod ekrana ne yazar?", kod: ["def selam(ad):", '    return "Merhaba " + ad', "", 'print(selam("Ece"))'],
    secenek: ["Merhaba ad", "Merhaba Ece", "selam(Ece)", "Ece"], dogru: 1 },
  { k: 8, soru: "Bu kodda hata hangi satırda?", kod: ['renk = "mavi"', 'if renk == "mavi":', 'print("Gökyüzü")'],
    secenek: ["1. satır", "2. satır", "3. satır", "Hata yok"], dogru: 2 },
  { k: 9, soru: "Bu satırda zipla nedir?", kod: ["r1.zipla()"],
    secenek: ["Robotun rengi", "Bir sayı", "Robotun yeteneği (metot)", "Robot kalıbı"], dogru: 2 },
  { k: 10, soru: "Model elma ve portakal örnekleri gördü. Şimdi ne yapar?", resim: emoji("🍎 🍊 → ❓"),
    secenek: ["Yeni meyveyi tahmin eder", "Meyveleri yer", "Hiçbir şey", "Ekranı kapatır"], dogru: 0 },
  { k: 11, soru: "Model gördüklerinde 100, yenilerde 60 aldı. Ne oldu?", resim: satir([["100", "gördüğü sorular"], ["60", "yeni sorular"]]),
    secenek: ["Mükemmel öğrendi", "Ezberledi", "Bozuldu", "Hiç öğrenmedi"], dogru: 1 },
  { k: 12, soru: "Türü belli penguenlerle yeni penguenin türünü bulan hangisi?", resim: emoji("🐧 🐧 🐧 → ❓"),
    secenek: ["K-Means", "Karar ağacı", "range", "append"], dogru: 1 }
];

export const FORM = { on: ON_TEST, son: SON_TEST };

/* cevaplar: seçilen sıra ya da -1 (bilmiyorum) → kazanım başına doğru mu */
export const puanla = (tur, cevaplar) => FORM[tur].map((s, i) => cevaplar[i] === s.dogru);
