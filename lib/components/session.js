'use strict';

const SessionService = require('../common/service/sessionService');

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
function Component(app, opts) {
  if (!(this instanceof Component)) {
    return new Component(app, opts);
  }

  opts = opts || {};
  this.app = app;
  app.set('sessionService', this, true);

  this.service = new SessionService(opts);

  const self = this;

  const getFun = (m) => {
    return (() => {
      return function() {
        return self.service[m].apply(self.service, arguments);
      };
    })();
  };

  // proxy the service methods except the lifecycle interfaces of component
  let method;
  let m;
  for (m in this.service) {
    if (m !== 'start' && m !== 'stop') {
      method = this.service[m];
      if (typeof method === 'function') {
        this[m] = getFun(m);
      }
    }
  }
}

Component.prototype.name = '__session__';
