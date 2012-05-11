module.exports = function(app, opts) {
  var server = app.findServer(app.serverType, app.serverId);
  app.set('curServer', server);
  var serverInst = require('../server/server.js').createServer(server);
  serverInst.start();
  app.set('currentServer', serverInst);
};

module.exports.name = 'server';
