// The envelope from the hero rides the head of the line down the page, turning as it goes, and spins next to the
// contact button once the line arrives.
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

const main = document.querySelector("main")!;
const SIZE = 88;
const canvas = document.createElement("canvas");
canvas.className = "rider";
canvas.setAttribute("aria-hidden", "true");

let renderer: THREE.WebGLRenderer | undefined;
try {
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
} catch {
  // No WebGL: the line runs on its own.
}

if (renderer) start(renderer);

function start(renderer: THREE.WebGLRenderer) {
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
  renderer.setSize(SIZE, SIZE, false);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  main.appendChild(canvas);

  const scene = new THREE.Scene();
  scene.environment = new THREE.PMREMGenerator(renderer).fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = 0.6;
  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 50);
  camera.position.set(0, 0, 5);
  scene.add(new THREE.HemisphereLight(0xffffff, 0x8a8f99, 0.8 * Math.PI));
  const key = new THREE.DirectionalLight(0xffffff, 0.9 * Math.PI);
  key.position.set(3, 5, 4);
  scene.add(key);

  const piece = new THREE.Group();
  scene.add(piece);
  const loader = new GLTFLoader();
  const file = "1";
  loader.load(`/models/${file}.glb`, (gltf) => {
    const m = gltf.scene;
    const box = new THREE.Box3().setFromObject(m);
    const k = 2.6 / box.getSize(new THREE.Vector3()).length();
    m.scale.setScalar(k);
    m.position.copy(box.getCenter(new THREE.Vector3())).multiplyScalar(-k);
    piece.add(m);
  });

  // It shows up once the page has been scrolled.
  let at = { x: 0, y: 0, end: false };
  let shown = 0;
  let turn = 0;
  let spin = 0;
  let shift = 0;
  let last = performance.now();
  main.addEventListener("pipe:head", (e) => (at = (e as CustomEvent).detail));

  function tick(now: number) {
    const want = scrollY > 120 ? 1 : 0;
    shown += (want - shown) * 0.12;
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    // On the way down it sits just above the head; at the end it rests on the last stretch, before the button.
    shift += ((at.end ? -40 : 0) - shift) * 0.12;
    const x = at.x + shift;
    canvas.style.transform = `translate(${x - SIZE / 2}px, ${at.y - SIZE * 0.8}px) scale(${shown})`;
    canvas.style.opacity = shown < 0.02 ? "0" : "1";
    if (shown > 0.02 && piece.children.length) {
      // It turns with the line: one full turn every 400px down, backwards on the way up. At the end it keeps
      // spinning on its own, and the spin it gathered there stays, so leaving the end never jumps.
      if (at.end) spin += dt * 2.4;
      const target = (at.y / 400) * Math.PI * 2 + spin;
      turn += (target - turn) * (at.end ? 1 : 0.15);
      // The envelope lies flat, so it leans toward you to show its seal.
      piece.rotation.set(0.9, turn, 0, "YXZ");
      renderer.render(scene, camera);
    }
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}
