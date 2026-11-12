# Faz 6 · Hesaplar

## Amaç
Öğrencinin ilerlemesi her cihazda aynı olsun (kursta bilgisayar, evde tablet). Öğretmen sınıfının dünya dünya
ilerlemesini ve test sonuçlarını görsün. Öğretmen hesabında bütün dünyalar açık olsun.

## Karar: eski sitenin Supabase projesi aynen kullanılır
- Öğretmenler, müdür, sınıflar, öğrenciler ve PIN'ler **ortak**: eski sitede açılmış bir sınıf ve öğrenci Junior'da da girer.
  Öğrenci aynı sınıf kodu + takma ad + PIN ile iki siteye de girebilir.
- Junior ilerlemesi **ayrı** tabloda (`junior_ilerleme`); eski sitenin ilerlemesine dokunulmaz.
- Veritabanına yalnızca `supabase/junior.sql` eklenir (yeni tablo + 3 fonksiyon). Eski tablolar ve fonksiyonlar değişmez.
  Dosya tekrar çalıştırılabilir.
- Sitede yalnızca publishable (anon) anahtar durur (`public/ayarlar.js`). service_role anahtarı hiçbir yerde yok.

## Roller
| | Öğrenci | Öğretmen | Müdür |
| --- | --- | --- | --- |
| Giriş | sınıf kodu + takma ad + PIN | e-posta + şifre | e-posta + şifre |
| Harita | sırayla açılır | hepsi açık | hepsi açık |
| Panel | — | kendi ve ortak olduğu sınıflar | bütün sınıflar + öğretmenler |

## Ekranlar
- **Giriş** (`#giris`): "Öğrenciyim" / "Öğretmenim". Öğrenci formu büyük, 3 kutu; PIN rakam klavyesiyle.
  Öğretmen: e-posta + şifre; "Hesap aç" (e-posta onayı, sonra ad + kurum kodu) eski sitedeki akışla aynı.
- **Harita**: üstte öğrencinin takma adı, kayıt durumu (bulut simgesi) ve Çıkış. Öğretmende "Panel" düğmesi.
- **Panel** (`#panel`): sınıf kartları, yeni sınıf. Müdürde ikinci sekme: öğretmenler (erişimi kapat/aç).
- **Sınıf** (`#panel/<id>`): büyük sınıf kodu; iki sekme:
  - İlerleme: öğrenci başına başlangıç testi, 10 dünyanın yıldızları, bitiş testi, oyun turları, son giriş.
  - Öğrenciler ve PIN'ler: öğrenci ekle (her satıra bir takma ad), PIN'ler gizli açılır, PIN yenile, öğrenci sil,
    PIN kartlarını yazdır.
- Ortak öğretmen ekleme, sınıf devretme ve öğrenci taşıma eski sitenin panelinde kalır (aynı veritabanı).

## İlerleme eşitleme
- Girişte buluttaki kayıt cihazdakinin yerine geçer (bulut tek doğru kaynak).
- Her değişiklikten ~1 sn sonra buluta yazılır; hata olursa artan aralıklarla yeniden dener, sayfa kapanırken bekleyeni yollar.
- Ses tercihi cihazda kalır, buluta gitmez.
- Çıkışta cihazdaki ilerleme silinir (paylaşılan bilgisayarda bir sonraki çocuk temiz başlar).

## Ayar yoksa
`public/ayarlar.js` boşsa site bugünkü gibi hesapsız çalışır (BIT-OGRETMEN kodu yalnızca bu modda geçerli).
`{ mock: true }` ile tarayıcı içi sahte sunucu çalışır (otomatik test ve önizleme; kurum kodu TEST, müdür kodu MUDUR).

## Yapmayacaklarımız
- Öğrenciden e-posta, gerçek ad ya da doğum tarihi almak.
- Eski sitenin tablolarını, fonksiyonlarını ya da ilerlemesini değiştirmek.
- service_role anahtarını siteye ya da depoya koymak.
- Siteyi yayınlamak (Faz 7, senin onayınla).

## Bitti tanımı
- [x] Öğrenci bir cihazda ilerleyip başka cihazda girince aynı yerden devam ediyor (otomatik testte iki ayrı tarayıcı).
- [x] Öğretmen sınıfın ilerleme tablosunda dünya yıldızlarını ve test puanlarını görüyor.
- [x] Öğretmen hesabında bütün dünyalar açık; öğrencide sırayla.
- [x] Müdür bütün sınıfları ve öğretmenleri görüyor, bir öğretmenin erişimini kapatabiliyor.
- [x] Hatalı PIN Türkçe ve sade mesaj veriyor; teknik ayrıntı yalnızca konsolda.
- [x] Hesaplı mod masaüstü ve telefonda otomatik testte (giriş, test, Dünya 1, iki cihaz, panel, müdür) geçiyor; hesapsız modda bütün kurs üç ekranda oynanmaya devam ediyor.

## Senin yapacağın
- Supabase'de `supabase/junior.sql`'i bir kere çalıştırmak (`supabase/KURULUM.md`). Gerçek veritabanıyla deneme bundan sonra yapılabilir;
  otomatik testler sahte sunucuyla çalışıyor.
