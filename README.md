# Python Atölyesi Junior

Sivas Robotik Akademi · 4–6. sınıflar için oyunlu Python ve yapay zekâ kursu.
10 dünya, her ekranda tek fikir: önce izle, sonra sen dene. Rehber karakter: **Bit**.

| Dünya | Konu |
| --- | --- |
| 1 · Bilgisayarın Dili | sıralı komutlar, 0 ve 1, diller, yorumlayıcı |
| 2 · Python'un İlk Sözleri | print, değişken, işlemler, yazılar |
| 3 · Karar Veren Robot | if / else / elif, karşılaştırma, girinti |
| 4 · Döngü Robotu | for, range, liste gezme, biriktirme, Arduino karşılaştırması |
| 5 · Vagonlar ve Dolaplar | liste, indeks, append/pop, dilimleme, sözlük |
| 6 · Makineler ve Fabrikalar | fonksiyon, parametre, return, sınıf, metot |
| 7 · Yapay Zekânın Alet Çantası | örnekten öğrenme, Pandas, grafik, ilk model |
| 8 · Rakam Okuyan Yapay Zekâ | en yakın komşu (KNN), kendi rakamını çiz |
| 9 · Penguen Dedektifi | karar ağacı, rastgele orman |
| 10 · Yapay Zekâ Ressamı | K-Means, renk gruplama, pop-art |

Kurs başlangıç testiyle açılır, bitiş testi ve sertifikayla kapanır. İki test aynı 12 kazanımı eş sorularla ölçer;
sonuç ekranı başta ve sonda kazanım kazanım karşılaştırır.

Oyun Salonu'nda 7 kısa oyun var (Kod Yapbozu, Çıktıyı Tahmin Et, Hata Avcısı, Piksel Sanatı, Gizli Ajan, Sohbet Botu,
Model Atölyesi); her biri ait olduğu dünya bitince açılır ve istenildiği kadar tekrar oynanır.

Yapay zekâ görselleri `src/assets/img/` klasörüne konur (adlar oradaki BENIOKU'da); olmayan görselin yeri görünmez.

## Çalıştırma
```
npm install
npm run dev      # geliştirme
npm run build    # dist/ klasörüne derler
node test/e2e.cjs  # uçtan uca test (Playwright gerekir; önce build)
```

Hesap yok; ilerleme tarayıcıda saklanır. Öğretmen sayfası (`#ogretmen`) bir cihazda bütün dünyaları açar.
Python kodları tarayıcıda Skulpt ile, yapay zekâ modelleri JavaScript ile çalışır; hiçbir veri dışarı gönderilmez.
Şartnameler `docs/` klasöründe.
