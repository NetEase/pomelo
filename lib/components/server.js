'use strict';

/**
 * Component for server starup.
 */
const Server = require('../server/server');

/**
 * Component factory function
 *
 * @param {Object} app  current application context
 * @return {Object}     component instance
 */
module.exports = Component;

/**
 * Server component class
 *
 * @param {Object} app  current application context
 */
function Component(app, opts) {
  if (!(this instanceof Component)) {
    return new Component(app, opts);
  }

  this.server = Server.create(app, opts);
}

Component.prototype.name = '__server__';

/**
 * Component lifecycle callback
 *
 * @param {Function} cb
 * @return {Void}
 */
Component.prototype.start = function(cb) {
  this.server.start();
  process.nextTick(cb);
};

/**
 * Component lifecycle callback
 *
 * @param {Function} cb
 * @return {Void}
 */
Component.prototype.afterStart = function(cb) {
  this.server.afterStart();
  process.nextTick(cb);
};

/**
 * Component lifecycle function
 *
 * @param {Boolean}  force whether stop the component immediately
 * @param {Function}  cb
 * @return {Void}
 */
Component.prototype.stop = function(force, cb) {
  this.server.stop();
  process.nextTick(cb);
};

/**
 * Proxy server handle
 */
Component.prototype.handle = function(msg, session, cb) {
  this.server.handle(msg, session, cb);
};

/**
 * Proxy server global handle
 */
Component.prototype.globalHandle = function(msg, session, cb) {
  this.server.globalHandle(msg, session, cb);
};
