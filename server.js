var express = require("express");
var app = express();
var server = require("http").Server(app);
var io = require("socket.io").listen(server);
var routes = require("./server/routes");
const bodyParser = require("body-parser");
var counter = 0;
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

io.on("connection", function(socket) {
  /**
   * Init
   */
  var currentRoom = socket.handshake.query.room;
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
  socket.broadcast.emit("newPlayer", GLOBALS.players[socket.id]);

  /**
   * if Game Ready
   */
  socket.on("acknowledge", function() {
    var ready = GLOBALS.rooms[currentRoom].roomReady();
    if (ready === true) {
      console.log("TCL: ready", ready);
      socket.emit("roomReady", true);
      socket.broadcast.emit("roomReady", true);
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
    console.log("TCL: playerMovement", payload, socket.id);
    GLOBALS.players[socket.id].speed.x = payload.speed.x;
    GLOBALS.players[socket.id].speed.y = payload.speed.y;
    GLOBALS.players[socket.id].speed.z = payload.speed.z;
    socket.broadcast.emit("playerMoved", GLOBALS.players[socket.id]);
  });
});

// io.on("connection", function(socket) {
//   /**
//    * Init
//    */
//   // console.log("TCL: socket", socket);
//   var currentRoom = "socket.handshake.query.room";

//   GLOBALS.players[socket.id] = {
//     alive: true,
//     playerId: socket.id,
//     playerName: "socket.handshake.query.username",
//     position: {
//       x: Math.floor(Math.random() * 120) - 60,
//       y: 0,
//       z: 0
//     },
//     speed: {
//       x: 0,
//       y: 0,
//       z: 0
//     },
//     room: currentRoom
//   };

//   /**
//    * on Handshake
//    */
//   var handshake = {
//     randomSeed: randomSeed,
//     players: {}
//   };

//   GLOBALS.rooms[currentRoom].addPlayers(socket.id);
//   Object.keys(GLOBALS.rooms[currentRoom].players).forEach(playerId => {
//     handshake.players[playerId] = GLOBALS.players[playerId];
//   });
//   socket.emit("handshake", handshake, () => console.log("cok"));
//   console.log("TCL: handshake", handshake);

//   /**
//    * Game is ready (2 player or 1 player)
//    */
//   socket.on("acknowledge", function() {
//     var ready = GLOBALS.rooms[currentRoom].roomReady();
//     console.log("TCL: ready", ready);
//     if (ready == true) {
//       socket.broadcast.emit("roomReady");
//       GLOBALS.rooms[currentRoom].setPlay();
//     }
//   });

//   /**
//    *  On New Player Connect
//    */
//   socket.broadcast.emit("newPlayer", GLOBALS.players[socket.id]);

//   /**
//    * if one player disconnect
//    */
//   socket.on("disconnect", function() {
//     console.log("user disconnected");
//     delete GLOBALS.players[socket.id];
//     io.emit("disconnect", socket.id);
//   });

//   /**
//    * Emit player movement to all socket
//    */
//   socket.on("playerMovement", function(payload) {
//     players[socket.id].speed.x = payload.speed.x;
//     players[socket.id].speed.y = payload.speed.y;
//     players[socket.id].speed.z = payload.speed.z;
//     socket.broadcast.emit("playerMoved", GLOBALS.players[socket.id]);
//   });
// });
