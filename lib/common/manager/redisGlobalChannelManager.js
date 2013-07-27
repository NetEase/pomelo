var utils = require('../../util/utils');
var redis = require('redis');
var logger = require('pomelo-logger').getLogger(__filename);

var DEFAULT_PREFIX = 'POMELO:CHANNEL';

var GlobalChannelManager = function(app, opts) {
  this.app = app;
  this.opts = opts || {};
  this.prefix = opts.prefix || DEFAULT_PREFIX;
  this.host = opts.host;
  this.port = opts.port;
  this.redis = null;
};

module.exports = GlobalChannelManager;

GlobalChannelManager.prototype.start = function(cb) {
  this.redis = redis.createClient(this.port, this.host, this.opts);
  var self = this;
  this.redis.once('ready', cb);
};

GlobalChannelManager.prototype.stop = function(force, cb) {
  if(this.redis) {
    this.redis.end();
    this.redis = null;
  }
  utils.invokeCallback(cb);
};

GlobalChannelManager.prototype.destroyChannel = function(name, cb) {
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

GlobalChannelManager.prototype.add = function(name, uid, sid, cb) {
  this.redis.sadd(genKey(this, name, sid), uid, function(err) {
    utils.invokeCallback(cb, err);
  });
};

GlobalChannelManager.prototype.leave = function(name, uid, sid, cb) {
  this.redis.srem(genKey(this, name, sid), uid, function(err) {
    utils.invokeCallback(cb, err);
  });
};

GlobalChannelManager.prototype.getMembersBySid = function(name, sid, cb) {
  this.redis.smembers(genKey(this, name, sid), function(err, list) {
    utils.invokeCallback(cb, err, list);
  });
};

var genKey = function(self, name, sid) {
  return self.prefix + ':' + name + ':' + sid;
};
