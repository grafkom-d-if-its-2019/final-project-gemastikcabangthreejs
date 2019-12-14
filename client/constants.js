import {
  BoxGeometry,
  ConeGeometry,
  MeshBasicMaterial,
  SphereGeometry,
  FontLoader
} from "three";
import path from "path";

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
    upperBound: 20
  },
  bounceAdd: 6,
  gravity: 0.5,
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

GEOMETRY.dino = new BoxGeometry(
  CONSTANTS.dinoWidth,
  CONSTANTS.dinoWidth,
  CONSTANTS.dinoWidth
);
MATERIALS.dino = new MeshBasicMaterial({
  color: 0xffff00
});
GEOMETRY.tree = new ConeGeometry(CONSTANTS.treeWidth, CONSTANTS.treeWidth, 30);
MATERIALS.tree = new MeshBasicMaterial({
  color: 0x0000ff
});
GEOMETRY.crow = new SphereGeometry(CONSTANTS.crowWidth, 32, 32);
MATERIALS.crow = new MeshBasicMaterial({
  color: 0x0000ff
});
MATERIALS.basicBlack = new MeshBasicMaterial({
  color: 0x000000
});

export { GEOMETRY, MATERIALS, SPEED, CONSTANTS, CAMERA, COLORS, FONT };
