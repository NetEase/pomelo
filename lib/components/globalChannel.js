var ChannelService = require('../common/service/globalChannelService');

module.exports = function(app, opts) {
  var service = new ChannelService(app, opts);
  app.set('globalChannelService', service, true);
  service.name = '__globalChannel__';
  return service;
};