/* Yapay zekâ görselleri: src/assets/img klasöründe olanlar paketlenir, olmayanlar için null döner.
   Böylece görsel gelmeden de site kırık resim göstermez. */
const DOSYALAR = import.meta.glob("../assets/img/*.{webp,png,jpg,jpeg}", { eager: true, query: "?url", import: "default" });
const ADLAR = {};
for (const [yol, url] of Object.entries(DOSYALAR)) ADLAR[yol.split("/").pop().replace(/\.\w+$/, "")] = url;

export const gorsel = (ad) => ADLAR[ad] || null;
export function gorselEtiketi(ad, cls = "", alt = "") {
  const u = gorsel(ad);
  return u ? `<img class="${cls}" src="${u}" alt="${alt}" loading="lazy" decoding="async">` : "";
}
