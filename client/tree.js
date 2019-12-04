import { Mesh } from "three";
import { GEOMETRY, MATERIALS, CONSTANTS, SPEED, CAMERA } from "./constants";
import { randomNumber } from "./utils";
import SocketHandler from "./socket";

class Tree extends Mesh {
  constructor() {
    super(GEOMETRY.tree, MATERIALS.tree);
    this.randomPosition();
  }

  animate = () => {
    this.position.z += SPEED.obstacleZ;
  };

  outside = () => {
    if (this.position.z > CAMERA.fov + CAMERA.near) {
      return true;
    }
    return false;
  };

  randomPosition = () => {
    this.position.z = -CONSTANTS.planeLength;
    this.position.y = 0;
    this.position.x = SocketHandler.randomNumber(
      -CONSTANTS.planeWidth / 2,
      CONSTANTS.planeWidth / 2
    );
  };
}

export default Tree;
