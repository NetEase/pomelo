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
 * @param  {Boolean}   opts   broadcast options. opts.binded: wheter binded clients or all clients, opts.filterParam: parameters for broadcast filter.
 * @param  {Function}  cb     callback function
 */
Remote.prototype.broadcast = function(route, msg, opts, cb) {
  opts = opts || {};
  var connector = this.app.components.__connector__.connector;
  if(connector.composePush) {
    msg = connector.composePush(route, msg);
  }
  var channelService = this.app.get('channelService');
  var sessionService = this.app.get('sessionService');
  var fails = [];

  if(opts.binded) {
    sessionService.forEachBindedSession(function(session) {
      if(channelService.broadcastFilter &&
         !channelService.broadcastFilter(session, msg, opts.filterParam)) {
        return;
      }

      sessionService.sendMessageByUid(session.uid, msg);
    });
  } else {
    sessionService.forEachSession(function(session) {
      if(channelService.broadcastFilter &&
         !channelService.broadcastFilter(session, msg, opts.filterParam)) {
        return;
      }

      sessionService.sendMessage(session.id, msg);
    });
  }

  cb(null);
};
