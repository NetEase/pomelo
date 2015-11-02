'use strict';
var async = require('async');
var crypto = require('crypto');
var zookeeper = require('node-zookeeper-client');
var commander = require('./common/cmd');
var constants = require('../util/constants');
var utils = require('../util/utils');
var countDownLatch = require('../util/countDownLatch');
var logger = require('pomelo-logger').getLogger('pomelo', __filename);

var ZK_INIT = 0;
var ZK_CONNECTING = 1;
var ZK_CONNECTED = 2;
var ZK_CONNECT_FAIL = 3;
var ZK_RECONNECTING = 4;
var ZK_END = 5;

var Monitor = function(app, opts) {
  if (!(this instanceof Monitor)) {
    return new Monitor(app, opts);
  }

  var self = this;
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

  this.client = zookeeper.createClient(this.servers, {sessionTimeout: this.timeout, retries: this.retries, spinDelay: this.spinDelay});
};

module.exports = Monitor;

Monitor.prototype.start = function(cb) {
  logger.info('try to start monitor server');
  
  var self = this;
  self.cbTimer = setTimeout(function() {
    logger.info('connect to zookeeper timeout');
    self.state = ZK_CONNECT_FAIL;
    utils.invokeCallback(cb, new Error(self.app.serverId + ' cannot connect to zookeeper.'));
  }, constants.TIME.DEFAULT_ZK_CONNECT_TIMEOUT);

  this.client.once('connected', function() {
    logger.info('%s connect zookeeper successfully.', self.app.serverId);
    self.state = ZK_CONNECTED;
    self.client.addAuthInfo('digest', new Buffer(self.authentication));
    if(self.setACL) {
      self.client.setACL(self.path, self.acls, -1, function(err, stat) {
        if(!!err) {
          logger.error('failed to set ACL: %j', err.stack);
          clearTimeout(self.cbTimer);
          throw err;
        }
        clearTimeout(self.cbTimer);
        registerZK(self, function() {
          getAndWatchCluster(self);
          utils.invokeCallback(cb);
        });
        logger.info('ACL is set to: %j', self.acls);
      });
    } else {
      clearTimeout(self.cbTimer);
      registerZK(self, function() {
        getAndWatchCluster(self);
        utils.invokeCallback(cb);
      });
    }
  });

  disconnectHandle(self);

  self.state = ZK_CONNECTING;
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
    utils.invokeCallback(cb, null, data === null || data === undefined ? null: data.toString());
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

var createDefaultRoot = function(zk, path, cb) {
  console.error('!!! ' + path);
  zk.client.exists(path, function(err, stat) {
    if(!!err) {
      logger.error('zk check default root with error: %j', err);
      utils.invokeCallback(err);
    }
    if(!!stat) {
      utils.invokeCallback(cb);
    } else {
      createNode(zk.client, path, null, zookeeper.CreateMode.PERSISTENT, cb);
    }
  });
};

var registerZK = function(zk, cb) {

  var allInfo = {};

  allInfo.serverInfo = getServerInfo(zk);
  allInfo.connectionInfo = getConnectionInfo(zk);
  allInfo.loginInfo = allInfo.connectionInfo;
  allInfo.proxyInfo = getProxyInfo(zk);
  allInfo.handlerInfo = getHandlerInfo(zk);
  allInfo.settingInfo = getSettingInfo(zk);
  allInfo.componentInfo = getComponentInfo(zk);
  allInfo.statusInfo = getStatusInfo(zk);
  allInfo.moduleInfo = getModuleInfo(zk);

  var buffer = new Buffer(JSON.stringify(allInfo));

  async.series([
    function(callback) {
      createDefaultRoot(zk, zk.path, callback);
    },
    function(callback) {
      createAllNode(zk, buffer, zookeeper.CreateMode.EPHEMERAL, function(err) {
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

var getServerInfo = function(zk) {
  var serverInfo = zk.app.getCurServer();
  serverInfo.pid = process.pid;
  return serverInfo;
};

var getConnectionInfo = function(zk) {
  var connectionInfo = {};
  var connection = zk.app.components.__connection__;
  connectionInfo.serverId = zk.app.serverId;
  if (connection) {
    connectionInfo.body = connection.getStatisticsInfo();
    
  }
  connectionInfo.body = 'no connection';
  return connectionInfo;
};

var getProxyInfo = function(zk) {
  var proxyInfo = {};
  var __proxy__ = zk.app.components.__proxy__;
  if (__proxy__ && __proxy__.client && __proxy__.client.proxies.user) {
    var proxies = __proxy__.client.proxies.user;
    var server = zk.app.getServerById(zk.app.serverId);
    if (!server) {
      cb('no server with this id ' + zk.app.serverId);
    } else {
      var type = server['serverType'];
      var tmp = proxies[type];
      proxyInfo[type] = {};
      for (var _proxy in tmp) {
        var r = tmp[_proxy];
        proxyInfo[type][_proxy] = {};
        for (var _rpc in r) {
          if (typeof r[_rpc] === 'function') {
            proxyInfo[type][_proxy][_rpc] = 'function';
          }
        }
      }
    }
  } else {
    proxyInfo = 'no proxy loaded';
  }
  return proxyInfo;
};

var getHandlerInfo = function(zk) {
  var handlerInfo = {};
  var __server__ = zk.app.components.__server__;
  if (__server__ && __server__.server && __server__.server.handlerService.handlers) {
    var handles = __server__.server.handlerService.handlers;
    var server = zk.app.getServerById(zk.app.serverId);
    if (!server) {
      cb('no server with this id ' + zk.app.serverId);
    } else {
      var type = server['serverType'];
      var tmp = handles;
      handlerInfo[type] = {};
      for (var _p in tmp) {
        var r = tmp[_p];
        handlerInfo[type][_p] = {};
        for (var _r in r) {
          if (typeof r[_r] === 'function') {
            handlerInfo[type][_p][_r] = 'function';
          }
        }
      }
    }
  } else {
    handlerInfo = 'no handler loaded';
  }
  return handlerInfo;
};

var getComponentInfo = function(zk) {
    var _components = zk.app.components;
    var res = {};
    for (var key in _components) {
      var name = getComponentName(key);
      res[name] = clone(name, zk.app.get(name + 'Config'))
    }
    return res;
};

var getSettingInfo = function(zk) {
    var _settings = zk.app.settings;
    var res = {};
    for (var key in _settings) {
      if (key.match(/^__\w+__$/) || key.match(/\w+Config$/)) {
        continue;
      }
      if (!checkJSON(_settings[key])) {
        res[key] = 'Object';
        continue;
      }
      res[key] = _settings[key];
    }
    return res;
};

var getStatusInfo = function(zk) {
    var statusInfo = {};
    return statusInfo;
};

var getModuleInfo = function(zk) {
    var moduleInfo = {};
    return moduleInfo;
};

function clone(param, obj) {
  var result = {};
  var flag = 1;
  for (var key in obj) {
    if (typeof obj[key] === 'function' || typeof obj[key] === 'object') {
      continue;
    }
    flag = 0;
    result[key] = obj[key];
  }
  if (flag) {
    // return 'no ' + param + 'Config info';
  }
  return result;
};

function getComponentName(c) {
  var t = c.match(/^__(\w+)__$/);
  if (t) {
    t = t[1];
  }
  return t;
};

function checkJSON(obj) {
  if (!obj) {
    return true;
  }
  try {
    JSON.stringify(obj);
  } catch (e) {
    return false;
  }
  return true;
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
  if(event.type !== 3) {
    logger.debug('command event ignore.');
    return;
  }
  var self = this;
  getData(self, this.cmdPath, watchCommand.bind(self), function(err, data) {
    commander.init(self, data);
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

  var getServerInfo = function(index) {
    return  (function() {
      if(!utils.startsWith(servers[index], constants.RESERVED.ZK_NODE_COMMAND)) {
        getData(zk, zk.path + '/' + servers[index], null, function(err, data) {
          if(!!err) {
            logger.error('%s get data failed for server %s, with err: %j', app.serverId, servers[index], err.stack);
            latch.done();
            success = false;
            return;
          }
          var allInfo = JSON.parse(data);
          var serverInfo = allInfo.serverInfo;
          results[serverInfo.id] = serverInfo;
          latch.done();
        });
      } else {
        latch.done();
      }
    })();
  };

  for(var i = 0; i < servers.length; i++) {
    getServerInfo(i);
  }
};

var disconnectHandle = function(self) {
  self.client.on('disconnected', function() {
      logger.error('%s disconnect with zookeeper server.', self.app.serverId);
      if(!self.app.get(constants.RESERVED.STOP_FLAG)) {
        reconnect(self);
      } else {
        logger.info('%s is forcely stopped by pomelo commander.', self.app.serverId);
      }
  });
};

var reconnect = function(self) {
  if(self.state === ZK_CONNECTING || self.state === ZK_RECONNECTING) {
    logger.warn('zookeeper client is in invalid state.');
    return;
  }
  logger.info('%s server is reconnecting', self.app.serverId);
  self.state = ZK_RECONNECTING;
  var count = 0;
  var retry = true;
  var retries = self.reconnectTimes;
  async.whilst(
    function () {
      return count <= retries && retry;
    },
    function (next) {
      count += 1;
      logger.debug('%s server is try to connect to zookeeper', self.app.serverId);
      self.client.close();
      self.client = zookeeper.createClient(self.servers, {sessionTimeout: self.timeout, retries: 0, spinDelay: self.spinDelay});

      self.cbTimer = setTimeout(function() {
        logger.info('reconnect to zookeeper timeout');
        self.state = ZK_CONNECT_FAIL;
        utils.invokeCallback(next);
      }, constants.TIME.DEFAULT_ZK_CONNECT_TIMEOUT);

      self.client.once('connected', function() {
        logger.info('%s connect zookeeper successfully.', self.app.serverId);
        self.state = ZK_CONNECTED;
        self.client.addAuthInfo('digest', new Buffer(self.authentication));
        if(self.setACL) {
          self.client.setACL(self.path, self.acls, -1, function(err, stat) {
            if(!!err) {
              logger.error('failed to set ACL: %j', err.stack);
              clearTimeout(self.cbTimer);
              throw err;
            }
            clearTimeout(self.cbTimer);
            registerZK(self, function() {
              getAndWatchCluster(self);
              disconnectHandle(self);
              retry = false;
            });
            logger.info('ACL is set to: %j', self.acls);
          });
        } else {
          clearTimeout(self.cbTimer);
          registerZK(self, function() {
            getAndWatchCluster(self);
            disconnectHandle(self);
            retry = false;
          });
        }
      });

      self.state = ZK_RECONNECTING;
      self.client.connect();
    },
    function (err) {

    }
    );
};
