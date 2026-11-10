# Faz 4 · Yapay zekâ dünyaları (7–10)

## Amaç
Eski notebook'lardaki dört yapay zekâ konusunu, Python bilmeden oynanabilen ama gerçek kodu da gösteren
ekranlara çevirmek. Modeller tarayıcıda, JavaScript ile, anında çalışır (`src/ml/modeller.js`).

## Veri
- Rakamlar: scikit-learn `load_digits` (1.797 örnek, 8×8, 0–16), ayrı dosyada; yalnızca Dünya 8'de yüklenir.
  Her 10. örnek test için ayrılır (180 örnek). Doğruluk: k=1 %98,3 · k=3 %98,3 · k=7 %98,9 · k=25 %97,8.
- Penguenler: seaborn penguins (342 örnek; gaga ve yüzgeç uzunluğu). Ağaç: yüzgeç > 206 → Gentoo; değilse
  gaga > 43 → Chinstrap, değilse Adelie (%94).
- Meyveler: Notebook 01'deki 16 elma/portakal ölçümü (ağırlık, kabuk pürüzü).

## Dünya 7 · Yapay Zekânın Alet Çantası
1. Kural mı örnek mi: 4 örneği modele ver, sonra yeni meyveyi sor.
2. Tablo (Pandas): sütuna dokun, ortalamayı hesapla.
3. Grafik (Matplotlib): tablo satırları noktalara uçar.
4. Tahmin: grafikte portakalların yanına düşen yeni meyve.
5. İlk model: kaydırıcılarla yeni meyve; en yakın 3 komşu çizgiyle bağlanır (bir elma, bir portakal bul).
6. Sırala: model kur → eğit (fit) → sor (predict).
7. Yaz: `print(model.predict([[175, 8]]))` (görünmeyen hazır kodda küçük bir KNeighborsClassifier var).

## Dünya 8 · Rakam Okuyan Yapay Zekâ
1. Rakam = 64 sayı: pikselleri sayı olarak gör.
2. Benzerlik: hedef rakama en çok benzeyeni seç; fark puanları açılır.
3. Komşular oy verir: k seç, en yakın k rakam oy versin.
4. Kendi rakamını çiz: model tahmin etsin (2 çizim).
5. Tahmin: model neden yanıldı?
6. Doğruluk: görmediği 180 rakamla sına, iki k değeri karşılaştır, yanlışları gör.
7. Sırala: çizimden tahmine adımlar.

## Dünya 9 · Penguen Dedektifi
1. 3 penguen türünü tanı.
2. İlk soruyu seç: hangi soru türleri en iyi ayırıyor? (dağılım çubukları)
3. Ağacı kur: ikinci soruyu ekle, ağaç büyüsün.
4. Ağaca sor: gizemli penguenle dallarda Evet/Hayır ilerle (2 penguen).
5. Tahmin: ezberleme tuzağı (çok dallı ağaç ve basit ağaç).
6. Orman: 5 ağaç oy versin.
7. Yaz: ağacın ilk kuralını `if` ile yaz ("Gentoo").

## Dünya 10 · Yapay Zekâ Ressamı
1. Noktaları grupla: 3 merkez koy, noktalar en yakın merkeze boyansın.
2. Merkezler kayıyor: K-Means'i adım adım çalıştır, durana kadar.
3. Tahmin: grup sayısını (k) kim söyler?
4. Şarj istasyonu: 2 istasyonu sen yerleştir, sonra yapay zekâ yerleştirsin; ortalama yol karşılaştırılır.
5. Renkler de nokta: örnek resmi k renge indir (2 farklı k).
6. Pop-art: kendi fotoğrafını yükle (ya da örnek resim), 4 renkli tablo.
7. Sırala: K-Means adımları.

## Yapmayacaklarımız
- Sunucuya ya da dış servise veri göndermek; yüklenen fotoğraf cihazdan çıkmaz.
- Rakam verisini ana pakete koymak (yalnızca Dünya 8'de yüklenir).
- Çocuktan matematik formülü beklemek; uzaklık "fark puanı" olarak gösterilir.
- Önceki fazların kuralları geçerli.

## Bitti tanımı
- [x] 10 dünyanın hepsi hazır, sırayla açılıyor; haritada "hazırlanıyor" kalmadı.
- [x] Rakam modeli testte %95 üstü doğruluk veriyor; kullanıcı çizimi doğru ölçekleniyor (otomatik testte çizilen 7 ve 1).
- [x] Fotoğraf yükleme ve örnek resim ile pop-art üretiliyor.
- [x] Bütün kurs (10 dünya) üç ekran boyutunda otomatik testte baştan sona oynanıyor; Bit cümleleri ≤ 12 kelime.
