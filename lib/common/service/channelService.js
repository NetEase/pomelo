var countDownLatch = require('../../util/countDownLatch');
var utils = require('../../util/utils');
var logger = require('pomelo-logger').getLogger('pomelo', __filename);
var async = require('async');

/**
 * constant
 */
var DEFAULT_GROUP_ID = 'default';

var ST_INITED = 0;
var ST_DESTROYED = 1;

/**
 * Create and maintain channels for server local.
 *
 * ChannelService is created by channel component which is a default loaded
 * component of pomelo and channel service would be accessed by `app.get('channelService')`.
 *
 * @class
 * @constructor
 */
var ChannelService = function(app, opts) {
  opts = opts || {};
  this.app = app;
  this.channels = {};
  this.broadcastFilter = opts.broadcastFilter;
};

module.exports = ChannelService;

/**
 * Create channel with name.
 *
 * @param {String} name channel's name
 * @memberOf ChannelService
 */
ChannelService.prototype.createChannel = function(name) {
  if(this.channels[name]) {
    return this.channels[name];
  }

  var c = new Channel(name, this);
  this.channels[name] = c;
  return c;
};

/**
 * Get channel by name.
 *
 * @param {String} name channel's name
 * @param {Boolean} create if true, create channel
 * @return {Channel}
 * @memberOf ChannelService
 */
ChannelService.prototype.getChannel = function(name, create) {
  var channel = this.channels[name];
  if(!channel && !!create) {
    channel = this.channels[name] = new Channel(name, this);
  }
  return channel;
};

/**
 * Destroy channel by name.
 *
 * @param {String} name channel name
 * @memberOf ChannelService
 */
ChannelService.prototype.destroyChannel = function(name) {
  delete this.channels[name];
};

/**
 * Push message by uids.
 * Group the uids by group. ignore any uid if sid not specified.
 *
 * @param {String} route message route
 * @param {Object} msg message that would be sent to client
 * @param {Array} uids the receiver info list, [{uid: userId, sid: frontendServerId}]
 * @param {Function} cb cb(err)
 * @memberOf ChannelService
 */
ChannelService.prototype.pushMessageByUids = function(route, msg, uids, cb) {
  if(typeof route !== 'string') {
    cb = uids;
    uids = msg;
    msg = route;
    route = msg.route;
  }

  if(!uids || uids.length === 0) {
    utils.invokeCallback(cb, new Error('uids should not be empty'));
    return;
  }
  var groups = {}, record;
  for(var i=0, l=uids.length; i<l; i++) {
    record = uids[i];
    add(record.uid, record.sid, groups);
  }

  sendMessageByGroup(this, route, msg, groups, cb);
};

/**
 * Broadcast message to all the connected clients.
 *
 * @param  {String}   stype      frontend server type string
 * @param  {String}   route      route string
 * @param  {Object}   msg        message
 * @param  {Boolean}  opts       broadcast options. opts.binded: push to binded sessions or all the sessions
 * @param  {Function} cb         callback
 * @memberOf ChannelService
 */
ChannelService.prototype.broadcast = function(stype, route, msg, opts, cb) {
  var app = this.app;
  var namespace = 'sys';
  var service = 'channelRemote';
  var method = 'broadcast';
  var servers = app.getServersByType(stype);

  if(!servers || servers.length === 0) {
    // server list is empty
    utils.invokeCallback(cb);
    return;
  }

  var count = servers.length;
  var successFlag = false;

  var latch = countDownLatch.createCountDownLatch(count, function() {
    if(!successFlag) {
      utils.invokeCallback(cb, new Error('broadcast fails'));
      return;
    }
    utils.invokeCallback(cb, null);
  });

  var genCB = function() {
    return function(err) {
      if(err) {
        logger.error('[broadcast] fail to push message to %j, err:' + err.stack, id);
        latch.done();
        return;
      }
      successFlag = true;
      latch.done();
    }
  };

  for(var i=0, l=count; i<l; i++) {
    app.rpcInvoke(servers[i].id, {namespace: namespace, service: service,
      method: method, args: [route, msg, opts]}, genCB());
  }
};

/**
 * Channel maintains the receiver collection for a subject. You can
 * add users into a channel and then broadcast message to them by channel.
 *
 * @class channel
 * @constructor
 */
var Channel = function(name, service) {
  this.name = name;
  this.groups = {};       // group map for uids. key: sid, value: [uid]
  this.records = {};      // member records. key: uid
  this.__channelService__ = service;
  this.state = ST_INITED;
};

/**
 * Add user to channel.
 *
 * @param {Number} uid user id
 * @param {String} sid frontend server id which user has connected to
 */
Channel.prototype.add = function(uid, sid) {
  if(this.state > ST_INITED) {
    return false;
  } else {
    var res = add(uid, sid, this.groups);
    if(res) {
      this.records[uid] = {sid: sid, uid: uid};
    }
    return res;
  }
};

/**
 * Remove user from channel.
 *
 * @param {Number} uid user id
 * @param {String} sid frontend server id which user has connected to.
 * @return [Boolean] true if success or false if fail
 */
Channel.prototype.leave = function(uid, sid) {
  if(!uid || !sid) {
    return false;
  }
  delete this.records[uid];
  var res = deleteFrom(uid, sid, this.groups[sid]);
  if(this.groups[sid] && this.groups[sid].length === 0) {
    delete this.groups[sid];
  }
  return res;
};

/**
 * Get channel members.
 *
 * <b>Notice:</b> Heavy operation.
 *
 * @return {Array} channel member uid list
 */
Channel.prototype.getMembers = function() {
  var res = [], groups = this.groups;
  var group, i, l;
  for(var sid in this.groups) {
    group = this.groups[sid];
    for(i=0, l=group.length; i<l; i++) {
      res.push(group[i]);
    }
  }
  return res;
};

/**
 * Get Member info.
 *
 * @param  {String} uid user id
 * @return {Object} member info
 */
Channel.prototype.getMember = function(uid) {
  return this.records[uid];
};

/**
 * Destroy channel.
 */
Channel.prototype.destroy = function() {
  this.state = ST_DESTROYED;
  this.__channelService__.destroyChannel(this.name);
};

/**
 * Push message to all the members in the channel
 *
 * @param {String} route message route
 * @param {Object} msg message that would be sent to client
 * @param {Function} cb callback function
 */
Channel.prototype.pushMessage = function(route, msg, cb) {
  if(this.state !== ST_INITED) {
    utils.invokeCallback(new Error('channel is not running now'));
    return;
  }

  if(typeof route !== 'string') {
    cb = msg;
    msg = route;
    route = msg.route;
  }

  sendMessageByGroup(this.__channelService__, route, msg, this.groups, cb);
};

/**
 * add uid and sid into group. ignore any uid that uid not specified.
 *
 * @param uid user id
 * @param sid server id
 * @param groups {Object} grouped uids, , key: sid, value: [uid]
 */
var add = function(uid, sid, groups) {
  if(!sid) {
    logger.warn('ignore uid %j for sid not specified.', uid);
    return false;
  }

  var group = groups[sid];
  if(!group) {
    group = [];
    groups[sid] = group;
  }

  group.push(uid);
  return true;
};

/**
 * delete element from array
 */
var deleteFrom = function(uid, sid, group) {
  if(!group) {
    return true;
  }

  for(var i=0, l=group.length; i<l; i++) {
    if(group[i] === uid) {
      group.splice(i, 1);
      return true;
    }
  }

  return false;
};

/**
 * push message by group
 *
 * @param route {String} route route message
 * @param msg {Object} message that would be sent to client
 * @param groups {Object} grouped uids, , key: sid, value: [uid]
 * @param cb {Function} cb(err)
 *
 * @api private
 */
var sendMessageByGroup = function(channelService, route, msg, groups, cb) {
  var app = channelService.app;
  var namespace = 'sys';
  var service = 'channelRemote';
  var method = 'pushMessage';
  var count = utils.size(groups);
  var successFlag = false;
  var failIds = [];

  if(count === 0) {
    // group is empty
    utils.invokeCallback(cb);
    return;
  }

  var latch = countDownLatch.createCountDownLatch(count, function(){
    if(!successFlag) {
      utils.invokeCallback(cb, new Error('all uids push message fail'));
      return;
    }
    utils.invokeCallback(cb, null, failIds);
  });

  var rpcCB = function(err, fails) {
    if(err) {
      logger.error('[pushMessage] fail to dispatch msg, err:' + err.stack);
      latch.done();
      return;
    }
    if(fails) {
      failIds = failIds.concat(fails);
    }
    successFlag = true;
    latch.done();
  };

  var group;
  for(var sid in groups) {
    group = groups[sid];
    if(group && group.length > 0) {
      app.rpcInvoke(sid, {namespace: namespace, service: service,
        method: method, args: [route, msg, groups[sid], {isPush: true}]}, rpcCB);
    } else {
      // empty group
      process.nextTick(rpcCB);
    }
  }
};
