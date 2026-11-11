# Faz 5 · Testler ve cila

## Amaç
Kursun başında ve sonunda aynı 12 kazanımı ölçmek, çocuğa gelişimini göstermek ve kursu sertifikayla kapatmak.
Yapay zekâ görselleri için yer açmak (görseller gelene kadar site onlarsız da eksiksiz görünür).

## Yol
Harita artık şöyle: **Başlangıç testi → Dünya 1 … Dünya 10 → Bitiş testi → Sertifika**.
- Dünya 1, başlangıç testi bitince açılır. Bitiş testi Dünya 10'dan sonra, sertifika bitiş testinden sonra açılır.
- Öğretmen modunda her şey açık.

## Testler
- 12 kazanım, eski sitedekilerin aynısı. Her testte kazanım başına bir soru (A formu başta, B formu sonda).
  İki form aynı beceriyi farklı soruyla ölçer; son testte ezberden hatırlanmaz.
- Ekran başına bir soru: Bit soruyu sorar, gerekirse kısa bir kod ya da resim, altında 3–4 büyük seçenek.
- "Bilmiyorum" düğmesi var: tahmin yerine dürüst cevap.
- Test sırasında doğru/yanlış gösterilmez (ölçüyoruz, öğretmiyoruz); her cevaptan sonra sıradaki soru gelir.
- Her test bir kez çözülür; sonuç cihazda saklanır. Öğretmen sayfasındaki sıfırlama testleri de siler.
- Başlangıç testinin sonunda puan gösterilmez ("Kursun sonunda tekrar soracağım").

## Sonuç ekranı
Bitiş testinden sonra: "Başta 5 · Sonda 11" iki büyük çubuk, altında 12 kazanımın her biri için önce/sonra işareti.
Öğretmen bunu derste çocuğun ekranından görür. Haritadaki test düğümünden sonradan da açılır.

## Sertifika
- Çocuk adını yazar (yalnızca bu cihazda saklanır).
- Ad, tarih, toplam yıldız, 10 dünyanın simgeleri, Bit. Eğitmen imzası için boş çizgi.
- "Yazdır" düğmesi: A4 yatay sayfa; tablette "PDF olarak kaydet" ile dosya olur.

## Görsel yuvaları
- `public/img/` altına konan görseller kendiliğinden görünür; dosya yoksa yer de görünmez.
  - `dunya-1.webp` … `dunya-10.webp` (16:9): dünya bitiş ekranının üstünde.
  - `sertifika.webp` (4:3): sertifikanın süsü.
- Gemini istem listesi ayrı dokümanda; her istem aynı üslup cümlesiyle başlar.

## Erişilebilirlik
- Test seçenekleri klavyeyle (Tab/Enter) ve ekran okuyucuyla kullanılabilir; soru `role=status` ile okunur.
- Hareket azaltma tercihi konfeti ve animasyonları kapatır (önceki fazlardan).
- Dokunma hedefleri en az 44 px.

## Yapmayacaklarımız
- Test sonucunu bir sunucuya göndermek (Faz 6'ya kadar her şey cihazda).
- Test sırasında ipucu ya da doğru cevap göstermek.
- Oyun Salonu'nu bu fazda yapmak (ayrı faz: 5b).
- Önceki fazların kuralları geçerli.

## Bitti tanımı
- [ ] Haritada başlangıç testi, bitiş testi ve sertifika düğümleri var; sıra kuralı çalışıyor.
- [ ] İki test 12'şer soru, her kazanımdan bir; cevaplar yenilemeden sonra da duruyor.
- [ ] Sonuç ekranı önce/sonra karşılaştırmasını doğru sayıyor (otomatik testte bilinen cevaplarla).
- [ ] Sertifika adla oluşuyor, yazdırma görünümü tek sayfa.
- [ ] Görsel dosyası yokken hiçbir yerde kırık resim yok.
- [ ] Bütün kurs (test + 10 dünya + test + sertifika) üç ekran boyutunda otomatik testte oynanıyor.
