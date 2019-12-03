import { Mesh } from "three";
import { GEOMETRY, MATERIALS, CONSTANTS, CAMERA } from "./constants";

class Dino extends Mesh {
  constructor() {
    super(GEOMETRY.dino, MATERIALS.dino);
    this.position.x = 0;
    this.position.y = 0;
    this.position.z = 0;
    this.status = {
      jumping: false
    };
    this.speed = {
      x: 0,
      y: 0,
      z: 0
    };
    this.move = {
      x: this.moveX.bind(this),
      z: this.moveZ.bind(this)
    };
  }

  moveX(x) {
    this.speed.x += x;
  }
  moveZ(z) {
    this.speed.z += z;
    if (this.position.z > 0) this.position.z = 0;
    if (this.position.z < -CAMERA.far / 8) this.position.z = -CAMERA.far / 8;
  }
  jump() {
    if (!this.status.jumping) {
      this.speed.y = CONSTANTS.bounceAdd;
      this.status.jumping = true;
    }
  }
  duck() {
    this.speed.y = -CONSTANTS.bounceAdd;
  }
  animate() {
    this.position.x += this.speed.x;
    this.speed.x *= CONSTANTS.velocityMultiplier;
    if (this.position.x < -CONSTANTS.planeWidth / 2 + CONSTANTS.dinoWidth / 2) {
      this.position.x = -CONSTANTS.planeWidth / 2 + CONSTANTS.dinoWidth / 2;
      this.speed.x = 0;
    }
    if (this.position.x > CONSTANTS.planeWidth / 2 - CONSTANTS.dinoWidth / 2) {
      this.position.x = CONSTANTS.planeWidth / 2 - CONSTANTS.dinoWidth / 2;
      this.speed.x = 0;
    }

    //y
    this.position.y += this.speed.y;
    this.speed.y -= CONSTANTS.gravity;
    if (this.position.y <= 0) {
      this.status.jumping = false;
    }
    this.position.y = Math.max(0, this.position.y);

    //z
    this.position.z += this.speed.z;
    this.speed.z *= CONSTANTS.velocityMultiplier;
    if (this.position.z < -CAMERA.far / 8) {
      this.position.z = -CAMERA.far / 8;
      this.speed.z = 0;
    }
    if (this.position.z > 0) {
      this.position.z = 0;
      this.speed.z = 0;
    }
  }
}

export default Dino;
