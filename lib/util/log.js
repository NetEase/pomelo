'use strict';

const logger = require('pomelo-logger');

/**
 * Configure pomelo logger
 */
exports.configure = function(app, filename) {
  const serverId = app.getServerId();
  const base = app.getBase();
  logger.configure(filename, {serverId: serverId, base: base});
};
