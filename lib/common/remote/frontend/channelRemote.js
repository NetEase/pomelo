/**
 * Remote channel service for frontend server.
 * Receive push request from backend servers and push it to clients.
 */
var logger = require('pomelo-logger').getLogger(__filename);

module.exports = function(app) {
  return new Remote(app);
};

var Remote = function(app) {
  this.app = app;
};

/**
 * Push message to client by uids.
 *
 * @param  {String}   route route string of message
 * @param  {Object}   msg   message
 * @param  {Array}    uids  user ids that would receive the message
 * @param  {Function} cb    [description]
 * @return {Function}
 */
Remote.prototype.pushMessage = function(route, msg, uids, cb) {
  // TODO: compress push
  var connector = this.app.components.__connector__.connector;
  msg = connector.composePush(route, msg);
  var sessionService = this.app.get('sessionService');
  var fails = [];
  for(var i=0, l=uids.length; i<l; i++) {
    if(!sessionService.sendMessageByUid(uids[i], msg)) {
      fails.push(uids[i]);
    }
  }
  cb(null, fails);
};