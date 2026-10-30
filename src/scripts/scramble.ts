// Section titles resolve from scrambled characters into their text, left to right, as they come into view.
const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%&*+/<>";

function scramble(el: HTMLElement) {
  const text = el.textContent!;
  const from = performance.now();
  const length = 700;
  el.setAttribute("aria-label", text);
  el.style.minHeight = `${el.offsetHeight}px`;
  function frame(now: number) {
    const k = (now - from) / length;
    let out = "";
    for (let i = 0; i < text.length; i++) {
      const c = text[i];
      out += c === " " || k > (i / text.length) * 0.7 + 0.3 ? c : GLYPHS[(Math.random() * GLYPHS.length) | 0];
    }
    el.textContent = out;
    if (k < 1) requestAnimationFrame(frame);
    else {
      el.textContent = text;
      el.removeAttribute("aria-label");
      el.style.minHeight = "";
    }
  }
  requestAnimationFrame(frame);
}

if (!matchMedia("(prefers-reduced-motion: reduce)").matches) {
  const io = new IntersectionObserver(
    (entries) =>
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        io.unobserve(e.target);
        scramble(e.target as HTMLElement);
      }),
    { rootMargin: "0px 0px -15% 0px" },
  );
  document.querySelectorAll<HTMLElement>("main section h2").forEach((h) => io.observe(h));
}
