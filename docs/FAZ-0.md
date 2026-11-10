# Faz 0 · İskelet (+ pilot dünyanın motora taşınması)

Kaynak plan: "Python Atölyesi Junior · İçerik ve Plan" dokümanı.
Kararlar: ad **Python Atölyesi Junior** · 4–6. sınıf · kursta bilgisayar, evde tablet · ses açık (kapatma düğmesi var) ·
çocukta dünyalar sırayla, öğretmen cihazında hepsi açık · Arduino karşılaştırması yalnızca Dünya 4'te.

## Amaç
Bütün dünyaların üzerine kurulacağı ortak iskeleti yazmak ve Döngü Robotu örneğini bu iskeletin üzerinde
çalıştırarak iskeleti gerçek bir dünyayla sınamak.

## Kapsam
1. **Proje**: `atolye-junior/` altında ayrı bir Vite projesi (bağımlılıksız vanilla JS). Göreli `base` ile her
   adreste çalışır.
2. **Yönlendirme**: düz hash adresleri: `#harita` (varsayılan), `#dunya-4`, `#ogretmen`.
3. **İlerleme kaydı**: `localStorage` içinde tek anahtar (`atolye-junior-v1`): bitmiş dünyalar, yıldızlar, ses
   tercihi, öğretmen modu. Okuma/yazma `try/catch` içinde; depolama yoksa site yine çalışır.
4. **Ses**: WebAudio ile kısa tonlar (doğru, yanlış, adım, kutlama). Varsayılan açık. Her sayfada sağ üstte
   ses düğmesi; tercih saklanır.
5. **Bit**: kodla çizilmiş SVG karakter; ruh halleri `mutlu`, `vay`, `uzgun`; göz kırpma animasyonu.
   Konuşma balonu en fazla ~12 kelime.
6. **Ekran motoru**: bir dünya = ekran listesi. Her ekran `({ frame, ui, store }) => void` biçiminde bir fonksiyon.
   `frame(cümle, ruh)` → `{ grid, actions, done(yıldız, rozet), next }`. "Devam" yalnızca `done` çağrılınca görünür.
   Üstte ilerleme noktaları ve toplam yıldız. Son ekrandan sonra dünya "bitti" olarak kaydedilir, bir sonraki
   dünya açılır, haritaya dönülür.
7. **Ortak bileşenler**: kod paneli (renklendirme, satır vurgusu, "Ekran" çıktısı), sayı seçici (+/−),
   değişken kutusu, konfeti, `wait` (hareket azaltma tercihine uyar).
8. **Harita**: 10 dünya bir yol üzerinde. Durumlar: bitti (yıldızlı), açık (sıradaki, parlayan), kilitli,
   hazırlanıyor (içeriği henüz yok; sırada atlanır, böylece hazır olan ilk dünya açılır). Kilitli dünyaya dokununca Bit "Önce önceki dünyayı bitir" der.
9. **Öğretmen modu**: `#ogretmen` sayfasında kod girilir (`BIT-OGRETMEN`); doğruysa o cihazda bütün dünyalar
   açılır, haritada "Öğretmen modu" etiketi görünür, aynı sayfadan kapatılır.
10. **Pilot dünya**: Döngü Robotu örneğinin 7 ekranı `src/worlds/dongu.js` içine, motorun API'siyle yazılır.
11. **Tema**: tek, açık tema (bilerek; koyu tema yok). Koyu renk yalnızca kod panelinde.

## Yapmayacaklarımız
- Eski projeye (`atolye-app/`, `python-atolyesi/`) ve GitHub'a dokunmak; hiçbir şeyi yayınlamak.
- Hesap, veritabanı, sunucu çağrısı eklemek.
- Bir ekrana Bit'in cümlesi dışında okuma metni koymak.
- Bit'i resimle değiştirmek.
- Henüz içeriği olmayan dünyalar için boş/yarım ekranlar üretmek (haritada "hazırlanıyor" görünürler).
- Harici kütüphane eklemek (Skulpt, Faz 1'deki Yaz ekranıyla gelecek).

## Bitti tanımı
- [x] `npm run build` hatasız; çıktı tek klasör, göreli yollarla açılıyor.
- [x] Harita 10 dünyayı doğru durumlarla gösteriyor; ilk açılışta yalnızca sıradaki açık dünya oynanabiliyor.
- [x] Döngü Robotu baştan sona oynanıyor; bitince haritada yıldızlarıyla "bitti" görünüyor ve sonraki dünya açılıyor.
- [x] Sayfa yenilenince ilerleme ve ses tercihi korunuyor; depolama engelliyken site hata vermeden açılıyor.
- [x] Öğretmen kodu bütün dünyaları açıyor, yanlış kod açmıyor, mod kapatılabiliyor.
- [x] Ses düğmesi her sayfada var ve çalışıyor.
- [x] 1280 px, 820 px (tablet) ve 390 px genişlikte yatay taşma yok; tablet boyutunda dokunmatik etkileşimler çalışıyor.
- [x] Otomatik uçtan uca test geçiyor, konsolda hata yok.
