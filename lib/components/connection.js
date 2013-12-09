var ConnectionService = require('../common/service/connectionService');

/**
 * Connection component for statistics connection status of frontend servers
 */
module.exports = function(app) {
  return new Component(app);
};

var Component = function(app) {
  this.app = app;
  this.service = new ConnectionService(app);

  // proxy the service methods except the lifecycle interfaces of component
  var method, self = this;
  for (var m in this.service) {
    if (m !== 'start' && m !== 'stop') {
      method = this.service[m];
      if (typeof method === 'function') {
        this[m] = (function(m) {
          return function() {
            return self.service[m].apply(self.service, arguments);
          };
        })(m);
      }
    }
  }
};

Component.prototype.name = '__connection__';