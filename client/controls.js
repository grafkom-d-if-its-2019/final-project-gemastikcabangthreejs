class Controls {
  static dino = {
    keyDown: action => {
      switch (action) {
        case "ArrowLeft":
          return dino => {
            dino.move.x(-100);
            dino.velocityMultiplier.x = 1;
          };
        case "ArrowRight":
          return dino => {
            dino.move.x(100);
            dino.velocityMultiplier.x = 1;
          };
        case "ArrowUp":
          return dino => {
            dino.move.z(-100);
            dino.velocityMultiplier.z = 1;
          };
        case "ArrowDown":
          return dino => {
            dino.move.z(100);
            dino.velocityMultiplier.z = 1;
          };
        case "KeyZ":
          return dino => {
            dino.jump();
          };
        case "KeyX":
          return dino => {
            dino.duck();
          };
        default:
          return dino => {
            return;
          };
      }
    },
    keyUp: action => {
      switch (action) {
        case "ArrowLeft":
          return dino => {
            dino.velocityMultiplier.x = 0.9;
          };
        case "ArrowRight":
          return dino => {
            dino.velocityMultiplier.x = 0.9;
          };
        case "ArrowUp":
          return dino => {
            dino.velocityMultiplier.z = 0.9;
          };
        case "ArrowDown":
          return dino => {
            dino.velocityMultiplier.z = 0.9;
          };
        default:
          return dino => {
            return;
          };
      }
    }
  };
}

export default Controls;
