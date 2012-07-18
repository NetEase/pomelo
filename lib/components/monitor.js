/**
 * Component for monitor.
 * Load and start monitor client.
 */
var logger = require('../util/log/log').getLogger(__filename);
var utils = require('../util/utils');

var exp = module.exports;

exp.start = function(app, opts, cb) {
  logger.info('begin to start monitor component.');

  var master = app.master;
  logger.info('monitor connect to master %j', master);
  var monitorClient = require('../monitor/monitorClient.js');
  monitorClient.start(app, master);

  logger.inof('monitor started.');
  utils.invokeCallback(cb);
};

exp.name = 'monitor';
