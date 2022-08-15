import "./style.css";
import * as THREE from "three";
import dat from "dat.gui";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

document.querySelector("#app").innerHTML = `
  <canvas id="webgl"></canvas>
`;

/**
 * Base
 */
// Debug
const gui = new dat.GUI({ width: 500 });

// Canvas
const canvas = document.querySelector("#webgl");

// Scene
const scene = new THREE.Scene();

// Galaxy
const params = {
  count: 100000,
  size: 0.01,
  radius: 5,
  branches: 4,
  spin: 1,
  randomness: 0.6,
  randomnessPower: 3,
  insideColor: "#ff6030",
  outsideColor: "#1b3984",
};

let geometry = null;
let material = null;
let point = null;

function generateGalaxy() {
  const { count, size, radius, branches, spin, randomness, randomnessPower } =
    params;

  // Destroy old galaxy
  if (point !== null) {
    geometry.dispose();
    material.dispose();
    scene.remove(point);
  }

  geometry = new THREE.BufferGeometry();
  material = new THREE.PointsMaterial({
    size,
    sizeAttenuation: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexColors: true,
  });

  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);

  const insideColor = new THREE.Color(params.insideColor);
  const outsideColor = new THREE.Color(params.outsideColor);

  for (let i = 0; i < count; i++) {
    const i3 = i * 3;
    const r = Math.random() * radius;
    const spinAngle = spin * r;
    const branchesAngle = ((i % branches) / branches) * 2 * Math.PI;

    const randomX =
      Math.pow(Math.random(), randomnessPower) *
      (Math.random() < 0.5 ? 1 : -1) *
      randomness;
    const randomY =
      Math.pow(Math.random(), randomnessPower) *
      (Math.random() < 0.5 ? 1 : -1) *
      randomness;
    const randomZ =
      Math.pow(Math.random(), randomnessPower) *
      (Math.random() < 0.5 ? 1 : -1) *
      randomness;

    positions[i3 + 0] = Math.cos(branchesAngle + spinAngle) * r + randomX; // x
    positions[i3 + 1] = randomY; // y
    positions[i3 + 2] = Math.sin(branchesAngle + spinAngle) * r + randomZ; // z

    const mixedColor = insideColor.clone();

    mixedColor.lerp(outsideColor, r / radius);

    colors[i3 + 0] = mixedColor.r;
    colors[i3 + 1] = mixedColor.g;
    colors[i3 + 2] = mixedColor.b;
  }

  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

  point = new THREE.Points(geometry, material);
  scene.add(point);
}

generateGalaxy();

gui
  .add(params, "count")
  .min(100)
  .max(100000)
  .step(100)
  .name("Number of points")
  .onFinishChange(generateGalaxy);

gui
  .add(params, "size")
  .min(0.001)
  .max(0.1)
  .step(0.001)
  .name("Size of point")
  .onFinishChange(generateGalaxy);

gui
  .add(params, "radius")
  .min(0.01)
  .max(20)
  .step(0.01)
  .name("Size of galaxy")
  .onFinishChange(generateGalaxy);

gui
  .add(params, "branches")
  .min(2)
  .max(20)
  .step(1)
  .name("Branches Number")
  .onFinishChange(generateGalaxy);

gui
  .add(params, "spin")
  .min(-5)
  .max(5)
  .step(0.001)
  .name("Spin Branches")
  .onFinishChange(generateGalaxy);

gui
  .add(params, "randomness")
  .min(0)
  .max(2)
  .step(0.001)
  .name("Randomness")
  .onFinishChange(generateGalaxy);

gui
  .add(params, "randomnessPower")
  .min(1)
  .max(10)
  .step(0.001)
  .name("Randomness Power")
  .onFinishChange(generateGalaxy);

gui
  .addColor(params, "insideColor")
  .name("Inside Color")
  .onFinishChange(generateGalaxy);

gui
  .addColor(params, "outsideColor")
  .name("Outside Color")
  .onFinishChange(generateGalaxy);

/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

window.addEventListener("resize", () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.1,
  100
);
camera.position.x = 3;
camera.position.y = 3;
camera.position.z = 3;
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

/**
 * Animate
 */
const clock = new THREE.Clock();

const tick = () => {
  const elapsedTime = clock.getElapsedTime();

  // Update controls
  controls.update();

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
