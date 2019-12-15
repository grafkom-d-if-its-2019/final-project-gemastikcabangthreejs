import {
  BoxGeometry,
  ConeGeometry,
  MeshBasicMaterial,
  SphereGeometry,
  FontLoader,
  MeshStandardMaterial,
  MeshDepthMaterial,
  MeshLambertMaterial,
  GLTF
} from "three";
import path from "path";
var ColladaLoader = require("three-collada-loader");
import GLTFLoader from "three-gltf-loader";

const FONTLOADER = new FontLoader();

const FONT = {};

FONTLOADER.load(
  path.resolve("client/helvetiker_regular.typeface.json"),
  function(font) {
    FONT.helvetiker = font;
  }
);

const CONSTANTS = {
  planeLength: 2000,
  planeWidth: 120,
  dinoWidth: 2,
  crowWidth: 2,
  treeWidth: 2,
  crowLimit: {
    lowerBound: 5,
    upperBound: 25
  },
  bounceAdd: 250,
  gravity: 800,
  velocityMultiplier: 0.9
};
const COLORS = {
  ground: 0xacacac,
  sky: 0x202124
};
const CAMERA = {
  near: 0.1,
  far: 2000,
  fov: 50
};
const SPEED = {
  obstacleZ: 300
};

const MATERIALS = {
  tree: null,
  crow: null,
  dino: null
};

const GEOMETRY = {
  tree: null,
  crow: null,
  dino: null
};

const PROTOTYPE = {
  dino: null,
  crow: null,
  cactus: null,
  mountain: null,
  dino2: null
};

const STATUS = {
  loader: false
};

GEOMETRY.dino = new BoxGeometry(
  CONSTANTS.dinoWidth,
  CONSTANTS.dinoWidth,
  CONSTANTS.dinoWidth
);
MATERIALS.dino = new MeshStandardMaterial({
  color: 0x000000
});
GEOMETRY.tree = new ConeGeometry(CONSTANTS.treeWidth, CONSTANTS.treeWidth, 30);
MATERIALS.tree = new MeshStandardMaterial({
  color: 0x0000ff
});
MATERIALS.cactus = new MeshLambertMaterial({
  color: 0x36993f
});
MATERIALS.mountains = new MeshLambertMaterial();
MATERIALS.mountains.color.setRGB(
  0.403921568627451,
  0.3215686274509804,
  0.20392156862745098
);
GEOMETRY.crow = new SphereGeometry(CONSTANTS.crowWidth, 32, 32);
MATERIALS.crow = new MeshStandardMaterial({
  color: 0x0000ff
});
MATERIALS.basicBlack = new MeshBasicMaterial({
  color: 0x000000
});

var colladaLoader = new ColladaLoader();
var gltfLoader = new GLTFLoader();

colladaLoader.load("/client/mountain.dae", function(collada) {
  PROTOTYPE.mountain = collada.scene;
  PROTOTYPE.mountain.visible = false;
  PROTOTYPE.mountain.position.y += 10;
  var daemesh = PROTOTYPE.mountain.children[0].children[0];
  daemesh.material = MATERIALS.mountains;
  daemesh.castShadow = true;
  daemesh.receiveShadow = true;
});
colladaLoader.load("/client/cactus.dae", function(collada) {
  PROTOTYPE.cactus = collada.scene;
  PROTOTYPE.cactus.visible = false;
  var daemesh = PROTOTYPE.cactus.children[0].children[0];
  daemesh.material = MATERIALS.cactus;
  daemesh.castShadow = true;
  daemesh.receiveShadow = true;
});
gltfLoader.load("/client/dino.glb", function(glb) {
  PROTOTYPE.dino = glb.scene.children[0];
  console.log("TCL: PROTOTYPE.dino", PROTOTYPE.dino);
  PROTOTYPE.dino.material = MATERIALS.dino;
  PROTOTYPE.dino.castShadow = true;
  PROTOTYPE.dino.receiveShadow = true;
});
gltfLoader.load("/client/crow.glb", function(glb) {
  PROTOTYPE.crow = glb.scene.children[0];
  PROTOTYPE.dino.castShadow = true;
  PROTOTYPE.dino.receiveShadow = true;
});
gltfLoader.load("/client/Dino2.glb", function(glb) {
  PROTOTYPE.dino2 = glb.scene.children[0];
  console.log("TCL: PROTOTYPE.dino2", PROTOTYPE.dino2);
  PROTOTYPE.dino2.material = MATERIALS.dino;
  PROTOTYPE.dino2.castShadow = true;
  PROTOTYPE.dino2.receiveShadow = true;
  STATUS.loader = true;
});

export {
  GEOMETRY,
  MATERIALS,
  SPEED,
  CONSTANTS,
  CAMERA,
  COLORS,
  FONT,
  PROTOTYPE,
  STATUS
};
