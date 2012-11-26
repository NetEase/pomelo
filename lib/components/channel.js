var ChannelService = require('../common/service/channelService');

module.exports = function(app) {
  var service = new ChannelService(app);
  app.set('channelService', service, true);
  service.name = '__channel__';
  return service;
};