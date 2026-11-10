# Faz 2 · Dünya 1, 2, 3

## Amaç
Kursun ilk üç dünyasını Döngü Robotu kalıbıyla üretmek. Tekrar eden ekranları ortak parçalara çevirip sonraki
dünyaların üretimini hızlandırmak.

## Ortak parçalar (`src/core/kaliplar.js`)
- **tahminEkrani**: kod + seçenekler; yanlış seçeneğe özel ipucu; doğruda animasyon çalışır.
- **siralaEkrani**: kartlara doğru sırayla dokunma (sürükle-bırak yok: dokunmatikte güvenilir).
- **yazEkrani**: Döngü'deki Yaz ekranının genelleşmiş hâli: başlangıç kodu, kontrol fonksiyonu, 3 basamaklı ipucu.
  Döngü Robotu'nun Yaz ekranı da buna taşınır.

## Dünya 1 · Bilgisayarın Dili (7 ekran)
1. Diş fırçalama tarifi: 4 kartı doğru sırayla seç; yanlış sırada Bit komik hata yapar. (program = sıralı komut)
2. Lamba sayıları: 16-8-4-2-1 değerli 5 lambayı yakıp hedef sayıyı yap (5, 12, 21).
3. Harfler de sayı: adını yaz, her harf sayıya ve lambalara dönüşsün.
4. Tahmin: 4-2-1 lambalarında hangisi 3?
5. Diller merdiveni: aynı "Merhaba" Python → C → Assembly → 0/1 basamak basamak.
6. İki çevirmen: hatalı programda hangisi hiç çalışmaz? (yorumlayıcı / derleyici)
7. Sırala (son görev): print satırlarını hedef çıktıya göre sırala, çalıştır.

## Dünya 2 · Python'un İlk Sözleri (7 ekran)
1. print: tırnağın içini değiştir, Bit söylesin.
2. Tırnak tuzağı (tahmin): `print(Merhaba)` neden çalışmaz?
3. Değişken = etiketli kutu: isim seç, kutuya düşsün, print kutuyu açsın.
4. Kutu değişir: önce tahmin, sonra adım adım (puan 0 → 5 → 8).
5. Hesap makinesi: + − × ÷ ile oyna (3 farklı işlem dene).
6. Yazıları birleştir: "Merhaba " + isim ve "Ha" * 3.
7. Yaz: isim kutusunu ekrana yazdır (`print(isim)`).

## Dünya 3 · Karar Veren Robot (7 ekran)
1. Yol ayrımı: hava güneşli/yağmurlu → Bit şemsiye alır ya da almaz; atlanan satır soluklaşır.
2. Doğru mu yanlış mı: 4 karşılaştırma kartını True/False sepetine ayır.
3. else ve fan: sıcaklık kaydırıcısı; 25'i geçince fan döner, çalışan dal yanar.
4. elif ve trafik ışığı: 3 renk, 3 davranış.
5. Girinti: tek satırı içeri/dışarı al, çıktının değiştiğini gör.
6. Hata avcısı: 3 hatalı koddan hatalı satıra dokun (`:` eksik, tek `=`, girinti).
7. Yaz: sıcaklık 25'ten büyükse "Fan açık" yazdır.

## Yapmayacaklarımız
- Bit'in cümlesi 12 kelimeyi aşmayacak; ekranda başka okuma metni olmayacak.
- `input()` kullanılmayacak (tarayıcıdaki Python'da kapalı; isim seçme/yazma ekranla yapılır).
- Değişken adlarında Türkçe harf olmayacak (`sicaklik`, `isik`); yazılarda serbest.
- Sürükle-bırak yerine dokun-seç kullanılacak.
- Eski projeye ve GitHub'a dokunulmayacak.

## Bitti tanımı
- [x] Dünya 1, 2, 3 haritada hazır; çocukta 1 → 2 → 3 → 4 sırasıyla açılıyor.
- [x] Her dünya baştan sona oynanıyor, her ekranda "Devam" yalnızca iş bitince çıkıyor.
- [x] Her yanlış seçenek/denemede Bit o hataya özel tepki veriyor.
- [x] Döngü Robotu'nun Yaz ekranı ortak kalıba taşındı ve aynı davranıyor.
- [x] Bit cümleleri 12 kelimeyi aşmıyor (otomatik sayım).
- [x] Bilgisayar, tablet, telefon boyutunda otomatik test geçiyor, taşma ve konsol hatası yok.
