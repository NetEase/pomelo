'use strict'
var Etcd = require('node-etcd');
var logger = require('pomelo-logger').getLogger('pomelo', __filename);
var constants = require('../util/constants');
var path = require('path');
var utils = require('../util/utils');

var etcd = new Etcd();

var Monitor = function(app, opts) {
  if(!(this instanceof Monitor)) {
    return new Monitor(app, opts);
  }
  this.app = app;
  this.etcdNodes = opts.etcdNodes || [];
  this.period = opts.period || constants.TIME.DEFAULT_ETCD_PERIOD;
  this.expire = (opts.expire || 3 * this.period) / 1000;
  this.etcdPrefix = opts.prefix || "pomelo";
  this.etcdOpts = opts.etcdOpts || {};
  this.etcdPath = path.join('/', this.etcdPrefix, 'pomelo-servers');
  this.servers = {};
};

module.exports = Monitor;

function getServerId(key) {
  var id = key.split('/').pop();
  return id;
}

Monitor.prototype.start = function(cb) {
  this.client = new Etcd(this.etcdNodes);
  this.watcher = this.client.watcher(this.etcdPath, null, {recursive: true});
  this.watcher.on('set', this.addServer.bind(this));
  this.watcher.on('expire', this.removeServer.bind(this));
  this.watcher.on('reconnect', this.handleEtcdReconnect.bind(this))
  this.updateInfoTimer = setInterval(this.updateServerInfo.bind(this, true), this.period);
  this.syncServers();
  this.updateServerInfo(false);
  this.started = true;
  utils.invokeCallback(cb);
}

Monitor.prototype.handleEtcdReconnect = function(err) {
  logger.warn('lost connection and reconnected to etcd:', err)
}

Monitor.prototype.removeServer = function(serverInfo) {
  var id = getServerId(serverInfo.node.key);
  delete this.servers[id];
  logger.debug('server deleted', this.servers)
}

Monitor.prototype.addServer = function(serverInfo) {
  var info = serverInfo.node ? serverInfo.node : serverInfo;
  var id = getServerId(info.key)
  this.servers[id] = JSON.parse(info.value);
  this.app.replaceServers(this.servers);
  logger.debug('server added', this.servers)
}

Monitor.prototype.syncServers = function(cb) {
  var self = this;
  this.client.get(this.etcdPath, function(err, res){
    if(!err){
      var nodes = res.node.nodes;
      if (nodes) {
        logger.debug('successfully sync servers')
        var serversNow = {}
        nodes.map(function(serverInfo){
          var id = getServerId(serverInfo.key);
          if (!self.servers[id]) {
            self.addServer(serverInfo);
          }
          serversNow[id] = serverInfo
        })
      } else {
        logger.debug('no pomelo server got from etcd')
      }
    } else {
      logger.error('error getting server list from etcd:', err.message)
    }
  })
}

Monitor.prototype.updateServerInfo = function(refresh) {
  var p = path.join('/', this.etcdPath, this.app.getCurServer().id);
  // first time we set the server into etcd
  if(!refresh){
    this.client.set(p, 
      JSON.stringify(this.app.getCurServer()),
      {
        ttl: this.expire,
      }
    );
  } else {
    //this time we want to update the ttl but don't want to trigger wathchers to avoid unnecessary traffic
    this.client.set(p,
      JSON.stringify(this.app.getCurServer()),
      {
        prevExist: true,
        ttl: this.expire
      }
    )
  }
}
