var StatusService = require('../common/service/statusService');

module.exports = function(app, opts) {
  var service = new StatusService(app, opts);
  app.set('statusService', service, true);
  service.name = '__status__';
  return service;
};