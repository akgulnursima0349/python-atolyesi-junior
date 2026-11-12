/* Çizgi ikonlar (Lucide, ISC lisansı). Emojiler yerine arayüzde tek tip görünüm için. */
import i_binary from "lucide-static/icons/binary.svg?raw";
import i_mesaj from "lucide-static/icons/message-square-text.svg?raw";
import i_yol from "lucide-static/icons/split.svg?raw";
import i_dongu from "lucide-static/icons/repeat.svg?raw";
import i_tren from "lucide-static/icons/train-front.svg?raw";
import i_fabrika from "lucide-static/icons/factory.svg?raw";
import i_beyin from "lucide-static/icons/brain-circuit.svg?raw";
import i_kalem from "lucide-static/icons/pen-line.svg?raw";
import i_dedektif from "lucide-static/icons/search.svg?raw";
import i_palet from "lucide-static/icons/palette.svg?raw";
import i_yapboz from "lucide-static/icons/puzzle.svg?raw";
import i_kristal from "lucide-static/icons/sparkles.svg?raw";
import i_bocek from "lucide-static/icons/bug.svg?raw";
import i_izgara from "lucide-static/icons/grid-3x3.svg?raw";
import i_anahtar from "lucide-static/icons/key-round.svg?raw";
import i_bot from "lucide-static/icons/bot-message-square.svg?raw";
import i_deney from "lucide-static/icons/flask-conical.svg?raw";
import i_test from "lucide-static/icons/clipboard-list.svg?raw";
import i_bayrak from "lucide-static/icons/flag.svg?raw";
import i_odul from "lucide-static/icons/award.svg?raw";
import i_oyun from "lucide-static/icons/gamepad-2.svg?raw";
import i_panel from "lucide-static/icons/layout-dashboard.svg?raw";
import i_kisi from "lucide-static/icons/user.svg?raw";
import i_yazici from "lucide-static/icons/printer.svg?raw";
import i_goz from "lucide-static/icons/eye.svg?raw";
import i_gozKapali from "lucide-static/icons/eye-off.svg?raw";
import i_yenile from "lucide-static/icons/rotate-cw.svg?raw";
import i_kilit from "lucide-static/icons/lock.svg?raw";
import i_tik from "lucide-static/icons/check.svg?raw";
import i_canta from "lucide-static/icons/backpack.svg?raw";
import i_kep from "lucide-static/icons/graduation-cap.svg?raw";
import i_liste from "lucide-static/icons/list-checks.svg?raw";
import i_soru from "lucide-static/icons/circle-help.svg?raw";
import i_saat from "lucide-static/icons/clock.svg?raw";
import i_cikis from "lucide-static/icons/log-out.svg?raw";
import i_kod from "lucide-static/icons/code-xml.svg?raw";
import i_kutu from "lucide-static/icons/box.svg?raw";
import i_degisken from "lucide-static/icons/variable.svg?raw";
import i_catal from "lucide-static/icons/git-fork.svg?raw";
import i_sira from "lucide-static/icons/list.svg?raw";
import i_islemci from "lucide-static/icons/cpu.svg?raw";
import i_hedef from "lucide-static/icons/target.svg?raw";
import i_kupa from "lucide-static/icons/trophy.svg?raw";
const SVG = {
  binary: i_binary,
  mesaj: i_mesaj,
  yol: i_yol,
  dongu: i_dongu,
  tren: i_tren,
  fabrika: i_fabrika,
  beyin: i_beyin,
  kalem: i_kalem,
  dedektif: i_dedektif,
  palet: i_palet,
  yapboz: i_yapboz,
  kristal: i_kristal,
  bocek: i_bocek,
  izgara: i_izgara,
  anahtar: i_anahtar,
  bot: i_bot,
  deney: i_deney,
  test: i_test,
  bayrak: i_bayrak,
  odul: i_odul,
  oyun: i_oyun,
  panel: i_panel,
  kisi: i_kisi,
  yazici: i_yazici,
  goz: i_goz,
  gozKapali: i_gozKapali,
  yenile: i_yenile,
  kilit: i_kilit,
  tik: i_tik,
  canta: i_canta,
  kep: i_kep,
  liste: i_liste,
  soru: i_soru,
  saat: i_saat,
  cikis: i_cikis,
  kod: i_kod,
  kutu: i_kutu,
  degisken: i_degisken,
  catal: i_catal,
  sira: i_sira,
  islemci: i_islemci,
  hedef: i_hedef,
  kupa: i_kupa
};
/* ikon("tren") → satır içi <svg>; boyut ve renk CSS'ten (width/height, currentColor) */
const TEMIZ = {};
export function ikon(ad, cls = "ik") {
  if (!SVG[ad]) return "";
  const t = (TEMIZ[ad] ||= SVG[ad].replace(/<!--[\s\S]*?-->/, "").replace(/\s(width|height)="24"/g, "").replace(/\s+/g, " ").trim());
  return t.replace(/class="[^"]*"/, `class="${cls}" aria-hidden="true" focusable="false"`);
}
