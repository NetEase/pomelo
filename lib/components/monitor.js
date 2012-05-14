var logger = require('../util/log/log').getLogger(__filename);

module.exports = function(app) {
  var master = app.master;
  logger.info('monitor connect to master %j', master);
  var monitorClient = require('../monitor/monitorClient.js');
  monitorClient.start(app, master);
};

module.exports.name = 'monitor';
