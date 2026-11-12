/* Öğretmen sayfası: bu cihazda bütün dünyaları açar. Hesap yok; kod yalnızca çocukların yanlışlıkla atlamasını önler. */
import { ikon } from "../core/ikon.js";
import { el, $ } from "../core/ui.js";
import { say } from "../core/bit.js";
import { soundButton, sfx } from "../core/sound.js";
import { store } from "../core/store.js";

const KOD = "BIT-OGRETMEN";
const norm = (s) => s.trim().toLocaleUpperCase("tr").replace(/İ/g, "I").replace(/Ğ/g, "G").replace(/Ö/g, "O").replace(/\s+/g, "-");

export function ogretmen(root) {
  root.innerHTML = "";
  const top = el("header", "m-top", '<a class="back" href="#harita">← Harita</a><div class="brand">Öğretmen</div>');
  top.append(soundButton());
  const card = el("main", "card narrow");
  root.append(top, card);

  function ciz(mesaj, mood) {
    const acik = store.teacher();
    card.innerHTML = "";
    card.append(say(mesaj || (acik ? "Bu cihazda <b>bütün dünyalar</b> açık." : "Öğretmen kodunu yaz, bütün dünyalar açılsın."), mood));
    if (!acik) {
      const form = el("form", "t-form", `<label for="t-kod">Öğretmen kodu</label>
        <div class="row"><input id="t-kod" autocomplete="off" autocapitalize="characters" spellcheck="false"><button class="btn">Aç</button></div>`);
      form.onsubmit = (e) => {
        e.preventDefault();
        if (norm($("#t-kod", form).value) === KOD) { store.setTeacher(true); sfx.dogru(); ciz("Öğretmen modu açık. Bütün dünyalar bu cihazda açıldı.", "vay"); }
        else { sfx.yanlis(); ciz("Bu kod doğru değil. Tekrar dene.", "uzgun"); }
      };
      card.append(form);
      setTimeout(() => { const i = $("#t-kod", card); if (i) i.focus(); }, 50);
    } else {
      const row = el("div", "actions");
      const kapat = el("button", "btn sec", "Öğretmen modunu kapat");
      kapat.onclick = () => { store.setTeacher(false); ciz("Öğretmen modu kapandı. Dünyalar yine sırayla açılır."); };
      const git = el("a", "btn", "Haritaya git ➜"); git.href = "#harita";
      row.append(git, kapat);
      card.append(row);
    }
    if (store.testBitti("son")) {
      const r = el("a", "btn sec", ikon("liste") + "Bu cihazdaki test sonuçları"); r.href = "#sonuc";
      const sat = el("div", "actions"); sat.append(r); card.append(sat);
    }
    /* paylaşılan bilgisayarlar için: ilerlemeyi sıfırla (iki adımlı onay) */
    const sifirla = el("div", "danger");
    const b = el("button", "btn sec", "Bu cihazdaki ilerlemeyi sıfırla");
    let onay = false;
    b.onclick = () => {
      if (!onay) { onay = true; b.textContent = "Emin misin? Tekrar bas"; b.classList.add("warn"); setTimeout(() => { onay = false; b.textContent = "Bu cihazdaki ilerlemeyi sıfırla"; b.classList.remove("warn"); }, 4000); return; }
      store.reset(); ciz("İlerleme sıfırlandı. Yeni öğrenci baştan başlayabilir.");
    };
    sifirla.append(b);
    card.append(sifirla);
  }
  ciz();
}
