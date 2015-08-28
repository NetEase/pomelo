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
  var monitor = opts.monitor;
  if(!monitor) {
    throw new Error('pomelo servers cannot start without monitor.');
  }
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