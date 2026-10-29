// "What I do": each service mark becomes a small toy token, extruded from the same icon path, that follows the pointer.
import * as THREE from "three";
import { SVGLoader } from "three/addons/loaders/SVGLoader.js";
import { ICONS, type IconName } from "../lib/icons";

const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
const pointer = { x: 0, y: 0 };
addEventListener("pointermove", (e) => {
  pointer.x = (e.clientX / innerWidth) * 2 - 1;
  pointer.y = (e.clientY / innerHeight) * 2 - 1;
});

const mat = {
  tile: new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.45 }),
  ink: new THREE.MeshStandardMaterial({ color: 0x23262e, roughness: 0.5 }),
  orange: new THREE.MeshStandardMaterial({ color: 0xf7930e, roughness: 0.38 }),
};

function tile(w: number, h: number, d: number, r: number) {
  const s = new THREE.Shape();
  const x = -(w / 2 - r), y = -(h / 2 - r), iw = w - 2 * r, ih = h - 2 * r, c = Math.min(iw, ih) * 0.25;
  s.moveTo(x + c, y);
  s.lineTo(x + iw - c, y);
  s.quadraticCurveTo(x + iw, y, x + iw, y + c);
  s.lineTo(x + iw, y + ih - c);
  s.quadraticCurveTo(x + iw, y + ih, x + iw - c, y + ih);
  s.lineTo(x + c, y + ih);
  s.quadraticCurveTo(x, y + ih, x, y + ih - c);
  s.lineTo(x, y + c);
  s.quadraticCurveTo(x, y, x + c, y);
  const g = new THREE.ExtrudeGeometry(s, { depth: d - 2 * r, bevelEnabled: true, bevelSize: r, bevelThickness: r, bevelSegments: 4, curveSegments: 8 });
  g.center();
  return g;
}

function mark(name: IconName) {
  const svg = new SVGLoader().parse(`<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="${ICONS[name]}"/></svg>`);
  const shapes = svg.paths.flatMap((p) => p.toShapes());
  const g = new THREE.ExtrudeGeometry(shapes, { depth: 1.2, bevelEnabled: true, bevelSize: 0.12, bevelThickness: 0.2, bevelSegments: 2, curveSegments: 10 });
  g.rotateX(Math.PI);
  g.center();
  g.scale(0.068, 0.068, 0.068);
  return g;
}

document.querySelectorAll<HTMLElement>(".glyph[data-icon]").forEach((el, n) => {
  const canvas = document.createElement("canvas");
  let renderer: THREE.WebGLRenderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  } catch {
    return; // keep the flat icon
  }
  el.replaceChildren(canvas);
  el.classList.add("token");
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(28, 1, 0.1, 50);
  camera.position.set(0, 0, 9.5);
  scene.add(new THREE.HemisphereLight(0xffffff, 0x8a8f99, 0.85 * Math.PI));
  const key = new THREE.DirectionalLight(0xffffff, 1.0 * Math.PI);
  key.position.set(3, 4, 6);
  scene.add(key);

  const token = new THREE.Group();
  scene.add(token);
  token.add(new THREE.Mesh(tile(2.6, 2.6, 0.7, 0.22), mat.tile));
  const logo = new THREE.Mesh(mark(el.dataset.icon as IconName), mat.ink);
  logo.position.z = 0.42;
  token.add(logo);

  let hover = false, spin = 0, lift = 0, ry = 0;
  const host = el.parentElement!;
  host.addEventListener("pointerenter", () => {
    hover = true;
    if (!reduce) spin += Math.PI * 2;
  });
  host.addEventListener("pointerleave", () => (hover = false));

  const size = () => renderer.setSize(el.clientWidth, el.clientWidth, false);
  new ResizeObserver(size).observe(el);
  size();
  let visible = true;
  new IntersectionObserver(([e]) => (visible = e.isIntersecting)).observe(el);

  function tick(now: number) {
    if (visible) {
      const t = now / 1000 + n * 1.3;
      ry += (spin - ry) * 0.06;
      lift += ((hover ? 1 : 0) - lift) * 0.12;
      token.rotation.set(-0.35 + pointer.y * 0.25 + (reduce ? 0 : Math.sin(t * 0.9) * 0.05), 0.45 + pointer.x * 0.4 + ry, 0);
      token.position.y = reduce ? 0 : Math.sin(t * 1.2) * 0.06 + lift * 0.1;
      logo.material = lift > 0.5 ? mat.orange : mat.ink;
      renderer.render(scene, camera);
    }
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
});
