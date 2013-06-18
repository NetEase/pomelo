var utils = require('../../util/utils');
var redis = require('redis');
var countDownLatch = require('../../util/countDownLatch');
var logger = require('pomelo-logger').getLogger(__filename);
var DefaultChannelManager = require('../../channel/redisGlobalChannelManager');

var ST_INITED = 0;
var ST_STARTED = 1;
var ST_CLOSED = 2;

var DEFAULT_PREFIX = 'POMELO:CHANNEL';

var GlobalChannelService = function(app, opts) {
  this.app = app;
  this.opts = opts || {};
  this.manager = getChannelManager(app, opts);
  this.state = ST_INITED;
};

module.exports = GlobalChannelService;

GlobalChannelService.prototype.start = function(cb) {
  if(this.state !== ST_INITED) {
    utils.invokeCallback(cb, new Error('invalid state'));
    return;
  }

  if(typeof this.manager.start === 'function') {
    var self = this;
    this.manager.start(function(err) {
      if(!err) {
        self.state = ST_STARTED;
      }
      utils.invokeCallback(cb, err);
    });
  } else {
    process.nextTick(function() {
      utils.invokeCallback(cb);
    });
  }
};

GlobalChannelService.prototype.stop = function(force, cb) {
  this.state = ST_CLOSED;

  if(typeof this.manager.stop === 'function') {
    this.manager.stop(force, cb);
  } else {
    process.nextTick(function() {
      utils.invokeCallback(cb);
    });
  }
};

GlobalChannelService.prototype.destroyChannel = function(name, cb) {
  if(this.state !== ST_STARTED) {
    utils.invokeCallback(cb, new Error('invalid state'));
    return;
  }

  this.manager.destroyChannel(name, cb);
};

GlobalChannelService.prototype.add = function(name, uid, sid, cb) {
  if(this.state !== ST_STARTED) {
    utils.invokeCallback(cb, new Error('invalid state'));
    return;
  }

  this.manager.add(name, uid, sid, cb);
};

GlobalChannelService.prototype.leave = function(name, uid, sid, cb) {
  if(this.state !== ST_STARTED) {
    utils.invokeCallback(cb, new Error('invalid state'));
    return;
  }

  this.manager.leave(name, uid, sid, cb);
};

GlobalChannelService.prototype.getMembersBySid = function(name, sid, cb) {
  if(this.state !== ST_STARTED) {
    utils.invokeCallback(cb, new Error('invalid state'));
    return;
  }

  this.manager.getMembersBySid(name, sid, cb);
};

GlobalChannelService.prototype.pushMessage = function(serverType, route, msg,
    channelName, opts, cb) {
  if(this.state !== ST_STARTED) {
    utils.invokeCallback(cb, new Error('invalid state'));
    return;
  }

  var rpcMsg = {
    namespace: 'sys',
    service: 'channelRemote',
    method: 'globalPushMessage',
    args: [route, msg, channelName, opts]
  };

  var self = this;
  var servers = this.app.getServersByType(serverType);

  if(!servers || servers.length === 0) {
    // no frontend server infos
    utils.invokeCallback(cb);
    return;
  }

  var successFlag = false;
  var latch = countDownLatch.createCountDownLatch(servers.length, function() {
    if(!successFlag) {
      utils.invokeCallback(cb, new Error('all frontend server push message fail'));
      return;
    }
    utils.invokeCallback(cb);
  });

  for(var i=0, l=servers.length; i<l; i++) {
    self.app.rpcInvoke(servers[i].id, rpcMsg, function(err) {
      if(err) {
        logger.error('[globalPushMessage] fail to dispatch msg, err:' + err.stack);
        latch.done();
        return;
      }
      successFlag = true;
      latch.done();
    });
  }
};

var getChannelManager = function(app, opts) {
  var manager;
  if(typeof opts.channelManager === 'function') {
    manager = opts.channelManager(app, opts);
  } else {
    manager = opts.channelManager;
  }

  if(!manager) {
    manager = new DefaultChannelManager(app, opts);
  }

  return manager;
};
