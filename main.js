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
  count: 10000,
  size: 0.01,
};

let geometry = null;
let material = null;
let point = null;

function generateGalaxy() {
  const { count, size } = params;

  // Destroy old galaxy
  if (point !== null) {
    geometry.dispose();
    material.dispose();
    scene.remove(point);
  }

  geometry = new THREE.BufferGeometry();
  material = new THREE.PointsMaterial({
    color: 0xff8800,
    size,
    sizeAttenuation: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

  const positions = new Float32Array(count * 3);

  for (let i = 0; i < count; i++) {
    const i3 = i * 3;

    positions[i3 + 0] = Math.random(); // x
    positions[i3 + 1] = Math.random(); // y
    positions[i3 + 2] = Math.random(); // z
  }

  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

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
