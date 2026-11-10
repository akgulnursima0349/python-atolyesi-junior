# Faz 1 · Pilot dünyanın tamamlanması (Dünya 4 · Döngü Robotu)

## Amaç
Döngü Robotu'nu planlanan son hâline getirmek: Arduino karşılaştırması ve ilk "Yaz" ekranı. Böylece pilot,
planlanan 7 ekran türünün hepsini içerir ve çocuklarla denenmeye hazır olur.

## Kapsam
1. **Arduino ikizi ekranı** (yalnızca bu dünyada): solda Arduino `for (int i = 0; i < 5; i++) { … }`, sağda Python
   `for i in range(5):`. Arduino kodundaki 4 renkli parçaya dokununca Python'daki karşılığı aynı renkle yanar
   (başlangıç 0, `i < 5`, `i++`, süslü parantez). Hepsi eşleşince "İkisini de çalıştır" açılır: soldaki 5 LED
   sırayla yanarken iki taraf aynı sayıları yazar.
2. **Python çalıştırıcı**: Skulpt (eski siteden), ilk ihtiyaçta yüklenir (açılışı yavaşlatmaz). Sonsuz döngüye karşı
   süre sınırı. Hata mesajları 4. sınıfa uygun Türkçe cümlelere çevrilir (girinti, yazım, tanımsız ad, süre).
3. **Kod kutusu**: büyük yazılı, dokunmatikle yazılabilen basit editör; Tab ve `:` sonrası Enter 4 boşluk girer.
4. **Yaz ekranı**: "1'den 10'a kadar topla" — tek eksik satırı çocuk yazar. Çıktı 55 olunca 2 yıldız.
   3 başarısız denemeden sonra basamaklı ipucu (3 basamak), son basamak çözümü gösterir.
5. **Ekran sırası**: Kısalt → Pist → Tahmin → Arduino ikizi → Meyve → Kumbara → Yaz → Görev.

## Yapmayacaklarımız
- Arduino karşılaştırmasını başka dünyalara koymak.
- CodeMirror gibi ağır bir editör eklemek.
- Yaz ekranında çocuktan birden fazla satır yazmasını istemek (4. sınıf).
- Hata mesajlarında İngilizce Python çıktısını olduğu gibi göstermek.
- Eski projeye, GitHub'a dokunmak; yayınlamak.

## Bitti tanımı
- [x] Arduino ikizinde 4 eşleşme dokunarak yapılıyor, çalıştırınca LED'ler ve iki çıktı aynı anda ilerliyor.
- [x] Yaz ekranında doğru satır 55 yazdırıp 2 yıldız veriyor; yanlış girintide ve yazım hatasında Türkçe mesaj çıkıyor.
- [x] 3 başarısız denemeden sonra ipucu düğmesi çıkıyor, 3 basamakta çözüme ulaşıyor.
- [x] `while True:` gibi sonsuz döngü sayfayı kilitlemiyor, Türkçe süre mesajı veriyor.
- [x] Skulpt yalnızca Yaz ekranına gelince yükleniyor.
- [x] Bütün dünya bilgisayar, tablet ve telefonda baştan sona oynanıyor; otomatik test geçiyor, konsolda hata yok.
