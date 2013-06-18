var utils = require('../../util/utils');
var redis = require('redis');
var countDownLatch = require('../../util/countDownLatch');

var ST_INITED = 0;
var ST_DESTROYED = 1;

var DEFAULT_PREFIX = 'POMELO:CHANNEL';

var GlobalChannelService = function(app, opts) {
  this.app = app;
  this.opts = opts || {};
  this.prefix = opts.prefix || DEFAULT_PREFIX;
  this.host = opts.host;
  this.port = opts.port;
  this.redis = null;
};

module.exports = GlobalChannelService;

GlobalChannelService.prototype.start = function(cb) {
  this.redis = redis.createClient(this.port, this.host, this.opts);
  this.redis.once('ready', cb);
};

GlobalChannelService.prototype.stop = function(force, cb) {
  if(this.redis) {
    this.redis.end();
    this.redis = null;
  }
  utils.invokeCallback(cb);
};

GlobalChannelService.prototype.destroyChannel = function(name, cb) {
  var servers = this.app.getServers();
  var server, cmds = [];
  for(var sid in servers) {
    server = servers[sid];
    if(this.app.isFrontend(server)) {
      cmds.push(['del', genKey(this, name, sid)]);
    }
  }

  if(cmds.length === 0) {
    utils.invokeCallback(cb);
    return;
  }

  this.redis.multi(cmds).exec(function(err, reply) {
    utils.invokeCallback(cb, err);
  });
};

GlobalChannelService.prototype.add = function(name, uid, sid, cb) {
  this.redis.sadd(genKey(this, name, sid), uid, function(err) {
    utils.invokeCallback(cb, err);
  });
};

GlobalChannelService.prototype.leave = function(name, uid, sid, cb) {
  this.redis.srem(genKey(this, name, sid), uid, function(err) {
    utils.invokeCallback(cb, err);
  });
};

GlobalChannelService.prototype.getMembers = function(name, sid, cb) {
  this.redis.smembers(genKey(this, name, sid), function(err, list) {
    utils.invokeCallback(cb, err, list);
  });
};

GlobalChannelService.prototype.pushMessage = function(serverType, route, msg,
    channelName, opts, cb) {

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

var genKey = function(self, name, sid) {
  return self.prefix + ':' + name + ':' + sid;
};
