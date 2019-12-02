var controls, renderer, scene, camera;
var plane, dino;
var treeSpawnInterval, crowSpawnInterval;

var GEOMETRY = {
  tree: null,
  crow: null,
  dino: null
};

var MATERIAL = {
  tree: null,
  crow: null,
  dino: null
};

var CONSTANTS = {
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
var COLORS = {
  ground: 0xacacac,
  sky: 0x202124
};
var CAMERA = {
  near: 0.1,
  far: 2000,
  fov: 50
};
var SPEED = {
  obstacleZ: 5,
  dino: {
    x: 0,
    y: 0,
    z: 0
  }
};
var STATUS = {
  jumping: false
};
var trees = [];
var crows = [];

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
    dino.move.x(-0.5);
  }
  if (event.code == "ArrowRight") {
    if (SPEED.dino.x < -0.5) SPEED.dino.x = -0.8;
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

function randomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function startGame() {
  treeSpawnInterval = window.setInterval(spawnTree, 2000);
  crowSpawnInterval = window.setInterval(spawnCrow, 2000);
}

function createGeometryMaterial() {
  GEOMETRY.dino = new THREE.BoxGeometry(
    CONSTANTS.dinoWidth,
    CONSTANTS.dinoWidth,
    CONSTANTS.dinoWidth
  );
  MATERIAL.dino = new THREE.MeshBasicMaterial({
    color: 0x00ff00
  });
  GEOMETRY.tree = new THREE.ConeGeometry(
    CONSTANTS.treeWidth,
    CONSTANTS.treeWidth,
    30
  );
  MATERIAL.tree = new THREE.MeshBasicMaterial({
    color: 0x0000ff
  });
  GEOMETRY.crow = new THREE.SphereGeometry(CONSTANTS.crowWidth, 32, 32);
  MATERIAL.crow = new THREE.MeshBasicMaterial({
    color: 0x0000ff
  });
}

// Object

function Dino() {
  dino = new THREE.Mesh(GEOMETRY.dino, MATERIAL.dino);

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

    //z
    dino.position.z += SPEED.dino.z;
    SPEED.dino.z *= CONSTANTS.velocityMultiplier;
    if (dino.position.z < -CAMERA.far / 8) {
      dino.position.z = -CAMERA.far / 8;
      SPEED.dino.z = 0;
    }
    if (dino.position.z > 0) {
      dino.position.z = 0;
      SPEED.dino.z = 0;
    }
  };

  dino.move = {
    x: function(x) {
      SPEED.dino.x += x;
    },
    z: function(z) {
      SPEED.dino.z += z;
      if (dino.position.z > 0) dino.position.z = 0;
      if (dino.position.z < -CAMERA.far / 8) dino.position.z = -CAMERA.far / 8;
    }
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

  return dino;
}

function Tree() {
  var object;
  object = new THREE.Mesh(GEOMETRY.tree, MATERIAL.tree);
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

function Crow() {
  var object;
  object = new THREE.Mesh(GEOMETRY.crow, MATERIAL.crow);
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

// End of Object

function spawnTree() {
  tree = new Tree();
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
