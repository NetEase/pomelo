/**
 * Component for proxy.
 * Generate proxies for rpc client.
 */
var Client = require('pomelo-rpc').client;
var pathUtil = require('../util/pathUtil');
var crc = require('crc');
var events = require('../util/events');

/**
 * Component factory function
 *
 * @param {Object} app  current application context
 * @param {Object} opts construct parameters
 *                      opts.router: (optional) rpc message route function, route(routeParam, msg, cb),
 *                      opts.mailBoxFactory: (optional) mail box factory instance.
 * @return {Object}     component instance
 */
module.exports = function(app, opts) {
  opts = opts || {};
  // proxy default config
  opts.cacheMsg = opts.cacheMsg||false;
  opts.interval = opts.interval || 30;
  opts.router = genRouteFun();
  opts.context = app;
  opts.routeContext = app;

  return new Proxy(app, opts);
};

/**
 * Proxy component class
 *
 * @param {Object} app  current application context
 * @param {Object} opts construct parameters
 */
var Proxy = function(app, opts) {
  this.client = null;
  this.app = app;
  this.opts = opts;
  this.client = genRpcClient(this.app, opts);

  this.app.event.on(events.ADD_SERVERS, this.addServers.bind(this));
  this.app.event.on(events.REMOVE_SERVERS, this.removeServers.bind(this));
};

var pro = Proxy.prototype;

/**
 * Proxy component lifecycle function
 *
 * @param {Function} cb
 * @return {Void}
 */
pro.start = function(cb) {
  if(this.opts.enableRpcLog) {
    this.client.filter(require('../filters/rpc/rpcLog'));
  }
  process.nextTick(cb);
};

/**
 * Component lifecycle callback
 *
 * @param {Function} cb
 * @return {Void}
 */
pro.afterStart = function(cb) {
  var self = this;
  this.app.__defineGetter__('rpc', function() {
    return self.client.proxies.user;
  });
  this.app.__defineGetter__('sysrpc', function() {
    return self.client.proxies.sys;
  });
  this.app.set('rpcInvoke', this.client.rpcInvoke.bind(this.client), true);
  this.client.start(cb);
};

/**
 * Add remote server to the rpc client.
 *
 * @param {Array} servers server info list, {id, serverType, host, port}
 */
pro.addServers = function(servers) {
  if(!servers || !servers.length) {
    return;
  }

  genProxies(this.client, this.app, servers);
  this.client.addServers(servers);
};

/**
 * Remote remote server from the rpc client.
 *
 * @param  {Array} ids server id list
 */
pro.removeServers = function(ids) {
  this.client.removeServers(ids);
};

/**
 * Proxy for rpc client rpcInvoke.
 *
 * @param {String}   serverId remote server id
 * @param {Object}   msg      rpc message: {serverType: serverType, service: serviceName, method: methodName, args: arguments}
 * @param {Function} cb      callback function
 */
pro.rpcInvoke = function(serverId, msg, cb) {
  this.client.rpcInvoke(serverId, msg, cb);
};

/**
 * Generate rpc client
 *
 * @param {Object} app current application context
 * @param {Object} opts contructor parameters for rpc client
 * @return {Object} rpc client
 */
var genRpcClient = function(app, opts) {
  opts.context = app;
  opts.routeContext = app;
  return Client.create(opts);
};

/**
 * Generate proxy for the server infos.
 *
 * @param  {Object} client rpc client instance
 * @param  {Object} app    application context
 * @param  {Array} sinfos server info list
 */
var genProxies = function(client, app, sinfos) {
  var item;
  for(var i=0, l=sinfos.length; i<l; i++) {
    item = sinfos[i];
    if(hasProxy(client, item)) {
      continue;
    }
    client.addProxies(getProxyRecords(app, item));
  }
};

/**
 * Check a server whether has generated proxy before
 *
 * @param  {Object}  client rpc client instance
 * @param  {Object}  sinfo  server info
 * @return {Boolean}        true or false
 */
var hasProxy = function(client, sinfo) {
  var proxy = client.proxies;
  return !!proxy.sys && !!proxy.sys[sinfo.serverType];
};

/**
 * Get proxy path for rpc client.
 * Iterate all the remote service path and create remote path record.
 *
 * @param {Object} app current application context
 * @param {Object} sinfo server info, format: {id, serverType, host, port}
 * @return {Array}     remote path record array
 */
var getProxyRecords = function(app, sinfo) {
  var records = [], appBase = app.getBase(), record;
  // sys remote service path record
  if(app.isFrontend(sinfo)) {
    record = pathUtil.getSysRemotePath('frontend');
  } else {
    record = pathUtil.getSysRemotePath('backend');
  }
  if(record) {
    records.push(pathUtil.remotePathRecord('sys', sinfo.serverType, record));
  }

  // user remote service path record
  record = pathUtil.getUserRemotePath(appBase, sinfo.serverType);
  if(record) {
    records.push(pathUtil.remotePathRecord('user', sinfo.serverType, record));
  }

  return records;
};

var genRouteFun = function() {
  return function(session, msg, app, cb) {
    var routes = app.get('__routes__');

    if(!routes) {
      defaultRoute(session, msg, app, cb);
      return;
    }

    var type = msg.serverType, route = routes[type] || routes['default'];

    if(route) {
      route(session, msg, app, cb);
    } else {
      defaultRoute(session, msg, app, cb);
    }
  };
};

var defaultRoute = function(session, msg, app, cb) {
  var list = app.getServersByType(msg.serverType);
  if(!list) {
    cb(new Error('can not find server info for type:' + msg.serverType));
    return;
  }

  var uid = session ? (session.uid || '') : '';
  var index = Math.abs(crc.crc32(uid)) % list.length;
  cb(null, list[index].id);
};