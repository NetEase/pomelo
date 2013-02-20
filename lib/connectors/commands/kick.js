var Package = require('pomelo-protocol');

module.exports.handle = function(socket, reason) {
  if(reason === 'kick') {
    socket.sendRaw(Package.encode(Package.TYPE_KICK));
  }
};