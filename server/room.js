function Room(id, mode) {
  this.id = id;
  this.mode = Number(mode);
  this.playStatus = false;
  this.players = {};
}

Room.prototype.addPlayers = function(player) {
  this.players[player] = player;
};

Room.prototype.roomReady = function() {
  var numOfPlayers = Object.keys(this.players).length;
  return numOfPlayers == this.mode;
};

Room.prototype.setPlay = function() {
  this.playStatus = true;
};

module.exports = Room;
