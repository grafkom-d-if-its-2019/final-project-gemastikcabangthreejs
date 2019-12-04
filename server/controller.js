var path = require("path");
const nanoid = require("nanoid");
var GLOBALS = require("./globals");
const Room = require("./room");

exports.index = (req, res) => {
  res.sendFile(path.resolve("public/menu.html"));
};

exports.error = (req, res) => {
  res.sendFile(path.resolve("public/404.html"));
};

exports.init = (req, res) => {
  var username = req.body.username;
  var newId = nanoid(10);
  var room = req.body.room || newId;
  console.log("TCL: exports.init -> room", room);
  if (room === newId) {
    GLOBALS.rooms[room] = new Room(room, req.body.mode);
    GLOBALS.rooms["socket.handshake.query.room"] = new Room(
      "socket.handshake.query.room",
      req.body.mode
    );
  }
  res.redirect(
    "/game?" +
      "username=" +
      username +
      "&mode=" +
      req.body.mode +
      "&room=" +
      room
  );
};

exports.game = (req, res) => {
  if (
    GLOBALS.rooms[req.query.room] !== undefined &&
    GLOBALS.rooms[req.query.room].playStatus == false
  ) {
    res.sendFile(path.resolve("public/game.html"));
  } else {
    res.redirect("/error");
  }
};
