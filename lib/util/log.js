var logger = require('pomelo-logger');

/**
 * Configure pomelo logger
 */
module.exports.configure = function(app, filename) {
  var serverId = app.getServerId();
  logger.configure(filename, {serverId: serverId});
};
