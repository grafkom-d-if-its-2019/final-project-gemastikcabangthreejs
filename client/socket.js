import io from "socket.io-client";
import seedrandom from "seedrandom";
import Dino from "./dino";
import Controls from "./controls";

class SocketHandler {
  static socket;
  static mainPlayer;
  static otherPlayers = {};
  static randomSeed = undefined;
  static mode = 1;
  static doneLoading;
  static subscriberDelete = [];

  static init = (scene, camera) => {
    var url = window.location.href.slice(window.location.href.indexOf("?") + 1);

    this.socket = io("/room", { query: url, multiplex: false });
    this.scene = scene;
    this.camera = camera;
    this.roomStatus = false;
    this.gamepadeConnected = false;
    this.socket.on("requestHandshake", this.requestHandshake);
    this.socket.on("roomReady", this.roomReady);
    this.socket.on("newPlayer", this.newPlayer);
    this.socket.on("disconnectUser", this.disconnectUser);
    this.socket.on("playerMoved", this.playerMoved);
    this.socket.on("gamepadKeyDown", this.gamepadKeyDown);
    this.socket.on("gamepadKeyUp", this.gamepadKeyUp);
  };

  static addSubscriber(type, func) {
    if ("delete") {
      this.subscriberDelete.push(func);
    }
  }

  static hitObstacle = () => {
    this.mainPlayer.lives -= 1;
    console.log(
      "TCL: SocketHandler -> statichitObstacle -> this.mainPlayer.lives",
      this.mainPlayer.lives
    );
    if (this.mainPlayer.lives == 0) {
      this.socket.emit("deadPlayer", this.mainPlayer);
      alert("Game Over");
      window.location = "/";
    }
  };

  static checkGameReady = () => {
    return this.roomStatus;
  };

  static roomReady = value => {
    this.roomStatus = value;
  };

  static requestHandshake = value => {
    this.randomSeed = value.randomSeed;
    this.rng = seedrandom(this.randomSeed);
    this.mode = value.mode;
    Object.keys(value.players).forEach(id => {
      value.players[id].dino = new Dino(id, value.players[id].playerName);
      value.players[id].dino.position.x = value.players[id].position.x;
      value.players[id].dino.position.y = value.players[id].position.y;
      value.players[id].dino.position.z = value.players[id].position.z;
      if (value.players[id].playerId === this.socket.id) {
        this.mainPlayer = value.players[id];
        this.mainPlayer.dino.add(this.camera);
      } else {
        this.otherPlayers[id] = value.players[id];
      }
      this.scene.add(value.players[id].dino);
    });
    this.socket.emit("acknowledge", value);
  };

  static newPlayer = player => {
    player.dino = new Dino(player.playerId, player.playerName);
    player.dino.position.x = player.position.x;
    player.dino.position.y = player.position.y;
    player.dino.position.z = player.position.z;
    this.scene.add(player.dino);
    this.otherPlayers[player.playerId] = player;
  };

  static disconnectUser = id => {
    this.scene.remove(this.otherPlayers[id].dino);
    this.subscriberDelete.forEach(func => {
      func(id);
    });
    delete this.otherPlayers[id];
  };

  static playerMovement = action => {
    this.socket.emit("playerMovement", action);
  };

  static playerMoved = action => {
    Controls.dino[action.type](action.key)(
      this.otherPlayers[action.player.playerId].dino
    );
  };

  static randomNumber = (min, max) => {
    return Math.floor(this.rng() * (max - min)) + min;
  };

  static gamepadKeyDown = event => {
    Controls.dino.keyDown(event.action)(this.mainPlayer.dino);
    var action = {
      type: "keyDown",
      key: event.action,
      player: this.mainPlayer
    };
    this.playerMovement(action);
  };

  static gamepadKeyUp = event => {
    Controls.dino.keyUp(event.action)(this.mainPlayer.dino);
    var action = {
      type: "keyUp",
      key: event.action,
      player: this.mainPlayer
    };
    this.playerMovement(action);
  };
}

export default SocketHandler;
