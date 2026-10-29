// About me: each stop on the line builds itself as you scroll to it, the year first, then the story and its skills.
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", () => {
  for (const stop of document.querySelectorAll<HTMLElement>("#path .stop")) {
    gsap
      .timeline({ scrollTrigger: { trigger: stop, start: "top 88%", end: "top 50%", scrub: 0.6 } })
      .from(stop.querySelector(".when"), { x: -24, opacity: 0, ease: "none" })
      .from(stop.querySelector("h3"), { y: 40, opacity: 0, ease: "none" }, "<0.15")
      .from(stop.querySelector("p"), { y: 24, opacity: 0, ease: "none" }, "<0.2")
      .from(stop.querySelectorAll(".tags li"), { y: 12, opacity: 0, stagger: 0.08, ease: "none" }, "<0.2");
  }
});
