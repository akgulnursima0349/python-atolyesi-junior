/* Python çalıştırıcı (Skulpt). İlk ihtiyaçta yüklenir; açılışı yavaşlatmaz.
   run(kod) → { out: [satırlar], hata: { mesaj, satir } | null } */
let yukleniyor = null;
function script(src) {
  return new Promise((ok, no) => { const s = document.createElement("script"); s.src = src; s.onload = ok; s.onerror = () => no(new Error("yuklenemedi")); document.head.append(s); });
}
export function hazirla() {
  if (window.Sk && window.Sk.builtinFiles) return Promise.resolve();
  if (!yukleniyor) {
    const kok = new URL("vendor/", document.baseURI).href;
    yukleniyor = script(kok + "skulpt.min.js").then(() => script(kok + "skulpt-stdlib.js")).catch((e) => { yukleniyor = null; throw e; });
  }
  return yukleniyor;
}

const ADIM_SINIRI = 20000;
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;");

/* Yazım hatasının sebebini satıra bakarak tahmin et (4. sınıfa uygun cümleler) */
function yazimIpucu(kod, satir) {
  const L = kod.split("\n"), s = (L[satir - 1] || "").trim();
  let o = satir - 2, araYorum = false;
  while (o >= 0 && (!L[o].trim() || /^\s*#/.test(L[o]))) { if (L[o].trim()) araYorum = true; o--; }
  const onceki = o >= 0 ? L[o] : "";
  if (/:\s*(#.*)?$/.test(onceki.trim()) && (L[satir - 1] || "").search(/\S/) <= onceki.search(/\S/))
    return araYorum || !s ? "<code>:</code> ile biten satırın altına en az <b>bir komut</b> yazmalısın (4 boşluk içeride)." : "Bu satır <b>4 boşluk içeride</b> olmalı.";
  if (/^(for|if|elif|else|while|def)\b/.test(s) && !/:\s*(#.*)?$/.test(s)) return "Satırın sonunda <code>:</code> eksik.";
  const u = s.replace(/#.*$/, "");
  if ((u.match(/"/g) || []).length % 2) return "Bir tırnak <code>\"</code> kapanmamış.";
  if ((u.match(/\(/g) || []).length !== (u.match(/\)/g) || []).length) return "Parantezler eşit değil: açılan kadar kapanmalı.";
  return null;
}

function cevir(e, satir, kod) {
  if (e && e.atolye) return { mesaj: e.message, satir };
  let ad = "", ham = String(e);
  try { ad = e.tp$name || ""; } catch (_) {}
  try { if (e.traceback && e.traceback.length) satir = e.traceback[0].lineno; } catch (_) {}
  const ayrinti = ham.replace(/ on line \d+[\s\S]*$/, "").replace(/^\w+: /, "");
  let mesaj;
  if (ad === "NameError") {
    const m = ayrinti.match(/name '([^']+)'/);
    mesaj = `Python <code>${esc(m ? m[1] : "?")}</code> diye bir şey tanımıyor. Yazımı kontrol et.`;
  } else if (ad === "IndentationError") mesaj = yazimIpucu(kod, satir) || "Girinti hatası: <code>:</code> ile biten satırın altı 4 boşluk içeride olmalı.";
  else if (/SyntaxError|ParseError|TokenError/.test(ad)) mesaj = yazimIpucu(kod, satir) || "Yazım hatası. <code>:</code>, parantez ve tırnaklara bak.";
  else if (ad === "TypeError") mesaj = "Sayı ile yazıyı karıştırdın gibi görünüyor.";
  else if (ad === "ZeroDivisionError") mesaj = "Sıfıra bölünemez!";
  else mesaj = "Python bir hata buldu.";
  return { mesaj, satir: /en az <b>bir komut/.test(mesaj) ? null : satir };
}

export async function run(kod) {
  await hazirla();
  const Sk = window.Sk, out = [];
  let buf = "", adim = 0, satir = 0;
  Sk.configure({
    output: (t) => { buf += t; const p = buf.split("\n"); buf = p.pop(); out.push(...p); },
    read: (x) => { if (!Sk.builtinFiles || Sk.builtinFiles.files[x] === undefined) throw "Dosya yok: " + x; return Sk.builtinFiles.files[x]; },
    inputfun: () => { const e = new Error("Burada <code>input()</code> kullanmıyoruz."); e.atolye = true; throw e; },
    inputfunTakesPrompt: true,
    __future__: Sk.python3, debugging: true, execLimit: null, yieldLimit: null
  });
  Sk.breakpoints = () => true;
  let hata = null;
  try {
    let r = Sk.importMainWithBody("<bit>", false, kod, true);
    while (r instanceof Sk.misceval.Suspension) {
      if (r.data && r.data.type === "Sk.debug") {
        let c = r; while (c) { if (c.$lineno != null) satir = c.$lineno; c = c.child; }
        if (++adim > ADIM_SINIRI) { const e = new Error("Program hiç durmadı! Bitmeyen bir döngü olabilir mi?"); e.atolye = true; throw e; }
      }
      r = r.resume();
    }
  } catch (e) { hata = cevir(e, satir, kod); }
  if (buf) out.push(buf);
  return { out, hata };
}
