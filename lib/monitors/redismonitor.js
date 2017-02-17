'use strict';

const Redis = require('ioredis');
const redisMonitor = require('redis');

const commander = require('./common/cmd');
const constants = require('../util/constants');
const utils = require('../util/utils');
const logger = require('pomelo-logger').getLogger('pomelo', __filename);

module.exports = Monitor;

function Monitor(app, opts) {
  if (!(this instanceof Monitor)) {
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
}

Monitor.prototype.start = function(cb) {
  this.started = false;
  if (this.mode === 'single') {
    this.client = new Redis(this.redisNodes.port,
                            this.redisNodes.host, this.redisOpts);
  } else {
    this.client = new Redis({
      sentinels: this.redisNodes.hosts,
      password: this.password,
      name: this.name
    }, this.redisOpts);
  }

  this.client.on('connect', () => {
    logger.info('%s connected to redis successfully !', this.app.serverId);
    if (this.password) {
      this.client.auth(this.password);
    }
    _watcherCluster2Command.call(this);

    if (this.mode === 'multiple') {
      _clearPingTimer(this, () => {
        _getMaster(this, this.redisNodes);
      });
    }

    if (!this.started) {
      this.started = true;
      this.timer = setInterval(_watcherCluster2Command.bind(this),
                               this.period);
      utils.invokeCallback(cb);
    }
  });

  this.client.on('error', function(error) {
    logger.error('[redisMonitor] server has errors with redis server, ' +
                 'with error: %j', error);
  });

  this.client.on('close', function() {
    logger.error('[redisMonitor] server has been closed with redis server.');
  });

  this.client.on('end', function() {
    logger.error('[redisMonitor] server is over and without reconnection.');
  });
};

Monitor.prototype.stop = function() {
  this.client.end();

  if (this.pingRedis) {
    this.pingRedis.end();
  }
  clearInterval(this.timer);
};

Monitor.prototype.sendCommandResult = function(result, type) {
  let key;
  if (!type) {
    // send result to redis, key:
    key = constants.RESERVED.REDIS_REG_RES_PREFIX +
      this.app.env + ':' +
      this.app.getCurServer().id;

  } else {
    //send show info to redis, key:
    key = constants.RESERVED.REDIS_REG_RES_PREFIX +
      this.app.env + ':' +
      this.app.getCurServer().id + ':' + type;
  }

  this.client.set(key, result, (err) => {
    if (err) {
      logger.error('set %j err: %j', key, err);
    }
  });
};

function _watcherCluster2Command() {
  _getClusterInfo(this, this.app, this.client, this.app.getCurServer());
  _getCommand(this, this.app, this.client, this.app.getCurServer());
}

function _getClusterInfo(mon, app, redis, serverInfo) {
  const results = {};
  const key = constants.RESERVED.REDIS_REG_PREFIX + app.env;
  serverInfo.pid = process.pid;
  const args = [key, Date.now() + mon.expire, JSON.stringify(serverInfo)];

  redis.zadd(args, (err, res) => {
    if (err) {
      logger.error('zadd %j err: %j', args, err);
      return;
    }

    const queryArgs = [key, Date.now(), '+inf'];
    redis.zrangebyscore(queryArgs, (err, res) => {
      if (err) {
        logger.error('zrangebyscore %j err: %j', queryArgs, err);
        return;
      }

      let i;
      let server;
      for (i = res.length - 1; i >= 0; i--) {
        server = JSON.parse(res[i]);
        results[server.id] = server;
      }

      logger.info('cluster servers info: %j', results);
      app.replaceServers(results);
    });
  });
}

function _getCommand(mon, app, redis, serverInfo) {
  const key = constants.RESERVED.REDIS_REG_PREFIX +
    app.env + ':' + serverInfo.id;

  redis.get(key, (err, res) => {
    if (err) {
      logger.error('get pomelo-register cmd err %j', err);
      return;
    }

    if (res) {
      logger.debug('get cmd: ', res);
      redis.del(key, function(err) {
        if (err) {
          logger.error('del command err %j', err);
        } else {
          commander.init(mon, res);
        }
      });
    }
  });
}

function _getMaster(mon, redisNodes) {
  logger.info('[redisMonitor] get master');
  const redis = mon.client;
  const clients = redisNodes.redis;

  // NOTE: use `let i` as loop variable here.
  // i inside loop will be independent
  for (let i = 0; i < clients.length; i++) {
    logger.info('[redisMonitor] get master index: %s, port: %s, host: %s',
                i, clients[i].port, clients[i].host);
    let client = redisMonitor.createClient(clients[i].port,
                                           clients[i].host,
                                           {auth_pass: redisNodes.password});
    client.on('connect', () => {
      logger.info('[redisMonitor] connect redis host: %s port: %s ok.',
                  clients[i].host, clients[i].port);

      client.info('replication', (err, info) => {
        if (err) {
          logger.error('[redisMonitor] get redis info error ' +
                       'with host: %s port: %s',
                       clients[i].host,
                       clients[i].port);
        }

        const obj = {};
        const lines = info.toString().split('\r\n');
        let parts;
        lines.forEach((line) => {
          parts = line.split(':');
          if (parts[1]) {
            obj[parts[0]] = parts[1];
          }
        });

        if (obj.role === 'master') {
          mon.pingRedis = client;
          mon.pingtimer = setInterval(() => {
            logger.info('[redisMonitor] ping redis with host: %s port: %s',
                        clients[i].host, clients[i].port);

            _ping(mon, client, redis);
          }, constants.TIME.DEFAULT_REDIS_PING);
        } else {
          client.end();
          client = null;
        }
      });
    });

    client.on('error', () => {
      logger.error('[redisMonitor] monitor redis connect error');
      client.end();
      client = null;
    });
  } // end of for
}

function _ping(mon, client, rds) {
  const timeout = setTimeout(() => {
    logger.error('[redisMonitor] ping redis timeout');
    clearInterval(mon.pingtimer);

    if (mon.pingtimer) {
      logger.info('[redisMonitor] clear pingtimer timeout');
      client.end();
      client = null;
      mon.pingtimer = null;
      rds.end();
      rds = null;
      mon.start(() => {});
    }
  }, constants.TIME.DEFAULT_REDIS_PING_TIMEOUT);

  client.ping((err) => {
    clearTimeout(timeout);
    if (err) {
      logger.error('[redisMonitor] redis ping error');
    }
    logger.info('[redisMonitor] ping');
  });
}

function _clearPingTimer(mon, cb) {
  logger.info('[redisMonitor] clear ping timer');
  clearInterval(mon.pingtimer);
  let client = mon.pingRedis;
  if (client) {
    client.end();
    client = null;
    mon.pingtimer = null;
  }
  utils.invokeCallback(cb);
}
