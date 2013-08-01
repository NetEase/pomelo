var utils = require('../../util/utils');
var redis = require('redis');

var DEFAULT_PREFIX = 'POMELO:STATUS';

var StatusManager = function(app, opts) {
  this.app = app;
  this.opts = opts || {};
  this.prefix = opts.prefix || DEFAULT_PREFIX;
  this.host = opts.host;
  this.port = opts.port;
  this.redis = null;
};

module.exports = StatusManager;

StatusManager.prototype.start = function(cb) {
	this.redis = redis.createClient(this.port, this.host, this.opts);
  var self = this;
  this.redis.once('ready', cb);
};

StatusManager.prototype.stop = function(cb) {
  if(this.redis) {
    this.redis.end();
    this.redis = null;
  }
  utils.invokeCallback(cb);
};

StatusManager.prototype.add = function(uid, sid ,cb) {
 	this.redis.sadd(genKey(this, uid), sid, function(err) {
    utils.invokeCallback(cb, err);
  });
};

StatusManager.prototype.leave = function(uid, sid, cb) {
	this.redis.srem(genKey(this, uid), sid, function(err) {
    utils.invokeCallback(cb, err);
  });
};

StatusManager.prototype.getSidsByUid = function(uid, cb) {
  this.redis.smembers(genKey(this, uid), function(err, list) {
    utils.invokeCallback(cb, err, list);
  });
};

var genKey = function(self, uid) {
  return self.prefix + ':' + uid;
};
