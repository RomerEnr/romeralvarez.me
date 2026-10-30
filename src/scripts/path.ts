// About me: each stop on the line comes into focus as you scroll to it, the year first, then the story and its skills.
// Everything starts half visible, so nothing looks missing to someone who scrolls fast.
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", () => {
  for (const stop of document.querySelectorAll<HTMLElement>("#path .stop")) {
    gsap
      .timeline({ scrollTrigger: { trigger: stop, start: "top 92%", end: "top 65%", scrub: 0.6 } })
      .from(stop.querySelector(".when"), { x: -16, opacity: 0.5, ease: "none" })
      .from(stop.querySelector("h3"), { y: 24, opacity: 0.5, ease: "none" }, "<0.15")
      .from(stop.querySelector("p"), { y: 16, opacity: 0.5, ease: "none" }, "<0.2")
      .from(stop.querySelectorAll(".tags li"), { y: 8, opacity: 0.5, stagger: 0.08, ease: "none" }, "<0.2");
  }
});
