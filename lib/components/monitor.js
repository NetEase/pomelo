'use strict';
/**
 * Component for monitor.
 * Load and start monitor client.
 */
var pomelo = require('../pomelo');
/**
 * Component factory function
 *
 * @param  {Object} app  current application context
 * @return {Object}      component instances
 */
module.exports = function(app, opts) {
  return new Component(app, opts);
};

var Component = function(app, opts) {
	if(!opts || !opts.monitor) {
    throw new Error('pomelo 2.0 cannot start without monitor, you can choose zookeeper or redis as monitor server.');
  }
  var monitor = opts.monitor;
  return monitor(app, opts);
};

var pro = Component.prototype;

pro.name = '__monitor__';

pro.start = function(cb) {
  this.monitor.start(cb);
};

pro.stop = function(force, cb) {
  this.monitor.stop(cb);
};