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
  this.globalChannelService = app.get('globalChannelService');
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
  if(!msg){
    logger.error('Can not send empty message! route : %j, compressed msg : %j',
        route, msg);
    return;
  }

  var connector = this.app.components.__connector__;

  var sessionService = this.app.get('sessionService');
  var fails = [], sids = [], sessions, j, k;
  for(var i=0, l=uids.length; i<l; i++) {
    sessions = sessionService.getByUid(uids[i]);
    if(!sessions) {
      fails.push(uids[i]);
    } else {
      for(j=0, k=sessions.length; j<k; j++) {
        sids.push(sessions[j].id);
      }
    }
  }

  connector.send(null, route, msg, sids, {isPush: true}, function(err) {
    cb(err, fails);
  });
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
  var connector = this.app.components.__connector__;

  opts.isBroadcast = true;
  connector.send(null, route, msg, null, opts, cb);
};

/**
 * Push message to all the clients in specified global channel.
 *
 * @param  {String}    route          route string
 * @param  {Object}    msg            message
 * @param  {String}    channelName    name of channel
 * @param  {Boolean}   opts           broadcast options. opts.binded: wheter binded clients or all clients, opts.filterParam: parameters for broadcast filter.
 * @param  {Function}  cb             callback function
 */
Remote.prototype.globalPushMessage = function(route, msg, channelName, opts, cb) {
  opts = opts || {isPush: true};
  
  if(!channelName) {
    cb(new Error('channel name should not be empty'));
    return;
  }
  var self = this;

  this.globalChannelService.getMembersBySid(channelName, this.app.getServerId(), function(err, uids) {
    if(err) {
      cb(err);
      return;
    }
    if(!uids || uids.length === 0) {
      // channel is empty
      cb();
      return;
    }

    var sessionService = self.app.get('sessionService');
    var sids = [], sessions, j, k;
    for(var i=0, l=uids.length; i<l; i++) {
      sessions = sessionService.getByUid(uids[i]);
      if(sessions) {
        for(j=0, k=sessions.length; j<k; j++) {
          sids.push(sessions[j].id);
        }
      }
    }

    var connector = self.app.components.__connector__;
    connector.send(null, route, msg, sids, opts, function(err) {
      cb(err);
    });
  });
};