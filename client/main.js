// external dependency
import * as THREE from "three";
import path from "path";
var ColladaLoader = require("three-collada-loader");
var STLLoader = require("three-stl-loader")(THREE);

// internal dependency
import { randomNumber } from "./utils";
import SocketHandler from "./socket";
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
import OrbitControls from "three-orbitcontrols";
import Controls from "./controls";

var controls, renderer, scene, camera;
var plane, dino, socket;
var elapsed = 0;
var otherPlayers = {};
var unusedCactus = [];
var unusedCrows = [];
var crows = [];
var mountains = [];
var cactus = [];
var sky = {};
var skyGeometry = {};
var skyMaterial = {};
var skyTexture = {};
var directionalLight = {};
var hemisphereLight = {};
var loader;
var prototype = {
  cactus: null,
  mountain: null
};
var loading = 0;

var date;

function createScene() {
  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(
    CAMERA.fov,
    window.innerWidth / window.innerHeight,
    CAMERA.near,
    CAMERA.far
  );
  renderer = new THREE.WebGLRenderer({ antialias: true });
  // controls = new OrbitControls(camera, renderer.domElement);

  renderer.setSize(window.innerWidth - 20, window.innerHeight - 10);
  renderer.setClearColor(new THREE.Color(COLORS.sky));
  renderer.shadowMap.enabled = true;
  document.body.appendChild(renderer.domElement);

  camera.position.x = 0;
  camera.position.y = 30;
  camera.position.z = 100;
}

function addLight() {
  var light = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.5);
  scene.add(light);
  var directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
  directionalLight.position.set(0, 1, 0);
  scene.add(directionalLight);
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

function initLoader() {
  loader = new ColladaLoader();
  loader.load("/client/mountain.dae", function(collada) {
    prototype.mountain = collada.scene;
    prototype.mountain.visible = false;
    loading += 1;
  });
  loader.load("/client/cactus.dae", function(collada) {
    prototype.cactus = collada.scene;
    prototype.cactus.visible = false;
    console.log("TCL: initLoader -> prototype", prototype);
    console.log("TCL: initLoader -> loading", loading);
    loading += 1;
  });
}

function createLandscapeFloors() {
  var planeLeft = {},
    planeLeftGeometry = {},
    planeLeftMaterial = {},
    planeRight = {};

  planeLeftGeometry = new THREE.BoxGeometry(
    CONSTANTS.planeWidth * 3,
    CONSTANTS.planeLength + CONSTANTS.planeLength / 10,
    1
  );
  planeLeftMaterial = new THREE.MeshLambertMaterial({
    color: 0x8bc34a
  });
  planeLeft = new THREE.Mesh(planeLeftGeometry, planeLeftMaterial);
  planeLeft.receiveShadow = true;
  planeLeft.rotation.x = 1.57;
  planeLeft.position.x = -2 * CONSTANTS.planeWidth;
  planeLeft.position.y = -4;

  planeRight = planeLeft.clone();
  planeRight.position.x = 2 * CONSTANTS.planeWidth;

  scene.add(planeLeft, planeRight);
}

function createCactus(i) {
  var object = {},
    objectDimensionX = {},
    objectDimensionY = {},
    objectDimensionZ = {};

  object = prototype.cactus.clone();
  objectDimensionX = 5;
  objectDimensionY = 5;
  objectDimensionZ = 5;
  object.scale.set(objectDimensionX, objectDimensionY, objectDimensionZ);
  object.rotateY(Math.PI / 2);
  object.rotateX(-Math.PI / 2);

  object.visible = true;

  object.randomPosition = function() {
    object.position.x = randomNumber(
      -CONSTANTS.planeWidth / 2,
      CONSTANTS.planeWidth / 2
    );
    object.position.y = -5;
    object.position.z =
      (i * CONSTANTS.planeLength) / 27 - 1.5 * CONSTANTS.planeLength;
  };

  object.outside = function() {
    if (
      object.position.z <
      CONSTANTS.planeLength / 2 - CONSTANTS.planeLength / 10
    ) {
      return false;
    }
    return true;
  };

  object.animate = function(deltaTime) {
    if (
      object.position.z <
      CONSTANTS.planeLength / 2 - CONSTANTS.planeLength / 10
    ) {
      object.position.z += SPEED.obstacleZ * deltaTime;
    } else {
      object.position.z = -CONSTANTS.planeLength / 2;
    }
  };
  object.randomPosition();
  cactus.push(object);
  scene.add(object);

  // loader.load('/client/cactus.stl', function (geometry) {
  //   var material = new THREE.MeshNormalMaterial()
  //   var mesh = new THREE.Mesh(geometry, material)
  //   prototype = mesh;
  //   prototype.visible = false;
  //   createObject();
  // })
}

function createMountain(i, isEast, layer) {
  var object = {},
    objectDimensionX = {},
    objectDimensionY = {},
    objectDimensionZ = {};

  object = prototype.mountain.clone();
  objectDimensionX = Math.random() * 0.25 + 0.05;
  objectDimensionY = Math.random() * 0.75;
  objectDimensionZ = objectDimensionX;
  object.scale.set(objectDimensionX, objectDimensionY, objectDimensionZ);

  if (isEast === true) {
    object.position.x = CONSTANTS.planeWidth * layer;
    object.position.z =
      (i * CONSTANTS.planeLength) / 27 - 1.5 * CONSTANTS.planeLength;
  } else {
    object.position.x = -CONSTANTS.planeWidth * layer;
    object.position.z =
      (i * CONSTANTS.planeLength) / 27 - CONSTANTS.planeLength / 2;
  }
  object.position.y = -5;

  object.visible = true;

  object.animate = function(deltaTime) {
    if (
      object.position.z <
      CONSTANTS.planeLength / 2 - CONSTANTS.planeLength / 10
    ) {
      object.position.z += 300 * deltaTime;
    } else {
      object.position.z = -CONSTANTS.planeLength / 2;
    }
  };

  mountains.push(object);
  scene.add(object);
}

function prepareGame() {
  console.log("TCL: prepareGame -> prepareGame");
  addLight();
  addPlane();
  createLandscapeFloors();
  for (var layer = 1; layer < 4; layer += 1) {
    for (var i = 0; i < 60; i += 1) {
      var isEast = false;
      if (i > 29) {
        isEast = true;
      }
      createMountain(i, isEast, layer);
    }
  }
  var canvas = document.getElementsByTagName("canvas")[0];
  skyGeometry = new THREE.BoxGeometry(
    canvas.width + canvas.width / 5,
    canvas.height,
    1,
    1
  );
  skyMaterial = new THREE.MeshBasicMaterial({
    map: new THREE.TextureLoader().load(
      "https://s3-us-west-2.amazonaws.com/s.cdpn.io/26757/background.jpg"
    ),
    depthWrite: false,
    side: THREE.BackSide
  });
  sky = new THREE.Mesh(skyGeometry, skyMaterial);
  sky.position.y = 300;
  sky.position.z = -CONSTANTS.planeLength / 2 + (CONSTANTS.planeWidth * 5) / 2;
  scene.add(sky);
  directionalLight = new THREE.DirectionalLight(0xffffff, 1);
  directionalLight.position.set(0, 40, 0);
  hemisphereLight = new THREE.HemisphereLight(0xffb74d, 0x37474f, 1);
  hemisphereLight.position.y = 500;
  scene.add(hemisphereLight, directionalLight);

  SocketHandler.init(scene, camera);
}

function animate() {
  date.new = Date.now();
  var deltaTime = (date.new - date.old) / 1000;
  var removeCrows = [];
  var removeCactus = [];
  crows.forEach((crow, idx) => {
    crow.animate(deltaTime);
    if (crow.outside()) {
      unusedCrows.push(crow);
      removeCrows.push(idx);
      scene.remove(crow);
    }
  });
  cactus.forEach((tree, idx) => {
    tree.animate(deltaTime);
    if (tree.outside()) {
      unusedCactus.push(tree);
      removeCactus.push(idx);
      scene.remove(tree);
    }
  });
  mountains.forEach(mountain => {
    mountain.animate(deltaTime);
  });
  crows = crows.filter((crow, idx) => {
    if (removeCrows.indexOf(idx) === -1) {
      return true;
    }
    return false;
  });
  cactus = cactus.filter((tree, idx) => {
    if (removeCactus.indexOf(idx) === -1) {
      return true;
    }
    return false;
  });
  SocketHandler.mainPlayer.dino.animate(deltaTime);
  Object.keys(SocketHandler.otherPlayers).forEach(id => {
    SocketHandler.otherPlayers[id].dino.animate(deltaTime);
  });
  renderer.render(scene, camera);
  date.old = date.new;
  elapsed += deltaTime;
  requestAnimationFrame(animate);
}

function onKeyUp(event) {
  console.log("TCL: onKeyUp -> event", event);
  var dino = SocketHandler.mainPlayer.dino;
  Controls.dino.keyUp(event.code)(dino);
  var action = {
    type: "keyUp",
    key: event.code,
    player: SocketHandler.mainPlayer
  };
  SocketHandler.playerMovement(action);
}

function onKeyDown(event) {
  var dino = SocketHandler.mainPlayer.dino;
  if (!SocketHandler.gamepadeConnected) {
    Controls.dino.keyDown(event.code)(dino);
    var action = {
      type: "keyDown",
      key: event.code,
      player: SocketHandler.mainPlayer
    };
    SocketHandler.playerMovement(action);
  }
}

function startGame() {
  // crowSpawnInterval = window.setInterval(spawnCrow, 2000);
  // cactusSpawnInterval = window.setInterval(spawnCactus, 2000);
  spawnCrow();
  spawnCactus();
}

function spawnCrow() {
  // window.clearInterval(crowSpawnInterval);
  var crow;
  if (unusedCrows.length !== 0) {
    crow = unusedCrows.shift();
    crow.randomPosition();
  } else {
    crow = new Crow();
  }
  scene.add(crow);
  crows.push(crow);
  setTimeout(spawnCrow, Math.max(300, 2000 - elapsed));
  console.log("TCL: spawnCrow -> elapsed", elapsed);
  // window.setInterval(spawnCrow, Math.max(300, 2000 - elapsed));
}

function spawnCactus() {
  // window.clearInterval(cactusSpawnInterval);
  for (var i = 0; i < 3; i++) {
    if (unusedCactus.length !== 0) {
      var tree = unusedCactus.shift();
      tree.randomPosition();
      cactus.push(tree);
      scene.add(tree);
    } else {
      console.log("TCL: spawnCactus -> i", i);
      createCactus(i);
    }
  }
  setTimeout(spawnCactus, Math.max(300, 2000 - elapsed));
  // window.setInterval(spawnCrow, Math.max(300, 2000 - elapsed));
}

function initGame() {
  createScene();
  initLoader();
  var checkLoading = window.setInterval(() => {
    console.log("TCL: initGame -> loading", loading);
    if (loading == 2) {
      prepareGame();
      clearInterval(checkLoading);
    }
  }, 1000);
  document.addEventListener("keydown", onKeyDown);
  document.addEventListener("keyup", onKeyUp);
  var checkServer = window.setInterval(() => {
    if (SocketHandler.checkGameReady()) {
      startGame();
      date = {
        old: Date.now(),
        new: Date.now()
      };
      requestAnimationFrame(animate);
      clearInterval(checkServer);
    }
  }, 1000);
}

initGame();
