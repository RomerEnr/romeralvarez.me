// Hero: the toy pieces float in a pile that pulls itself together. The pointer pushes them apart, and once you
// scroll the envelope leaves the pile to ride the line down the page (see rider.ts).
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

const stage = document.getElementById("stage")!;
const canvas = stage.querySelector("canvas")!;
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

let renderer: THREE.WebGLRenderer | undefined;
try {
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
} catch {
  // No WebGL: the dark stage stays as it is.
}

if (renderer) start(renderer);

type Body = { obj: THREE.Group; p: THREE.Vector3; v: THREE.Vector3; w: THREE.Vector3; r: number; g: number; leaves?: boolean };

function start(renderer: THREE.WebGLRenderer) {
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
  renderer.setClearColor(0x111318, 1);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = 0.6;
  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
  camera.position.set(0, 0, 11);
  scene.add(new THREE.HemisphereLight(0xffffff, 0x2a2d35, 0.6 * Math.PI));
  const key = new THREE.DirectionalLight(0xffffff, 0.9 * Math.PI);
  key.position.set(4, 7, 6);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0xf7930e, 0.9 * Math.PI);
  rim.position.set(-6, -2, -4);
  scene.add(rim);

  // Every piece of the deploy story, a few of them twice, so the pile looks full.
  const files = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "3", "7", "9", "5", "7"];
  const bodies: Body[] = files.map((file, i) => {
    const obj = new THREE.Group();
    const a = (i / files.length) * Math.PI * 2;
    const body: Body = {
      obj,
      p: new THREE.Vector3(Math.cos(a) * 3, 7 + i * 0.6, Math.sin(a) * 1.5),
      v: new THREE.Vector3(),
      w: new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).multiplyScalar(2),
      r: 0.82,
      g: 0,
      leaves: i === 0,
    };
    obj.rotation.set(Math.random() * 6, Math.random() * 6, Math.random() * 6);
    obj.scale.setScalar(0.0001);
    scene.add(obj);
    return body;
  });

  // Each model is centered on its middle so it spins in place, and scaled to fit its ball.
  const loader = new GLTFLoader();
  const models = new Map<string, Promise<THREE.Object3D>>();
  const model = (file: string) => {
    if (!models.has(file))
      models.set(
        file,
        new Promise((done) =>
          loader.load(`/models/${file}.glb`, (gltf) => {
            const m = gltf.scene;
            const box = new THREE.Box3().setFromObject(m);
            const c = box.getCenter(new THREE.Vector3());
            const k = 2 / box.getSize(new THREE.Vector3()).length();
            m.scale.setScalar(k);
            m.position.copy(c).multiplyScalar(-k);
            const g = new THREE.Group();
            g.add(m);
            done(g);
          }),
        ),
      );
    return models.get(file)!;
  };
  let first = true;
  files.forEach((file, i) =>
    model(file).then((m) => {
      bodies[i].obj.add(first ? m : m.clone());
      first = false;
    }),
  );

  // The pointer is a ball on the plane through the middle of the pile.
  const ray = new THREE.Raycaster();
  const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
  const hand = { p: new THREE.Vector3(99, 99, 0), on: false, r: 1.1 };
  const ndc = new THREE.Vector2();
  function aim(e: PointerEvent) {
    const r = stage.getBoundingClientRect();
    ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -(((e.clientY - r.top) / r.height) * 2 - 1));
    ray.setFromCamera(ndc, camera);
    ray.ray.intersectPlane(plane, hand.p);
    hand.on = true;
  }
  stage.addEventListener("pointermove", aim);
  stage.addEventListener("pointerdown", aim);
  stage.addEventListener("pointerleave", () => (hand.on = false));

  // Scrolling sends the envelope out of the bottom left corner, toward where the line starts.
  let leave = 0;
  const exit = new THREE.Vector3(-6, -5, 0);
  addEventListener("scroll", () => (leave = Math.min(1, Math.max(0, (scrollY - 20) / 220))), { passive: true });

  const tmp = new THREE.Vector3();
  const n = new THREE.Vector3();
  const spin = new THREE.Quaternion();
  function step(dt: number) {
    for (const b of bodies) {
      const home = b.leaves ? tmp.copy(exit).multiplyScalar(leave) : tmp.set(0, 0, 0);
      // A spring toward the middle, squashed in depth so the pile spreads across the frame.
      b.v.x += (home.x - b.p.x) * 2.2 * dt;
      b.v.y += (home.y - b.p.y) * 2.2 * dt;
      b.v.z += (home.z - b.p.z) * 5 * dt;
      b.v.multiplyScalar(Math.exp(-2.4 * dt));
      b.w.multiplyScalar(Math.exp(-1.2 * dt));
    }
    // Balls push each other apart; a hit sets them spinning.
    for (let i = 0; i < bodies.length; i++) {
      const a = bodies[i];
      if (a.leaves && leave > 0.05) continue;
      for (let j = i + 1; j < bodies.length; j++) {
        const b = bodies[j];
        if (b.leaves && leave > 0.05) continue;
        n.subVectors(b.p, a.p);
        const d = n.length(), min = a.r + b.r;
        if (d >= min || d === 0) continue;
        n.divideScalar(d);
        const push = (min - d) / 2;
        a.p.addScaledVector(n, -push);
        b.p.addScaledVector(n, push);
        const vn = tmp.subVectors(b.v, a.v).dot(n);
        if (vn < 0) {
          a.v.addScaledVector(n, vn * 0.6);
          b.v.addScaledVector(n, -vn * 0.6);
          const kick = Math.min(-vn, 4) * 0.5;
          a.w.addScaledVector(tmp.set(n.z, -n.x, n.y), kick);
          b.w.addScaledVector(tmp.set(-n.y, n.z, -n.x), kick);
        }
      }
    }
    if (hand.on)
      for (const b of bodies) {
        n.subVectors(b.p, hand.p);
        const d = n.length(), min = b.r + hand.r;
        if (d >= min) continue;
        n.divideScalar(d || 1);
        b.p.addScaledVector(n, min - d);
        b.v.addScaledVector(n, (min - d) * 18);
        b.w.addScaledVector(tmp.set(-n.y, n.x, n.z), (min - d) * 6);
      }
    for (const b of bodies) {
      b.p.addScaledVector(b.v, dt);
      const s = b.w.length();
      if (s > 1e-4) b.obj.quaternion.premultiply(spin.setFromAxisAngle(tmp.copy(b.w).divideScalar(s), s * dt));
    }
  }

  function size() {
    const w = stage.clientWidth, h = stage.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.position.z = w / h < 1.1 ? 13 : 11;
    camera.updateProjectionMatrix();
  }
  new ResizeObserver(size).observe(stage);
  size();

  let visible = true;
  new IntersectionObserver(([e]) => (visible = e.isIntersecting)).observe(stage);

  // With reduced motion the pile is settled before the first frame and only the envelope's exit is shown.
  if (reduce) for (let i = 0; i < 600; i++) step(1 / 60);

  let last = performance.now();
  function tick(now: number) {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    if (visible) {
      if (!reduce) for (let i = 0; i < 2; i++) step(dt / 2);
      for (const b of bodies) {
        b.obj.position.copy(b.p);
        if (reduce && b.leaves) b.obj.position.copy(exit).multiplyScalar(leave).lerp(b.p, 1 - leave);
        if (b.obj.children.length) b.g += (1 - b.g) * (reduce ? 1 : 0.1);
        b.obj.scale.setScalar(Math.max(0.0001, b.leaves ? b.g * (1 - leave) : b.g));
      }
      renderer.render(scene, camera);
    }
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}
