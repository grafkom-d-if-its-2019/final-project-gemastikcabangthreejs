// import { Mesh } from "three";
// import { GEOMETRY, MATERIALS, CONSTANTS, SPEED, CAMERA } from "./constants";
// import { randomNumber } from "./utils";
// import { ColladaLoader } from "three-collada-loader"


// class Mountain extends Mesh {
    
//   constructor(pos) {
//     this.loader = new ColladaLoader();
//     this.prototype = {};
//     loader.load(
//         'https://s3-us-west-2.amazonaws.com/s.cdpn.io/26757/mountain.dae',
//         function ( collada ) {
//         prototype = collada.scene;
//         prototype.visible = false;
//     } );
//     this.object = this.prototype.clone();
//     if (pos === 'right') {
//         this.object.position.x = CONSTANTS.planeWidth * 2
//         this.object.position.z = ( i * CONSTANTS.planeLength / 27 ) - ( 1.5 * CONSTANTS.planeLength );
//     } else {
//         this.object.position.x = -CONSTANTS.planeWidth * 2
//         this.object.position.z = ( i * CONSTANTS.planeLength / 27 ) - ( CONSTANTS.planeLength / 2 );
//     }
//     this.object.visible = true; 
//   }

//   animate() {
//     this.position.z += SPEED.obstacleZ;
//   }

//   outside() {
//     if (this.position.z > CAMERA.fov + CAMERA.near) {
//       return true;
//     }
//     return false;
//   }

//   randomPosition() {
//     this.position.z = -CONSTANTS.planeLength;
//     this.position.y = randomNumber(
//       CONSTANTS.crowLimit.lowerBound,
//       CONSTANTS.crowLimit.upperBound
//     );
//     this.position.x = randomNumber(
//       -CONSTANTS.planeWidth / 2,
//       CONSTANTS.planeWidth / 2
//     );
//   }
// }

// export default Crow;
