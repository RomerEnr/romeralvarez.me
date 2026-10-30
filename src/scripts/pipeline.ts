// The pipeline: starts under the lead, drops onto the rail, stops at every section and ends at the CTA.
const main = document.querySelector("main")!;
const svg = main.querySelector<SVGSVGElement>("svg.pipe")!;
const path = svg.querySelector("path")!;
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
const R = 16;

let total = 0;
let drawn = 0;
let head = -1;
let samples: [number, number][] = [];
let nodes: { el: SVGCircleElement; at: number }[] = [];

function rel(el: Element) {
  const a = el.getBoundingClientRect();
  const m = main.getBoundingClientRect();
  return { x: a.left - m.left, y: a.top - m.top, w: a.width, h: a.height };
}

function lengthAtY(y: number) {
  let best = 0;
  for (const [l, py] of samples) if (py <= y) best = l;
  return best;
}

function dot(x: number, y: number, r: number) {
  const c = document.createElementNS("http://www.w3.org/2000/svg", "circle");
  c.setAttribute("cx", String(x));
  c.setAttribute("cy", String(y));
  c.setAttribute("r", String(r));
  svg.appendChild(c);
  return { el: c, at: lengthAtY(y) };
}

function build() {
  const W = main.offsetWidth;
  const H = main.offsetHeight;
  svg.setAttribute("width", String(W));
  svg.setAttribute("height", String(H));
  svg.setAttribute("viewBox", `0 0 ${W} ${H}`);

  const lead = rel(document.getElementById("lead")!);
  const cta = rel(document.getElementById("endcta")!);
  const flowEl = main.querySelector(".flowing")!;
  const contentX = rel(flowEl).x + parseFloat(getComputedStyle(flowEl).paddingLeft);
  const railX = Math.max(lead.x + 4, contentX - Math.min(64, (contentX - lead.x) / 2));
  const stage = rel(document.getElementById("stage")!);
  const stacked = stage.y > lead.y + lead.h;
  const narrow = stacked || railX - lead.x < 2 * R + 8;
  const startY = stacked ? stage.y + stage.h + 24 : lead.y + lead.h + 28;
  const endY = cta.y + cta.h / 2;

  const d = narrow
    ? `M${railX} ${startY} V${endY - R} A${R} ${R} 0 0 0 ${railX + R} ${endY} H${cta.x - 6}`
    : `M${lead.x} ${startY} H${railX - R} A${R} ${R} 0 0 1 ${railX} ${startY + R} V${endY - R} A${R} ${R} 0 0 0 ${railX + R} ${endY} H${cta.x - 6}`;
  path.setAttribute("d", d);

  svg.querySelectorAll("circle").forEach((c) => c.remove());
  total = path.getTotalLength();
  samples = [];
  for (let l = 0; l <= total; l += 4) samples.push([l, path.getPointAtLength(l).y]);

  // data-node can carry the dot's offset from the top of its element; 40 by default.
  nodes = [...main.querySelectorAll<HTMLElement>("[data-node]")].map((el) => dot(railX, rel(el).y + (Number(el.dataset.node) || 40), 7));
  const end = dot(cta.x - 6, endY, 9);
  end.at = total;
  nodes.push(end);

  path.style.strokeDasharray = String(total);
  head = -1;
  frame(true);
}

function frame(once?: boolean) {
  const front = -main.getBoundingClientRect().top + innerHeight * 0.8;
  const nearEnd = innerHeight + scrollY >= document.documentElement.scrollHeight - 4;
  const target = reduce || nearEnd ? total : lengthAtY(front);
  drawn = once || reduce ? target : drawn + (target - drawn) * 0.08;
  path.style.strokeDashoffset = String(total - drawn);
  for (const n of nodes) n.el.classList.toggle("off", drawn < n.at - 2);
  // The head of the line, for the piece that rides it (rider.ts).
  if (total && Math.abs(drawn - head) > 0.5) {
    head = drawn;
    const p = path.getPointAtLength(drawn);
    main.dispatchEvent(new CustomEvent("pipe:head", { detail: { x: p.x, y: p.y, end: drawn >= total - 1 } }));
  }
  // Keep drawing while the line is still catching up with the scroll; a scroll starts it again.
  if (once) return;
  if (Math.abs(target - drawn) > 0.5) requestAnimationFrame(() => frame());
  else running = false;
}

let running = false;
function wake() {
  if (running) return;
  running = true;
  requestAnimationFrame(() => frame());
}
addEventListener("scroll", wake, { passive: true });

document.fonts.ready.then(() => {
  build();
  wake();
});
new ResizeObserver(() => requestAnimationFrame(build)).observe(main);
