var express = require("express");
var app = express();
var server = require("http").Server(app);
var io = require("socket.io").listen(server);

var players = {};
var counter = 0;

app.use(express.static(__dirname + "/public"));

app.get("/", function(req, res) {
  res.sendFile(__dirname + "/index.html");
});

server.listen(8081, function() {
  console.log(`Listening on ${server.address().port}`);
});

var randomSeed = Math.random();

io.on("connection", function(socket) {
  players[socket.id] = {
    alive: true,
    playerId: socket.id,
    playerName: String("Player ") + String(++counter),
    position: {
      x: Math.floor(Math.random() * 120) - 60,
      y: 0,
      z: 0
    },
    speed: {
      x: 0,
      y: 0,
      z: 0
    }
  };
  var constValue = {
    randomSeed: randomSeed
  };
  socket.emit("constValue", constValue);
  socket.emit("currentPlayers", players);
  socket.broadcast.emit("newPlayer", players[socket.id]);
  console.log("a user connected", players);
  socket.on("disconnect", function() {
    console.log("user disconnected");
    delete players[socket.id];
    io.emit("disconnect", socket.id);
  });
  socket.on("playerMovement", function(payload) {
    console.log("TCL: playerMovement", payload, socket.id);
    players[socket.id].speed.x = payload.speed.x;
    players[socket.id].speed.y = payload.speed.y;
    players[socket.id].speed.z = payload.speed.z;
    socket.broadcast.emit("playerMoved", players[socket.id]);
  });
});
