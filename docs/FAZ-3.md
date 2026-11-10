# Faz 3 · Dünya 5 ve 6

## Amaç
Listeler, sözlükler, fonksiyonlar ve nesneleri Faz 2'deki kalıplarla anlatmak.

## Dünya 5 · Vagonlar ve Dolaplar (7 ekran)
1. Tren = liste: vagona dokun → `print(tren[1])`; vagon numarası 0'dan başlar (3 vagon dene).
2. Tahmin: `tren[2]` hangi meyve? (1'den sayma ve "sonraki" yanılgılarına özel ipucu).
3. Vagon ekle/çıkar: `append` sona ekler, `pop` sondan çıkarır, `len` vagon sayısı.
4. Dilimleme makası: `kelime[başla:bitiş]` ile hedef harfleri kes (THO, sonra PY).
5. Sözlük = etiketli dolap: çekmeceye dokun → `print(dolap["muz"])` (2 çekmece dene).
6. Tahmin: çekmeceye yeni değer konunca ne olur? (yerine konur, toplanmaz).
7. Yaz: sepete `append` ile "çilek" ekle.

## Dünya 6 · Makineler ve Fabrikalar (7 ekran)
1. Fonksiyon makinesi: `def` tanımlar, çağırmak çalıştırır (düğmeye 2 kez bas).
2. Parametre: makineye isim kartı ver (2 farklı isim).
3. return: kare makinesi sonucu geri verir, kutuya düşer (2 sayı dene).
4. Tahmin: `ikiyle_carp(5) + 1`.
5. Sınıf = robot kalıbı: kalıptan 3 farklı renkte robot üret.
6. Metot: robota yetenek çağır (`r1.zipla()`; 3 farklı çağrı).
7. Yaz: `selam_ver("Bit")` ile fonksiyonu çağır.

## Plandan sapma
- Dünya 5'in son görevi "en uzun adı bul" yerine "sepete append ile ekle" oldu: ilki döngü + if + len birlikte
  gerektiriyor, 4. sınıf için tek satırlık Yaz ekranına sığmıyor. Plan dokümanı güncellenir.

## Yapmayacaklarımız
- `__init__`, `self` gibi ayrıntıları açıklamaya çalışmak: kod görünür, Bit yalnızca "kalıp" ve "yetenek" fikrini anlatır.
- Liste/sözlük metotlarından yalnızca `append`, `pop`, `len` kullanılır.
- Faz 2 kurallarının hepsi geçerli (12 kelime, dokun-seç, Türkçe harfsiz değişken adları, GitHub'a dokunmamak).

## Bitti tanımı
- [x] Dünya 5 ve 6 haritada hazır, sırayla açılıyor (4 → 5 → 6).
- [x] Her ekranda yanlışa özel tepki, "Devam" yalnızca iş bitince.
- [x] Hızlı tıklama ve çalışma sırasında değişiklik yarış hatası üretmiyor (düğmeler kilitli ya da değerler başta alınıyor).
- [x] Altı dünya üç ekran boyutunda otomatik testte baştan sona oynanıyor; Bit cümleleri 12 kelimeyi aşmıyor.
