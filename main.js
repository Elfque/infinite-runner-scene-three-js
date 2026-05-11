import * as three from "three";
import { OrbitControls } from "three/examples/jsm/Addons.js";
import { floorMesh, speedZ, floorTexture } from "./floor";
import { pointMesh } from "./points";

const sizes = { width: window.innerWidth, height: window.innerHeight };
const restartButton = document.querySelector(".restart");
const gameOverOverlay = document.querySelector(".overlay");
const scoreContainer = document.querySelector(".score");
const levelContainer = document.querySelector(".level");

let score = 0;
let level = 1;

// SCENE
const scene = new three.Scene();

// CAMERA
const camera = new three.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.1,
  1000,
);
camera.position.set(0, 0, 10);
scene.add(camera);

const renderer = new three.WebGLRenderer({ antialias: true });
document.body.appendChild(renderer.domElement);
renderer.setSize(sizes.width, sizes.height);

const control = new OrbitControls(camera, renderer.domElement);
control.enableDamping = true;

const boxGeometry = new three.BoxGeometry(1, 1, 1);
const boxMaterial = new three.MeshBasicMaterial({ color: "#23ED00" });
const boxMesh = new three.Mesh(boxGeometry, boxMaterial);
boxMesh.position.set(0, 0.5, 0);
scene.add(boxMesh);

const ambientLight = new three.AmbientLight("#EEFF90", 1);
scene.add(ambientLight);

// OBSTACLES GROUP
const obstaclesGroup = new three.Group();
scene.add(obstaclesGroup);
const obstaclesCount = 50;
const obstaclesGeometry = new three.BoxGeometry(1, 1, 1);
const obstacleMaterial = new three.MeshStandardMaterial();

const obstaclesInstancedMesh = new three.InstancedMesh(
  obstaclesGeometry,
  obstacleMaterial,
  obstaclesCount,
);

let positions = [];
let offsets = [];
let obstaclesMatrix = new three.Matrix4();
let obstaclesColor = new three.Color();
let meshPassedArray = [];

const initInstanced = () => {
  positions = [];
  offsets = [];
  meshPassedArray = [];

  for (let i = 0; i < obstaclesCount; i++) {
    const x = (Math.random() - 0.5) * 20;
    const y = 0.5;
    const z = -(i + 1) * 3 - 20;
    positions.push(new three.Vector3(x, y, z));
    offsets.push(Math.random() * Math.PI * 2);

    obstaclesMatrix.makeTranslation(x, y, z);
    obstaclesInstancedMesh.setMatrixAt(i, obstaclesMatrix);

    const h = Math.random();
    const s = Math.random();
    const l = Math.random();

    obstaclesColor.setHSL(h, s, l);
    meshPassedArray[i] = 0;
    obstaclesInstancedMesh.setColorAt(i, obstaclesColor);
  }
  obstaclesInstancedMesh.instanceMatrix.needsUpdate = true;
  if (obstaclesInstancedMesh.instanceColor) {
    obstaclesInstancedMesh.instanceColor.needsUpdate = true;
  }
};
initInstanced();

obstaclesGroup.add(obstaclesInstancedMesh);
obstaclesGroup.add(boxMesh);

// FLOOR
obstaclesGroup.add(floorMesh);
obstaclesGroup.position.set(0, -3, 0);
scene.add(pointMesh);

const boxMovement = 0.1;
const keys = {
  right: false,
  left: false,
};
document.addEventListener("keydown", (e) => {
  if (e.key === "ArrowRight") keys.right = true;
  if (e.key === "ArrowLeft") keys.left = true;
});

document.addEventListener("keyup", (e) => {
  if (e.key === "ArrowRight") keys.right = false;
  if (e.key === "ArrowLeft") keys.left = false;
});

const updateMovement = () => {
  if (keys.right && boxMesh.position.x < 8.0) boxMesh.position.x += boxMovement;
  if (keys.left && boxMesh.position.x > -8.0) boxMesh.position.x -= boxMovement;
};

let offsetZ = 0;
let isGameOver = false;

const restartGame = () => {
  score = 0;
  level = 1;
  scoreContainer.textContent = score;
  levelContainer.textContent = level;
  isGameOver = false;
  gameOverOverlay.classList.add("hide");
  initInstanced();
  boxMesh.position.set(0, 0.5, 0);
};

restartButton.addEventListener("click", restartGame);

const animate = () => {
  if (!isGameOver) {
    for (let i = 0; i < obstaclesCount; i++) {
      positions[i].z += speedZ * 10 + level * 0.2;
      if (positions[i].z > 15) {
        positions[i].z = -140;
        positions[i].x = (Math.random() - 0.5) * 20;
        meshPassedArray[i] = 0;
      }

      obstaclesMatrix.makeTranslation(
        positions[i].x,
        positions[i].y,
        positions[i].z,
      );

      if (
        Math.abs(boxMesh.position.x - positions[i].x) < 1 &&
        Math.abs(boxMesh.position.z - positions[i].z) < 1
      ) {
        isGameOver = true;
        gameOverOverlay.classList.remove("hide");
      } else if (
        Math.abs(boxMesh.position.z - positions[i].z) < 1 &&
        meshPassedArray[i] === 0
      ) {
        meshPassedArray[i] = 1;
        score++;
        scoreContainer.textContent = score;
      }
      obstaclesInstancedMesh.setMatrixAt(i, obstaclesMatrix);
    }
    obstaclesInstancedMesh.instanceMatrix.needsUpdate = true;

    //   FLOOR ANIMATION
    offsetZ += speedZ;
    if (offsetZ > 1) offsetZ -= 1;

    floorTexture.offset.y = offsetZ;
    floorTexture.needsUpdate = true;
    updateMovement();
    level = Math.floor(score / 100);
    levelContainer.textContent = level + 1;
  }

  renderer.render(scene, camera);
  control.update();
  window.requestAnimationFrame(animate);
};
animate();

window.addEventListener("resize", () => {
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});
