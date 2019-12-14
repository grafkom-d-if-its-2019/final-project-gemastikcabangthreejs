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
  socket.join(currentRoom, function() {
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
      room: currentRoom
    };

    /**
     * on Handshake
     */
    var requestHandshake = {
      randomSeed: randomSeed,
      players: {}
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
        console.log("TCL: ready", ready);
        socket.emit("roomReady", true);
        socket.to(GLOBALS.players[socket.id].room).emit("roomReady", true);
        GLOBALS.rooms[currentRoom].setPlay();
        console.log(
          "TCL: GLOBALS.rooms[currentRoom]",
          GLOBALS.rooms[currentRoom]
        );
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
      console.log("TCL: payload", payload);
      var playerId = payload.player.playerId;
      socket.to(GLOBALS.players[playerId].room).emit("playerMoved", payload);
    });
  });
});

io.of("/gamepad").on("connection", function(socket) {
  socket.on("registerGamepad", function(id, ack) {
    id = "/room#" + id;
    console.log("TCL: registerGamepad", id);
    if (GLOBALS.players[id] != undefined) {
      GLOBALS.players[id].gamepad = socket.id;
      GLOBALS.gamepad[id] = {
        id: socket.id,
        player: GLOBALS.players[id]
      };
      ack("Success", GLOBALS.players[id]);
    } else {
      ack("Fail");
    }
  });

  socket.on("keyUp", function(action, id) {
    var playerId = id;
    var payload = {
      id: playerId,
      action: action
    };
    console.log("TCL: payload", payload);
    io.of("/room")
      .to(playerId)
      .emit("gamepadKeyUp", payload);
  });

  socket.on("keyDown", function(action, id) {
    var playerId = id;
    var payload = {
      id: playerId,
      action: action
    };
    console.log("TCL: payload", payload);
    io.of("/room")
      .to(playerId)
      .emit("gamepadKeyDown", payload);
  });
});
