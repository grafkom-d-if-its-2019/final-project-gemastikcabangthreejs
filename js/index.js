let controls, renderer, scene, camera;
let meshes, lamps, lights, result, moving, dino;
let plane, tree;
let geometryTree, geometryCrow, geometryDino;
let materialTree, materialCrow, materialDino;

let CONSTANTS = {
  planeLength: 2000,
  planeWidth: 100,
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
let COLORS = {
  ground: 0xacacac,
  sky: 0x202124
};
let CAMERA = {
  near: 0.1,
  far: 2000,
  fov: 50
};
let SPEED = {
  obstacleZ: 5,
  dino: {
    x: 0,
    y: 0,
    z: 0
  }
};
let STATUS = {
  jumping: false
};
let trees = [];
let crows = [];

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
  light = new THREE.HemisphereLight(COLORS.ground, COLORS.ground, 1);
  scene.add(light);
  directionalLight = new THREE.DirectionalLight(0xffffff, 1);
  directionalLight.position.set(0, 20, 0);
  // scene.add(directionalLight);
}

function InitDino() {
  dino = new THREE.Mesh(geometry, material);

  dino.position.x = 0;
  dino.position.y = 0;
  dino.position.z = 0;

  dino.animate = function() {
    //x
    dino.position.x += SPEED.dino.x;
    SPEED.dino.x *= CONSTANTS.velocityMultiplier;
    if (dino.position.x < -CONSTANTS.planeWidth / 2 + CONSTANTS.dinoWidth / 2) {
      dino.position.x = -CONSTANTS.planeWidth / 2 + CONSTANTS.dinoWidth / 2;
      SPEED.dino.x = 0;
    }
    if (dino.position.x > CONSTANTS.planeWidth / 2 - CONSTANTS.dinoWidth / 2) {
      dino.position.x = CONSTANTS.planeWidth / 2 - CONSTANTS.dinoWidth / 2;
      SPEED.dino.x = 0;
    }

    //y
    dino.position.y += SPEED.dino.y;
    SPEED.dino.y -= CONSTANTS.gravity;
    if (dino.position.y <= 0) {
      STATUS.jumping = false;
    }
    dino.position.y = Math.max(0, dino.position.y);
  };

  dino.move = function(x, y, z) {
    SPEED.dino.x += x;
    dino.position.y += y;
    dino.position.z += z;
    if (dino.position.z > 0) dino.position.z = 0;
    if (dino.position.z < -CAMERA.far / 8) dino.position.z = -CAMERA.far / 8;
    // camera.position.x = dino.position.x;
    // camera.position.z = dino.position.z + 150;
  };

  dino.jump = function() {
    if (!STATUS.jumping) {
      SPEED.dino.y = CONSTANTS.bounceAdd;
      STATUS.jumping = true;
    }
  };

  dino.duck = function() {
    SPEED.dino.y = -CONSTANTS.bounceAdd;
  };

  dino.add(camera);
  scene.add(dino);
}

function addPlane() {
  let material = new THREE.MeshPhongMaterial({
    color: COLORS.ground
  });
  let geometry = new THREE.BoxGeometry(
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
  createGeometryMaterial();
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
    if (SPEED.dino.x > 0.5) SPEED.dino.x = 0.8;
    dino.move(-0.5, 0, 0);
  }
  if (event.code == "ArrowRight") {
    if (SPEED.dino.x < -0.5) SPEED.dino.x = -0.8;
    dino.move(0.5, 0, 0);
  }
  if (event.code == "ArrowUp") {
    dino.move(0, 0, -10);
  }
  if (event.code == "ArrowDown") {
    dino.move(0, 0, 10);
  }
  if (event.code == "KeyZ") {
    dino.jump();
  }
  if (event.code == "KeyX") {
    dino.duck();
  }
}

function randomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function startGame() {
  treeSpawnInterval = window.setInterval(spawnTree, 2000);
  crowSpawnInterval = window.setInterval(spawnCrow, 2000);
}

function createGeometryMaterial() {
  geometry = new THREE.BoxGeometry(
    CONSTANTS.dinoWidth,
    CONSTANTS.dinoWidth,
    CONSTANTS.dinoWidth
  );
  material = new THREE.MeshBasicMaterial({
    color: 0x00ff00
  });
  geometryTree = new THREE.ConeGeometry(
    CONSTANTS.treeWidth,
    CONSTANTS.treeWidth,
    30
  );
  materialTree = new THREE.MeshBasicMaterial({
    color: 0x0000ff
  });
  geometryCrow = new THREE.SphereGeometry(CONSTANTS.crowWidth, 32, 32);
  materialCrow = new THREE.MeshBasicMaterial({
    color: 0x0000ff
  });
}

function Tree() {
  let object;
  object = new THREE.Mesh(geometryTree, materialTree);
  object.position.z = -CONSTANTS.planeLength;
  object.position.y = 0;
  object.position.x = randomNumber(
    -CONSTANTS.planeWidth / 2,
    CONSTANTS.planeWidth / 2
  );
  object.animate = function() {
    object.position.z += SPEED.obstacleZ;
  };

  return object;
}

function spawnTree() {
  tree = new Tree();
  scene.add(tree);
  trees.push(tree);
}

function spawnCrow() {
  crow = new Crow();
  scene.add(crow);
  crows.push(crow);
}

function Crow() {
  let object;
  object = new THREE.Mesh(geometryCrow, materialCrow);
  object.position.z = -CONSTANTS.planeLength;
  object.position.y = randomNumber(
    CONSTANTS.crowLimit.lowerBound,
    CONSTANTS.crowLimit.upperBound
  );
  object.position.x = randomNumber(
    -CONSTANTS.planeWidth / 2,
    CONSTANTS.planeWidth / 2
  );
  object.animate = function() {
    object.position.z += SPEED.obstacleZ;
  };
  return object;
}

function initGame() {
  createScene();
  prepareGame();
  document.addEventListener("keydown", onKeyDown);
  startGame();
  animate();
}

initGame();
