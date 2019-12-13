// external dependency
import * as THREE from "three";
import path from "path";
var ColladaLoader = require('three-collada-loader');
var STLLoader = require('three-stl-loader')(THREE);

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

var controls, renderer, scene, camera;
var plane, dino, socket;
var treeSpawnInterval, crowSpawnInterval;
var mainPlayer = null;
var otherPlayers = {};
var unusedTrees = [];
var unusedCrows = [];
var trees = [];
var crows = [];
var mountains = [];
var cactus = [];
var sky = {};
var skyGeometry = {};
var skyMaterial = {};
var skyTexture = {};
var directionalLight = {};
var hemisphereLight = {};

function createScene() {
  scene = new THREE.Scene();

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
  var light = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.5);
  scene.add(light);
  var directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
  directionalLight.position.set(0, 1, 0);
  scene.add(directionalLight);
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

function createLandscapeFloors () {
  var planeLeft = {},
      planeLeftGeometry = {},
      planeLeftMaterial = {},
      planeRight = {};
  
  planeLeftGeometry = new THREE.BoxGeometry( CONSTANTS.planeWidth * 3, CONSTANTS.planeLength + CONSTANTS.planeLength / 10, 1 );
  planeLeftMaterial = new THREE.MeshLambertMaterial( {
    color: 0x8BC34A
  } );
  planeLeft = new THREE.Mesh( planeLeftGeometry, planeLeftMaterial );
  planeLeft.receiveShadow = true;
	planeLeft.rotation.x = 1.570;
  planeLeft.position.x = -2 * CONSTANTS.planeWidth;
  planeLeft.position.y = -4;
  
  planeRight = planeLeft.clone();
  planeRight.position.x = 2 * CONSTANTS.planeWidth;
  
  scene.add( planeLeft, planeRight );
}

function createCactus(i) {
  var loader = {},
      prototype = {},
      object = {},
      objectDimensionX = {},
      objectDimensionY = {},
      objectDimensionZ = {};
  
  loader = new ColladaLoader();
  
  
  function createObject () {
    object = prototype.clone();
    objectDimensionX = 5;
    objectDimensionY = 5;
    objectDimensionZ = 5;
    object.scale.set( objectDimensionX, objectDimensionY, objectDimensionZ );
    object.rotateY(Math.PI / 2);
    object.rotateX(-Math.PI / 2);
    object.position.x = randomNumber(-CONSTANTS.planeWidth / 2, CONSTANTS.planeWidth / 2);
    console.log(object.position.x);
    object.position.z = ( i * CONSTANTS.planeLength / 27 ) - ( 1.5 * CONSTANTS.planeLength );
    object.position.y = -5;
    
    object.visible = true;
    
    object.animate = function () {
      
      if ( object.position.z < CONSTANTS.planeLength / 2 - CONSTANTS.planeLength / 10 ) {
        object.position.z += 5;
      } else {
        object.position.z = -CONSTANTS.planeLength / 2;
      }
      
    }
    
    cactus.push( object );
    scene.add( object );
  }
  loader.load(
    '/client/cactus.dae',
    function ( collada ) {
      prototype = collada.scene;
      prototype.visible = false;
      createObject();
    } );
  // loader.load('/client/cactus.stl', function (geometry) {
  //   var material = new THREE.MeshNormalMaterial()
  //   var mesh = new THREE.Mesh(geometry, material)
  //   prototype = mesh;
  //   prototype.visible = false;
  //   createObject();
  // })
}

function createMountain ( i, isEast, layer) {
  var loader = {},
      prototype = {},
      object = {},
      objectDimensionX = {},
      objectDimensionY = {},
      objectDimensionZ = {};
  
  loader = new ColladaLoader();
  
  function createObject () {
    object = prototype.clone();
    objectDimensionX = Math.random() * 0.25 + 0.05;
    objectDimensionY = Math.random() * 0.75;
    objectDimensionZ = objectDimensionX;
    object.scale.set( objectDimensionX, objectDimensionY, objectDimensionZ );
    
    if ( isEast === true ) {
      object.position.x = CONSTANTS.planeWidth * layer;
      object.position.z = ( i * CONSTANTS.planeLength / 27 ) - ( 1.5 * CONSTANTS.planeLength );
    } else {
      object.position.x = -CONSTANTS.planeWidth * layer;
      object.position.z = ( i * CONSTANTS.planeLength / 27 ) - ( CONSTANTS.planeLength / 2 );
    }
    object.position.y = -5;
    
    object.visible = true;
    
    object.animate = function () {
      
      if ( object.position.z < CONSTANTS.planeLength / 2 - CONSTANTS.planeLength / 10 ) {
        object.position.z += 5;
      } else {
        object.position.z = -CONSTANTS.planeLength / 2;
      }
    }
    
    mountains.push( object );
    scene.add( object );
  }
  
  loader.load(
    '/client/mountain.dae',
    function ( collada ) {
      prototype = collada.scene;
      prototype.visible = false;
      createObject();
    } );
  
}

function prepareGame() {
  addLight();
  addPlane();
  createLandscapeFloors();
  for (var layer = 1; layer < 4; layer += 1) {
    for ( var i = 0; i < 60; i += 1 ) {
      var isEast = false;
      if ( i > 29 ) {
        isEast = true;
      }
      createMountain( i, isEast, layer);
    }
  }
  for (var i = 0; i < 5; i++) {
    createCactus(i);
  }
  var canvas = document.getElementsByTagName('canvas')[0];
  skyGeometry = new THREE.BoxGeometry( canvas.width +  canvas.width  / 5, canvas.height, 1, 1 );
  skyMaterial = new THREE.MeshBasicMaterial( {
    map: new THREE.TextureLoader().load( 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/26757/background.jpg' ),
    depthWrite: false,
    side: THREE.BackSide
  } );
  sky = new THREE.Mesh( skyGeometry, skyMaterial );
  sky.position.y = 300;
  sky.position.z = -CONSTANTS.planeLength / 2 + CONSTANTS.planeWidth * 5 / 2;
  scene.add(sky);
  directionalLight = new THREE.DirectionalLight( 0xffffff, 1 );
  directionalLight.position.set( 0, 40, 0 );
  hemisphereLight = new THREE.HemisphereLight( 0xFFB74D, 0x37474F, 1 );
  hemisphereLight.position.y = 500;
  scene.add(hemisphereLight, directionalLight);

  SocketHandler.init(scene, camera);
}

function animate() {
  requestAnimationFrame(animate);
  var removeTrees = [];
  var removeCrows = [];
  trees.forEach((tree, idx) => {
    tree.animate();
    if (tree.outside()) {
      unusedTrees.push(tree);
      removeTrees.push(idx);
      scene.remove(tree);
    }
  });
  crows.forEach((crow, idx) => {
    crow.animate();
    if (crow.outside()) {
      unusedCrows.push(crow);
      removeCrows.push(idx);
      scene.remove(crow);
    }
  });
  mountains.forEach((mountain) => {
    mountain.animate();
  });
  cactus.forEach((tree) => {
    tree.animate();
  });

  trees = trees.filter((tree, idx) => {
    if (removeTrees.indexOf(idx) === -1) {
      return true;
    }
    return false;
  });

  crows = crows.filter((crow, idx) => {
    if (removeCrows.indexOf(idx) === -1) {
      return true;
    }
    return false;
  });
  SocketHandler.mainPlayer.dino.animate();
  Object.keys(SocketHandler.otherPlayers).forEach(id => {
    SocketHandler.otherPlayers[id].dino.animate();
  });
  renderer.render(scene, camera);
}

function onKeyDown(event) {
  var dino = SocketHandler.mainPlayer.dino;
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
  if (event.code == "Tab") {
    dino.remove(camera);
    Object.keys(SocketHandler.otherPlayers).forEach(id => {
      camera.position.x = SocketHandler.otherPlayers[id].dino.position.x;
      camera.position.y = SocketHandler.otherPlayers[id].dino.position.y + 30;
      camera.position.z = SocketHandler.otherPlayers[id].dino.position.z + 100;
    });
  }
  SocketHandler.playerMovement(dino);
}

function startGame() {
  treeSpawnInterval = window.setInterval(spawnTree, 2000);
  crowSpawnInterval = window.setInterval(spawnCrow, 2000);
}

function spawnTree() {
  var tree;
  if (unusedTrees.length !== 0) {
    tree = unusedTrees.shift();
    tree.randomPosition();
  } else {
    tree = new Tree();
  }
  scene.add(tree);
  trees.push(tree);
}

function spawnCrow() {
  var crow;
  if (unusedCrows.length !== 0) {
    crow = unusedCrows.shift();
    crow.randomPosition();
  } else {
    crow = new Crow();
  }
  scene.add(crow);
  crows.push(crow);
}

function initGame() {
  createScene();
  prepareGame();
  document.addEventListener("keydown", onKeyDown);
  var checkServer = window.setInterval(() => {
    console.log(
      "TCL: initGame -> SocketHandler.checkGameReady()",
      SocketHandler.checkGameReady()
    );
    if (SocketHandler.checkGameReady()) {
      startGame();
      animate();
      clearInterval(checkServer);
    }
  }, 1000);
}

initGame();
