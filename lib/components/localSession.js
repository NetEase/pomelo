var LocalSessionService = require('../common/service/localSessionService');

module.exports = function(app) {
  var service = new LocalSessionService(app);
  service.name = '__localSession__';
  // export local session service to the application context
  app.set('localSessionService', service, true);
  return service;
};
