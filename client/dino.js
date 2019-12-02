import { Mesh } from "three";
import { GEOMETRY, MATERIALS, CONSTANTS, CAMERA } from "./constants";

function Dino() {
  var dino = new Mesh(GEOMETRY.dino, MATERIALS.dino);

  dino.position.x = 0;
  dino.position.y = 0;
  dino.position.z = 0;

  dino.status = {
    jumping: false
  };

  dino.speed = {
    x: 0,
    y: 0,
    z: 0
  };

  dino.move = {
    x: function(x) {
      dino.speed.x += x;
    },
    z: function(z) {
      dino.speed.z += z;
      if (dino.position.z > 0) dino.position.z = 0;
      if (dino.position.z < -CAMERA.far / 8) dino.position.z = -CAMERA.far / 8;
    }
  };

  dino.animate = function() {
    //x
    dino.position.x += dino.speed.x;
    dino.speed.x *= CONSTANTS.velocityMultiplier;
    if (dino.position.x < -CONSTANTS.planeWidth / 2 + CONSTANTS.dinoWidth / 2) {
      dino.position.x = -CONSTANTS.planeWidth / 2 + CONSTANTS.dinoWidth / 2;
      dino.speed.x = 0;
    }
    if (dino.position.x > CONSTANTS.planeWidth / 2 - CONSTANTS.dinoWidth / 2) {
      dino.position.x = CONSTANTS.planeWidth / 2 - CONSTANTS.dinoWidth / 2;
      dino.speed.x = 0;
    }

    //y
    dino.position.y += dino.speed.y;
    dino.speed.y -= CONSTANTS.gravity;
    if (dino.position.y <= 0) {
      dino.status.jumping = false;
    }
    dino.position.y = Math.max(0, dino.position.y);

    //z
    dino.position.z += dino.speed.z;
    dino.speed.z *= CONSTANTS.velocityMultiplier;
    if (dino.position.z < -CAMERA.far / 8) {
      dino.position.z = -CAMERA.far / 8;
      dino.speed.z = 0;
    }
    if (dino.position.z > 0) {
      dino.position.z = 0;
      dino.speed.z = 0;
    }
  };

  dino.jump = function() {
    if (!dino.status.jumping) {
      dino.speed.y = CONSTANTS.bounceAdd;
      dino.status.jumping = true;
    }
  };

  dino.duck = function() {
    dino.speed.y = -CONSTANTS.bounceAdd;
  };

  return dino;
}

export default Dino;
