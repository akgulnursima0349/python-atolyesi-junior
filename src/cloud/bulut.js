/* Bulut katmanı: hesaplar ve ilerlemenin Supabase'de saklanması.
   public/ayarlar.js içinde Supabase adresi ve publishable anahtar varsa "bulut" modu: öğrenci sınıf kodu + takma ad + PIN ile girer,
   ilerlemesi her cihazda aynıdır. Ayar yoksa "yerel" mod: hesap yok, ilerleme yalnızca bu tarayıcıda.
   { mock: true } → tarayıcı içi sahte sunucu (otomatik test ve önizleme). */
import { store } from "../core/store.js";

const AYAR = (typeof window !== "undefined" && window.JUNIOR_AYAR) || {};
export const bulut = {
  mod: AYAR.mock || (AYAR.supabaseUrl && AYAR.supabaseKey) ? "bulut" : "yerel",
  deneme: !!AYAR.mock,
  ben: { rol: null },       // { rol: "ogrenci", takma_ad, sinif, sinif_kod } | { rol: "ogretmen", ad, mudur } | { rol: null }
  durum: "hazir",           // hazir | kaydediliyor | kaydedildi | hata
  hata: "",
  dinleyiciler: new Set()
};
let api = null, zaman = null, kirli = false, yaziyor = false, tekrar = 0;

const MESAJ = {
  gecersiz_giris: "Sınıf kodu, takma ad ya da PIN hatalı. Kontrol edip tekrar dene.",
  cok_deneme: "Çok fazla hatalı deneme yapıldı. 15 dakika sonra tekrar dene ya da öğretmenine sor.",
  kurum_kodu_hatali: "Kurum kodu geçersiz.",
  yetki_yok: "Bu işlem için yetkiniz bulunmuyor.",
  oturum_yok: "Oturumun süresi doldu. Lütfen yeniden giriş yap.",
  giris_gerekli: "Bu işlem için giriş yapmanız gerekiyor.",
  ogretmen_hesabi: "Bu tarayıcıda açık bir öğretmen oturumu var. Öğrenci girişi için önce çıkış yapın.",
  cok_fazla: "Tek seferde en fazla 60 öğrenci eklenebilir.",
  kendini_kapatamazsin: "Kendi hesabınızın erişimini kapatamazsınız.",
  ag: "Sunucuya bağlanılamadı. İnternet bağlantısını kontrol edip tekrar dene.",
  "Invalid login credentials": "E-posta adresi veya şifre hatalı.",
  "Email not confirmed": "E-posta adresiniz henüz doğrulanmadı. Gelen kutunuzdaki doğrulama bağlantısını kullanın.",
  "User already registered": "Bu e-posta adresiyle kayıtlı bir hesap zaten var."
};
/* Kullanıcıya sade mesaj; teknik ayrıntı yalnızca konsolda */
export function hataMetni(e) {
  const k = (e && (e.code || e.message)) || String(e);
  for (const a of Object.keys(MESAJ)) if (k.includes(a)) return MESAJ[a];
  if (/fetch|network|Failed to/i.test(k)) return MESAJ.ag;
  if (/Password should be/i.test(k)) return "Şifre en az 6 karakter olmalıdır.";
  if (/rate limit|too many/i.test(k)) { console.warn("[junior]", k); return "Çok sayıda istek gönderildi. Biraz bekleyip tekrar deneyin."; }
  if (/anonymous/i.test(k)) { console.error("[junior] Anonim giriş kapalı:", k); return "Öğrenci girişi şu anda kullanılamıyor. Öğretmenine haber ver."; }
  if (/junior_/.test(k)) { console.error("[junior] junior.sql kurulmamış olabilir:", k); return "Sistem henüz hazır değil. Öğretmenine haber ver."; }
  console.error("[junior]", e);
  return "Beklenmeyen bir hata oluştu. Sayfayı yenileyip tekrar dene.";
}
const yay = () => bulut.dinleyiciler.forEach((f) => { try { f(bulut); } catch (_) {} });
export const bulutDinle = (f) => { bulut.dinleyiciler.add(f); return () => bulut.dinleyiciler.delete(f); };

async function baglan() {
  if (AYAR.mock) { const m = await import("./mock.js"); return m.mockApi(); }
  const { createClient } = await import("@supabase/supabase-js");
  const sb = createClient(AYAR.supabaseUrl, AYAR.supabaseKey, { auth: { persistSession: true, autoRefreshToken: true, storageKey: "atolye-junior-auth" } });
  const ac = ({ data, error }) => { if (error) { const e = new Error(error.message); e.code = error.message; throw e; } return data; };
  return {
    rpc: async (fn, args) => ac(await sb.rpc(fn, args || {})),
    session: async () => ac(await sb.auth.getSession()).session,
    signInAnon: async () => ac(await sb.auth.signInAnonymously()),
    signIn: async (email, password) => ac(await sb.auth.signInWithPassword({ email, password })),
    signUp: async (email, password) => ac(await sb.auth.signUp({ email, password, options: { emailRedirectTo: location.href.split("#")[0] } })),
    signOut: async () => { await sb.auth.signOut(); }
  };
}

/* Açılışta: oturum varsa kim olduğunu öğren, öğrenciyse ilerlemesini çek */
export async function bulutBaslat() {
  if (bulut.mod !== "bulut") return;
  store.onDegisim(planla);
  try {
    api = await baglan();
    const s = await api.session();
    bulut.ben = s ? await api.rpc("ben") : { rol: null };
    if (bulut.ben.rol === "ogrenci") await cek();
    else if (bulut.ben.rol === "ogretmen") store.setTeacher(true);
    else { store.setTeacher(false); store.yukle({}); }
  } catch (e) {
    bulut.ben = { rol: null }; bulut.durum = "hata"; bulut.hata = hataMetni(e);
  }
  yay();
}

/* ---------- ilerleme: bulutta tek kopya, cihazda önbellek ---------- */
async function cek() {
  const r = await api.rpc("junior_ilerleme_getir");
  store.setTeacher(false);
  store.yukle((r && r.veri) || {});
  bulut.durum = "kaydedildi";
}
function planla() {
  if (bulut.ben.rol !== "ogrenci") return;
  kirli = true;
  clearTimeout(zaman);
  zaman = setTimeout(yaz, tekrar ? Math.min(30000, 2000 * 2 ** tekrar) : 1000);
  if (bulut.durum !== "kaydediliyor") { bulut.durum = "kaydediliyor"; yay(); }
}
async function yaz() {
  if (yaziyor || !kirli) return;
  yaziyor = true; kirli = false;
  try {
    await api.rpc("junior_ilerleme_kaydet", { p_veri: store.veri() });
    tekrar = 0; bulut.durum = kirli ? "kaydediliyor" : "kaydedildi";
  } catch (e) {
    kirli = true; tekrar++; bulut.durum = "hata"; bulut.hata = hataMetni(e);
    if (/oturum_yok/.test(e.message || "")) { bulut.ben = { rol: null }; store.yukle({}); location.hash = "giris"; }
  }
  yaziyor = false; yay();
  if (kirli) { clearTimeout(zaman); zaman = setTimeout(yaz, tekrar ? Math.min(30000, 2000 * 2 ** tekrar) : 600); }
}
if (typeof window !== "undefined") addEventListener("pagehide", () => { if (kirli) yaz(); });
export const bekleyenVar = () => kirli || yaziyor;
/* testler için: bekleyen kaydı hemen yaz */
export async function simdiKaydet() { clearTimeout(zaman); if (kirli) await yaz(); }

/* ---------- giriş / çıkış ---------- */
export async function ogrenciGiris(kod, ad, pin) {
  if (bulut.ben.rol === "ogretmen") await cikis(true);
  if (!(await api.session())) await api.signInAnon();
  const r = await api.rpc("ogrenci_giris", { p_kod: kod, p_takma_ad: ad, p_pin: pin });
  if (r && r.hata) { const e = new Error(r.hata); e.code = r.hata; throw e; }
  bulut.ben = r;
  await cek();
  yay();
  return r;
}
export async function ogretmenGiris(eposta, sifre) {
  if (bulut.ben.rol) await cikis(true);
  else if (await api.session()) await api.signOut();
  await api.signIn(eposta, sifre);
  bulut.ben = await api.rpc("ben");
  if (bulut.ben.rol === "ogretmen") { store.yukle({}); store.setTeacher(true); }
  yay();
  return bulut.ben; // rol null: hesap var ama öğretmen kaydı tamamlanmamış (ya da erişimi kapatılmış: pasif)
}
export async function ogretmenKaydol(eposta, sifre) {
  if (await api.session()) { await api.signOut(); bulut.ben = { rol: null }; }
  const r = await api.signUp(eposta, sifre);
  return { onayGerekli: !r.session };
}
export async function ogretmenTamamla(ad, kurumKodu) {
  bulut.ben = await api.rpc("ogretmen_kaydol", { p_ad: ad, p_kurum_kodu: kurumKodu });
  store.yukle({}); store.setTeacher(true);
  yay();
  return bulut.ben;
}
/* e-posta onayından dönmüş ama öğretmen kaydını tamamlamamış hesap (öğrencinin anonim oturumu sayılmaz) */
export async function tamamlanmamisHesap() {
  if (!api || bulut.ben.rol || bulut.ben.pasif) return false;
  const s = await api.session();
  return !!s && !(s.anon || (s.user && s.user.is_anonymous));
}
export async function cikis(sessiz) {
  clearTimeout(zaman);
  if (kirli && bulut.ben.rol === "ogrenci") { try { await yaz(); } catch (_) {} }
  try { if (bulut.ben.rol === "ogrenci") await api.rpc("ogrenci_cikis"); } catch (_) {}
  try { await api.signOut(); } catch (_) {}
  bulut.ben = { rol: null }; bulut.durum = "hazir";
  store.setTeacher(false); store.yukle({});
  if (!sessiz) yay();
}

/* ---------- öğretmen işlemleri (eski sitenin fonksiyonları + Junior raporu) ---------- */
export const panelApi = {
  siniflar: () => api.rpc("siniflarim"),
  sinifOlustur: (ad) => api.rpc("sinif_olustur", { p_ad: ad }),
  ogrenciEkle: (id, adlar) => api.rpc("ogrenci_ekle", { p_sinif: id, p_adlar: adlar }),
  pinYenile: (id) => api.rpc("ogrenci_pin_yenile", { p_ogrenci: id }),
  ogrenciSil: (id) => api.rpc("ogrenci_sil", { p_ogrenci: id }),
  rapor: (id) => api.rpc("junior_sinif_raporu", { p_sinif: id }),
  mudurOgretmenler: () => api.rpc("mudur_ogretmenler"),
  aktiflik: (t, aktif) => api.rpc("ogretmen_aktiflik", { p_ogretmen: t, p_aktif: aktif })
};
