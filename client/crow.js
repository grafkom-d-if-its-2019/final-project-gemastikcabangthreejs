import { Mesh } from "three";
import { GEOMETRY, MATERIALS, CONSTANTS, SPEED, CAMERA } from "./constants";
import SocketHandler from "./socket";

class Crow extends Mesh {
  constructor() {
    super(GEOMETRY.crow, MATERIALS.crow);
    this.randomPosition();
  }

  animate = deltatime => {
    this.position.z += SPEED.obstacleZ * deltatime;
  };

  outside = () => {
    if (this.position.z > CAMERA.fov + CAMERA.near) {
      return true;
    }
    return false;
  };

  randomPosition = () => {
    this.position.z = -CONSTANTS.planeLength;
    this.position.y = SocketHandler.randomNumber(
      CONSTANTS.crowLimit.lowerBound,
      CONSTANTS.crowLimit.upperBound
    );
    this.position.x = SocketHandler.randomNumber(
      -CONSTANTS.planeWidth / 2,
      CONSTANTS.planeWidth / 2
    );
  };
}

export default Crow;
