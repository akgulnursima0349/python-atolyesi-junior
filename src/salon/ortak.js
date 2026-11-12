/* Oyun Salonu ortak yardımcıları */
export const karistir = (a) => {
  const b = [...a];
  for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; }
  return b;
};
export const sec = (a, n) => karistir(a).slice(0, n);
export const rastgele = (min, max) => min + Math.floor(Math.random() * (max - min + 1));
export const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/* İlk denemede doğru yaparsa 1 yıldız; yanlışlar sayılır ama ceza yok */
export function sayac() {
  let hata = 0;
  return { hata: () => hata++, yildiz: () => (hata === 0 ? 1 : 0), kac: () => hata };
}
