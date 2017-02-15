'use strict';

const crc = require('crc');

const utils = require('../util/utils');
const events = require('../util/events');
const Client = require('pomelo-rpc').client;
const pathUtil = require('../util/pathUtil');
const Constants = require('../util/constants');
const logger = require('pomelo-logger').getLogger('pomelo', __filename);

module.exports = Component;

/**
 * Component factory function
 *
 * @param {Object} app  current application context
 * @param {Object} opts construct parameters
 *                      opts.router: (optional) rpc message route function,
 *                      route(routeParam, msg, cb),
 *
 *                      opts.mailBoxFactory: (optional) mail box
 *                                          factory instance.
 * @return {Object}     component instance
 */

/**
 * Proxy component class
 *
 * @param {Object} app  current application context
 * @param {Object} opts construct parameters
 */
function Component(app, opts) {
  if (!(this instanceof Component)) {
    return new Component(app, opts);
  }

  opts = opts || {};
  // proxy default config
  // cacheMsg is deprecated, just for compatibility here.
  opts.bufferMsg = opts.bufferMsg || opts.cacheMsg || false;
  opts.interval = opts.interval || 30;
  opts.router = _genRouteFun();
  opts.context = app;
  opts.routeContext = app;

  if (app.enabled('rpcDebugLog')) {
    opts.rpcDebugLog = true;
    opts.rpcLogger = require('pomelo-logger')
      .getLogger('rpc-debug', __filename);
  }

  this.app = app;
  this.opts = opts;
  this.client = _genRpcClient(this.app, opts);
  this.app.event.on(events.REPLACE_SERVERS,
                    this.replaceServers.bind(this));
}

Component.prototype.name = '__proxy__';

/**
 * Proxy component lifecycle function
 *
 * @param {Function} cb
 * @return {Void}
 */
Component.prototype.start = function(cb) {
  if (this.opts.enableRpcLog) {
    logger.warn('enableRpcLog is deprecated in 0.8.0, ' +
                'please use app.rpcFilter(pomelo.rpcFilters.rpcLog())');
  }

  const rpcBefores = this.app.get(Constants.KEYWORDS.RPC_BEFORE_FILTER);
  const rpcAfters = this.app.get(Constants.KEYWORDS.RPC_AFTER_FILTER);
  const rpcErrorHandler = this.app.get(Constants.RESERVED.RPC_ERROR_HANDLER);

  if (rpcBefores) {
    this.client.before(rpcBefores);
  }

  if (rpcAfters) {
    this.client.after(rpcAfters);
  }

  if (rpcErrorHandler) {
    this.client.setErrorHandler(rpcErrorHandler);
  }
  process.nextTick(cb);
};

/**
 * Component lifecycle callback
 *
 * @param {Function} cb
 * @return {Void}
 */
Component.prototype.afterStart = function(cb) {
  const self = this;

  Object.defineProperty(this.app, 'rpc', {
    get: function() {
      return self.client.proxies.user;
    },
    configurable: false,
    enumerable: false
  });

  Object.defineProperty(this.app, 'sysrpc', {
    get: function() {
      return self.client.proxies.sys;
    },
    configurable: false,
    enumerable: false
  });

  Object.defineProperty(this.app, 'rpcInvoke', {
    get: function() {
      return self.client.rpcInvoke.bind(self.client);
    },
    configurable: false,
    enumerable: false
  });

  this.client.start(cb);
};

/**
 * Replace remote servers from the rpc client.
 *
 * @param  {Array} ids server id list
 */
Component.prototype.replaceServers = function(servers) {
  if (!servers || !servers.length) {
    return;
  }

  _genProxies(this.client, this.app, servers);

  this.client.replaceServers(servers);
};

/**
 * Proxy for rpc client rpcInvoke.
 *
 * @param {String}   serverId remote server id
 * @param {Object}   msg rpc message:
 *                    {
 *                      serverType: serverType,
 *                      service: serviceName,
 *                      method: methodName,
 *                      args: arguments
 *                    }
 *
 * @param {Function} cb      callback function
 */
Component.prototype.rpcInvoke = function(serverId, msg, cb) {
  this.client.rpcInvoke(serverId, msg, cb);
};

/**
 * Generate rpc client
 *
 * @param {Object} app current application context
 * @param {Object} opts contructor parameters for rpc client
 * @return {Object} rpc client
 */
function _genRpcClient(app, opts) {
  opts.context = app;
  opts.routeContext = app;

  if (opts.rpcClient) {
    return opts.rpcClient.create(opts);
  } else {
    return Client.create(opts);
  }
}

/**
 * Generate proxy for the server infos.
 *
 * @param  {Object} client rpc client instance
 * @param  {Object} app    application context
 * @param  {Array} sinfos server info list
 */
function _genProxies(client, app, sinfos) {
  let item;
  let i;
  for (i = 0; i < sinfos.length; i++) {
    item = sinfos[i];
    if (_hasProxy(client, item)) {
      continue;
    }
    client.addProxies(_getProxyRecords(app, item));
  }
}

/**
 * Check a server whether has generated proxy before
 *
 * @param  {Object}  client rpc client instance
 * @param  {Object}  sinfo  server info
 * @return {Boolean}        true or false
 */
function _hasProxy(client, sinfo) {
  const proxy = client.proxies;
  return proxy.sys && proxy.sys[sinfo.serverType];
}

/**
 * Get proxy path for rpc client.
 * Iterate all the remote service path and create remote path record.
 *
 * @param {Object} app current application context
 * @param {Object} sinfo server info, format: {id, serverType, host, port}
 * @return {Array}     remote path record array
 */
function _getProxyRecords(app, sinfo) {
  const records = [];
  const appBase = app.getBase();
  let record;

  // sys remote service path record
  if (app.isFrontend(sinfo)) {
    record = pathUtil.getSysRemotePath('frontend');
  } else {
    record = pathUtil.getSysRemotePath('backend');
  }

  if (record) {
    records.push(pathUtil.remotePathRecord('sys', sinfo.serverType, record));
  }

  // user remote service path record
  record = pathUtil.getUserRemotePath(appBase, sinfo.serverType);

  if (record) {
    records.push(pathUtil.remotePathRecord('user', sinfo.serverType, record));
  }

  return records;
}

function _genRouteFun() {
  return (session, msg, app, cb) => {
    const routes = app.get('__routes__');

    if (!routes) {
      _defaultRoute(session, msg, app, cb);
      return;
    }

    const type = msg.serverType;
    const route = routes[type] || routes['default'];

    if (route) {
      route(session, msg, app, cb);
    } else {
      _defaultRoute(session, msg, app, cb);
    }
  };
}

function _defaultRoute(session, msg, app, cb) {
  const list = app.getServersByType(msg.serverType);
  if (!list || !list.length) {
    cb(new Error('can not find server info for type:' + msg.serverType));
    return;
  }

  const uid = session ? (session.uid || '') : '';
  const index = Math.abs(crc.crc32(uid.toString())) % list.length;
  utils.invokeCallback(cb, null, list[index].id);
}
