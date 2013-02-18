var protocol = require('pomelo-protocol');

var PKG_KICK = 3;     // kick package

module.exports.handle = function(socket, reason) {
  if(reason === 'kick') {
    socket.sendRaw(protocol.encode(PKG_KICK, ''));
  }
};