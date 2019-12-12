// external dependency
import * as THREE from "three";
import path from "path";
var ColladaLoader = require('three-collada-loader');

// internal dependency
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
    // objectDimensionX = Math.random() * 0.25 + 0.05;
    // objectDimensionY = Math.random() * 0.25;
    // objectDimensionZ = objectDimensionX;
    // object.scale.set( objectDimensionX, objectDimensionY, objectDimensionZ );
    if ( true ) {
      object.position.x = 0;
      object.position.z = ( i * CONSTANTS.planeLength / 27 ) - ( 1.5 * CONSTANTS.planeLength );
    } else {
      object.position.x = 0;
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
    objectDimensionY = Math.random() * 0.25;
    objectDimensionZ = objectDimensionX;
    object.scale.set( objectDimensionX, objectDimensionY, objectDimensionZ );
    
    if ( isEast === true ) {
      object.position.x = CONSTANTS.planeWidth
      object.position.z = ( i * CONSTANTS.planeLength / 27 ) - ( 1.5 * CONSTANTS.planeLength );
    } else {
      object.position.x = -CONSTANTS.planeWidth
      object.position.z = ( i * CONSTANTS.planeLength / 27 ) - ( CONSTANTS.planeLength / 2 );
    }
    
    object.visible = true;
    
    object.animate = function () {
      
      if ( object.position.z < CONSTANTS.planeLength / 2 - CONSTANTS.planeLength / 10 ) {
        object.position.z += 5;
      } else {
        object.position.z = -CONSTANTS.planeLength / 2;
      }
    }

    object.outside = function () {
      if (object.position.z > CAMERA.fov + CAMERA.near) {
        return true;
      }
      return false;
    }
    
    mountains.push( object );
    scene.add( object );
  }
  console.log('in');
  loader.load(
    './mountain.dae',
    function ( collada ) {
      prototype = collada.scene;
      console.log(prototype);
      prototype.visible = true;
      createObject();
    } );

}

function prepareGame() {
  addLight();
  addPlane();
  for ( var i = 0; i < 60; i += 1 ) {
    var isEast = false;
    if ( i > 29 ) {
      isEast = true;
    }
    addMountain( i, isEast );
  }
  SocketHandler.init(scene);
  SocketHandler.socket.on("currentPlayers", SocketHandler.currentPlayers);
  SocketHandler.socket.on("newPlayer", SocketHandler.newPlayer);
  SocketHandler.socket.on("disconnect", SocketHandler.disconnect);
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
