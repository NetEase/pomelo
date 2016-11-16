'use strict';
var Redis = require('ioredis');
var commander = require('./common/cmd');
var constants = require('../util/constants');
var utils = require('../util/utils');
var logger = require('pomelo-logger').getLogger('pomelo', __filename);
var redisMonitor = require('redis');

var Monitor = function(app, opts) {
  if(!(this instanceof Monitor)) {
    return new Monitor(app, opts);
  }

  this.app = app;
  this.mode = opts.mode || 'single';
  this.name = opts.name || null;
  this.redisNodes = opts.redisNodes || [];
  this.period = opts.period || constants.TIME.DEFAULT_REDIS_REG;
  this.updateInfoPeriod = opts.updateInfoPeriod || constants.TIME.DEFAULT_REDIS_REG_UPDATE_INFO;
  this.updateInfoExpire = opts.updateInfoExpire || 3.0*constants.TIME.DEFAULT_REDIS_REG_UPDATE_INFO;
  this.maxServerInfoBatch = opts.maxServerInfoBatch;
  this.expire = opts.expire || constants.TIME.DEFAULT_REDIS_EXPIRE;
  this.password = opts.password || null;
  this.redisOpts = opts.redisOpts || {};
  this.lastResults = {}
};

module.exports = Monitor;

Monitor.prototype.start = function(cb) {
  var self = this;
  self.started = false;
  if(this.mode === 'single') {
    this.client = new Redis(this.redisNodes.port, this.redisNodes.host, this.redisOpts);
  } else {
    this.client = new Redis({
      sentinels: this.redisNodes.hosts,
      password: this.password,
      name: this.name
    }, this.redisOpts);
  }

  this.client.on('connect', function() {
    logger.info('%s connected to redis successfully !', self.app.serverId);
    if(self.password) {
      self.client.auth(self.password);
    }
    // Initial registration and fetch other servers
    watcherUpdateServerInfo.call(self);
    watcherCluster2Command.call(self);

    if(self.mode === 'multiple') {
      clearPingTimer(self, function() {
        getMaster(self, self.redisNodes);
      });
    }

    if(!self.started) {
      self.started = true;
      self.updateInfoTimer = setInterval(watcherUpdateServerInfo.bind(self), self.updateInfoPeriod);
      self.timer = setInterval(watcherCluster2Command.bind(self), self.period);
      utils.invokeCallback(cb);
    }
  });

  this.client.on('error', function(error) {
      logger.error("[redisMonitor] server has errors with redis server, with error: %j", error);
  });

  this.client.on('close', function() {
    logger.error("[redisMonitor] server has been closed with redis server.");
  });

  this.client.on('end', function() {
     logger.error("[redisMonitor] server is over and without reconnection.");
  });
};

Monitor.prototype.stop = function() {
  this.client.end();
  if (!!this.pingRedis) {
    this.pingRedis.end();
  }
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

var watcherUpdateServerInfo = function() {
  updateServerInfo(this, this.app, this.client, this.app.getCurServer());
};

var watcherCluster2Command = function() {
  getClusterInfo(this, this.app, this.client, this.app.getCurServer());
  getCommand(this, this.app, this.client, this.app.getCurServer());
};

var getClusterInfo = function(self, app, redis, serverInfo) {
  var results = {};
  var key = constants.RESERVED.REDIS_REG_PREFIX + app.env;
  serverInfo.pid = process.pid;
  var args = [key, Date.now() + self.expire, serverInfo.id];

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
      var missingServersKeys = [];
      for (var i = res.length - 1; i >= 0; i--) {
        // fetch any missing server
        var serverId = res[i];
        var lastServerInfo = self.lastResults[serverId]
        if (lastServerInfo) {
          results[serverId] = lastServerInfo;
        }
        else {
          missingServersKeys.push(constants.RESERVED.REDIS_REG_SERVER_PREFIX + app.env + ":" +serverId);
        }
      }
      if (missingServersKeys.length > 0) {
        // fetch missing servers info first
        if (self.maxServerInfoBatch) {
          missingServersKeys = missingServersKeys.slice(0, self.maxServerInfoBatch);
        }
        redis.mget(missingServersKeys, function(err, res) {
          if(err) {
            logger.error('mget %j err: %j', query_args, err);
            return;
          }
          for (var i = res.length - 1; i >= 0; i--) {
            if (res[i]) {
              var server = JSON.parse(res[i]);
              results[server.id] = server;
            }
          }
          logger.debug('cluster servers info: %j',results);
          self.lastResults = results;
          app.replaceServers(results);
        });
      }
      else {
        logger.debug('cluster servers info: %j',results);
        self.lastResults = results;
        app.replaceServers(results);
      }
    });
  });
};

var updateServerInfo = function(self, app, redis, serverInfo) {
  var key = constants.RESERVED.REDIS_REG_SERVER_PREFIX + app.env + ":" +serverInfo.id;
  serverInfo.pid = process.pid;
  var args = [key, self.updateInfoExpire, JSON.stringify(serverInfo)];
  redis.setex(args, function(err, res) {
    if(err) {
      logger.error('setex %j err: %j', args, err);
      return;
    }
    logger.debug('updated server info');
  });
}

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

var getMaster = function(self, redisNodes) {
  logger.info("[redisMonitor] get master");
  var redis = self.client;
  var clients = redisNodes.redis;
  for(var i=0; i<clients.length; i++) {
    (function(index) {
      logger.info("[redisMonitor] get master with index: %s, port: %s, host: %s", index, clients[index].port, clients[index].host);
      var client = redisMonitor.createClient(clients[index].port, clients[index].host, {auth_pass: redisNodes.password});
      client.on('connect', function() {
        logger.info("[redisMonitor] connect redis host: %s port: %s successfully.", clients[index].host, clients[index].port);
        client.info('replication', function(err, info) {
          if (!!err) {
            logger.error("[redisMonitor] get redis info error with host: %s port: %s", clients[index].host, clients[index].port);
          }
          var obj = {};
          var lines = info.toString().split("\r\n");
          lines.forEach(function(line) {
            var parts = line.split(':');
            if (parts[1]) {
              obj[parts[0]] = parts[1];
            }
          });
          if(obj.role == 'master') {
            self.pingRedis = client;
            self.pingtimer = setInterval(function() {
              logger.info("[redisMonitor] ping redis with host: %s port: %s", clients[index].host, clients[index].port);
              ping(self, client, redis);
            }, constants.TIME.DEFAULT_REDIS_PING);
          } else {
            client.end();
            client = null;
          }
        });
      });
      client.on('error', function() {
        logger.error('[redisMonitor] monitor redis connect error');
        client.end();
        client = null;
      });
    })(i);
  }
};

var ping = function(self, client, rds) {
  var timeout = setTimeout(function() {
    logger.error('[redisMonitor] ping redis timeout');
    clearInterval(self.pingtimer);
    if(self.pingtimer) {
      logger.info('[redisMonitor] clear pingtimer timeout');
      client.end();
      client = null;
      self.pingtimer = null;
      rds.end();
      rds = null;
      self.start(function() {});
    }
  }, constants.TIME.DEFAULT_REDIS_PING_TIMEOUT);
  client.ping(function(err) {
    clearTimeout(timeout);
    if (!!err) {
      logger.error('[redisMonitor] redis ping error');
    }
    logger.info('[redisMonitor] ping');
  });
};

var clearPingTimer = function(self, cb) {
  logger.info('[redisMonitor] clear ping timer');
  clearInterval(self.pingtimer);
  var client = self.pingRedis;
  if(!!client) {
    client.end();
    client = null;
    self.pingtimer = null;
  }
  utils.invokeCallback(cb);
};
