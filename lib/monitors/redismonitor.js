'use strict';
var Redis = require('ioredis');
var commander = require('./common/cmd');
var constants = require('../util/constants');
var utils = require('../util/utils');
var logger = require('pomelo-logger').getLogger('pomelo', __filename);

var Monitor = function(app, opts) {
  if(!(this instanceof Monitor)) {
    return new Monitor(app, opts);
  }

  this.app = app;
  this.mode = opts.mode || 'single';
  this.name = opts.name || null;
  this.redisNodes = opts.redisNodes || [];
  this.period = opts.period || constants.TIME.DEFAULT_REDIS_REG;
  this.expire = opts.expire || constants.TIME.DEFAULT_REDIS_EXPIRE;
  this.password = opts.password || null;
  this.redisOpts = opts.redisOpts || {};
};

module.exports = Monitor;

Monitor.prototype.start = function(cb) {
  var self = this;
  if(this.mode === 'single') {
    this.client = new Redis(this.redisNodes.port, this.redisNodes.host, this.redisOpts);
  } else if(this.mode === 'sentinel') {
    this.client = new Redis({
      sentinels: this.redisNodes,
      name: this.name
    }, this.redisOpts);
  } else {
    this.client = new Redis.Cluster(this.redisNodes, this.redisOpts);
  }

  this.client.once('connect', function() {
    logger.info('%s connected to redis successfully !', self.app.serverId);
    if(self.password) {
      self.client.auth(self.password);
    }
    watcherCluster2Command.call(self);
    self.timer = setInterval(watcherCluster2Command.bind(self), self.period);
    utils.invokeCallback(cb);

  });

  this.client.on('error', function(err) {
    logger.error('redis err:', err);
  });
};

Monitor.prototype.stop = function() {
  this.client.end();
  clearInterval(this.timer);
};

Monitor.prototype.sendCommandResult = function(result, type) {
  var key;
  if(!type){
    //send result to redis, key:
    key = constants.RESERVED.REDIS_REG_RES_PREFIX + this.app.env + ':' + this.app.getCurServer().id;
  } else {
    //send show info to redis, key:
    key = constants.RESERVED.REDIS_REG_RES_PREFIX + this.app.env + ':' + this.app.getCurServer().id + ':' + type;
  }

  this.client.set(key, result, function(err){
    if(err){
      logger.error('set %j err: %j', key, err);
    }
  });
};

var watcherCluster2Command = function() {
  getClusterInfo(this, this.app, this.client, this.app.getCurServer());
  getCommand(this, this.app, this.client, this.app.getCurServer());
};

var getClusterInfo = function(self, app, redis, serverInfo) {
  var results = {};
  var key = constants.RESERVED.REDIS_REG_PREFIX + app.env;
  serverInfo.pid = process.pid;
  var args = [key, Date.now() + self.expire, JSON.stringify(serverInfo)];

  redis.zadd(args, function(err, res) {
    if(err) {
      logger.error('zadd %j err: %j', args, err);
      return;
    }

    var query_args = [key, Date.now(), '+inf'];
    redis.zrangebyscore(query_args, function(err, res) {
      if(err) {
        logger.error('zrangebyscore %j err: %j', query_args, err);
        return;
      }

      for (var i = res.length - 1; i >= 0; i--) {
        var server = JSON.parse(res[i]);
        results[server.id] = server;
      }

      logger.info('cluster servers info: %j',results);
      app.replaceServers(results);
    });
  });
};

var getCommand = function(self, app, redis, serverInfo) {
  var key = constants.RESERVED.REDIS_REG_PREFIX + app.env + ':' + serverInfo.id;
  redis.get(key, function(err, res) {
    if(err) {
      logger.error('get pomelo-regist cmd err %j', err);
      return;
    }

    if(res) {
      logger.debug('get cmd: ', res);
      redis.del(key, function(err) {
        if(err) {
          logger.error('del command err %j', err);
        }else {
          commander.init(self, res);
        }
      });
    }
  });
};