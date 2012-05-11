var log = require('../util/log/log');

module.exports = function(app) {
  var logConfFile = app.get('dirname')+'/config/log4js.json';
  log.configure(logConfFile);
};

module.exports.name = 'log';
