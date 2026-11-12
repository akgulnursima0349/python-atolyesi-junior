/* Giriş: öğrenci (sınıf kodu + takma ad + PIN) ya da öğretmen (e-posta + şifre). */
import { ikon } from "../core/ikon.js";
import { el, $ } from "../core/ui.js";
import { say } from "../core/bit.js";
import { sfx, soundButton } from "../core/sound.js";
import { gorsel } from "../core/gorseller.js";
import { bulut, hataMetni, ogrenciGiris, ogretmenGiris, ogretmenKaydol, ogretmenTamamla, tamamlanmamisHesap } from "../cloud/bulut.js";

const SON_SINIF = "atolye-junior-son-sinif";
const oku = () => { try { return localStorage.getItem(SON_SINIF) || ""; } catch (_) { return ""; } };
const yaz = (v) => { try { localStorage.setItem(SON_SINIF, v); } catch (_) {} };
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");

export function girisSayfasi(root) {
  root.innerHTML = "";
  /* ortalanmış tek sütun: üstte logo ve başlık, altında üst kenarı görselli tek kart */
  const logo = gorsel("logo"), bant = gorsel("giris") || gorsel("dunya-2");
  const ses = el("div", "giris-ses"); ses.append(soundButton());
  const orta = el("div", "giris-orta");
  const ust = el("header", "giris-ust");
  ust.innerHTML = `${logo ? `<img class="g-logo" src="${logo}" alt="Sivas Robotik Akademi">` : ""}
    <h1>Python Atölyesi <span>Junior</span></h1>
    <p>4–6. sınıflar için adım adım Python ve yapay zekâ</p>`;
  const kutu = el("div", "giris-kutu");
  if (bant) kutu.innerHTML = `<img class="g-bant" src="${bant}" alt="" decoding="async">`;
  const card = el("main", "giris");
  kutu.append(card);
  orta.append(ust, kutu);
  root.append(ses, orta);

  const bas = (metin, mood = "mutlu") => { card.innerHTML = ""; card.append(say(metin, mood)); };
  const mesaj = (m, tur = "bad") => { let d = $(".msg", card); if (!d) { d = el("div", "msg"); card.append(d); } d.className = "msg " + tur; d.innerHTML = m; d.setAttribute("role", "alert"); };
  const mesgul = (form, b, metin) => { const btn = $("button[type=submit]", form); btn.disabled = b; if (metin) btn.textContent = metin; };

  function secim() {
    bas("Merhaba, ben <b>Bit</b>! Sen kimsin?");
    const r = el("div", "giris-sec");
    r.innerHTML = `<button class="giris-kart" id="g-ogr">${ikon("canta", "ik gk-ik")}<b>Öğrenciyim</b><small>Sınıf kodu ve PIN ile</small></button>
      <button class="giris-kart sec" id="g-ogt">${ikon("kep", "ik gk-ik")}<b>Öğretmenim</b><small>E-posta ve şifre ile</small></button>`;
    card.append(r);
    $("#g-ogr", r).onclick = ogrenci;
    $("#g-ogt", r).onclick = () => ogretmen();
    if (bulut.deneme) card.append(el("p", "deneme-not", "<b>Deneme modu</b> · Öğrenci: sınıf <code>DENEME</code>, Ece <code>1234</code> ya da Mert <code>5678</code> · Öğretmen: <code>ogretmen@deneme.com</code>, müdür: <code>mudur@deneme.com</code> (şifre <code>deneme123</code>)"));
  }

  function ogrenci() {
    bas("Öğretmeninin verdiği <b>sınıf kodunu</b> ve <b>PIN</b>'i yaz.");
    const f = el("form", "g-form");
    f.innerHTML = `<label>Sınıf kodu<input id="g-kod" autocomplete="off" autocapitalize="characters" spellcheck="false" maxlength="8" value="${esc(oku())}" required></label>
      <label>Takma adın<input id="g-ad" autocomplete="off" spellcheck="false" maxlength="30" required></label>
      <label>PIN<input id="g-pin" type="password" inputmode="numeric" pattern="[0-9]*" maxlength="4" autocomplete="off" required></label>
      <div class="actions"><button class="btn" type="submit">Giriş yap ➜</button><button class="btn sec" type="button" id="g-geri">Geri</button></div>`;
    card.append(f);
    $("#g-geri", f).onclick = secim;
    $(oku() ? "#g-ad" : "#g-kod", f).focus({ preventScroll: true });
    f.onsubmit = async (e) => {
      e.preventDefault();
      const kod = $("#g-kod", f).value.trim().toUpperCase(), ad = $("#g-ad", f).value.trim(), pin = $("#g-pin", f).value.trim();
      if (!/^\d{4}$/.test(pin)) { sfx.yanlis(); return mesaj("PIN 4 rakamdan oluşur."); }
      mesgul(f, true, "Giriş yapılıyor…");
      try {
        await ogrenciGiris(kod, ad, pin);
        yaz(kod); sfx.dogru(); location.hash = "harita";
      } catch (err) {
        sfx.yanlis(); $(".say", card).replaceWith(say("Olmadı. Bilgileri <b>kontrol edip</b> tekrar dene.", "uzgun"));
        mesaj(hataMetni(err)); mesgul(f, false, "Giriş yap ➜"); $("#g-pin", f).value = ""; $("#g-pin", f).focus();
      }
    };
  }

  function ogretmen(not) {
    bas("Öğretmen girişi: e-posta ve şifreni yaz.");
    const f = el("form", "g-form");
    f.innerHTML = `<label>E-posta<input id="g-eposta" type="email" autocomplete="username" required></label>
      <label>Şifre<input id="g-sifre" type="password" autocomplete="current-password" required></label>
      <div class="actions"><button class="btn" type="submit">Giriş yap ➜</button><button class="btn sec" type="button" id="g-geri">Geri</button></div>
      <p class="g-alt">Hesabın yok mu? <button type="button" class="link" id="g-kayit">Hesap aç</button></p>`;
    card.append(f);
    if (not) mesaj(not, "ok");
    $("#g-geri", f).onclick = secim;
    $("#g-kayit", f).onclick = kaydol;
    $("#g-eposta", f).focus({ preventScroll: true });
    f.onsubmit = async (e) => {
      e.preventDefault();
      mesgul(f, true, "Giriş yapılıyor…");
      try {
        const ben = await ogretmenGiris($("#g-eposta", f).value.trim(), $("#g-sifre", f).value);
        if (ben.rol === "ogretmen") { sfx.dogru(); location.hash = "panel"; return; }
        if (ben.pasif) { mesaj("Bu hesabın erişimi kurum yöneticisi tarafından kapatılmış."); mesgul(f, false, "Giriş yap ➜"); return; }
        tamamla();
      } catch (err) { sfx.yanlis(); mesaj(hataMetni(err)); mesgul(f, false, "Giriş yap ➜"); }
    };
  }

  function kaydol() {
    bas("Yeni öğretmen hesabı: e-posta ve bir <b>şifre</b> belirle.");
    const f = el("form", "g-form");
    f.innerHTML = `<label>E-posta<input id="g-eposta" type="email" autocomplete="username" required></label>
      <label>Şifre (en az 6 karakter)<input id="g-sifre" type="password" autocomplete="new-password" minlength="6" required></label>
      <div class="actions"><button class="btn" type="submit">Hesap aç ➜</button><button class="btn sec" type="button" id="g-geri">Geri</button></div>`;
    card.append(f);
    $("#g-geri", f).onclick = () => ogretmen();
    f.onsubmit = async (e) => {
      e.preventDefault();
      mesgul(f, true, "Hesap açılıyor…");
      try {
        const r = await ogretmenKaydol($("#g-eposta", f).value.trim(), $("#g-sifre", f).value);
        if (r.onayGerekli) return ogretmen("E-postana bir doğrulama bağlantısı gönderildi. Bağlantıya tıkladıktan sonra buradan giriş yap.");
        tamamla();
      } catch (err) { sfx.yanlis(); mesaj(hataMetni(err)); mesgul(f, false, "Hesap aç ➜"); }
    };
  }

  function tamamla() {
    bas("Son adım: adını ve kurumun verdiği <b>kurum kodunu</b> yaz.");
    const f = el("form", "g-form");
    f.innerHTML = `<label>Adın soyadın<input id="g-adsoyad" maxlength="60" autocomplete="name" required></label>
      <label>Kurum kodu<input id="g-kurum" autocomplete="off" spellcheck="false" required></label>
      <div class="actions"><button class="btn" type="submit">Tamamla ➜</button></div>`;
    card.append(f);
    f.onsubmit = async (e) => {
      e.preventDefault();
      mesgul(f, true, "Kaydediliyor…");
      try { await ogretmenTamamla($("#g-adsoyad", f).value.trim(), $("#g-kurum", f).value.trim()); sfx.dogru(); location.hash = "panel"; }
      catch (err) { sfx.yanlis(); mesaj(hataMetni(err)); mesgul(f, false, "Tamamla ➜"); }
    };
  }

  /* e-posta onayından dönen ya da kaydını tamamlamamış öğretmen */
  tamamlanmamisHesap().then((v) => (v ? tamamla() : secim())).catch(secim);
}
