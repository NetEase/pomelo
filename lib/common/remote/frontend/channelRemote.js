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
 * @param  {Function} cb    callback function
 */
Remote.prototype.pushMessage = function(route, msg, uids, cb) {
  var connector = this.app.components.__connector__.connector;
  if(!msg){
    logger.error('Can not send empty message! route : %j, compressed msg : %j', route, msg);
    return;
  }
  if(connector.composePush) {
    msg = connector.composePush(route, msg);
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

/**
 * Broadcast to all the client connectd with current frontend server.
 *
 * @param  {String}    route  route string
 * @param  {Object}    msg    message
 * @param  {Boolean}   binded whether broadcast to binded session or all the session
 * @param  {Function}  cb     callback function
 */
Remote.prototype.broadcast = function(route, msg, binded, cb) {
  var connector = this.app.components.__connector__.connector;
  if(connector.composePush) {
    msg = connector.composePush(route, msg);
  }
  var sessionService = this.app.get('sessionService');
  var fails = [];

  if(binded) {
    sessionService.forEachBindedSession(function(session) {
      if(!sessionService.sendMessageByUid(session.uid, msg)) {
        fails.push(session.uid);
      }
    });
  } else {
    sessionService.forEachSession(function(session) {
      if(!sessionService.sendMessage(session.id, msg)) {
        fails.push(session.id);
      }
    });
  }

  cb(null, fails);
};
