import { Mesh } from "three";
import { GEOMETRY, MATERIALS, CONSTANTS, SPEED } from "./constants";
import { randomNumber } from "./utils";

function Tree() {
  var object = new Mesh(GEOMETRY.tree, MATERIALS.tree);
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

export default Tree;
