/* Öğretmen paneli: sınıflar, sınıfın Junior ilerlemesi, öğrenciler ve PIN'ler; müdürde öğretmenler. */
import { ikon } from "../core/ikon.js";
import { el, $, $$ } from "../core/ui.js";
import { say } from "../core/bit.js";
import { bulut, panelApi, hataMetni } from "../cloud/bulut.js";
import { hesapParcasi } from "../core/hesap.js";
import { WORLDS } from "../worlds/index.js";
import { puanla } from "../data/testler.js";

const esc = (s) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const tarih = (t) => {
  if (!t) return "–";
  const g = Math.floor((Date.now() - new Date(t)) / 86400000);
  return g <= 0 ? "bugün" : g === 1 ? "dün" : g < 30 ? `${g} gün önce` : new Date(t).toLocaleDateString("tr-TR");
};
const testPuani = (v, tur) => { const t = v.testler && v.testler[tur]; return t && t.bitti ? puanla(tur, t.cevaplar).filter(Boolean).length : null; };

function iskelet(root, baslik, geri) {
  root.innerHTML = "";
  const top = el("header", "m-top", `${geri ? `<a class="back" href="${geri}">← Geri</a>` : '<a class="back" href="#harita">← Harita</a>'}<div class="brand">${baslik}</div>`);
  const h = hesapParcasi({ panel: false });
  if (h) top.append(h);
  const card = el("main", "card panel");
  root.append(top, card);
  return card;
}
const hataGoster = (card, e) => { card.append(el("div", "msg bad", esc(hataMetni(e)))); };

/* ---------- #panel ---------- */
export async function panelSayfasi(root, sekme = "siniflar") {
  const card = iskelet(root, "Öğretmen paneli");
  const ben = bulut.ben;
  card.append(say(`Merhaba <b>${esc(ben.ad)}</b>! ${ben.mudur ? "Kurumdaki bütün sınıflar burada." : "Sınıfların burada."}`, "mutlu"));
  if (ben.mudur) {
    const t = el("div", "tabs", `<a href="#panel" class="tab${sekme === "siniflar" ? " on" : ""}">Sınıflar</a><a href="#panel-ogretmenler" class="tab${sekme === "ogretmenler" ? " on" : ""}">Öğretmenler</a>`);
    card.append(t);
  }
  const govde = el("div", "panel-govde", '<p class="yukleniyor">Yükleniyor…</p>');
  card.append(govde);
  if (sekme === "ogretmenler" && ben.mudur) return ogretmenler(govde);
  try {
    const sn = await panelApi.siniflar();
    govde.innerHTML = "";
    const grid = el("div", "sinif-grid");
    sn.forEach((s) => {
      const a = el("a", "sinif-kart");
      a.href = "#panel/" + s.id;
      a.innerHTML = `<b>${esc(s.ad)}</b><span class="kod-chip">${esc(s.kod)}</span><small>${s.ogrenci_sayisi} öğrenci${s.benim ? "" : ` · ${esc(s.sahip_ad)}`}</small>`;
      grid.append(a);
    });
    if (!sn.length) govde.append(el("p", "bos-not", "Henüz sınıf yok. Aşağıdan ilk sınıfını aç."));
    govde.append(grid);
    const f = el("form", "yeni-sinif", '<label for="ys-ad">Yeni sınıf</label><div class="row"><input id="ys-ad" maxlength="60" placeholder="Örn. Cumartesi 10:00" required><button class="btn">＋ Aç</button></div>');
    f.onsubmit = async (e) => {
      e.preventDefault();
      const b = $("button", f); b.disabled = true;
      try { const s = await panelApi.sinifOlustur($("#ys-ad", f).value.trim()); location.hash = "panel/" + s.id; }
      catch (err) { b.disabled = false; hataGoster(govde, err); }
    };
    govde.append(f);
  } catch (e) { govde.innerHTML = ""; hataGoster(govde, e); }
}

async function ogretmenler(govde) {
  try {
    const l = await panelApi.mudurOgretmenler();
    govde.innerHTML = "";
    const t = el("div", "ogt-liste");
    l.forEach((o) => {
      const r = el("div", "ogt-satir" + (o.aktif ? "" : " pasif"));
      r.innerHTML = `<span><b>${esc(o.ad)}</b>${o.mudur ? ' <span class="etiket">müdür</span>' : ""}${o.aktif ? "" : ' <span class="etiket kapali">erişim kapalı</span>'}</span><small>${o.sinif_sayisi} sınıf</small>`;
      if (o.id !== bulut.ben.id) {
        const b = el("button", "btn sec small", o.aktif ? "Erişimi kapat" : "Erişimi aç");
        b.onclick = async () => {
          b.disabled = true;
          try { await panelApi.aktiflik(o.id, !o.aktif); ogretmenler(govde); } catch (err) { b.disabled = false; hataGoster(govde, err); }
        };
        r.append(b);
      } else r.append(el("small", "", "sen"));
      t.append(r);
    });
    govde.append(t, el("p", "bos-not", "Erişimi kapatılan öğretmenin sınıfları ve öğrencileri silinmez; siz görmeye devam edersiniz."));
  } catch (e) { govde.innerHTML = ""; hataGoster(govde, e); }
}

/* ---------- #panel/<sınıf> ---------- */
export async function sinifSayfasi(root, id, sekme = "ilerleme") {
  const card = iskelet(root, "Sınıf", "#panel");
  const govde = el("div", "panel-govde", '<p class="yukleniyor">Yükleniyor…</p>');
  card.append(govde);
  let sinif, liste;
  try {
    const sn = await panelApi.siniflar();
    sinif = sn.find((s) => s.id === id);
    if (!sinif) { govde.innerHTML = ""; return hataGoster(govde, { code: "yetki_yok" }); }
    liste = await panelApi.rapor(id);
  } catch (e) { govde.innerHTML = ""; return hataGoster(govde, e); }
  $(".brand", root).textContent = sinif.ad;
  govde.innerHTML = "";
  const ust = el("div", "sinif-ust", `<div><small>Sınıf kodu</small><span class="kod-buyuk">${esc(sinif.kod)}</span></div><p>Öğrenciler bu kod, takma adları ve PIN'leriyle girer.</p>`);
  const tabs = el("div", "tabs", `<a href="#panel/${id}" class="tab${sekme === "ilerleme" ? " on" : ""}">İlerleme</a><a href="#panel/${id}/ogrenciler" class="tab${sekme === "ogrenciler" ? " on" : ""}">Öğrenciler ve PIN'ler</a>`);
  govde.append(ust, tabs);
  const icerik = el("div", "");
  govde.append(icerik);
  if (sekme === "ogrenciler") ogrenciler(icerik, sinif, liste, () => sinifSayfasi(root, id, "ogrenciler"));
  else ilerleme(icerik, liste, () => sinifSayfasi(root, id, "ilerleme"));
}

function ilerleme(kap, liste, yenile) {
  if (!liste.length) { kap.append(el("p", "bos-not", "Bu sınıfta henüz öğrenci yok. <b>Öğrenciler ve PIN'ler</b> sekmesinden ekleyin.")); return; }
  const n = liste.length;
  const bitiren = WORLDS.map((w) => liste.filter((o) => o.veri.worlds && o.veri.worlds[w.id] && o.veri.worlds[w.id].done).length);
  const ort = (tur) => { const p = liste.map((o) => testPuani(o.veri, tur)).filter((x) => x != null); return p.length ? (p.reduce((a, b) => a + b, 0) / p.length).toLocaleString("tr-TR", { maximumFractionDigits: 1 }) + " / 12" : "–"; };
  const ozet = el("div", "ozet");
  ozet.innerHTML = `<div><small>Başlangıç testi ort.</small><b>${ort("on")}</b></div><div><small>Bitiş testi ort.</small><b>${ort("son")}</b></div>
    <div><small>Kursu bitiren</small><b>${bitiren[bitiren.length - 1]} / ${n}</b></div>`;
  const ara = el("div", "ozet-ara");
  const yb = el("button", "btn sec small", ikon("yenile") + "Yenile"); yb.onclick = yenile;
  ara.append(el("small", "", "Sayılar dünya yıldızları; boş kutu: henüz bitmedi."), yb);
  const sar = el("div", "tablo-sar");
  sar.innerHTML = `<table class="ilerleme-tablo">
    <thead><tr><th scope="col">Öğrenci</th><th scope="col" title="Başlangıç testi">Ön</th>${WORLDS.map((w) => `<th scope="col" title="${esc(w.title)}"><span class="w-ikon" style="--c:${w.color}">${w.no}</span></th>`).join("")}<th scope="col" title="Bitiş testi">Son</th><th scope="col" title="Oyun Salonu'nda oynanan tur">🎮</th><th scope="col">Son giriş</th></tr></thead>
    <tbody>${liste.map((o) => {
      const v = o.veri || {}, w = v.worlds || {};
      const on = testPuani(v, "on"), son = testPuani(v, "son");
      const tur = Object.values(v.oyunlar || {}).reduce((t, x) => t + (x.tur || 0), 0);
      return `<tr><th scope="row">${esc(o.takma_ad)}</th><td class="test">${on == null ? "–" : on}</td>
        ${WORLDS.map((x) => { const d = w[x.id]; return d && d.done ? `<td><span class="w-yildiz" style="--c:${x.color}" title="${esc(x.title)}: ${d.stars} yıldız">${d.stars}</span></td>` : '<td><span class="w-bos" aria-label="bitmedi"></span></td>'; }).join("")}
        <td class="test">${son == null ? "–" : son}</td><td>${tur || "–"}</td><td class="tarih">${tarih(o.guncelleme || o.son_giris)}</td></tr>`;
    }).join("")}</tbody>
    <tfoot><tr><th scope="row">Bitiren</th><td></td>${bitiren.map((b) => `<td>${b}</td>`).join("")}<td></td><td></td><td></td></tr></tfoot></table>`;
  kap.append(ozet, ara, sar);
}

function ogrenciler(kap, sinif, liste, yenile) {
  /* öğrenci ekle */
  const f = el("form", "ogr-ekle", `<label for="oe-adlar">Öğrenci ekle <small>(her satıra bir takma ad; ör. "Elif K.")</small></label>
    <textarea id="oe-adlar" rows="3" spellcheck="false"></textarea><div class="actions"><button class="btn">Ekle</button></div>`);
  f.onsubmit = async (e) => {
    e.preventDefault();
    const adlar = $("#oe-adlar", f).value.split("\n").map((x) => x.trim()).filter(Boolean);
    if (!adlar.length) return;
    const b = $("button", f); b.disabled = true;
    try {
      const r = await panelApi.ogrenciEkle(sinif.id, adlar);
      await yenile();
      const not = el("div", "msg ok", `${r.eklenen.length} öğrenci eklendi.${r.atlanan.length ? ` Eklenmeyen: ${r.atlanan.map(esc).join(", ")} (aynı ad var ya da 2–30 karakter değil).` : ""}`);
      const k = $(".ogr-ekle", document); if (k) k.after(not);
    } catch (err) { b.disabled = false; hataGoster(kap, err); }
  };
  kap.append(f);
  if (!liste.length) return;

  const arac = el("div", "ozet-ara");
  const goster = el("button", "btn sec small", ikon("goz") + "PIN'leri göster");
  const yazdir = el("button", "btn sec small", ikon("yazici") + "PIN kartlarını yazdır");
  arac.append(goster, yazdir);
  kap.append(arac);
  const tablo = el("div", "ogr-liste pinler-gizli");
  liste.forEach((o) => {
    const r = el("div", "ogr-satir");
    r.dataset.ogrenci = o.takma_ad;
    r.innerHTML = `<b>${esc(o.takma_ad)}</b><span class="pin-chip" data-pin="${esc(o.pin || "")}">${o.pin ? "••••" : "PIN yok"}</span>`;
    const yen = el("button", "btn sec small", "PIN yenile");
    yen.onclick = async () => {
      yen.disabled = true;
      try { await panelApi.pinYenile(o.id); yenile(); } catch (err) { yen.disabled = false; hataGoster(kap, err); }
    };
    const sil = el("button", "btn sec small", "Sil");
    let onay = false;
    sil.onclick = async () => {
      if (!onay) { onay = true; sil.textContent = "Emin misiniz?"; sil.classList.add("warn"); setTimeout(() => { onay = false; sil.textContent = "Sil"; sil.classList.remove("warn"); }, 4000); return; }
      sil.disabled = true;
      try { await panelApi.ogrenciSil(o.id); yenile(); } catch (err) { hataGoster(kap, err); }
    };
    r.append(yen, sil);
    tablo.append(r);
  });
  kap.append(tablo);
  const pinCiz = (acik) => $$(".pin-chip", tablo).forEach((c) => { if (c.dataset.pin) c.textContent = acik ? c.dataset.pin : "••••"; });
  goster.onclick = () => {
    const acik = tablo.classList.toggle("pinler-gizli") === false;
    pinCiz(acik); goster.innerHTML = acik ? ikon("gozKapali") + "PIN'leri gizle" : ikon("goz") + "PIN'leri göster";
  };
  /* yazdırılacak kartlar: yalnızca yazdırırken görünür */
  const kartlar = el("section", "pin-kartlar");
  kartlar.innerHTML = liste.filter((o) => o.pin).map((o) => `<div class="pin-kart"><small>Python Atölyesi Junior</small><b>${esc(o.takma_ad)}</b>
    <div><span>Sınıf kodu</span><code>${esc(sinif.kod)}</code></div><div><span>PIN</span><code>${esc(o.pin)}</code></div></div>`).join("");
  kap.append(kartlar);
  yazdir.onclick = () => { document.body.classList.add("pin-yazdir"); window.print(); setTimeout(() => document.body.classList.remove("pin-yazdir"), 500); };
  if (liste.some((o) => !o.pin)) kap.append(el("p", "bos-not", "“PIN yok” yazan öğrencilerin PIN'i eski sürümde açıldığı için saklanmamış; <b>PIN yenile</b> ile yeni PIN verin."));
}

