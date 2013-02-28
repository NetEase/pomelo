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
  var connector = this.app.components.__connector__.connector;

  // TODO: compress push
  msg = connector.composePush(route, msg);
  if(!msg){
    logger.error('Can not send empty message! route : %j, compressed msg : %j', route, msg);
    return;
  }

  var sessionService = this.app.get('sessionService');
  var fails = [];
  for(var i=0, l=uids.length; i<l; i++) {
    if(!sessionService.sendMessageByUid(uids[i], msg)) {
      fails.push(uids[i]);
    }
  }
  cb(null, fails);
};