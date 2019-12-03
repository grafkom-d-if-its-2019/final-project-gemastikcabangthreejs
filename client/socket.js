import io from "socket.io-client";
import Dino from "./dino";

class SocketHandler {
  static socket;
  static mainPlayer;
  static otherPlayers = [];

  static init(scene) {
    this.socket = io();
    this.scene = scene;
  }

  static currentPlayers = players => {
    Object.keys(players).forEach(id => {
      players[id].dino = new Dino();
      players[id].dino.position.x = players[id].position.x;
      players[id].dino.position.y = players[id].position.y;
      players[id].dino.position.z = players[id].position.z;
      if (players[id].playerId === this.socket.id) {
        this.mainPlayer = players[id];
        // players[id].dino.add(camera);
      } else {
        this.otherPlayers[id] = players[id];
      }
      this.scene.add(players[id].dino);
    });
  };

  static newPlayer = player => {
    player.dino = new Dino();
    player.dino.position.x = player.position.x;
    player.dino.position.y = player.position.y;
    player.dino.position.z = player.position.z;
    this.scene.add(player.dino);
    this.otherPlayers[id] = player;
  };

  static disconnect = id => {
    this.scene.remove(this.otherPlayers[id].dino);
    delete this.otherPlayers[id];
  };
}

export default SocketHandler;
