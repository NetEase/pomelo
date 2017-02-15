'use strict';

/**
 * Component for remote service.
 * Load remote service and add to global context.
 */
const fs = require('fs');
const pathUtil = require('../util/pathUtil');
const RemoteServer = require('pomelo-rpc').server;

module.exports = Component;

/**
 * Remote component class
 *
 * @param {Object} app  current application context
 * @param {Object} opts construct parameters
 */

/**
 * Remote component factory function
 *
 * @param {Object} app  current application context
 * @param {Object} opts construct parameters
 *                       opts.acceptorFactory
 *                       {Object}: acceptorFactory.create(opts, cb)
 * @return {Object}     remote component instances
 */

function Component(app, opts) {
  opts = opts || {};

  // cacheMsg is deprecated, just for compatibility here.
  opts.bufferMsg = opts.bufferMsg || opts.cacheMsg || false;
  opts.interval = opts.interval || 30;
  if (app.enabled('rpcDebugLog')) {
    opts.rpcDebugLog = true;
    opts.rpcLogger = require('pomelo-logger')
      .getLogger('rpc-debug', __filename);
  }

  this.app = app;
  this.opts = opts;
}

Component.prototype.name = '__remote__';

/**
 * Remote component lifecycle function
 *
 * @param {Function} cb
 * @return {Void}
 */
Component.prototype.start = function(cb) {
  this.opts.port = this.app.getCurServer().port;
  this.remote = _genRemote(this.app, this.opts);
  this.remote.start();
  process.nextTick(cb);
};

/**
 * Remote component lifecycle function
 *
 * @param {Boolean}  force whether stop the component immediately
 * @param {Function}  cb
 * @return {Void}
 */
Component.prototype.stop = function(force, cb) {
  this.remote.stop(force);
  process.nextTick(cb);
};

/**
 * Get remote paths from application
 *
 * @param {Object} app current application context
 * @return {Array} paths
 *
 */
function _getRemotePaths(app) {
  const paths = [];

  let role;
  // master server should not come here
  if (app.isFrontend()) {
    role = 'frontend';
  } else {
    role = 'backend';
  }

  const serverType = app.getServerType();

  const sysPath = pathUtil.getSysRemotePath(role);
  if (fs.existsSync(sysPath)) {
    paths.push(pathUtil.remotePathRecord('sys', serverType, sysPath));
  }

  const userPath = pathUtil.getUserRemotePath(app.getBase(), serverType);
  if (fs.existsSync(userPath)) {
    paths.push(pathUtil.remotePathRecord('user', serverType, userPath));
  }

  return paths;
}

/**
 * Generate remote server instance
 *
 * @param {Object} app current application context
 * @param {Object} opts contructor parameters for rpc Server
 * @return {Object} remote server instance
 */
function _genRemote(app, opts) {
  opts.paths = _getRemotePaths(app);
  opts.context = app;

  if (opts.rpcServer) {
    return opts.rpcServer.create(opts);
  } else {
    return RemoteServer.create(opts);
  }
}
