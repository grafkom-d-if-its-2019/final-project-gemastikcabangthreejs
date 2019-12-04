import io from "socket.io-client";
import Dino from "./dino";
import seedrandom from "seedrandom";

class SocketHandler {
  static socket;
  static mainPlayer;
  static otherPlayers = {};
  static randomSeed = undefined;
  static gameReady = false;

  static init = (scene, camera) => {
    this.socket = io();
    this.scene = scene;
    this.camera = camera;
    this.gameReady = false;
    // this.rng = Math.random;
  };

  static checkGameReady = () => {
    var keys = Object.keys(this.otherPlayers);
    if (this.randomSeed !== undefined && keys.length > 0) {
      return true;
    }
    return false;
  };

  static constValue = value => {
    console.log("TCL: SocketHandler -> value", value);
    this.randomSeed = value.randomSeed;
    this.rng = seedrandom(this.randomSeed);
  };

  static currentPlayers = players => {
    Object.keys(players).forEach(id => {
      players[id].dino = new Dino();
      players[id].dino.position.x = players[id].position.x;
      players[id].dino.position.y = players[id].position.y;
      players[id].dino.position.z = players[id].position.z;
      if (players[id].playerId === this.socket.id) {
        this.mainPlayer = players[id];
        players[id].dino.add(this.camera);
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
    this.otherPlayers[player.playerId] = player;
  };

  static disconnect = id => {
    this.scene.remove(this.otherPlayers[id].dino);
    delete this.otherPlayers[id];
  };

  static playerMovement = dino => {
    var payload = {
      speed: dino.speed
    };
    this.socket.emit("playerMovement", payload);
  };

  static playerStopMoved = dino => {
    var payload = {
      position: dino.position
    };
    this.socket.emit("playerStopMoved", payload);
  };

  static finalSyncPosition = player => {
    this.otherPlayers[player.playerId].dino.position.x = player.position.x;
    this.otherPlayers[player.playerId].dino.position.y = player.position.y;
    this.otherPlayers[player.playerId].dino.position.z = player.position.z;
  };

  static playerMoved = player => {
    console.log("TCL: SocketHandler -> player", player);
    this.otherPlayers[player.playerId].dino.speed.x = player.speed.x;
    this.otherPlayers[player.playerId].dino.speed.y = player.speed.y;
    this.otherPlayers[player.playerId].dino.speed.z = player.speed.z;
  };

  static randomNumber = (min, max) => {
    return Math.floor(this.rng() * (max - min + 1)) + min;
  };
}

export default SocketHandler;
