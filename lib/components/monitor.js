'use strict';

/**
 * Component factory function
 *
 * @param  {Object} app  current application context
 * @return {Object}      component instances
 */

function Component(app, opts) {
  if (!(this instanceof Component)) {
    return new Component(app, opts);
  }

  if (!opts || !opts.monitor) {
    throw new Error('pomelo 2.0 cannot start without monitor, ' +
                    'you can choose zookeeper or redis as monitor server.');
  }
  const monitor = opts.monitor;
  return monitor(app, opts);
}

Component.prototype.name = '__monitor__';

Component.prototype.start = function(cb) {
  this.monitor.start(cb);
};

Component.prototype.stop = function(force, cb) {
  this.monitor.stop(cb);
};
