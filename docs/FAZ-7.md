# Faz 7 · Yayın

## Amaç
Junior'ı çocukların evden de açabileceği kalıcı bir adrese koymak; eski siteye dokunmadan.

## Karar
- Adres: **https://akgulnursima0349.github.io/python-atolyesi-junior/** (bu deponun GitHub Pages'i).
  Eski site `…/python-atolyesi/` adresinde aynen kalır.
- Her `main` güncellemesinde GitHub Actions: derle → kursu masaüstünde ve hesaplı modda baştan sona oynat → geçerse yayınla.
  Test geçmezse eski sürüm yayında kalır.
- Veritabanı: eski projedeki Supabase (junior.sql kuruldu). Sitede yalnızca publishable anahtar var.

## Senin yapacakların (Supabase paneli, bir kere)
- Authentication → URL Configuration → **Redirect URLs**'e Junior adresini ekle
  (`https://akgulnursima0349.github.io/python-atolyesi-junior/**`). Yeni öğretmenin onay e-postası Junior'a dönebilsin.
- Yayından sonra gerçek hesapla bir öğrenci ve bir öğretmen girişi dene.

## Yapmayacaklarımız
- Eski sitenin deposuna, adresine ya da Pages ayarına dokunmak.
- service_role anahtarını herhangi bir yere koymak.
- Test geçmeden yayınlamak.

## Bitti tanımı
- [x] Pages açık, iş akışı yeşil (ilk yayın 13 Kasım 2026, test dahil), adres yayında.
- [ ] Yayındaki sitede giriş ekranı geliyor (hesaplı mod gerçek Supabase'e bağlı).
- [x] Eski site etkilenmedi (ayrı depo, ayrı adres; eski depoya dokunulmadı).
