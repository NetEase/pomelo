var async = require('async');
var crypto = require('crypto');
var zookeeper = require('node-zookeeper-client');
var commander = require('./common/cmd');
var constants = require('../util/constants');
var utils = require('../util/utils');
var countDownLatch = require('../util/countDownLatch');
var CreateMode = zookeeper.CreateMode;
var logger = require('pomelo-logger').getLogger('pomelo', __filename);

var Monitor = function(app, opts) {
  if (!(this instanceof Monitor)) {
    return new Monitor(app, opts);
  }

  var self = this;
  this.app = app;
  this.path = opts.path || constants.RESERVED.DEFAULT_ROOT;
  this.username = opts.username || '';
  this.password = opts.password || '';
  this.timeout = opts.timeout || constants.TIME.DEFAULT_ZK_TIMEOUT;
  this.setACL = opts.setACL;
  this.retries = opts.retries || constants.RETRY.CONNECT_RETRY;
  this.spinDelay = opts.spinDelay || constants.TIME.DEFAULT_SPIN_DELAY;
  this.reconnectTimes = opts.reconnectTimes || constants.RETRY.RECONNECT_RETRY;
  this.nodePath = this.path + '/'  + app.serverType + constants.RESERVED.ZK_NODE_SEP + app.serverId;
  this.cmdPath = this.path + '/' + constants.RESERVED.ZK_NODE_COMMAND + app.serverId;
  this.authentication = this.username + ':' + this.password;

  var shaDigest = crypto.createHash('sha1').update(this.authentication).digest('base64');
  this.acls = [
  new zookeeper.ACL(
    zookeeper.Permission.ALL,
    new zookeeper.Id('digest', this.username + ':' + shaDigest)
    )
  ];

  this.client = zookeeper.createClient(opts.servers, {sessionTimeout: this.timeout, retries: this.retries, spinDelay: this.spinDelay});
};

module.exports = Monitor;

Monitor.prototype.start = function(cb) {
  var self = this;

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
        registerZK(self, function() {
          getAndWatchCluster(self);
          utils.invokeCallback(cb);
        });
        logger.info('ACL is set to: %j', self.acls);
      });
    } else {
      clearTimeout(cbTimer);
      registerZK(self, function() {
        getAndWatchCluster(self);
        utils.invokeCallback(cb);
      });
    }
  });

  this.client.on('disconnected', function() {
    logger.error('%s disconnect with zookeeper server.', self.app.serverId);
    if(!self.app.get(constants.RESERVED.STOP_FLAG)) {
      reconnect(self);
    } else {
      logger.info('%s is forcely stopped by pomelo commander.', self.app.serverId);
    }
  });

  this.client.connect();
};

Monitor.prototype.stop = function() {
  this.client.close();
};

var getData = function(zk, path, watcher, cb) {
  zk.client.getData(path, watcher, function(err, data) {
    if(!!err) {
      utils.invokeCallback(cb, err);
      return;
    }
    utils.invokeCallback(cb, null, data == null ? null: data.toString());
  });
};

var getAndWatchCluster = function(self) {
  logger.debug('watch server: %j, with path: %s', self.app.serverId, self.nodePath);
  getChildren(self, getAndWatchCluster.bind(null, self), function(err, children) {
    if(!!err) {
      logger.error('get children failed when watch server, with err: %j', err.stack);
      return;
    }
    logger.debug('cluster children: %j', children);
    getClusterInfo(self.app, self, children);
  });
};

var getChildren = function(zk, fun, cb) {
  zk.client.getChildren(zk.path, fun, function(err, children, stats) {
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
      getData(zk, zk.cmdPath, watchCommand.bind(zk), function(err, data) {
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
  getData(self, this.cmdPath, watchCommand.bind(self), function(err, data) {
    commander.init(self, event, data);
  });
};

var getClusterInfo = function(app, zk, servers) {
  var success = true;
  var results = {};
  if(!servers.length) {
    logger.error('get servers data is null.');
    return;
  }
  
  var latch = countDownLatch.createCountDownLatch(servers.length, {timeout: constants.TIME.TIME_WAIT_COUNTDOWN}, function() {
    if(!success) {
      logger.error('get all children data failed, with serverId: %s', app.serverId);
      return;
    }
    logger.info('cluster servers information: %j', results);
    app.replaceServers(results);
  });

  for(var i = 0; i < servers.length; i++) {
    (function(index) {
      if(!utils.startsWith(servers[index], constants.RESERVED.ZK_NODE_COMMAND)) {
        getData(zk, zk.path + '/' + servers[index], null, function(err, data) {
          if(!!err) {
            logger.error('%s get data failed for server %s, with err: %j', app.serverId, servers[index], err.stack);
            latch.done();
            success = false;
            return;
          }
          var serverInfo = JSON.parse(data);
          results[serverInfo.id] = serverInfo;
          latch.done();
        });
      } else {
        latch.done();
      }
    })(i);
  }
};

var reconnect = function(self) {
  logger.info('%s server is reconnecting', self.app.serverId);
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