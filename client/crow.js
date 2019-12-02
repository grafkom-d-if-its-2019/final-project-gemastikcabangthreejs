import { Mesh } from "three";
import { GEOMETRY, MATERIALS, CONSTANTS, SPEED } from "./constants";
import { randomNumber } from "./utils";

function Crow() {
  var object;
  object = new Mesh(GEOMETRY.crow, MATERIALS.crow);
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

export default Crow;
