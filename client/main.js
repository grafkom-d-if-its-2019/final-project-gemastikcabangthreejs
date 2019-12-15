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
  COLORS,
  STATUS,
  PROTOTYPE
} from "./constants";
import OrbitControls from "three-orbitcontrols";
import Controls from "./controls";
import { isObject } from "util";

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

var loading = 0;

var date;
var dinoHitbox = [];
var cactusHitbox;
var crowHitbox;

function createScene() {
  scene = new THREE.Scene();
  const loader = new THREE.TextureLoader();
  const bgTexture = loader.load("client/sky.jpg");
  scene.background = bgTexture;

  camera = new THREE.PerspectiveCamera(
    CAMERA.fov,
    window.innerWidth / window.innerHeight,
    CAMERA.near,
    CAMERA.far
  );
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
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

  var ambientLight = new THREE.AmbientLight(0x404040);
  scene.add(ambientLight);

  var pointLight = new THREE.SpotLight(0xffffff, 1, 10000, 2);
  pointLight.position.x = 0;
  pointLight.position.y = 250;
  pointLight.position.z = 200;
  pointLight.castShadow = true;
  scene.add(pointLight);

  var pointLightHelper = new THREE.PointLightHelper(pointLight, 10);
  scene.add(pointLightHelper);

  // var directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
  // directionalLight.position.set(-0.5, 1.75, 1);
  // directionalLight.position.multiplyScalar(30);
  // directionalLight.castShadow = true;
  // scene.add(directionalLight);
  // directionalLight.shadow.mapSize.width = 2048;
  // directionalLight.shadow.mapSize.height = 2048;
  // directionalLight.shadow.camera.near = 0.1;
  // directionalLight.shadow.camera.far = 2000;
  // var dirlightHelper = new THREE.DirectionalLightHelper(directionalLight, 10);
  // scene.add(dirlightHelper);
}

function addSky() {
  var skyGeo = new THREE.SphereGeometry(10, 25, 25);
  var loader = new THREE.TextureLoader(),
    texture = loader.load("client/sky.jpg");
  var material = new THREE.MeshPhongMaterial({
    map: texture
  });
  var sky = new THREE.Mesh(skyGeo, material);
  sky.material.side = THREE.BackSide;
  sky.position.x = 0;
  sky.position.y = 0;
  sky.position.z = 0;
  scene.add(sky);
}

function addPlane() {
  var material = new THREE.MeshStandardMaterial({
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
  plane.receiveShadow = true;
  scene.add(plane);
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
    color: 0xe8db74
  });
  planeLeft = new THREE.Mesh(planeLeftGeometry, planeLeftMaterial);
  planeLeft.receiveShadow = true;
  planeLeft.rotation.x = 1.57;
  planeLeft.position.x = -2 * CONSTANTS.planeWidth;
  planeLeft.position.y = -4;
  planeLeft.position.z = -CONSTANTS.planeLength / 2 + CAMERA.fov;

  planeRight = planeLeft.clone();
  planeRight.position.x = 2 * CONSTANTS.planeWidth;
  planeRight.position.z = -CONSTANTS.planeLength / 2 + CAMERA.fov;

  scene.add(planeLeft, planeRight);
}

function createCactus(i) {
  var object = {},
    objectDimensionX = {},
    objectDimensionY = {},
    objectDimensionZ = {};

  object = PROTOTYPE.cactus.clone();
  objectDimensionX = 5;
  objectDimensionY = 5;
  objectDimensionZ = 5;
  object.scale.set(objectDimensionX, objectDimensionY, objectDimensionZ);
  object.rotateY(Math.PI / 2);
  object.rotateX(-Math.PI / 2);

  object.visible = true;

  object.randomPosition = function() {
    object.position.x = SocketHandler.randomNumber(
      -CONSTANTS.planeWidth / 2,
      CONSTANTS.planeWidth / 2
    );
    object.position.y = -5;
    object.position.z =
      (i * CONSTANTS.planeLength) / 27 - 1.5 * CONSTANTS.planeLength;
  };

  object.outside = function() {
    if (object.position.z < CAMERA.fov + CAMERA.near) {
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
  //   PROTOTYPE.visible = false;
  //   createObject();
  // })
}

function createMountain(i, isEast, layer) {
  var object = {},
    objectDimensionX = {},
    objectDimensionY = {},
    objectDimensionZ = {};

  object = PROTOTYPE.mountain.clone();

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

  object.randomDimension = function() {
    objectDimensionX = randomNumber(0, 1) * 0.25 + 0.05;
    objectDimensionY = randomNumber(0.4, 1) * 0.75;
    objectDimensionZ = objectDimensionX;
    object.scale.set(objectDimensionX, objectDimensionY, objectDimensionZ);
  };

  object.animate = function(deltaTime) {
    if (object.position.z < CAMERA.fov + CAMERA.near) {
      object.position.z += 300 * deltaTime;
    } else {
      object.position.z = -CONSTANTS.planeLength / 2;
      object.randomDimension();
    }
  };
  object.randomDimension();
  mountains.push(object);
  scene.add(object);
}

function detectCollision() {
  dinoHitbox[0].setFromObject(SocketHandler.mainPlayer.dino);
  var idx = 1;
  Object.keys(SocketHandler.otherPlayers).forEach(id => {
    dinoHitbox[idx].setFromObject(SocketHandler.otherPlayers[id].dino);
    idx++;
  });
  for (var j = 0; j < cactus.length; j++) {
    cactusHitbox.setFromObject(cactus[j]);
    if (cactusHitbox.intersectsBox(dinoHitbox[0])) {
      alert("cactus collide with player");
    }
  }
  for (var j = 0; j < crows.length; j++) {
    crowHitbox.setFromObject(crows[j]);
    if (crowHitbox.intersectsBox(dinoHitbox[0])) {
      alert("crow collide with player");
    }
  }
  for (var j = 1; j < dinoHitbox.length; j++) {
    if (dinoHitbox[j].intersectsBox(dinoHitbox[0])) {
      alert("dino " + (j + 1) + " collide with player ");
    }
  }
  // console.log(cactusBoxHelper[0]);
  // console.log(cactusHitbox[0]['max']);
  // console.log(cactusHitbox[0]['min']);
  // console.log(cactusBoxHelper.length);
}

function addMountains() {
  for (var layer = 1; layer < 4; layer += 1) {
    for (var i = 0; i < 60; i += 1) {
      var isEast = false;
      if (i > 29) {
        isEast = true;
      }
      createMountain(i, isEast, layer);
    }
  }
}

function prepareGame() {
  console.log("TCL: prepareGame -> prepareGame");
  // addSky();
  addLight();
  addPlane();
  createLandscapeFloors();
  var canvas = document.getElementsByTagName("canvas")[0];
  // skyGeometry = new THREE.BoxGeometry(
  //   canvas.width + canvas.width / 5,
  //   canvas.height,
  //   1,
  //   1
  // );
  // skyMaterial = new THREE.MeshBasicMaterial({
  //   map: new THREE.TextureLoader().load(
  //     "https://s3-us-west-2.amazonaws.com/s.cdpn.io/26757/background.jpg"
  //   ),
  //   depthWrite: false,
  //   side: THREE.BackSide
  // });
  // sky = new THREE.Mesh(skyGeometry, skyMaterial);
  // sky.position.y = 300;
  // sky.position.z = -CONSTANTS.planeLength / 2 + (CONSTANTS.planeWidth * 5) / 2;
  // scene.add(sky);

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
  detectCollision();
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
  for (var i = 0; i < Math.floor(2 + elapsed / 100); i++) {
    var crow;
    if (unusedCrows.length !== 0) {
      crow = unusedCrows.shift();
      crow.randomPosition();
    } else {
      crow = new Crow.create();
    }
    scene.add(crow);
    crows.push(crow);
  }
  setTimeout(spawnCrow, Math.max(300, 2000 - elapsed));
  console.log("TCL: spawnCrow -> elapsed", elapsed);
  // window.setInterval(spawnCrow, Math.max(300, 2000 - elapsed));
}

function spawnCactus() {
  // window.clearInterval(cactusSpawnInterval);
  for (var i = 0; i < Math.floor(3 + elapsed / 100); i++) {
    if (unusedCactus.length !== 0) {
      var tree = unusedCactus.shift();
      tree.randomPosition();
      cactus.push(tree);
      scene.add(tree);
    } else {
      createCactus(i);
    }
  }
  setTimeout(spawnCactus, Math.max(300, 2000 - elapsed));
  // window.setInterval(spawnCrow, Math.max(300, 2000 - elapsed));
}

function initGame() {
  createScene();
  var checkLoading = window.setInterval(() => {
    if (STATUS.loader == true) {
      prepareGame();
      clearInterval(checkLoading);
    }
  }, 1000);
  document.addEventListener("keydown", onKeyDown);
  document.addEventListener("keyup", onKeyUp);
  var checkServer = window.setInterval(() => {
    if (SocketHandler.checkGameReady()) {
      addMountains();
      dinoHitbox.push(
        new THREE.Box3().setFromObject(SocketHandler.mainPlayer.dino)
      );
      Object.keys(SocketHandler.otherPlayers).forEach(id => {
        dinoHitbox.push(new THREE.Box3());
      });
      cactusHitbox = new THREE.Box3();
      crowHitbox = new THREE.Box3();
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
