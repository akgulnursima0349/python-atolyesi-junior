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

/* testte cevapları sırayla seç: sayı = seçenek sırası, -1 = Bilmiyorum */
async function testCoz(p, cevaplar, bas = 0) {
  for (let i = bas; i < cevaplar.length; i++) {
    await p.waitForSelector(`.t-no:has-text("${i + 1} / 12")`);
    if (cevaplar[i] === -1) await p.click(".t-idk"); else await p.click(`.t-opt >> nth=${cevaplar[i]}`);
    await p.waitForFunction((n) => { const t = document.querySelector(".t-no"); return !t || !t.textContent.startsWith(n + " "); }, i + 1);
  }
}
const ON_CEVAP = [0, 1, 0, 1, -1, 0, 0, 0, 0, 0, 0, 0]; // 4 doğru + bilmiyorum + yalnızca son soru doğru → 5 doğru
const SON_CEVAP = [2, 0, 1, 0, 2, 3, 1, 2, 2, 0, 1, 1]; // hepsi doğru

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

async function oynaListe(p, shot) {
  for (const i of [1, 0, 2]) await p.click(`.wagon >> nth=${i}`);
  await bekleDevam(p); await shot("d5_1"); await p.click(".next");
  await p.click(".opt:has-text('🍌')"); ok(/1'den/.test(await p.textContent(".bubble")), "1'den sayma yanılgısına özel ipucu"); await p.click(".opt:has-text('🍇')"); await devam(p);
  await p.click(".add button >> nth=1"); await p.click("text=➕ append"); await p.waitForTimeout(900);
  ok((await p.$$(".train-wrap .wagon")).length === 3, "append vagon ekledi");
  await p.click("text=➖ pop"); await bekleDevam(p); await shot("d5_3"); await p.click(".next");
  // makas: a=1,b=3 → THO (2:5): a+1, b+2 ; sonra PY (0:2): a-2, b-3
  await p.click(".num-btn >> nth=0 >> button >> nth=1"); await p.click(".num-btn >> nth=1 >> button >> nth=1"); await p.click(".num-btn >> nth=1 >> button >> nth=1");
  ok(/Kestin/.test(await p.textContent(".bubble")), "THO kesildi");
  for (let k = 0; k < 2; k++) await p.click(".num-btn >> nth=0 >> button >> nth=0");
  for (let k = 0; k < 3; k++) await p.click(".num-btn >> nth=1 >> button >> nth=0");
  await bekleDevam(p); await shot("d5_4"); await p.click(".next");
  await p.click(".drawer >> nth=1"); await p.click(".drawer >> nth=2"); await bekleDevam(p); await shot("d5_5"); await p.click(".next");
  await p.click(".opt:has-text('10')"); await p.click(".opt:has-text('7')"); await devam(p);
  await p.fill(".editor", 'sepet = ["elma", "muz", "çilek"]\nprint(sepet)'); await p.click("text=▶ Çalıştır");
  await p.waitForSelector(".msg.bad", { timeout: 20000 }); ok(/append/.test(await p.textContent(".msg")), "append kullanmayana uyarı");
  await p.fill(".editor", 'sepet = ["elma", "muz"]\nsepet.append("çilek")\nprint(sepet)'); await p.click("text=▶ Çalıştır");
  await p.waitForSelector(".msg.ok", { timeout: 10000 }); await shot("d5_7"); await p.click(".next");
  await p.waitForSelector(".end");
}

async function oynaFonk(p, shot) {
  await p.click("text=selam_ver() çağır"); await p.waitForSelector(".actions .btn:not(.next):not([disabled])");
  await p.waitForTimeout(300); await p.click("text=selam_ver() çağır"); await bekleDevam(p); await shot("d6_1"); await p.click(".next");
  await p.click(".opt:has-text('Ada')"); await p.waitForTimeout(2200); await p.click(".opt:has-text('Ece')"); await bekleDevam(p); await shot("d6_2"); await p.click(".next");
  await p.click("text=▶ Çalıştır"); await p.waitForTimeout(300); await p.waitForSelector(".actions .btn:not(.next):not([disabled])", { timeout: 8000 });
  ok((await p.textContent(".chip em")) === "16", "kare(4) = 16 kutuya düştü");
  await p.click(".num-btn button >> nth=1"); await p.click("text=▶ Çalıştır"); await bekleDevam(p); await shot("d6_3"); await p.click(".next");
  await p.click(".opt:has-text('10')"); await p.click(".opt:has-text('11')"); await devam(p);
  for (const r of ["kırmızı", "mavi", "yeşil"]) { await p.click(`.color-pick:has-text("${r}")`); await p.waitForTimeout(1300); }
  ok((await p.$$(".robots .made-bot")).length === 3, "kalıptan 3 robot üretildi"); await bekleDevam(p); await shot("d6_5"); await p.click(".next");
  await p.click(".opt.wide >> nth=0"); await p.waitForTimeout(900);
  await p.click(".opt:has-text('r2')"); await p.click(".opt.wide >> nth=1"); await p.waitForTimeout(900); await p.click(".opt.wide >> nth=2");
  await bekleDevam(p); await shot("d6_6"); await p.click(".next");
  await p.click("text=▶ Çalıştır"); await p.waitForSelector(".msg.bad", { timeout: 20000 });
  ok(/çağırmadın/.test(await p.textContent(".msg")), "çağrılmayan fonksiyon için uyarı");
  await p.fill(".editor", 'def selam_ver(isim):\n    print("Merhaba " + isim)\n\nselam_ver("Bit")'); await p.click("text=▶ Çalıştır");
  await p.waitForSelector(".msg.ok", { timeout: 10000 }); await shot("d6_7"); await p.click(".next");
  await p.waitForSelector(".end");
}

const ayarla = (p, sel, v) => p.evaluate(([s, v]) => { const r = document.querySelector(s); r.value = v; r.dispatchEvent(new Event("input")); }, [sel, v]);
async function svgTikla(p, sel, fx, fy) { const b = await (await p.$(sel)).boundingBox(); await p.mouse.click(b.x + b.width * fx, b.y + b.height * fy); }
async function cizgi(p, sel, pts) {
  const b = await (await p.$(sel)).boundingBox(); await p.mouse.move(b.x + b.width * pts[0][0], b.y + b.height * pts[0][1]); await p.mouse.down();
  for (const [x, y] of pts.slice(1)) await p.mouse.move(b.x + b.width * x, b.y + b.height * y, { steps: 10 });
  await p.mouse.up();
}
function renkliPng() {
  const zlib = require("zlib"), W = 48, H = 36, satir = [];
  for (let y = 0; y < H; y++) { const r = [0]; for (let x = 0; x < W; x++) r.push(x < 16 ? 230 : x < 32 ? 40 : 250, y < 18 ? 60 : 200, (x * 5) % 255); satir.push(Buffer.from(r)); }
  const crc = (b) => { let c, t = []; for (let n = 0; n < 256; n++) { c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } c = 0xffffffff; for (const x of b) c = t[(c ^ x) & 255] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; };
  const parca = (tip, veri) => { const u = Buffer.alloc(4); u.writeUInt32BE(veri.length); const tv = Buffer.concat([Buffer.from(tip), veri]); const c = Buffer.alloc(4); c.writeUInt32BE(crc(tv)); return Buffer.concat([u, tv, c]); };
  const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(W, 0); ihdr.writeUInt32BE(H, 4); ihdr[8] = 8; ihdr[9] = 2;
  const f = path.join(require("os").tmpdir(), "foto.png");
  fs.writeFileSync(f, Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), parca("IHDR", ihdr), parca("IDAT", zlib.deflateSync(Buffer.concat(satir))), parca("IEND", Buffer.alloc(0))]));
  return f;
}

async function oynaYz(p, shot) {
  for (let i = 0; i < 4; i++) await p.click(`.ex-card[data-i="${i}"]`);
  await p.click("text=Yeni meyveyi sor"); await bekleDevam(p); ok(/portakal/.test(await p.textContent(".answer")), "model yeni meyveye portakal dedi"); await shot("d7_1"); await p.click(".next");
  await p.click("th button >> nth=1"); await p.click("text=Ortalama ağırlık"); await bekleDevam(p); await shot("d7_2"); await p.click(".next");
  await p.click("text=📈 Çiz"); await bekleDevam(p); await shot("d7_3"); await p.click(".next");
  await p.click(".opt >> nth=0"); await p.click(".opt >> nth=1"); await devam(p);
  ok(/elma/.test(await p.textContent(".verdict")), "başlangıçta model elma diyor");
  await ayarla(p, "#w", 185); await ayarla(p, "#p", 9); ok(/portakal/.test(await p.textContent(".verdict")), "ağır ve pürüzlü meyveye portakal");
  await bekleDevam(p); await shot("d7_5"); await p.click(".next");
  for (let k = 0; k < 3; k++) await p.click(".havuz .kart >> nth=0");
  await p.click("text=▶ Çalıştır"); await p.waitForSelector("text=▶ Tekrar çalıştır"); ok(/soramazsın|eğitemezsin/.test(await p.textContent(".bubble")), "yanlış model sırasında açıklama");
  for (let k = 0; k < 3; k++) await p.click(".prog .kart >> nth=0");
  for (const t of ["KNeighborsClassifier()", "model.fit", "model.predict"]) await p.click(`.havuz .kart:has-text("${t}")`);
  await p.click("text=Tekrar çalıştır"); await devam(p);
  await p.click("text=▶ Çalıştır"); await p.waitForSelector(".msg.bad", { timeout: 20000 });
  await p.fill(".editor", 'X = [[140, 2], [130, 1], [175, 8], [185, 10]]\ny = ["elma", "elma", "portakal", "portakal"]\nmodel = KNeighborsClassifier(n_neighbors=1)\nmodel.fit(X, y)\nprint(model.predict([[175, 8]]))');
  await p.click("text=▶ Çalıştır"); await p.waitForSelector(".msg.ok", { timeout: 20000 });
  ok(/portakal/.test(await p.textContent(".so-lines")), "Python'daki küçük model portakal dedi"); await shot("d7_7"); await p.click(".next");
  await p.waitForSelector(".end");
}

async function oynaRakam(p, shot) {
  await p.click("button:has-text('Sayı olarak gör')"); await bekleDevam(p); await shot("d8_1"); await p.click(".next");
  await p.waitForSelector(".sim-cand"); await p.click(".sim-cand >> nth=0"); ok(await p.isVisible(".sim-cand.no"), "benzemeyen rakamda uyarı");
  await p.click(".sim-cand >> nth=1"); await bekleDevam(p); await shot("d8_2"); await p.click(".next");
  await p.waitForSelector(".nb-target .dgrid"); await p.click("text=Komşuları bul"); await bekleDevam(p); await shot("d8_3"); await p.click(".next");
  await p.waitForTimeout(300);
  await cizgi(p, "canvas.draw", [[0.25, 0.22], [0.75, 0.22], [0.42, 0.85]]); await p.click("button:has-text('Tahmin et')");
  const t7 = await p.textContent(".guess-big"); ok(t7 === "7", `çizilen 7'yi okudu (tahmin ${t7})`);
  await p.click("button:has-text('Temizle')"); await cizgi(p, "canvas.draw", [[0.5, 0.12], [0.5, 0.88]]); await p.click("button:has-text('Tahmin et')");
  const t1 = await p.textContent(".guess-big"); ok(t1 === "1", `çizilen 1'i okudu (tahmin ${t1})`);
  await bekleDevam(p); await shot("d8_4"); await p.click(".next");
  await p.waitForSelector(".opt"); await p.click(".opt >> nth=1"); await p.click(".opt >> nth=0"); await devam(p);
  await p.click(".opt:has-text('k = 1')"); await p.waitForSelector(".opt:has-text('k = 3'):not([disabled])", { timeout: 20000 });
  await p.click(".opt:has-text('k = 3')"); await bekleDevam(p);
  ok(/%9[5-9]/.test(await p.textContent(".acc-hist")), "test doğruluğu %95'in üstünde: " + (await p.textContent(".acc-hist"))); await shot("d8_6"); await p.click(".next");
  for (const t of ["Rakamı çiz", "8×8", "64 sayıya", "komşuları", "Oyları"]) await p.click(`.havuz .kart:has-text("${t}")`);
  await p.click("text=▶ Çalıştır"); await devam(p);
  await p.waitForSelector(".end");
}

async function oynaPenguen(p, shot) {
  for (let i = 0; i < 3; i++) await p.click(`.peng-card >> nth=${i}`);
  await bekleDevam(p); await shot("d9_1"); await p.click(".next");
  await p.click(".opt:has-text('Gaga > 43')"); ok(/karışık/.test(await p.textContent(".bubble")), "kötü soruda karışık uyarısı");
  await p.click(".opt:has-text('Yüzgeç > 206')"); await bekleDevam(p); await shot("d9_2"); await p.click(".next");
  await p.click(".opt:has-text('Yüzgeç > 190')"); await p.click(".opt:has-text('Gaga > 43')"); await bekleDevam(p);
  ok(/94,4/.test(await p.textContent(".bubble")), "ağaç doğruluğu %94,4"); await shot("d9_3"); await p.click(".next");
  await p.click("text=Evet ✔"); await p.waitForTimeout(1300);
  await p.click("text=Evet ✔"); ok(/Tekrar bak/.test(await p.textContent(".bubble")), "yanlış dalda uyarı");
  await p.click("text=Hayır ✘"); await p.click("text=Evet ✔"); await bekleDevam(p); await shot("d9_4"); await p.click(".next");
  await p.click(".opt >> nth=0"); await p.click(".opt >> nth=1"); await devam(p);
  await p.click("text=🗳️ Oylat"); await bekleDevam(p); ok(/Chinstrap/.test(await p.textContent(".bubble")), "orman Chinstrap dedi"); await shot("d9_6"); await p.click(".next");
  await p.fill(".editor", 'yuzgec = 215\ngaga = 48\nprint("Gentoo")'); await p.click("text=▶ Çalıştır");
  await p.waitForSelector(".msg.bad", { timeout: 20000 }); ok(/if/.test(await p.textContent(".msg")), "if kullanmayana uyarı");
  await p.fill(".editor", 'yuzgec = 215\ngaga = 48\nif yuzgec > 206:\n    print("Gentoo")'); await p.click("text=▶ Çalıştır");
  await p.waitForSelector(".msg.ok", { timeout: 20000 }); await p.click(".next");
  await p.waitForSelector(".end");
}

async function oynaRessam(p, shot, fotograf) {
  for (const [x, y] of [[0.25, 0.25], [0.75, 0.3], [0.5, 0.75]]) await svgTikla(p, ".stage svg.plot", x, y);
  await bekleDevam(p); await shot("d10_1"); await p.click(".next");
  for (let i = 0; i < 40 && (await p.isHidden(".next")); i++) { await p.click("text=Bir adım"); await p.waitForSelector(".actions .btn:not(.next):not([disabled]), .next:not([hidden])"); }
  await bekleDevam(p); await shot("d10_2");
  ok(await p.evaluate(() => new Set([...document.querySelectorAll(".kpt")].map((c) => c.style.fill)).size === 3), "K-Means 3 grubun hepsini buldu");
  await p.click(".next");
  await p.click(".opt >> nth=1"); await p.click(".opt >> nth=0"); await devam(p);
  await svgTikla(p, ".stage svg.plot", 0.3, 0.6); await svgTikla(p, ".stage svg.plot", 0.6, 0.4);
  await p.click("text=Yapay zekâ yerleştirsin"); await bekleDevam(p); await shot("d10_4"); await p.click(".next");
  await p.click("text=Renkleri bul"); await p.waitForSelector(".actions .btn:not(.next):not([disabled])");
  await p.click(".num-btn button >> nth=1"); await p.click("text=Renkleri bul"); await bekleDevam(p);
  ok((await p.$$(".palette i")).length === 4, "resim 4 renge indi"); await shot("d10_5"); await p.click(".next");
  if (fotograf) await p.setInputFiles('input[type="file"]', renkliPng()); else await p.click("text=Örnek resim");
  await bekleDevam(p); ok((await p.$$(".pop-grid canvas")).length === 4, fotograf ? "yüklenen fotoğraftan 4 pop-art" : "örnek resimden 4 pop-art"); await shot("d10_6"); await p.click(".next");
  for (const t of ["yıldız koy", "boya", "taşı", "tekrarla"]) await p.click(`.havuz .kart:has-text("${t}")`);
  await p.click("text=▶ Çalıştır"); await devam(p);
  await p.waitForSelector(".end"); await shot("d10_son");
}

(async () => {
  const b = await chromium.launch(process.env.CHROMIUM ? { executablePath: process.env.CHROMIUM } : {});
  for (const [ad, vp, touch] of [["masaustu", { width: 1280, height: 860 }, false], ["tablet", { width: 820, height: 1180 }, true], ["telefon", { width: 390, height: 844 }, true]].filter(([a]) => !process.env.SADECE || process.env.SADECE === a)) {
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
    const durumlar = await p.$$eval(".node[data-no]", (n) => n.map((x) => x.className.replace("node ", "")));
    ok(durumlar.length === 10, "harita 10 dünya gösteriyor");
    ok((await p.$$(".node")).length === 13, "harita yolunda başlangıç testi, bitiş testi ve sertifika da var");
    ok(await p.isVisible('.node[data-durak="on"].acik') && durumlar.every((d) => d === "kilitli"), "başta yalnızca başlangıç testi açık, Dünya 1 kilitli");
    ok(await p.isVisible('.node[data-durak="son"].kilitli') && await p.isVisible('.node[data-durak="sertifika"].kilitli'), "bitiş testi ve sertifika kilitli");
    ok(!(await tasma()), "haritada yatay taşma yok");
    await p.click('.node[data-no="1"]'); ok(/başlangıç testini/.test(await p.textContent(".bubble")), "test çözülmeden Dünya 1'e dokununca Bit uyarıyor");
    await p.goto(URL + "#test-son"); await p.waitForSelector(".node"); ok(true, "kilitli bitiş testinin adresi haritaya döndürüyor");
    ok(durumlar.every((d) => d !== "hazirlaniyor"), "hazırlanıyor durumunda dünya kalmadı");

    // başlangıç testi: 3 soru, yenile, kaldığı yerden devam
    await p.click('.node[data-durak="on"]'); await p.waitForSelector("text=Başla ➜"); await shot("test_giris"); await p.click("text=Başla ➜");
    ok(await p.isHidden(".opt.ok, .opt.no, .msg"), "testte doğru/yanlış gösterilmiyor");
    await testCoz(p, ON_CEVAP.slice(0, 3)); await shot("test_soru");
    await p.reload(); await p.waitForSelector("text=Devam et ➜");
    ok(/4\. soru/.test(await p.textContent(".bubble")), "yenileyince kaldığı sorudan devam ediyor");
    await p.click("text=Devam et ➜");
    await testCoz(p, ON_CEVAP, 3);
    await p.waitForSelector("text=Hazırsın!"); ok(!/\d+ \/ 12 doğru/.test(await p.textContent(".card")), "başlangıç testinin sonunda puan gösterilmiyor");
    await p.click("text=Haritaya dön"); await p.waitForSelector('.node[data-durak="on"].bitti');
    ok(await p.isVisible('.node[data-no="1"].acik') && await p.isVisible('.node[data-no="2"].kilitli'), "test bitince Dünya 1 açıldı, 2 kilitli");
    await p.goto(URL + "#test-on"); await p.waitForSelector(".node"); ok(true, "bitmiş başlangıç testi yeniden çözülmüyor");
    await p.click('.node[data-no="3"]'); ok(/önceki/.test(await p.textContent(".bubble")), "kilitli dünyaya dokununca Bit uyarıyor");

    const oyunlar = [[1, oynaDil], [2, oynaIlk], [3, oynaKarar], [4, oynaDongu], [5, oynaListe], [6, oynaFonk], [7, oynaYz], [8, oynaRakam], [9, oynaPenguen], [10, (p, sh) => oynaRessam(p, sh, ad !== "masaustu")]];
    for (const [no, oyna] of oyunlar) {
      await p.click(`.node[data-no="${no}"]`); await p.waitForSelector(".card .say");
      ok(!(await tasma()), `Dünya ${no} ekranında yatay taşma yok`);
      await oyna(p, shot);
      ok(!(await tasma()), `Dünya ${no} sonunda yatay taşma yok`);
      await p.click("text=Haritaya dön");
      await p.waitForSelector(`.node[data-no="${no}"].bitti`);
      if (no === 1) ok(await p.evaluate(() => !window.Sk), "Python (Skulpt) ilk Yaz ekranına kadar yüklenmedi");
      if (no < 10) ok(await p.isVisible(`.node[data-no="${no + 1}"].acik`), `Dünya ${no} bitince Dünya ${no + 1} açıldı`);
    }
    const yildiz = Number(await p.textContent(".m-top .score span"));
    ok(yildiz === 87, `toplam yıldız 87 (bulunan ${yildiz})`);

    // bitiş testi → sonuçlar → sertifika
    ok(await p.isVisible('.node[data-durak="son"].acik') && await p.isVisible('.node[data-durak="sertifika"].kilitli'), "10 dünya bitince bitiş testi açıldı");
    await p.click('.node[data-durak="son"]'); await p.click("text=Başla ➜");
    await testCoz(p, SON_CEVAP);
    await p.waitForSelector(".r-table"); await shot("sonuc");
    const barlar = await p.$$eval(".r-bar b", (b) => b.map((x) => x.textContent));
    ok(barlar.join(",") === "5,12", `sonuç çubukları başta 5, sonda 12 (bulunan ${barlar})`);
    ok((await p.$$(".r-row.yeni")).length === 7, "7 konu yeni öğrenildi olarak işaretli");
    ok((await p.$$(".r-row:not(.r-head) .r-mark.r-idk")).length === 1, "Bilmiyorum cevabı ayrı işaretli");
    ok(!(await tasma()), "sonuç ekranında yatay taşma yok");
    await p.click("text=Sertifikanı al"); await p.waitForSelector("#c-ad");
    await p.click(".t-form .btn"); ok(/unutma/.test(await p.textContent(".bubble")), "ad boşken sertifika hazırlanmıyor");
    await p.fill("#c-ad", "Ayşe <b>Yılmaz</b>"); await p.click(".t-form .btn");
    await p.waitForSelector(".cert");
    ok((await p.textContent(".cert-name")) === "Ayşe <b>Yılmaz</b>", "sertifikadaki ad yazıldığı gibi (HTML olarak işlenmeden) görünüyor");
    ok(/87 yıldız/.test(await p.textContent(".cert-text")), "sertifikada toplam yıldız var");
    ok(!(await tasma()), "sertifikada yatay taşma yok"); await shot("sertifika");
    if (ad === "masaustu") {
      const pdf = await p.pdf({ landscape: true, format: "A4", printBackground: true, preferCSSPageSize: true });
      const sayfa = (pdf.toString("latin1").match(/\/Type\s*\/Page[^s]/g) || []).length;
      ok(sayfa === 1, `yazdırma görünümü tek sayfa (bulunan ${sayfa})`);
      fs.writeFileSync(`${OUT}/sertifika.pdf`, pdf);
    }
    ok(await p.evaluate(() => [...document.images].every((i) => i.complete && i.naturalWidth > 0)), "kırık resim yok");
    await p.goto(URL + "#harita"); await p.waitForSelector('.node[data-durak="sertifika"].bitti');
    ok(/sonra/.test(await p.textContent('.node[data-durak="son"]')) === false && await p.isVisible('.node[data-durak="son"].bitti'), "haritada bitiş testi bitti görünüyor");
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
    ok(await p.isVisible('.node[data-durak="on"].acik') && await p.isVisible('.node[data-no="1"].kilitli'), "sıfırlama ilerlemeyi ve testleri siliyor");

    // kilitli dünyaya doğrudan adresle girilemiyor
    await p.goto(URL + "#dunya-9"); await p.waitForSelector(".node");
    ok(true, "kilitli dünyanın adresi haritaya döndürüyor");

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
