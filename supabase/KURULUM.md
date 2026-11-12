# Junior · Hesapların kurulumu

Junior, eski Python Atölyesi'nin Supabase projesini kullanır. Öğretmenler, müdür, sınıflar, öğrenciler ve PIN'ler
iki sitede ortaktır; Junior'ın ilerlemesi ayrı bir tabloda tutulur. Süre: 2 dakika, bir kere yapılır.

## 1. Veritabanına Junior tablosunu ekle
1. Supabase panelinde eski projeyi aç → **SQL Editor → New query**.
2. `junior.sql` dosyasının tamamını yapıştır, **Run** de. ("Success. No rows returned" görmelisin.)

Bu dosya yalnızca bir tablo (`junior_ilerleme`) ve üç fonksiyon ekler. Eski tablolara, eski ilerlemeye,
kurum kodlarına dokunmaz. Tekrar çalıştırmak güvenlidir.

## 2. Kontrol et
- **Authentication → Sign In / Providers → Allow anonymous sign-ins** açık olmalı (eski site için zaten açık).
- Site yayınlandığında **Authentication → URL Configuration → Redirect URLs** listesine Junior'ın adresini ekle
  (yeni öğretmenin onay e-postası Junior'a dönebilsin).

## 3. Ayar dosyası
`public/ayarlar.js` eski sitedeki adres ve **publishable** anahtarla dolu. service_role anahtarı hiçbir zaman buraya yazılmaz.

## Nasıl çalışır
| | Öğrenci | Öğretmen | Müdür |
| --- | --- | --- | --- |
| Giriş | sınıf kodu + takma ad + PIN | e-posta + şifre | e-posta + şifre |
| Harita | sırayla açılır | hepsi açık | hepsi açık |
| Panel | — | kendi ve ortak olduğu sınıflar | bütün sınıflar + öğretmenler |

- Eski sitede açtığın sınıflar ve öğrenciler Junior panelinde hazır görünür; yeni PIN gerekmez.
- Ortak öğretmen ekleme, sınıf devretme ve öğrenci taşıma eski sitenin panelinde yapılır (aynı veritabanı).
- Öğrenci çıkış yapınca cihazdaki ilerleme silinir; tekrar girince buluttan gelir.
