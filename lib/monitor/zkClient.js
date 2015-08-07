var async = require('async');
var crypto = require('crypto');
var zookeeper = require('node-zookeeper-client');
var commander = require('./cmd');
var constants = require('../util/constants');
var utils = require('../util/utils');
var CreateMode = zookeeper.CreateMode;
var logger = require('pomelo-logger').getLogger('pomelo', __filename);

function ZKClient(app, cb) {
  var self = this;

  this.app = app;
  zkConfig = app.zookeeper;
  this.path = zkConfig.path || constants.RESERVED.DEFAULT_ROOT;
  this.username = zkConfig.username || '';
  this.password = zkConfig.password || '';
  this.timeout = zkConfig.timeout || constants.TIME.DEFAULT_ZK_TIMEOUT;
  this.setACL = zkConfig.setACL;
  this.retries = zkConfig.retries || constants.RETRY.CONNECT_RETRY;
  this.spinDelay = zkConfig.spinDelay || constants.TIME.DEFAULT_SPIN_DELAY;
  this.reconnectTimes = zkConfig.reconnectTimes || constants.RETRY.RECONNECT_RETRY;
  this.nodePath = this.path + '/info::' + app.serverId;
  this.cmdPath = this.path + '/cmd::' + app.serverId;
  this.authentication = this.username + ':' + this.password;

  var shaDigest = crypto.createHash('sha1').update(this.authentication).digest('base64');
  this.acls = [
  new zookeeper.ACL(
    zookeeper.Permission.ALL,
    new zookeeper.Id('digest', this.username + ':' + shaDigest)
    )
  ];

  this.client = zookeeper.createClient(zkConfig.servers, {sessionTimeout: this.timeout, retries: this.retries, spinDelay: this.spinDelay});

  var cbTimer = setTimeout(function() {
    utils.invokeCallback(cb, new Error(self.app.serverId + ' cannot connect to zookeeper.'));
  }, constants.TIME.DEFAULT_ZK_CONNECT_TIMEOUT);

  this.client.once('connected', function() {
    logger.info('%s connect zookeeper successfully.', self.app.serverId);
    self.client.addAuthInfo('digest', new Buffer(self.authentication));
    if(self.setACL) {
      self.client.setACL(self.path, self.acls, -1, function(err, stat) {
        if(!!err) {
          logger.error('failed to set ACL: %j', err.stack);
          clearTimeout(cbTimer);
          throw err;
        }
        clearTimeout(cbTimer);
        registerZK(self, cb);
        logger.info('ACL is set to: %j', self.acls);
      });
    } else {
      clearTimeout(cbTimer);
      registerZK(self, cb);
    }
  });

  this.client.on('disconnected', function() {
    logger.error('%s disconnect with zookeeper server.', self.app.serverId);
    reconnect(self);
  });

  this.client.connect();
};

module.exports = ZKClient;

ZKClient.prototype.close = function() {
  this.client.close();
};

ZKClient.prototype.getData = function(path, watcher, cb) {
  this.client.getData(path, watcher, function(err, data) {
    if(!!err) {
      utils.invokeCallback(cb, err);
      return;
    }
    utils.invokeCallback(cb, null, data == null ? null: data.toString());
  });
};

ZKClient.prototype.getChildren = function(fun, cb) {
  var self = this;
  this.client.getChildren(this.path, fun, function(err, children, stats) {
    if(!!err) {
      utils.invokeCallback(cb, err);
      return;
    }
    utils.invokeCallback(cb, null, children);
  });
};

var registerZK = function(zk, cb) {
  var serverInfo = zk.app.getCurServer();
  serverInfo.pid = process.pid;
  var buffer = new Buffer(JSON.stringify(serverInfo));

  async.series([
    function(callback) {
      createAllNode(zk, buffer, CreateMode.EPHEMERAL, function(err) {
        if(!!err) {
          logger.error('create server node %s failed, with err : %j ', zk.nodePath, err.stack);
          utils.invokeCallback(callback, err);
          return;
        }
        utils.invokeCallback(callback);
      });
    },
    function(callback) {
      zk.getData(zk.cmdPath, watchCommand.bind(zk), function(err, data) {
        logger.debug('cmd data: %j', data);
        utils.invokeCallback(callback);
      });
    }
    ],
    function(err, rs) {
      utils.invokeCallback(cb, err);
    });
};

var createAllNode = function(zk, value, mode, cb) {
  async.series([
    function(callback) {
      logger.debug('ceate data path');
      createNode(zk.client, zk.nodePath, value, mode, callback);
    },
    function(callback) {
      logger.debug('ceate command path');
      createNode(zk.client, zk.cmdPath, null, mode, callback);
    }
    ],
  function(err, rs) {
    logger.debug('create all node with callback');
    utils.invokeCallback(cb, err);
  });
};

var createNode = function(client, path, value, mode, cb) {
  logger.debug('create node with path: %s', path);
  client.create(path, value, mode, function(err, result) {
    logger.debug('create node with result: %s', result);
    utils.invokeCallback(cb, err);
  });
};

var watchCommand = function(event) {
  var self = this;
  this.getData(this.cmdPath, watchCommand.bind(self), function(err, data) {
    commander.init(self, event, data);
  });
};

var reconnect = function(self) {
  var self = this;
  var count = 0;
  var retry = true;
  var retries = this.reconnectTimes;
  async.whilst(
    function () {
      return count <= retries && retry;
    },
    function (next) {
      count += 1;
      self.connectZK(function(err) {
        if(!!err) {
          logger.error(self.app.serverId + ' reconnect fail with count: %s.' + count);
          setTimeout(
            next,
            count * 1000 * 5
            );
        } else {
          self.registerZK(function(err) {
            if(!!err) {
              logger.error(self.app.serverId + ' registerZK fail with count: %s.' + count);
              setTimeout(
                next,
                count * 1000 * 5
                );
            } else {
              retry = false;
            }
          });
        }
      });
    },
    function (error) {

    }
    );
};