'use strict';

const Package = require('pomelo-protocol').Package;

module.exports.handle = function(socket, reason) {
  // websocket close code 1000 would emit
  // when client close the connection
  if (typeof reason === 'string') {
    const res = {
      reason: reason
    };
    socket.sendRaw(Package.encode(Package.TYPE_KICK,
                                  new Buffer(JSON.stringify(res))));
  }
};
