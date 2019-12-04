import { Mesh } from "three";
import { GEOMETRY, MATERIALS, CONSTANTS, CAMERA } from "./constants";
import { roundDecimal } from "./utils";

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
      x: this.moveX,
      z: this.moveZ
    };
  }

  roundSpeed = () => {
    this.speed.x = roundDecimal(this.speed.x, 4);
    this.speed.y = roundDecimal(this.speed.y, 4);
    this.speed.z = roundDecimal(this.speed.z, 4);
  };

  moveX = x => {
    this.speed.x += x;
    this.roundSpeed();
  };
  moveZ = z => {
    this.speed.z += z;
    if (this.position.z > 0) this.position.z = 0;
    if (this.position.z < -CAMERA.far / 8) this.position.z = -CAMERA.far / 8;
    this.roundSpeed();
  };
  jump = () => {
    if (!this.status.jumping) {
      this.speed.y = CONSTANTS.bounceAdd;
      this.status.jumping = true;
    }
    this.roundSpeed();
  };
  duck = () => {
    this.speed.y = -CONSTANTS.bounceAdd;
    this.roundSpeed();
  };
  animate = () => {
    this.position.x += this.speed.x;
    this.speed.x *= CONSTANTS.velocityMultiplier;
    this.roundSpeed();
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
    this.roundSpeed();
    if (this.position.y <= 0) {
      this.status.jumping = false;
    }
    this.position.y = Math.max(0, this.position.y);
    if (this.position.y === 0) this.speed.y = 0;

    //z
    this.position.z += this.speed.z;
    this.speed.z *= CONSTANTS.velocityMultiplier;
    this.roundSpeed();
    if (this.position.z < -CAMERA.far / 8) {
      this.position.z = -CAMERA.far / 8;
      this.speed.z = 0;
    }
    if (this.position.z > 0) {
      this.position.z = 0;
      this.speed.z = 0;
    }
  };
}

export default Dino;
