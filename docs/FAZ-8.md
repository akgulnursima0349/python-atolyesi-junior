# Faz 8 · Kursu baştan sona oynama notları

Nur kursu baştan sona oynadı ve şu notları aldı (13 Kasım 2026). Bu faz yalnızca bu notları kapatır.

## Yapılacaklar

1. **Ekranlar arasında geri dönme.** Dünya içinde "← Geri" düğmesi önceki ekrana götürür (ilk ekranda görünmez).
   - Daha önce bitirilmiş bir ekrana dönülünce ekran baştan oynar, "Devam" hemen görünür.
   - Yıldızlar iki kez sayılmaz: her ekranın yıldızı bir kez tutulur.
2. **Dünya 1 · Diş fırçalama (tarif):** Emoji yerine çizilmiş sahne.
   - Banyo, ayna ve Bit.
   - Her adımın kendi resmi var: fırça, macunlu fırça, köpüklü dişler, su bardağı.
   - Yanlış sırada komik sonuç da resimle gösterilir.
3. **Dünya 1 · Diller merdiveni:** Python ile C arasındaki fark görünür olsun.
   - Her dil aynı "Merhaba" programını kendi gerçek haliyle gösterir:
     - Python: 1 satır.
     - C: `#include`, `main`, `printf`, `return` ile 5–6 satır.
     - Assembly: daha uzun.
     - Makine dili: 0 ve 1.
   - Satır sayısı ve "dikkat edilecekler" (noktalı virgül, süslü parantez…) her basamakta yazar.
4. **Dünya 1 · İki çevirmen:** Etkinlik baştan yazılır.
   - İki çevirmen karakteri aynı 4 satırlık programı (3. satırda yazım hatası) çalıştırır.
   - Çocuk her birini kendi düğmesiyle çalıştırır ve ekran çıktısını görür:
     - Satır satır çeviren 2 satırı yazdırıp durur.
     - Hepsini birden çeviren hiç yazdırmaz, hatayı baştan söyler.
   - Sonra soru sorulur: "Python hangisi gibi çalışır?"
5. **Dünya 7 · Yapay Zekânın Alet Çantası daha açıklayıcı:**
   - Yeni bir giriş ekranı eklenir: çantadaki üç alet (Pandas, Matplotlib, scikit-learn).
     - Her biri ne işe yarar, günlük hayattan bir benzetme, hangi ekranda kullanılacak.
   - Aletin kullanıldığı ekranlarda "🧰 Alet: …" etiketi durur.
   - İlk ekranda "özellik" (ağırlık, pürüz) kavramı açıklanır.
6. **Dünya 8 · Rakam Okuyan YZ, son ekran (nasıl okur):** Emoji yerine adımların gerçek görselleri.
   - Çizim, 8×8 kare, 64 sayı, komşular, oy çubukları.
   - Çocuk sıraladıkça ilgili görsel yanar.
7. **Dünya 9 · Penguenler:** Üç tür gerçek görünümüyle çizilir.
   - Adelie: kara baş, beyaz göz halkası, küçük kara gaga.
   - Chinstrap: beyaz yüz, çenenin altında ince kara çizgi.
   - Gentoo: başın üstünde beyaz bant, turuncu gaga ve ayaklar.
   - Tür rengi kartın kenarında kalır, penguenin üstüne boyanmaz. Gizemli penguen gölge siluettir.
8. **Dünya 10 · K-Means adımları:**
   - "Adım adım" ekranı:
     - Yıldızlar gerçek yıldız biçiminde.
     - Taşınma izi kesik çizgiyle görünür.
     - Hangi adımda olunduğu gösterilir (1 Boya / 2 Taşı).
   - Son sıralama ekranı: emoji yerine her adımın küçük nokta-bulutu resmi.
9. **Sertifika:** Akademi logosu ortada, üstte ve büyük.

## Yapmayacaklarımız

- Etkinliklerin öğrettiği kazanımları, test sorularını ve yıldız sayılarını değiştirmeyeceğiz (Alet Çantası'na eklenen tanıtım ekranı 1 yıldız verir).
- Yeni görsel dosyası eklemeyeceğiz; çizimler satır içi SVG olacak, böylece kurs internetsiz ve hafif kalır.
- Eski siteye ve Supabase şemasına dokunmayacağız.
- Kayıtlı ilerleme biçimini değiştirmeyeceğiz (öğrencilerin ilerlemesi kaybolmaz).

## Bitti tanımı

- [ ] 9 maddenin hepsi masaüstü, tablet ve telefonda göz kontrolünden geçti (ekran görüntüsü).
- [ ] Geri düğmesiyle dönüp tekrar bitirmek yıldızı artırmıyor (test).
- [ ] İki çevirmen ekranında iki çıktı da doğru (test).
- [ ] Bütün uçtan uca testler geçiyor; yayın iş akışı yeşil.
