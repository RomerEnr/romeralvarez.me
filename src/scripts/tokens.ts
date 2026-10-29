// "What I do": each service gets one of the toy pieces from the hero. It pops in when it comes into view
// and then sways slowly on its own.
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
const loader = new GLTFLoader();

document.querySelectorAll<HTMLElement>(".glyph[data-model]").forEach((el, n) => {
  const canvas = document.createElement("canvas");
  let renderer: THREE.WebGLRenderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  } catch {
    return; // keep the flat icon
  }
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(26, 1, 0.1, 50);
  camera.position.set(0, 1.5, 5.6);
  camera.lookAt(0, 0.6, 0);
  scene.add(new THREE.HemisphereLight(0xffffff, 0x8a8f99, 0.9 * Math.PI));
  const key = new THREE.DirectionalLight(0xffffff, 1.0 * Math.PI);
  key.position.set(3, 5, 4);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0xf7930e, 0.4 * Math.PI);
  rim.position.set(-4, 2, -3);
  scene.add(rim);

  const piece = new THREE.Group();
  scene.add(piece);

  loader.load(`/models/${el.dataset.model}.glb`, (gltf) => {
    const m = gltf.scene;
    const box = new THREE.Box3().setFromObject(m);
    const s = box.getSize(new THREE.Vector3());
    const c = box.getCenter(new THREE.Vector3());
    const k = 1.45 / Math.max(s.x, s.y, s.z);
    m.scale.setScalar(k);
    m.position.set(-c.x * k, -box.min.y * k, -c.z * k);
    piece.add(m);
    el.replaceChildren(canvas);
    el.classList.add("token");
    size();
  });

  const size = () => renderer.setSize(el.clientWidth, el.clientWidth, false);
  new ResizeObserver(size).observe(el);

  let visible = false;
  let shown = reduce ? 1 : 0;
  new IntersectionObserver(([e]) => (visible = e.isIntersecting)).observe(el);

  function tick(now: number) {
    if (visible && piece.children.length) {
      const t = now / 1000 + n * 1.7;
      shown += (1 - shown) * 0.08;
      // A soft overshoot as the piece arrives, then a slow sway and float.
      const pop = shown < 0.999 ? 1 + Math.sin(shown * Math.PI) * 0.12 : 1;
      piece.scale.setScalar(shown * pop);
      piece.rotation.y = -0.5 + (reduce ? 0 : Math.sin(t * 0.6) * 0.35) + (1 - shown) * -1.2;
      piece.position.y = reduce ? 0 : Math.sin(t * 1.1) * 0.04;
      renderer.render(scene, camera);
    }
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
});
