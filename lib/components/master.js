'use strict';

/**
 * Component for master.
 */
const Master = require('../master/master');

/**
 * Component factory function
 *
 * @param  {Object} app  current application context
 * @return {Object}      component instances
 */
module.exports = function(app, opts) {
  return new Component(app, opts);
};

/**
* Master component class
*
* @param {Object} app  current application context
*/
function Component(app, opts) {
  if (!(this instanceof Component)) {
    return new Component(app, opts);
  }
  this.master = new Master(app, opts);
}

Component.prototype.name = '__master__';

/**
 * Component lifecycle function
 *
 * @param  {Function} cb
 * @return {Void}
 */
Component.prototype.start = function(cb) {
  this.master.start(cb);
};

/**
 * Component lifecycle function
 *
 * @param  {Boolean}   force whether stop the component immediately
 * @param  {Function}  cb
 * @return {Void}
 */
Component.prototype.stop = function(force, cb) {
  this.master.stop(cb);
};
