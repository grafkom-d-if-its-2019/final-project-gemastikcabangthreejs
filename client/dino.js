import { Mesh, TextGeometry, FontLoader } from "three";
import { GEOMETRY, MATERIALS, CONSTANTS, FONT, CAMERA } from "./constants";
import { roundDecimal } from "./utils";

class Dino extends Mesh {
  constructor(playerId, username) {
    console.log("TCL: Dino -> constructor -> playerId", playerId);
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
    this.velocityMultiplier = {
      x: 1,
      y: 1,
      z: 1
    };
    this.move = {
      x: this.moveX,
      z: this.moveZ
    };
    this.playerId = playerId;
    this.username = username;
  }

  roundSpeed = () => {
    this.speed.x = roundDecimal(this.speed.x, 4);
    this.speed.y = roundDecimal(this.speed.y, 4);
    this.speed.z = roundDecimal(this.speed.z, 4);
  };

  moveX = x => {
    this.speed.x = x;
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

  updateX = deltaTime => {
    this.position.x += this.speed.x * deltaTime;
    this.speed.x *= this.velocityMultiplier.x;

    if (this.position.x < -CONSTANTS.planeWidth / 2 + CONSTANTS.dinoWidth / 2) {
      this.position.x = -CONSTANTS.planeWidth / 2 + CONSTANTS.dinoWidth / 2;
      this.speed.x = 0;
    }
    if (this.position.x > CONSTANTS.planeWidth / 2 - CONSTANTS.dinoWidth / 2) {
      this.position.x = CONSTANTS.planeWidth / 2 - CONSTANTS.dinoWidth / 2;
      this.speed.x = 0;
    }
  };

  updateY = deltaTime => {
    this.position.y += this.speed.y;
    this.speed.y -= CONSTANTS.gravity;

    if (this.position.y <= 0) {
      this.status.jumping = false;
    }
    this.position.y = Math.max(0, this.position.y);
    if (this.position.y === 0) this.speed.y = 0;
  };

  updateZ = deltaTime => {
    this.position.z += this.speed.z * deltaTime;
    this.speed.z *= this.velocityMultiplier.z;

    if (this.position.z < -CAMERA.far / 8) {
      this.position.z = -CAMERA.far / 8;
      this.speed.z = 0;
    }
    if (this.position.z > 0) {
      this.position.z = 0;
      this.speed.z = 0;
    }
  };

  animate = deltaTime => {
    this.updateX(deltaTime);
    this.updateY(deltaTime);
    this.updateZ(deltaTime);
  };
}

export default Dino;
