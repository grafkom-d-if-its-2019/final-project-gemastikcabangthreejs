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

io.on("connection", function(socket) {
  players[socket.id] = {
    alive: true,
    playerId: socket.id,
    playerName: String("Player ") + String(++counter),
    position: {
      x: Math.floor(Math.random() * 120) - 60,
      y: 0,
      z: 0
    }
  };
  socket.emit("currentPlayers", players);
  socket.broadcast.emit("newPlayer", players[socket.id]);
  console.log("a user connected", players);
  socket.on("disconnect", function() {
    console.log("user disconnected");
    delete players[socket.id];
    io.emit("disconnect", socket.id);
  });
});
