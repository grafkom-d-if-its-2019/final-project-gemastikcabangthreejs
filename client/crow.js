import { Mesh } from "three";
import {
  GEOMETRY,
  MATERIALS,
  CONSTANTS,
  SPEED,
  CAMERA,
  PROTOTYPE
} from "./constants";
import SocketHandler from "./socket";

class Crow {
  static create = () => {
    var object = PROTOTYPE.crow.clone();
    console.log("TCL: Crow -> create -> object", object);
    object.animate = this.animate.bind(object);
    object.outside = this.outside.bind(object);
    object.randomPosition = this.randomPosition.bind(object);
    object.randomPosition();
    return object;
  };

  static animate(deltatime) {
    this.position.z += SPEED.obstacleZ * deltatime;
  }

  static outside() {
    if (this.position.z > CAMERA.fov + CAMERA.near) {
      return true;
    }
    return false;
  }

  static randomPosition() {
    this.position.z = -CONSTANTS.planeLength;
    this.position.y = SocketHandler.randomNumber(
      CONSTANTS.crowLimit.lowerBound,
      CONSTANTS.crowLimit.upperBound
    );
    this.position.x = SocketHandler.randomNumber(
      -CONSTANTS.planeWidth / 2,
      CONSTANTS.planeWidth / 2
    );
  }
}

export default Crow;
