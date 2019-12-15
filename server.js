var express = require("express");
var app = express();
var server = require("http").Server(app);
var io = require("socket.io").listen(server);
var routes = require("./server/routes");
const bodyParser = require("body-parser");
var counter = 0;
var Room = require("./server/room");
var GLOBALS = require("./server/globals");

app.use(
  bodyParser.urlencoded({
    extended: true
  })
);
app.use(bodyParser.json());
app.use(express.static(__dirname + "/public"));
app.use("", routes);

server.listen(8081, function() {
  console.log(`Listening on ${server.address().port}`);
});

var randomSeed = Math.random();
GLOBALS.rooms["dummy"] = new Room("dummy", 1);
GLOBALS.players["dummy"] = {
  alive: true,
  playerId: "dummy",
  playerName: "dummy",
  position: {
    x: Math.floor(Math.random() * 120) - 60,
    y: 0,
    z: 0
  },
  speed: {
    x: 0,
    y: 0,
    z: 0
  },
  room: "dummy"
};

io.of("/room").on("connection", function(socket) {
  /**
   * Init
   */
  var currentRoom = socket.handshake.query.room;
  var gamepad = "/gamepad#" + socket.handshake.query.gamepad;
  console.log("TCL: gamepad", gamepad);
  socket.join(currentRoom, function() {
    if (!!gamepad && !!GLOBALS.gamepad[gamepad]) {
      GLOBALS.gamepad[gamepad].playerId = socket.id;
      io.of("/gamepad")
        .to(gamepad)
        .emit("userConnect", socket.id);
    }
    GLOBALS.players[socket.id] = {
      alive: true,
      playerId: socket.id,
      playerName: socket.handshake.query.username,
      position: {
        x: Math.floor(Math.random() * 120) - 60,
        y: 0,
        z: 0
      },
      speed: {
        x: 0,
        y: 0,
        z: 0
      },
      lives: 3,
      room: currentRoom
    };

    /**
     * on Handshake
     */
    var requestHandshake = {
      randomSeed: randomSeed,
      players: {},
      mode: socket.handshake.query.mode
    };
    GLOBALS.rooms[currentRoom].addPlayers(socket.id);
    Object.keys(GLOBALS.rooms[currentRoom].players).forEach(playerId => {
      requestHandshake.players[playerId] = GLOBALS.players[playerId];
    });
    socket.emit("requestHandshake", requestHandshake);

    /**
     * on New Player
     */
    socket
      .to(GLOBALS.players[socket.id].room)
      .emit("newPlayer", GLOBALS.players[socket.id]);

    /**
     * if Game Ready
     */
    socket.on("acknowledge", function() {
      var ready = GLOBALS.rooms[currentRoom].roomReady();
      if (ready === true) {
        socket.emit("roomReady", true);
        socket.to(GLOBALS.players[socket.id].room).emit("roomReady", true);
        GLOBALS.rooms[currentRoom].setPlay();
      }
    });

    /**
     * if disconnect
     */
    socket.on("disconnect", function() {
      console.log("user disconnected");
      delete GLOBALS.players[socket.id];
      io.emit("disconnect", socket.id);
    });

    /**
     * Movement player
     */
    socket.on("playerMovement", function(payload) {
      var playerId = payload.player.playerId;
      socket.to(GLOBALS.players[playerId].room).emit("playerMoved", payload);
    });
  });
});

io.of("/gamepad").on("connection", function(socket) {
  GLOBALS.gamepad[socket.id] = {
    playerId: null
  };

  socket.on("userConnect", function(playerId) {
    console.log("TCL: playerId", playerId);
    socket.emit("userConnect", playerId);
  });

  socket.on("keyUp", function(action, id) {
    var playerId = GLOBALS.gamepad[socket.id].playerId;
    var payload = {
      id: playerId,
      action: action
    };
    if (playerId !== null) {
      io.of("/room")
        .to(playerId)
        .emit("gamepadKeyUp", payload);
    }
  });

  socket.on("keyDown", function(action, id) {
    var playerId = GLOBALS.gamepad[socket.id].playerId;
    var payload = {
      id: playerId,
      action: action
    };
    if (playerId !== null) {
      io.of("/room")
        .to(playerId)
        .emit("gamepadKeyDown", payload);
    }
  });
});
