# Faz 5b · Oyun Salonu

## Amaç
Eski sitedeki 7 istasyonu kısa, tekrar oynanabilir turlara çevirmek. Çocuk evde "bir tur daha" diyerek
öğrendiğini pekiştirir. Uzun görev listesi ve kod yazma yok; hepsi dokun, sırala, seç.

## Oyunlar
| Oyun | Açılır | Bir tur | Çocuk ne yapıyor |
| --- | --- | --- | --- |
| Kod Yapbozu | Dünya 1 | 3 bulmaca | Karışık satırları sıraya dizer; hedef çıktı görünür |
| Çıktıyı Tahmin Et | Dünya 2 | 5 kod | Kod ekrana ne yazar, seçer; yanlışa özel ipucu |
| Hata Avcısı | Dünya 3 | 4 kod | Hatalı satıra dokunur; Bit hatayı söyler |
| Piksel Sanatı | Dünya 4 | 3 desen | range sayılarını ayarlar, döngü hedef kareleri boyar |
| Gizli Ajan | Dünya 5 | 3 şifre | Kodun istediği vagon numaralarına dokunur (son turda h[-1]) |
| Sohbet Botu | Dünya 6 | 4 mesaj | Botun if/elif kodunu okuyup cevabı seçer (lower, in, sıra) |
| Model Atölyesi | Dünya 7 | 4 meyve | Yeni meyveyi tahmin eder; k komşu oy verir |

Dünya 8–10 kendi içinde zaten oyun gibi; onlar için ayrı oyun yok (plandaki gibi).

## Kurallar
- Her tur havuzdan rastgele seçilir; "Bir tur daha" yeni sorularla başlar.
- İlk denemede doğru yapılan her soru 1 yıldız. Yanlışta ceza yok, ipucu var; soru yine bitirilir.
- Oyun yıldızları dünya yıldızlarına eklenmez (sertifikadaki sayı değişmez); salonda her oyunun en iyi turu görünür.
- Haritada bir dünya bitince "Oyun Salonu" düğmesi çıkar; dünya bitiş ekranında açılan oyun haber verilir.
- Öğretmen modunda bütün oyunlar açık.
- Görsel yuvası: `oyun-<id>.webp` (1:1) varsa kartta görünür.

## Yapmayacaklarımız
- Süre sınırı ya da yarışma tablosu (sınıfta baskı yaratır).
- Oyunlarda kod yazdırmak (yazma görevleri dünyaların sonunda zaten var).
- Önceki fazların kuralları geçerli.

## Bitti tanımı
- [x] 7 oyun, ait olduğu dünya bitince açılıyor; kilitli oyunun adresi salona döndürüyor.
- [x] Her oyunda bir tur baştan sona oynanıyor, tur sonunda yıldız ve "Bir tur daha" var.
- [x] En iyi tur ve oynanan tur sayısı cihazda saklanıyor; dünya yıldızları değişmiyor.
- [x] Üç ekran boyutunda otomatik testte bütün oyunlar oynanıyor, yatay taşma yok.
