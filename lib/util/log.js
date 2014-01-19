var logger = require('pomelo-logger');

/**
 * Configure pomelo logger
 */
module.exports.configure = function(app, filename) {
  var serverId = app.getServerId();
  var base = app.getBase();
  logger.configure(filename, {serverId: serverId, base: base});
  app.logger = logger; //增加这个logger，解决在0.8.0加载pomelo-logger不同包，导致无法写入日志的问题
};
