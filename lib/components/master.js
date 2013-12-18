/**
 * Component for master.
 */
var Master = require('../master/master');

/**
 * Component factory function
 *
 * @param  {Object} app  current application context
 * @return {Object}      component instances
 */
module.exports = function (app, opts) {
	return new Component(app, opts);
};

/**
* Master component class
*
* @param {Object} app  current application context
*/
var Component = function (app, opts) {
	this.master = new Master(app, opts);
};

var pro = Component.prototype;

pro.name = '__master__';

/**
 * Component lifecycle function
 *
 * @param  {Function} cb
 * @return {Void}
 */
pro.start = function (cb) {
  this.master.start(cb);
};

/**
 * Component lifecycle function
 *
 * @param  {Boolean}   force whether stop the component immediately
 * @param  {Function}  cb
 * @return {Void}
 */
pro.stop = function (force, cb) {
  this.master.stop(cb);
};
