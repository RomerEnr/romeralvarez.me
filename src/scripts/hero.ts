// Hero: one deploy, told in six steps. The orange line carries a commit through CI, ArgoCD and Kubernetes
// to the metrics, and Terraform closes everything into one module at the end.
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { ICONS, type IconName } from "../lib/icons";

const stage = document.getElementById("stage")!;
const canvas = stage.querySelector("canvas")!;
const caption = stage.querySelector(".hint")!;
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

let renderer: THREE.WebGLRenderer | undefined;
try {
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
} catch {
  // No WebGL: the dark stage stays as it is.
}

if (renderer) start(renderer);

function start(renderer: THREE.WebGLRenderer) {
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
  renderer.setClearColor(0x111318, 1);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
  // Intensities are multiplied by PI to match the look of the prototype's legacy lighting.
  scene.add(new THREE.HemisphereLight(0xffffff, 0x2a2d35, 0.9 * Math.PI));
  const key = new THREE.DirectionalLight(0xffffff, 1.1 * Math.PI);
  key.position.set(4, 9, 6);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  Object.assign(key.shadow.camera, { left: -6, right: 6, top: 6, bottom: -6 });
  scene.add(key);
  const rim = new THREE.DirectionalLight(0xf7930e, 0.6 * Math.PI);
  rim.position.set(-7, 3, -5);
  scene.add(rim);

  const orange = new THREE.MeshStandardMaterial({ color: 0xf7930e, roughness: 0.38 });

  function roundedBox(w: number, h: number, d: number, r: number) {
    const s = new THREE.Shape();
    const x = -(w / 2 - r), y = -(h / 2 - r), iw = w - 2 * r, ih = h - 2 * r, c = Math.min(r, iw / 2, ih / 2) * 0.6;
    s.moveTo(x + c, y);
    s.lineTo(x + iw - c, y);
    s.quadraticCurveTo(x + iw, y, x + iw, y + c);
    s.lineTo(x + iw, y + ih - c);
    s.quadraticCurveTo(x + iw, y + ih, x + iw - c, y + ih);
    s.lineTo(x + c, y + ih);
    s.quadraticCurveTo(x, y + ih, x, y + ih - c);
    s.lineTo(x, y + c);
    s.quadraticCurveTo(x, y, x + c, y);
    const g = new THREE.ExtrudeGeometry(s, { depth: d - 2 * r, bevelEnabled: true, bevelSize: r, bevelThickness: r, bevelSegments: 4, curveSegments: 6 });
    g.center();
    return g;
  }

  const world = new THREE.Group();
  scene.add(world);
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(20, 20), new THREE.ShadowMaterial({ opacity: 0.35 }));
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  world.add(floor);

  // Five stations on a zig-zag, left to right.
  const P = [[-3.2, 0.7], [-1.6, -0.7], [0, 0.7], [1.6, -0.7], [3.2, 0.7]].map(([x, z]) => new THREE.Vector3(x, 0, z));
  const station = P.map((p) => {
    const g = new THREE.Group();
    g.position.copy(p);
    world.add(g);
    return g;
  });

  // Toy pieces generated with Higgsfield (image to 3D). Each one is scaled to a size and set on the floor.
  const loader = new GLTFLoader();
  function piece(parent: THREE.Object3D, file: string, size: number, x = 0, y = 0, z = 0, copies = 1) {
    const holders = Array.from({ length: copies }, () => {
      const h = new THREE.Group();
      h.position.set(x, y, z);
      h.scale.setScalar(0.0001);
      parent.add(h);
      return h;
    });
    loader.load(`/models/${file}.glb`, (gltf) => {
      const m = gltf.scene;
      const box = new THREE.Box3().setFromObject(m);
      const s = box.getSize(new THREE.Vector3());
      const c = box.getCenter(new THREE.Vector3());
      const k = size / Math.max(s.x, s.y, s.z);
      m.scale.setScalar(k);
      m.position.set(-c.x * k, -box.min.y * k, -c.z * k);
      m.traverse((o) => {
        if ((o as THREE.Mesh).isMesh) o.castShadow = o.receiveShadow = true;
      });
      holders.forEach((h, i) => h.add(i ? m.clone() : m));
    });
    return holders;
  }
  const [letter] = piece(station[0], "1", 1.1);
  const [factory] = piece(station[1], "2", 1.4, -0.2, 0, 0);
  const [box] = piece(station[1], "3", 0.5);
  const [octo] = piece(station[2], "4", 1.15);
  const [ring] = piece(station[2], "5", 0.7, 0, 1.2, 0);
  const [platform] = piece(station[3], "6", 1.6);
  const crates = piece(station[3], "7", 0.42, 0, 0, 0, 3);
  const [screen] = piece(station[4], "8", 1.25, -0.35, 0, -0.1);
  const bars = piece(station[4], "9", 0.8, 0, 0, 0, 3);
  const cratePos = [[-0.4, 0.2], [0.05, 0.2], [-0.18, -0.25]];
  const barPos = [0.35, 0.62, 0.89];
  const barH = [0.55, 0.8, 1.1];

  // Terraform: at the end everything sits inside one module, a slab underneath and a dashed boundary around it.
  const ENV = { w: 9.4, h: 2.7, d: 3.9 };
  const slab = new THREE.Mesh(roundedBox(ENV.w, 0.14, ENV.d, 0.06), new THREE.MeshStandardMaterial({ color: 0x262931, roughness: 0.7 }));
  slab.position.y = -0.08;
  slab.receiveShadow = true;
  world.add(slab);
  const boundary = new THREE.LineSegments(
    new THREE.EdgesGeometry(new THREE.BoxGeometry(ENV.w, ENV.h, ENV.d)),
    new THREE.LineDashedMaterial({ color: 0xf2f3f5, dashSize: 0.18, gapSize: 0.12, transparent: true, opacity: 0.7 }),
  );
  boundary.computeLineDistances();
  boundary.position.y = ENV.h / 2;
  world.add(boundary);

  // A badge over each station with its technology mark; the active one turns orange.
  function badgeTexture(name: IconName, on: boolean) {
    const c = document.createElement("canvas");
    c.width = c.height = 256;
    const x = c.getContext("2d")!;
    x.fillStyle = on ? "#F7930E" : "#FFFFFF";
    x.beginPath();
    x.arc(128, 128, 120, 0, Math.PI * 2);
    x.fill();
    x.translate(56, 56);
    x.scale(6, 6);
    x.fillStyle = "#111318";
    x.fill(new Path2D(ICONS[name]));
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }
  const marks: IconName[] = ["git", "actions", "argo", "kubernetes", "grafana", "terraform"];
  const badgeY = [1.1, 1.75, 2.15, 1.85, 1.75];
  const badges = marks.map((name, i) => {
    const off = new THREE.SpriteMaterial({ map: badgeTexture(name, false), depthTest: false });
    const on = new THREE.SpriteMaterial({ map: badgeTexture(name, true), depthTest: false });
    const sp = new THREE.Sprite(off);
    sp.userData = { off, on };
    sp.renderOrder = 2;
    if (P[i]) sp.position.set(P[i].x, badgeY[i], P[i].z);
    else sp.position.set(-ENV.w / 2, ENV.h, ENV.d / 2);
    world.add(sp);
    return sp;
  });

  // The line: one tube through all five stations, drawn as the commit moves.
  const pts: THREE.Vector3[] = [];
  P.forEach((p, i) => {
    if (!i) return;
    const a = P[i - 1];
    pts.push(new THREE.Vector3(a.x, 0.05, a.z), new THREE.Vector3((a.x + p.x) / 2, 0.05, a.z), new THREE.Vector3((a.x + p.x) / 2, 0.05, p.z));
  });
  pts.push(new THREE.Vector3(P[4].x, 0.05, P[4].z));
  const curve = new THREE.CurvePath<THREE.Vector3>();
  for (let i = 0; i < pts.length - 1; i++) curve.add(new THREE.LineCurve3(pts[i], pts[i + 1]));
  const SEG = 400, RAD = 8;
  const tube = new THREE.Mesh(new THREE.TubeGeometry(curve, SEG, 0.06, RAD, false), orange);
  tube.receiveShadow = true;
  world.add(tube);
  const packet = new THREE.Mesh(new THREE.SphereGeometry(0.14, 24, 12), orange);
  packet.castShadow = true;
  world.add(packet);
  const stationT = P.map((p) => {
    let best = 0, d = 1e9;
    const target = new THREE.Vector3(p.x, 0.05, p.z);
    for (let i = 0; i <= 200; i++) {
      const dd = curve.getPointAt(i / 200).distanceTo(target);
      if (dd < d) [d, best] = [dd, i / 200];
    }
    return best;
  });

  // Timeline (seconds). Each step: the line travels, then the station acts.
  const steps = [
    { label: "01 · Commit", travel: [0, 0], act: [0.3, 1.8] },
    { label: "02 · Build · CI", travel: [1.8, 3.2], act: [3.2, 5.2] },
    { label: "03 · Sync · ArgoCD", travel: [5.2, 6.6], act: [6.6, 8.6] },
    { label: "04 · Deploy · Kubernetes", travel: [8.6, 10.0], act: [10.0, 12.2] },
    { label: "05 · Observe · Grafana", travel: [12.2, 13.6], act: [13.6, 15.6] },
    { label: "06 · Provision · Terraform", travel: [15.8, 15.8], act: [16.0, 19.0] },
  ];
  const HOLD = 34, OUT = 35; // the finished scene stays for 15 s before it starts again
  const clamp = (x: number) => Math.max(0, Math.min(1, x));
  const ease = (x: number) => 1 - Math.pow(1 - clamp(x), 3);
  const back = (x: number) => {
    x = clamp(x);
    const c = 1.7;
    return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2);
  };
  const span = (t: number, [a, b]: number[]) => (b > a ? (t - a) / (b - a) : t >= a ? 1 : 0);

  let zoom = 0;
  function pose(t: number) {
    const out = 1 - ease((t - HOLD) / (OUT - HOLD));
    let lineT = 0, active = 0;
    steps.forEach((s, i) => {
      if (t >= s.travel[0]) active = i;
      if (i > 0 && i < P.length) {
        const k = ease(span(t, s.travel));
        if (k > 0) lineT = stationT[i - 1] + (stationT[i] - stationT[i - 1]) * k;
      }
    });
    const n = Math.floor(SEG * lineT) * RAD * 6;
    tube.geometry.setDrawRange(0, out < 1 ? Math.floor(n * out) : n);
    const moving = steps.some((s, i) => i && t > s.travel[0] && t < s.travel[1]);
    packet.visible = moving;
    if (moving) {
      const q = curve.getPointAt(Math.max(0.001, lineT));
      packet.position.set(q.x, 0.2, q.z);
    }

    const a = steps.map((s) => span(t, s.act));
    const pop = (o: THREE.Object3D, k: number) => o.scale.setScalar(Math.max(0.0001, k * out));
    // 1 the commit lands and gets its seal
    pop(letter, back(a[0]));
    letter.rotation.y = (1 - ease(a[0])) * 1.2;
    // 2 the factory appears, then the build box rolls out toward the next step
    pop(factory, back(a[1] * 3));
    const kb = ease(a[1] * 1.6 - 0.5);
    box.position.set(-0.2 + kb * 0.85, 0.35 * (1 - kb), 0.15 + kb * 0.45);
    pop(box, back(a[1] * 1.6 - 0.45));
    // 3 Argo picks it up: the octopus pops in and the sync ring turns once
    pop(octo, back(a[2] * 3));
    pop(ring, back(a[2] * 3 - 0.4));
    ring.rotation.y = ease(a[2] * 1.2 - 0.2) * Math.PI * 2;
    ring.position.y = 1.15 + Math.sin(ease(a[2]) * Math.PI) * 0.2;
    // 4 Kubernetes: the node appears and the containers drop into place one by one
    pop(platform, back(a[3] * 3));
    crates.forEach((c, i) => {
      const k = ease(a[3] * 4 - 1 - i * 0.7);
      c.position.set(cratePos[i][0], 0.66 + (1 - k) * 2.4, cratePos[i][1]);
      pop(c, k > 0 ? 1 : 0);
    });
    // 5 Grafana: the screen turns on and the bars rise
    pop(screen, back(a[4] * 3));
    bars.forEach((b, i) => {
      const k = ease(a[4] * 3 - 0.8 - i * 0.5) * out;
      b.position.set(barPos[i], 0, 0.25);
      b.scale.set(1, Math.max(0.0001, barH[i] * k), 1);
      b.visible = k > 0.01;
    });
    // 6 Terraform: the slab grows under everything and the boundary closes around it
    const kt = ease(a[5] * 1.5), kb2 = ease(a[5] * 1.5 - 0.4);
    slab.scale.set(Math.max(0.0001, kt * out), 1, Math.max(0.0001, kt * out));
    slab.visible = kt > 0.01;
    boundary.scale.set(1, Math.max(0.0001, kb2 * out), 1);
    boundary.position.y = (ENV.h * kb2 * out) / 2;
    boundary.visible = kb2 > 0.01;
    zoom = ease(a[5] * 1.2) * out;
    badges.forEach((b, i) => {
      b.scale.setScalar(Math.max(0.0001, 0.85 * back(a[i] * 2) * out));
      b.material = i === active && t < HOLD ? b.userData.on : b.userData.off;
    });
    caption.textContent = reduce ? "Commit → CI → ArgoCD → Kubernetes → Grafana → Terraform" : steps[active].label;
  }

  // Pointer tilts the scene; a tap restarts the story.
  const pointer = new THREE.Vector2();
  const tilt = { x: 0, y: 0 };
  let startedAt = performance.now();
  stage.addEventListener("pointermove", (e) => {
    const r = stage.getBoundingClientRect();
    pointer.set(((e.clientX - r.left) / r.width) * 2 - 1, -(((e.clientY - r.top) / r.height) * 2 - 1));
  });
  stage.addEventListener("pointerleave", () => pointer.set(0, 0));
  stage.addEventListener("click", () => (startedAt = performance.now()));

  let baseDist = 1.15;
  function size() {
    const w = stage.clientWidth, h = stage.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    baseDist = w / h < 1.2 ? 1.3 : 1.15;
    camera.updateProjectionMatrix();
  }
  new ResizeObserver(size).observe(stage);
  size();

  let visible = true;
  new IntersectionObserver(([e]) => (visible = e.isIntersecting)).observe(stage);

  function tick(now: number) {
    if (visible) {
      const t = reduce ? HOLD - 1 : ((now - startedAt) / 1000) % OUT;
      tilt.x += (pointer.y * 0.15 - tilt.x) * 0.06;
      tilt.y += (pointer.x * 0.35 - tilt.y) * 0.06;
      world.rotation.set(-tilt.x, 0.3 + tilt.y, 0);
      pose(t);
      camera.position.set(5.5, 6.5, 9).multiplyScalar(baseDist * (1 + 0.5 * zoom));
      camera.lookAt(0.2 - 0.2 * zoom, 0.75 + 0.35 * zoom, -0.2);
      renderer.render(scene, camera);
    }
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}
