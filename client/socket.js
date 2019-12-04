import io from "socket.io-client";
import Dino from "./dino";
import seedrandom from "seedrandom";

class SocketHandler {
  static socket;
  static mainPlayer;
  static otherPlayers = {};
  static randomSeed = undefined;

  static init = (scene, camera) => {
    var url = window.location.href.slice(window.location.href.indexOf("?") + 1);

    this.socket = io("http://localhost:8081", { query: url });
    this.scene = scene;
    this.camera = camera;
    this.roomStatus = false;
    this.socket.on("requestHandshake", this.requestHandshake);
    this.socket.on("roomReady", this.roomReady);
    this.socket.on("newPlayer", this.newPlayer);
    this.socket.on("disconnect", this.disconnect);
    this.socket.on("playerMoved", this.playerMoved);
  };

  static checkGameReady = () => {
    return this.roomStatus;
  };

  static roomReady = value => {
    console.log("TCL: SocketHandler -> staticroomReady -> roomStatus", value);
    this.roomStatus = value;
  };

  static requestHandshake = value => {
    console.log("TCL: SocketHandler -> value", value);
    this.randomSeed = value.randomSeed;
    this.rng = seedrandom(this.randomSeed);
    Object.keys(value.players).forEach(id => {
      value.players[id].dino = new Dino();
      value.players[id].dino.position.x = value.players[id].position.x;
      value.players[id].dino.position.y = value.players[id].position.y;
      value.players[id].dino.position.z = value.players[id].position.z;
      if (value.players[id].playerId === this.socket.id) {
        this.mainPlayer = value.players[id];
        value.players[id].dino.add(this.camera);
      } else {
        this.otherPlayers[id] = value.players[id];
      }
      this.scene.add(value.players[id].dino);
    });
    this.socket.emit("acknowledge", value);
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
