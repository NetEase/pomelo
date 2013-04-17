var SessionService = require('../common/service/sessionService');

var DEFAULT_FLUSH_INTERVAL = 20;

module.exports = function(app, opts) {
  var cmp = new Component(app, opts);
  app.set('sessionService', cmp, true);
  return cmp;
};

/**
 * Session component. Manage sessions.
 *
 * @param {Object} app  current application context
 * @param {Object} opts attach parameters
 */
var Component = function(app, opts) {
  opts = opts || {};
  this.app = app;
  this.flushInterval = opts.flushInterval || DEFAULT_FLUSH_INTERVAL;
  this.sendDirectly = opts.sendDirectly;
  this.intervalId = null;
  this.service = new SessionService(opts);

  // proxy the service methods except the lifecycle interfaces of component
  var method, self = this;
  for(var m in this.service) {
    if(m !== 'start' && m !== 'stop') {
      method = this.service[m];
      if(typeof method === 'function') {
        this[m] = (function(m) {
          return function() {
            return self.service[m].apply(self.service, arguments);
          };
        })(m);
      }
    }
  }
};

Component.prototype.name = '__session__';

Component.prototype.afterStart = function(cb) {
  var self = this;
  if(!this.sendDirectly) {
    this.intervalId = setInterval(function() {
      self.service.flush();
    }, this.flushInterval);
  }
  cb();
};

Component.prototype.stop = function(force, cb) {
  if(this.intervalId) {
    clearInterval(this.intervalId);
    this.intervalId = null;
  }
  cb();
};
