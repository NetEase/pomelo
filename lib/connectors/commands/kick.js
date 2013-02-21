var Package = require('pomelo-protocol').Package;

module.exports.handle = function(socket, reason) {
  if(reason === 'kick') {
    socket.sendRaw(Package.encode(Package.TYPE_KICK));
  }
};