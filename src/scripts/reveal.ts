// Section titles rise word by word from under their baseline and come into focus as they come into view.
if (!matchMedia("(prefers-reduced-motion: reduce)").matches) {
  const io = new IntersectionObserver(
    (entries) =>
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        io.unobserve(e.target);
        e.target.classList.add("in");
      }),
    { rootMargin: "0px 0px -12% 0px" },
  );
  document.querySelectorAll<HTMLElement>("main section h2").forEach((h) => {
    const words = h.textContent!.trim().split(/\s+/);
    h.setAttribute("aria-label", words.join(" "));
    h.replaceChildren(
      ...words.flatMap((word, i) => {
        const outer = document.createElement("span");
        outer.className = "word";
        outer.setAttribute("aria-hidden", "true");
        const inner = document.createElement("span");
        inner.textContent = word;
        inner.style.transitionDelay = `${i * 90}ms`;
        outer.append(inner);
        return i ? [" ", outer] : [outer];
      }),
    );
    h.classList.add("rise");
    io.observe(h);
  });
}
