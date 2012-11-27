/**
 * Component for monitor.
 * Load and start monitor client.
 */
var Monitor = require('../monitor/monitor');

/**
 * Component factory function
 *
 * @param  {Object} app  current application context
 * @return {Object}      component instances
 */
module.exports = function(app) {
  return new Component(app);
};

var Component = function(app) {
  this.monitor = new Monitor(app);
};

var pro = Component.prototype;

pro.start = function(cb) {
  this.monitor.start(cb);
};

pro.stop = function(force, cb) {
  this.monitor.stop(cb);
};
