import * as THREE from "three";
import Dino from "./dino";
import Tree from "./tree";
import Crow from "./crow";
import {
  GEOMETRY,
  MATERIALS,
  CONSTANTS,
  SPEED,
  CAMERA,
  COLORS
} from "./constants";

var controls, renderer, scene, camera;
var plane, dino;
var treeSpawnInterval, crowSpawnInterval;

var trees = [];
var crows = [];

function createScene() {
  scene = new THREE.Scene();

  console.log("TCL: createScene -> CAMERA", CAMERA);
  camera = new THREE.PerspectiveCamera(
    CAMERA.fov,
    window.innerWidth / window.innerHeight,
    CAMERA.near,
    CAMERA.far
  );
  renderer = new THREE.WebGLRenderer({ antialias: true });
  // controls = new THREE.OrbitControls(camera, renderer.domElement);

  renderer.setSize(window.innerWidth - 20, window.innerHeight - 10);
  renderer.setClearColor(new THREE.Color(COLORS.sky));
  renderer.shadowMap.enabled = true;
  document.body.appendChild(renderer.domElement);

  camera.position.x = 0;
  camera.position.y = 30;
  camera.position.z = 100;
}

function addLight() {
  var light = new THREE.HemisphereLight(COLORS.ground, COLORS.ground, 1);
  scene.add(light);
  var directionalLight = new THREE.DirectionalLight(0xffffff, 1);
  directionalLight.position.set(0, 20, 0);
  // scene.add(directionalLight);
}

function InitDino() {
  dino = new Dino();

  dino.add(camera);
  scene.add(dino);
}

function addPlane() {
  var material = new THREE.MeshPhongMaterial({
    color: COLORS.ground
  });
  var geometry = new THREE.BoxGeometry(
    CONSTANTS.planeWidth,
    CONSTANTS.planeLength,
    1
  );
  plane = new THREE.Mesh(geometry, material);
  plane.rotation.x = Math.PI * 0.5;
  plane.position.x = 0;
  plane.position.y = -5;
  plane.position.z = -CONSTANTS.planeLength / 2 + CAMERA.fov;
  scene.add(plane);
}

function prepareGame() {
  addLight();
  addPlane();
  // mountain();
  InitDino();
}

function animate() {
  requestAnimationFrame(animate);
  trees.forEach(tree => {
    tree.animate();
  });
  crows.forEach(crow => {
    crow.animate();
  });
  dino.animate();
  renderer.render(scene, camera);
}

function onKeyDown(event) {
  if (event.code == "ArrowLeft") {
    if (dino.speed.x > 0.5) dino.speed.x = 0.8;
    dino.move.x(-0.5);
  }
  if (event.code == "ArrowRight") {
    if (dino.speed.x < -0.5) dino.speed.x = -0.8;
    dino.move.x(0.5);
  }
  if (event.code == "ArrowUp") {
    dino.move.z(-1);
  }
  if (event.code == "ArrowDown") {
    dino.move.z(1);
  }
  if (event.code == "KeyZ") {
    dino.jump();
  }
  if (event.code == "KeyX") {
    dino.duck();
  }
}

function startGame() {
  treeSpawnInterval = window.setInterval(spawnTree, 2000);
  crowSpawnInterval = window.setInterval(spawnCrow, 2000);
}

// Object

// End of Object

function spawnTree() {
  var tree = new Tree();
  scene.add(tree);
  trees.push(tree);
}

function spawnCrow() {
  var crow = new Crow();
  scene.add(crow);
  crows.push(crow);
}

function initGame() {
  createScene();
  prepareGame();
  document.addEventListener("keydown", onKeyDown);
  startGame();
  animate();
}

initGame();
