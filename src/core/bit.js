/* Bit: kursun robot karakteri. Kodla çizilir, böylece göz kırpabilir, zıplayabilir, üzülebilir. */
const AGIZ = {
  mutlu: '<path d="M24 39q8 7 16 0" stroke="#172036" stroke-width="3" fill="none" stroke-linecap="round"/>',
  vay: '<ellipse cx="32" cy="41" rx="5" ry="4" fill="#172036"/>',
  uzgun: '<path d="M25 43q7-5 14 0" stroke="#172036" stroke-width="3" fill="none" stroke-linecap="round"/>'
};

export function bitSvg(mood = "mutlu", cls = "bit") {
  return `<svg class="${cls}" viewBox="0 0 64 64" aria-hidden="true">
  <line x1="32" y1="4" x2="32" y2="12" stroke="var(--robot-2)" stroke-width="3"/><circle cx="32" cy="5" r="4" fill="var(--accent)"/>
  <rect x="8" y="12" width="48" height="42" rx="14" fill="var(--robot)"/><rect x="14" y="20" width="36" height="28" rx="10" fill="#e9fbf9"/>
  <ellipse class="eye" cx="24" cy="30" rx="4" ry="5" fill="#172036"/><ellipse class="eye" cx="40" cy="30" rx="4" ry="5" fill="#172036"/>${AGIZ[mood] || AGIZ.mutlu}
  <rect x="2" y="28" width="6" height="14" rx="3" fill="var(--robot-2)"/><rect x="56" y="28" width="6" height="14" rx="3" fill="var(--robot-2)"/></svg>`;
}

/* Bit'in konuşma balonu: tek kısa cümle */
export function say(text, mood) {
  const s = document.createElement("div");
  s.className = "say";
  s.innerHTML = bitSvg(mood) + `<div class="bubble" role="status">${text}</div>`;
  return s;
}
