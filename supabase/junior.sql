-- =====================================================================
--  PYTHON ATÖLYESİ JUNIOR · VERİTABANI EKLENTİSİ (Supabase)
--  Eski Python Atölyesi'nin Supabase projesine EK olarak çalıştırılır.
--  Önce eski sitenin supabase/kurulum.sql dosyası kurulmuş olmalı (öğretmenler, sınıflar, öğrenciler oradan gelir).
--  Supabase paneli: SQL Editor → New query → bu dosyanın tamamını yapıştır → Run.
--  Dosya tekrar çalıştırılabilir; eski tablolara ve eski ilerlemeye dokunmaz, veri silmez.
-- =====================================================================

-- Junior ilerlemesi: öğrenci başına tek kayıt (dünyalar, testler, oyunlar). Eski sitenin "ilerleme" tablosundan ayrı.
create table if not exists public.junior_ilerleme (
  ogrenci_id uuid primary key references public.ogrenciler(id) on delete cascade,
  veri       jsonb not null default '{}'::jsonb,
  guncelleme timestamptz not null default now()
);
alter table public.junior_ilerleme enable row level security;
revoke all on public.junior_ilerleme from anon, authenticated;

-- Giriş yapmış öğrencinin Junior kaydı
create or replace function public.junior_ilerleme_getir() returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare og uuid := public._oturum_ogrencisi();
begin
  if og is null then raise exception 'oturum_yok'; end if;
  return (select jsonb_build_object('veri', veri, 'guncelleme', guncelleme) from public.junior_ilerleme where ogrenci_id = og);
end $$;

create or replace function public.junior_ilerleme_kaydet(p_veri jsonb) returns timestamptz
language plpgsql volatile security definer set search_path = public as $$
declare og uuid := public._oturum_ogrencisi(); t timestamptz := now();
begin
  if og is null then raise exception 'oturum_yok'; end if;
  if jsonb_typeof(p_veri) <> 'object' or pg_column_size(p_veri) > 100000 then raise exception 'veri_gecersiz'; end if;
  insert into public.junior_ilerleme (ogrenci_id, veri, guncelleme) values (og, p_veri, t)
    on conflict (ogrenci_id) do update set veri = excluded.veri, guncelleme = t;
  update public.ogrenciler set son_giris = t where id = og;
  return t;
end $$;

-- Öğretmen paneli: sınıfın öğrencileri ve Junior ilerlemeleri (erişim kontrolü eski _sinifim ile)
create or replace function public.junior_sinif_raporu(p_sinif uuid) returns jsonb
language plpgsql stable security definer set search_path = public as $$
begin
  perform public._sinifim(p_sinif);
  return coalesce((select jsonb_agg(jsonb_build_object('id', o.id, 'takma_ad', o.takma_ad, 'pin', o.pin, 'son_giris', o.son_giris,
           'guncelleme', j.guncelleme, 'veri', coalesce(j.veri, '{}'::jsonb)) order by lower(o.takma_ad))
           from public.ogrenciler o left join public.junior_ilerleme j on j.ogrenci_id = o.id where o.sinif_id = p_sinif), '[]'::jsonb);
end $$;

-- Yetkiler: yalnızca giriş yapmış oturumlar (öğrencinin anonim oturumu dahil)
revoke execute on function public.junior_ilerleme_getir(), public.junior_ilerleme_kaydet(jsonb), public.junior_sinif_raporu(uuid) from public, anon;
grant execute on function public.junior_ilerleme_getir(), public.junior_ilerleme_kaydet(jsonb), public.junior_sinif_raporu(uuid) to authenticated;
