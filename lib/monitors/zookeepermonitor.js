'use strict';

const crypto = require('crypto');

const async = require('async');
const zookeeper = require('node-zookeeper-client');

const commander = require('./common/cmd');
const constants = require('../util/constants');
const utils = require('../util/utils');
const countDownLatch = require('../util/countDownLatch');
const logger = require('pomelo-logger').getLogger('pomelo', __filename);

const ZK_INIT = 0;
const ZK_CONNECTING = 1;
const ZK_CONNECTED = 2;
const ZK_CONNECT_FAIL = 3;
const ZK_RECONNECTING = 4;

module.exports = Monitor;

function Monitor(app, opts) {
  if (!(this instanceof Monitor)) {
    return new Monitor(app, opts);
  }

  this.state = ZK_INIT;
  this.app = app;
  this.servers = opts.servers;
  this.path = opts.path || constants.RESERVED.DEFAULT_ROOT;
  this.username = opts.username || '';
  this.password = opts.password || '';
  this.timeout = opts.timeout || constants.TIME.DEFAULT_ZK_TIMEOUT;
  this.setACL = opts.setACL;
  this.retries = opts.retries || constants.RETRY.CONNECT_RETRY;
  this.spinDelay = opts.spinDelay || constants.TIME.DEFAULT_SPIN_DELAY;
  this.reconnectTimes = opts.reconnectTimes || constants.RETRY.RECONNECT_RETRY;

  this.nodePath = this.path + '/' + app.serverType +
    constants.RESERVED.ZK_NODE_SEP + app.serverId;

  this.cmdPath = this.path + '/' +
    constants.RESERVED.ZK_NODE_COMMAND + app.serverId;

  this.authentication = this.username + ':' + this.password;

  const shaDigest = crypto.createHash('sha1')
                          .update(this.authentication)
                          .digest('base64');

  const id = new zookeeper.Id('digest', this.username + ':' + shaDigest);
  this.acls = [new zookeeper.ACL(zookeeper.Permission.ALL, id)];

  this.client = zookeeper.createClient(this.servers, {
    sessionTimeout: this.timeout,
    retries: this.retries,
    spinDelay: this.spinDelay
  });
}

Monitor.prototype.start = function(cb) {
  logger.info('try to start monitor server');

  this.cbTimer = setTimeout(() => {
    logger.info('connect to zookeeper timeout');
    this.state = ZK_CONNECT_FAIL;
    const er = new Error(this.app.serverId + ' cannot connect to zookeeper.');
    utils.invokeCallback(cb, er);
  }, constants.TIME.DEFAULT_ZK_CONNECT_TIMEOUT);

  this.client.once('connected', () => {
    logger.info('%s connect zookeeper successfully.',
                this.app.serverId);

    this.state = ZK_CONNECTED;
    this.client.addAuthInfo('digest', new Buffer(this.authentication));

    if (this.setACL) {
      this.client.setACL(this.path, this.acls, -1, (err, stat) => {
        if (err) {
          logger.error('failed to set ACL: %j', err.stack);
          clearTimeout(this.cbTimer);
          throw err;
        }

        clearTimeout(this.cbTimer);
        _registerZK(this, () => {
          _getAndWatchCluster(this);
          utils.invokeCallback(cb);
        });
        logger.info('ACL is set to: %j', this.acls);
      });
    } else {
      clearTimeout(this.cbTimer);
      _registerZK(this, () => {
        _getAndWatchCluster(this);
        utils.invokeCallback(cb);
      });
    }
  });

  _disconnectHandle(this);

  this.state = ZK_CONNECTING;
  this.client.connect();
};

Monitor.prototype.stop = function() {
  this.client.close();
};

Monitor.prototype.sendCommandResult = function(result, type) {
  const buffer = new Buffer(result);
  this.client.setData(this.cmdPath, buffer, (err, stat) => {
    if (err) {
      logger.error('send result to zookeeper failed with err: ', err);
    }
  });
};

function _getData(zk, path, watcher, cb) {
  zk.client.getData(path, watcher, (err, data) => {
    if (err) {
      utils.invokeCallback(cb, err);
      return;
    }

    if (data === null || data === undefined) {
      data = null;
    } else {
      data = data.toString();
    }

    utils.invokeCallback(cb, null, data);
  });
}

function _getAndWatchCluster(mon) {
  logger.debug('watch server: %j, with path: %s',
               mon.app.serverId, mon.nodePath);

  _getChildren(mon, _getAndWatchCluster.bind(null, mon), (err, children) => {
    if (err) {
      logger.error('get children failed when watch server, with err: %j',
                   err.stack);
      return;
    }
    logger.debug('cluster children: %j', children);
    _getClusterInfo(mon.app, mon, children);
  });
}

function _getChildren(zk, fun, cb) {
  zk.client.getChildren(zk.path, fun, (err, children, stats) => {
    if (err) {
      utils.invokeCallback(cb, err);
      return;
    }
    utils.invokeCallback(cb, null, children);
  });
}

function _createDefaultRoot(zk, path, cb) {
  zk.client.exists(path, (err, stat) => {
    if (err) {
      logger.error('zk check default root with error: %j', err);
      utils.invokeCallback(err);
    }

    if (stat) {
      utils.invokeCallback(cb);
    } else {
      _createNode(zk.client, path, null, zookeeper.CreateMode.PERSISTENT, cb);
    }
  });
}

function _registerZK(zk, cb) {
  const allInfo = {};
  const serverInfo = zk.app.getCurServer();
  serverInfo.pid = process.pid;
  allInfo.serverInfo = serverInfo;

  const buffer = new Buffer(JSON.stringify(allInfo));

  async.series([
    (callback) => {
      _createDefaultRoot(zk, zk.path, callback);
    },
    (callback) => {
      _createAllNode(zk, buffer, zookeeper.CreateMode.EPHEMERAL, (err) => {
        if (err) {
          logger.error('create server node %s failed, with err : %j ',
                       zk.nodePath, err.stack);
          utils.invokeCallback(callback, err);
          return;
        }
        utils.invokeCallback(callback);
      });
    },
    (callback) => {
      _getData(zk, zk.cmdPath, _watchCommand.bind(zk), (err, data) => {
        logger.debug('cmd data: %j', data);
        utils.invokeCallback(callback);
      });
    }
  ], (err, rs) => {
    utils.invokeCallback(cb, err);
  });
}

function _createAllNode(zk, value, mode, cb) {
  async.series([
    (callback) => {
      logger.debug('ceate data path');
      _createNode(zk.client, zk.nodePath, value, mode, callback);
    },
    (callback) => {
      logger.debug('ceate command path');
      _createNode(zk.client, zk.cmdPath, null, mode, callback);
    }
  ], (err, rs) => {
    logger.debug('create all node with callback');
    utils.invokeCallback(cb, err);
  });
}

function _createNode(client, path, value, mode, cb) {
  logger.debug('create node with path: %s', path);
  client.create(path, value, mode, (err, result) => {
    logger.debug('create node with result: %s', result);
    utils.invokeCallback(cb, err);
  });
}

function _watchCommand(event) {
  // FIXME: magic number 3
  if (event.type !== 3) {
    logger.debug('command event ignore.');
    return;
  }
  _getData(this, this.cmdPath, _watchCommand.bind(this), (err, data) => {
    commander.init(this, data);
  });
}

function _getClusterInfo(app, zk, servers) {
  let success = true;
  const results = {};
  if (!servers.length) {
    logger.error('get servers data is null.');
    return;
  }

  const latch = countDownLatch.createCountDownLatch(servers.length, {
    timeout: constants.TIME.TIME_WAIT_COUNTDOWN
  }, () => {
    if (!success) {
      logger.error('get all children data failed, with serverId: %s',
                   app.serverId);
      return;
    }

    logger.info('cluster servers information: %j', results);
    app.replaceServers(results);
  });

  const getServerInfo = function(index) {
    if (!utils.startsWith(servers[index],
                          constants.RESERVED.ZK_NODE_COMMAND)) {
      _getData(zk, zk.path + '/' + servers[index], null, (err, data) => {
        if (err) {
          logger.error('%s get data failed for server %s, with err: %j',
                       app.serverId, servers[index], err.stack);

          latch.done();
          success = false;
          return;
        }
        const allInfo = JSON.parse(data);
        const serverInfo = allInfo.serverInfo;
        results[serverInfo.serverId] = serverInfo;
        latch.done();
      });
    } else {
      latch.done();
    }
  };

  for (let i = 0; i < servers.length; i++) {
    getServerInfo(i);
  }
}

function _disconnectHandle(mon) {
  mon.client.on('disconnected', () => {
    logger.error('%s disconnect with zookeeper server.',
                 mon.app.serverId);

    if (!mon.app.get(constants.RESERVED.STOP_FLAG)) {
      _reconnect(mon);
    } else {
      logger.info('%s is forcely stopped by pomelo commander.',
                  mon.app.serverId);
    }
  });
}

function _reconnect(mon) {
  if (mon.state === ZK_CONNECTING || mon.state === ZK_RECONNECTING) {
    logger.warn('zookeeper client is in invalid state.');
    return;
  }

  logger.info('%s server is reconnecting', mon.app.serverId);
  mon.state = ZK_RECONNECTING;

  let count = 0;
  let retry = true;
  const retries = mon.reconnectTimes;

  async.whilst(() => { // test
    return count <= retries && retry;
  }, (next) => { // fn
    count++;
    logger.debug('%s server is try to connect to zookeeper',
                 mon.app.serverId);
    mon.client.close();
    mon.client = zookeeper.createClient(mon.servers, {
      sessionTimeout: mon.timeout,
      retries: 0,
      spinDelay: mon.spinDelay
    });

    mon.cbTimer = setTimeout(() => {
      logger.info('reconnect to zookeeper timeout');
      mon.state = ZK_CONNECT_FAIL;
      utils.invokeCallback(next);
    }, constants.TIME.DEFAULT_ZK_CONNECT_TIMEOUT);

    mon.client.once('connected', () => {
      logger.info('%s connect zookeeper successfully.', mon.app.serverId);

      mon.state = ZK_CONNECTED;
      mon.client.addAuthInfo('digest', new Buffer(mon.authentication));

      if (mon.setACL) {
        mon.client.setACL(mon.path, mon.acls, -1, (err, stat) => {
          if (err) {
            logger.error('failed to set ACL: %j', err.stack);
            clearTimeout(err.cbTimer);
            throw err;
          }

          clearTimeout(mon.cbTimer);

          _registerZK(mon, () => {
            _getAndWatchCluster(mon);
            _disconnectHandle(mon);
            retry = false;
          });
          logger.info('ACL is set to: %j', mon.acls);
        });
      } else {
        clearTimeout(mon.cbTimer);
        _registerZK(mon, () => {
          _getAndWatchCluster(mon);
          _disconnectHandle(mon);
          retry = false;
        });
      }
    });
    mon.state = ZK_RECONNECTING;
    mon.client.connect();
  }, (err) => { // callback

  });
}
