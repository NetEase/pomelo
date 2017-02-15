'use strict';

const ConnectionService = require('../common/service/connectionService');

/**
 * Connection component for statistics connection status of frontend servers
 */
module.exports = Component;

function Component(app, opts) {
  if (!(this instanceof Component)) {
    return new Component(app, opts);
  }

  this.app = app;
  this.service = new ConnectionService(app);

  // proxy the service methods except the lifecycle interfaces of component
  const self = this;

  const getFun = (m) => {
    return (() => {
      return function() {
        return self.service[m].apply(self.service, arguments);
      };
    })();
  };

  let m;
  let method;
  for (m in this.service) {
    if (m !== 'start' && m !== 'stop') {
      method = this.service[m];
      if (typeof method === 'function') {
        this[m] = getFun(m);
      }
    }
  }
}

Component.prototype.name = '__connection__';
