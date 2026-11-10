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

async function oynaDongu(p, shot) {
  // 1 kısalt
  await p.click("text=Döngüyle kısalt"); await p.waitForSelector(".next:not([hidden])", { timeout: 15000 }); await shot("1"); await p.click(".next");
  // 2 pist: iki farklı sayı
  await p.click("text=▶ Koş"); await p.waitForSelector("text=▶ Tekrar koş", { timeout: 15000 });
  await p.click(".num-btn button >> nth=1"); await p.click("text=▶ Tekrar koş");
  await p.waitForSelector(".next:not([hidden])", { timeout: 20000 }); await shot("2"); await p.click(".next");
  // 3 tahmin: önce yanlış, sonra doğru
  await p.click(".opt >> nth=0"); ok(await p.isVisible(".opt.no"), "yanlış tahminde ipucu"); await p.click(".opt >> nth=1");
  await p.waitForSelector(".next:not([hidden])", { timeout: 10000 }); await p.click(".next");
  // Arduino ikizi: 5 parçaya dokun, çalıştır
  ok(await p.isHidden("text=İkisini de çalıştır"), "eşleştirme bitmeden çalıştır düğmesi gizli");
  for (let k = 1; k <= 5; k++) { await p.click(`.chunk[data-k="${k}"]`); if (k === 2) ok((await p.$$(".pk.on")).length >= 1, "Arduino parçası Python karşılığını yakıyor"); }
  await p.click("text=İkisini de çalıştır"); await p.waitForSelector(".next:not([hidden])", { timeout: 10000 });
  ok((await p.$$(".leds .lit")).length === 5, "5 LED yandı"); await shot("3b"); await p.click(".next");
  // meyve
  await p.click(".add button >> nth=0"); await p.click("text=▶ Çalıştır"); await p.waitForTimeout(700); await shot("4");
  await p.waitForSelector(".next:not([hidden])", { timeout: 20000 }); await p.click(".next");
  // 5 kumbara
  for (let i = 0; i < 9; i++) { await p.click("text=Bir adım"); await p.waitForTimeout(80); await p.waitForFunction(() => { const b = [...document.querySelectorAll(".btn")].find((x) => /Bir adım/.test(x.textContent)); return !b || !b.disabled || b.hidden; }); }
  await p.waitForSelector(".next:not([hidden])", { timeout: 5000 }); await shot("5");
  await p.click(".next");
  // Yaz: önce dokunmadan çalıştır, sonra yanlış, sonra sonsuz döngü, ipucu, doğru
  await p.click("text=▶ Çalıştır"); await p.waitForSelector(".msg.bad", { timeout: 20000 });
  ok(/en az .*bir komut/.test(await p.textContent(".msg")), "boş döngü gövdesi için Türkçe mesaj: " + (await p.textContent(".msg")));
  await p.fill(".editor", "toplam = 0\nfor sayi in range(1, 11):\n    toplam = toplam + 1\nprint(toplam)");
  await p.click("text=▶ Çalıştır"); await p.waitForFunction(() => /10/.test(document.querySelector(".msg").textContent));
  ok(/55/.test(await p.textContent(".msg")), "yanlış sonuçta hedef söyleniyor");
  await p.fill(".editor", "toplam = 0\nwhile True:\n    toplam = toplam + 1\nprint(toplam)");
  await p.click("text=▶ Çalıştır"); await p.waitForFunction(() => /durmadı/.test(document.querySelector(".msg").textContent), null, { timeout: 30000 });
  ok(true, "sonsuz döngü durduruldu ve Türkçe mesaj verildi");
  ok(await p.isVisible("text=💡 İpucu"), "3 başarısızlıktan sonra ipucu düğmesi çıktı");
  for (let i = 0; i < 3; i++) await p.click("text=💡 İpucu");
  await p.click("text=Kutuya yaz"); await p.click("text=▶ Çalıştır");
  await p.waitForSelector(".msg.ok", { timeout: 10000 }); await shot("yaz"); ok(true, "ipucu çözümü 55 verdi");
  await p.click(".next");
  // 6 görev: önce eksik, sonra doğru; zor görev
  await p.click("text=▶ Çalıştır"); await p.waitForSelector("text=▶ Tekrar dene", { timeout: 10000 });
  ok(/ulaşamadı/.test(await p.textContent(".bubble")), "eksik adımda Bit uyarıyor");
  for (let i = 0; i < 4; i++) await p.click(".num-btn button >> nth=1");
  await p.click("text=▶ Tekrar dene"); await p.waitForSelector(".next:not([hidden])", { timeout: 15000 }); await p.click(".next");
  for (let i = 0; i < 3; i++) await p.click(".num-btn button >> nth=1");
  await p.click("text=▶ Çalıştır"); await p.waitForSelector(".next:not([hidden])", { timeout: 15000 }); await shot("6"); await p.click(".next");
  await p.waitForSelector(".end"); await shot("son");
}

const bekleDevam = (p, t = 20000) => p.waitForSelector(".next:not([hidden])", { timeout: t });
const devam = async (p) => { await bekleDevam(p); await p.click(".next"); };

async function oynaDil(p, shot) {
  // tarif: önce yanlış sıra (görünen sıra), sonra geri al, doğru sıra
  ok(await p.isHidden(".next"), "Devam düğmesi iş bitmeden gizli");
  for (let k = 0; k < 4; k++) await p.click(".havuz .kart >> nth=0");
  await p.click("text=▶ Çalıştır"); await p.waitForSelector("text=▶ Tekrar çalıştır", { timeout: 10000 });
  ok(/fırça|Macun|çalkala|karıştı/i.test(await p.textContent(".bubble")), "yanlış tarifte Bit komik hata yapıyor");
  for (let k = 0; k < 4; k++) await p.click(".prog .kart >> nth=0");
  for (const t of ["Fırçayı al", "Macunu sür", "Dişlerini fırçala", "Ağzını çalkala"]) await p.click(`.havuz .kart:has-text("${t}")`);
  await p.click("text=Tekrar çalıştır"); await shot("d1_1"); await devam(p);
  // lambalar
  for (const hedef of [[2, 4], [1, 2], [0, 2, 4]]) { for (const i of hedef) await p.click(`.lamp[data-i="${i}"]`); await p.waitForTimeout(900); }
  await shot("d1_2"); await devam(p);
  // harfler
  await p.fill("#ad-kutu", "Ayşe"); await p.click("text=Bilgisayara çevir"); await bekleDevam(p);
  ok((await p.$$(".letter-row")).length === 4, "adın her harfi bir satır"); await shot("d1_3"); await p.click(".next");
  // lamba tahmin
  await p.click(".opt >> nth=1"); ok(await p.isVisible(".opt.no"), "yanlış lamba tahmininde ipucu"); await p.click(".opt >> nth=0"); await devam(p);
  // merdiven
  for (let k = 0; k < 3; k++) { await p.click("text=Bir basamak in"); await p.waitForTimeout(300); }
  await shot("d1_5"); await devam(p);
  // çevirmen
  await p.click(".opt >> nth=1"); await p.click(".opt >> nth=0"); await bekleDevam(p); await shot("d1_6"); await p.click(".next");
  // sıralı print: önce görünen sıra (yanlış), sonra doğru
  for (let k = 0; k < 3; k++) await p.click(".havuz .kart >> nth=0");
  await p.click("text=▶ Çalıştır"); await p.waitForSelector(".sonuc.bad", { timeout: 10000 });
  for (let k = 0; k < 3; k++) await p.click(".prog .kart >> nth=0");
  for (const t of ["Merhaba!", "Ben Bit.", "Hadi"]) await p.click(`.havuz .kart:has-text("${t}")`);
  await p.click("text=Tekrar çalıştır"); await bekleDevam(p); await shot("d1_7"); await p.click(".next");
  await p.waitForSelector(".end");
}

async function oynaIlk(p, shot) {
  await p.fill(".code-input", "Selam!"); await p.click("text=▶ Çalıştır"); await bekleDevam(p);
  ok((await p.textContent(".speech")) === "Selam!", "print'teki yazıyı Bit söylüyor"); await shot("d2_1"); await p.click(".next");
  await p.click(".opt >> nth=0"); await p.click(".opt >> nth=1"); await devam(p);
  await p.click(".opt:has-text('Ada')"); await p.click("text=▶ Çalıştır"); await bekleDevam(p);
  ok((await p.textContent(".vbox-val")) === '"Ada"', "kutuya isim düştü"); await shot("d2_3"); await p.click(".next");
  await p.click(".opt:has-text('53')"); await p.click(".opt:has-text('8')"); await bekleDevam(p); await shot("d2_4"); await p.click(".next");
  await p.click("text=▶ Hesapla"); await p.click(".opt.op >> nth=2"); await p.click("text=▶ Hesapla"); await p.click(".opt.op >> nth=3"); await p.click("text=▶ Hesapla");
  await p.waitForTimeout(500); ok(/3\.5/.test(await p.textContent(".calc-eq")), "7 / 2 = 3.5"); await shot("d2_5"); await devam(p);
  await p.click("text=▶ Birleştir"); await p.click("text=▶ Tekrarla"); await bekleDevam(p); await shot("d2_6"); await p.click(".next");
  await p.fill(".editor", 'isim = "Bit"\nyas = 10\nprint("Bit")'); await p.click("text=▶ Çalıştır");
  await p.waitForSelector(".msg.bad", { timeout: 20000 }); ok(/elle/.test(await p.textContent(".msg")), "elle yazılan isim için kutuyu kullan uyarısı");
  await p.fill(".editor", 'isim = "Bit"\nyas = 10\nprint(isim)'); await p.click("text=▶ Çalıştır");
  await p.waitForSelector(".msg.ok", { timeout: 10000 }); await shot("d2_7"); await p.click(".next");
  await p.waitForSelector(".end");
}

async function oynaKarar(p, shot) {
  await p.click("text=▶ Çalıştır"); await p.waitForSelector(".umbrella.on");
  ok(await p.isDisabled(".opt:has-text('Güneş')"), "çalışırken hava değiştirilemiyor");
  await p.waitForSelector(".opt:has-text('Güneş'):not([disabled])");
  await p.click(".opt:has-text('Güneş')"); await p.click("text=▶ Çalıştır"); await bekleDevam(p);
  ok(await p.isHidden(".umbrella.on"), "güneşte şemsiye satırı atlandı"); await shot("d3_1"); await p.click(".next");
  await p.click(".ok-btn"); await p.waitForTimeout(600);
  await p.click(".ok-btn"); ok(/Hayır/.test(await p.textContent(".bubble")), "yanlış karşılaştırmada açıklama"); await p.waitForTimeout(450);
  await p.click(".no-btn"); await p.waitForTimeout(600); await p.click(".ok-btn"); await p.waitForTimeout(600); await p.click(".no-btn");
  await bekleDevam(p); await shot("d3_2"); await p.click(".next");
  await p.evaluate(() => { const r = document.querySelector("#sic"); r.value = 32; r.dispatchEvent(new Event("input")); });
  ok(await p.isVisible(".fan.spin"), "25'in üstünde fan dönüyor"); await shot("d3_3");
  await p.evaluate(() => { const r = document.querySelector("#sic"); r.value = 10; r.dispatchEvent(new Event("input")); });
  await devam(p);
  for (const r of ["kırmızı", "sarı", "yeşil"]) { await p.click(`.tl[data-r="${r}"]`); await p.waitForTimeout(2600); }
  await shot("d3_4"); await devam(p);
  await p.click("text=▶ Çalıştır"); await p.waitForTimeout(1600); await p.click("text=İçeri al"); await p.click("text=▶ Çalıştır");
  await bekleDevam(p); await shot("d3_5"); await p.click(".next");
  await p.click(".bugline >> nth=0"); ok(/Başka yere/.test(await p.textContent(".bubble")), "doğru satıra dokununca uyarı");
  for (const k of [1, 1, 2]) { await p.waitForTimeout(450); await p.click(`.bugline >> nth=${k}`); await p.waitForTimeout(1500); }
  await bekleDevam(p); await p.click(".next");
  await p.fill(".editor", 'sicaklik = 30\nif sicaklik > 25:\n    print("Fan açık")'); await p.click("text=▶ Çalıştır");
  await p.waitForSelector(".msg.ok", { timeout: 20000 }); await shot("d3_7"); await p.click(".next");
  await p.waitForSelector(".end");
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
    const kelime = [];
    await p.exposeFunction("bubbleLog", (t) => kelime.push(t)).catch(() => {});
    await p.evaluate(() => new MutationObserver(() => { const b = document.querySelector(".bubble"); if (b && b.dataset.seen !== b.textContent) { b.dataset.seen = b.textContent; window.bubbleLog(b.textContent); } }).observe(document.body, { childList: true, subtree: true }));
    const durumlar = await p.$$eval(".node", (n) => n.map((x) => x.className.replace("node ", "")));
    ok(durumlar.length === 10, "harita 10 dünya gösteriyor");
    ok(durumlar[0] === "acik" && durumlar.slice(1, 4).every((d) => d === "kilitli"), "yalnızca Dünya 1 açık, 2–4 kilitli");
    ok(!(await tasma()), "haritada yatay taşma yok");
    await p.click('.node[data-no="3"]'); ok(/önceki/.test(await p.textContent(".bubble")), "kilitli dünyaya dokununca Bit uyarıyor");
    await p.click('.node[data-no="5"]'); ok(/hazırlanıyor/.test(await p.textContent(".bubble")), "hazırlanan dünyaya dokununca Bit açıklıyor");

    const oyunlar = [[1, oynaDil], [2, oynaIlk], [3, oynaKarar], [4, oynaDongu]];
    for (const [no, oyna] of oyunlar) {
      await p.click(`.node[data-no="${no}"]`); await p.waitForSelector(".card .say");
      ok(!(await tasma()), `Dünya ${no} ekranında yatay taşma yok`);
      await oyna(p, shot);
      ok(!(await tasma()), `Dünya ${no} sonunda yatay taşma yok`);
      await p.click("text=Haritaya dön");
      await p.waitForSelector(`.node[data-no="${no}"].bitti`);
      if (no === 1) ok(await p.evaluate(() => !window.Sk), "Python (Skulpt) ilk Yaz ekranına kadar yüklenmedi");
      if (no < 4) ok(await p.isVisible(`.node[data-no="${no + 1}"].acik`), `Dünya ${no} bitince Dünya ${no + 1} açıldı`);
    }
    const yildiz = Number(await p.textContent(".m-top .score span"));
    ok(yildiz === 37, `toplam yıldız 37 (bulunan ${yildiz})`);
    const uzun = [...new Set(kelime)].filter((t) => t.trim().split(/\s+/).length > 12);
    ok(uzun.length === 0, "Bit cümleleri en fazla 12 kelime" + (uzun.length ? ": " + uzun.join(" | ") : ""));

    // ses tercihi ve yenileme sonrası kalıcılık
    await p.click(".icon-btn"); await p.reload(); await p.waitForSelector(".node");
    ok((await p.getAttribute(".icon-btn", "aria-label")) === "Sesi aç", "ses tercihi yenilemede korunuyor");
    ok(await p.isVisible('.node[data-no="3"].bitti'), "ilerleme yenilemede korunuyor");

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
    ok(await p.isVisible('.node[data-no="1"].acik'), "sıfırlama ilerlemeyi siliyor");

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
