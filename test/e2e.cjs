// Faz 0 uçtan uca testi:  node test/e2e.cjs  (önce: npx vite build)
// Bitti tanımındaki maddeleri sırayla dener; her genişlikte taşmayı ve konsol hatalarını raporlar.
const { chromium } = require("playwright");
const http = require("http"), fs = require("fs"), path = require("path");

const DIST = path.join(__dirname, "..", "dist");
const OUT = process.env.EKRAN || path.join(__dirname, "ekran");
fs.mkdirSync(OUT, { recursive: true });
const TIP = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".svg": "image/svg+xml", ".webp": "image/webp" };
const srv = http.createServer((q, r) => {
  const f = path.join(DIST, decodeURIComponent(q.url.split("?")[0]) === "/" ? "index.html" : decodeURIComponent(q.url.split("?")[0]));
  fs.readFile(f, (e, d) => { if (e) { r.writeHead(404); return r.end(); } r.writeHead(200, { "Content-Type": TIP[path.extname(f)] || "application/octet-stream" }); r.end(d); });
}).listen(0);
const URL = `http://127.0.0.1:${srv.address().port}/`;

let hata = 0;
const ok = (kosul, ad) => { console.log(`${kosul ? "  ✓" : "  ✗"} ${ad}`); if (!kosul) hata++; };

async function oyna(p, shot) {
  // 1 kısalt
  await p.click("text=Döngüyle kısalt"); await p.waitForSelector(".next:not([hidden])", { timeout: 15000 }); await shot("1"); await p.click(".next");
  // 2 pist: iki farklı sayı
  await p.click("text=▶ Koş"); await p.waitForSelector("text=▶ Tekrar koş", { timeout: 15000 });
  await p.click(".num-btn button >> nth=1"); await p.click("text=▶ Tekrar koş");
  await p.waitForSelector(".next:not([hidden])", { timeout: 20000 }); await shot("2"); await p.click(".next");
  // 3 tahmin: önce yanlış, sonra doğru
  await p.click(".opt >> nth=0"); ok(await p.isVisible(".opt.no"), "yanlış tahminde ipucu"); await p.click(".opt >> nth=1");
  await p.waitForSelector(".next:not([hidden])", { timeout: 10000 }); await p.click(".next");
  // 4 meyve
  await p.click(".add button >> nth=0"); await p.click("text=▶ Çalıştır"); await p.waitForTimeout(700); await shot("4");
  await p.waitForSelector(".next:not([hidden])", { timeout: 20000 }); await p.click(".next");
  // 5 kumbara
  for (let i = 0; i < 9; i++) { await p.click("text=Bir adım"); await p.waitForTimeout(80); await p.waitForFunction(() => { const b = [...document.querySelectorAll(".btn")].find((x) => /Bir adım/.test(x.textContent)); return !b || !b.disabled || b.hidden; }); }
  await p.waitForSelector(".next:not([hidden])", { timeout: 5000 }); await shot("5"); await p.click(".next");
  // 6 görev: önce eksik, sonra doğru; zor görev
  await p.click("text=▶ Çalıştır"); await p.waitForSelector("text=▶ Tekrar dene", { timeout: 10000 });
  ok(/ulaşamadı/.test(await p.textContent(".bubble")), "eksik adımda Bit uyarıyor");
  for (let i = 0; i < 4; i++) await p.click(".num-btn button >> nth=1");
  await p.click("text=▶ Tekrar dene"); await p.waitForSelector(".next:not([hidden])", { timeout: 15000 }); await p.click(".next");
  for (let i = 0; i < 3; i++) await p.click(".num-btn button >> nth=1");
  await p.click("text=▶ Çalıştır"); await p.waitForSelector(".next:not([hidden])", { timeout: 15000 }); await shot("6"); await p.click(".next");
  await p.waitForSelector(".end"); await shot("son");
}

(async () => {
  const b = await chromium.launch(process.env.CHROMIUM ? { executablePath: process.env.CHROMIUM } : {});
  for (const [ad, vp, touch] of [["masaustu", { width: 1280, height: 860 }, false], ["tablet", { width: 820, height: 1180 }, true], ["telefon", { width: 390, height: 844 }, true]]) {
    console.log(`\n${ad} (${vp.width}px)`);
    const ctx = await b.newContext({ viewport: vp, hasTouch: touch });
    const p = await ctx.newPage();
    const errs = [];
    p.on("pageerror", (e) => errs.push(String(e)));
    p.on("console", (m) => { if (m.type() === "error" && !/fonts\.g|ERR_TUNNEL|net::/.test(m.text())) errs.push(m.text()); });
    const shot = (n) => p.screenshot({ path: `${OUT}/${ad}_${n}.png` });
    const tasma = () => p.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1);

    await p.goto(URL); await p.waitForSelector(".node");
    await shot("harita");
    const durumlar = await p.$$eval(".node", (n) => n.map((x) => x.className.replace("node ", "")));
    ok(durumlar.length === 10, "harita 10 dünya gösteriyor");
    ok(durumlar[3] === "acik" && durumlar.filter((d) => d === "acik").length === 1, "yalnızca Dünya 4 açık (1–3 hazırlanıyor)");
    ok(!(await tasma()), "haritada yatay taşma yok");
    await p.click('.node[data-no="1"]'); ok(/hazırlanıyor/.test(await p.textContent(".bubble")), "hazırlanan dünyaya dokununca Bit açıklıyor");

    await p.click('.node[data-no="4"]'); await p.waitForSelector(".card .say");
    ok(!(await tasma()), "dünya ekranında yatay taşma yok");
    await oyna(p, shot);
    ok(!(await tasma()), "dünya sonunda yatay taşma yok");
    await p.click("text=Haritaya dön");
    await p.waitForSelector('.node[data-no="4"].bitti');
    ok(true, "Dünya 4 haritada bitti görünüyor");
    const yildiz = Number(await p.textContent(".m-top .score span"));
    ok(yildiz === 10, `toplam yıldız 10 (bulunan ${yildiz})`);

    // ses tercihi ve yenileme sonrası kalıcılık
    await p.click(".icon-btn"); await p.reload(); await p.waitForSelector(".node");
    ok((await p.getAttribute(".icon-btn", "aria-label")) === "Sesi aç", "ses tercihi yenilemede korunuyor");
    ok(await p.isVisible('.node[data-no="4"].bitti'), "ilerleme yenilemede korunuyor");

    // öğretmen modu
    await p.click("text=Öğretmen"); await p.fill("#t-kod", "yanlis"); await p.click(".t-form .btn");
    ok(/doğru değil/.test(await p.textContent(".bubble")), "yanlış öğretmen kodu reddediliyor");
    await p.fill("#t-kod", "bit öğretmen"); await p.click(".t-form .btn");
    ok(/açık/.test(await p.textContent(".bubble")), "doğru kod (Türkçe harf ve boşlukla) kabul ediliyor");
    await p.click("text=Haritaya git"); await p.waitForSelector(".teacher-tag");
    ok(true, "haritada Öğretmen modu etiketi var");
    await p.goto(URL + "#ogretmen"); await p.click("text=Öğretmen modunu kapat");
    ok(/kapandı/.test(await p.textContent(".bubble")), "öğretmen modu kapatılabiliyor");
    await p.click("text=Bu cihazdaki ilerlemeyi sıfırla"); await p.click("text=Emin misin? Tekrar bas");
    await p.goto(URL + "#harita"); await p.waitForSelector(".node");
    ok(await p.isVisible('.node[data-no="4"].acik'), "sıfırlama ilerlemeyi siliyor");

    // kilitli dünyaya doğrudan adresle girilemiyor
    await p.goto(URL + "#dunya-9"); await p.waitForSelector(".node");
    ok(true, "hazır olmayan dünyanın adresi haritaya döndürüyor");

    ok(errs.length === 0, "konsolda hata yok" + (errs.length ? ": " + errs.slice(0, 3).join(" | ") : ""));
    await ctx.close();
  }
  // depolama kapalıyken açılış
  const ctx = await b.newContext();
  await ctx.addInitScript(() => { Object.defineProperty(window, "localStorage", { get() { throw new Error("engelli"); } }); });
  const p = await ctx.newPage(); const errs = []; p.on("pageerror", (e) => errs.push(String(e)));
  await p.goto(URL); await p.waitForSelector(".node");
  console.log("\ndepolama engelli"); ok(errs.length === 0, "depolama engelliyken site hatasız açılıyor");
  await b.close(); srv.close();
  console.log(hata ? `\n${hata} madde başarısız` : "\nBütün maddeler geçti");
  process.exit(hata ? 1 : 0);
})();
