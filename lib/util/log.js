var logger = require('pomelo-logger');

/**
 * Configure pomelo logger
 */
module.exports.configure = function(app, filename) {
  var serverId = app.getServerId();
  var serverType = app.getServerType();
  logger.configure(filename, {serverId: serverId, pattern: serverType});
};
