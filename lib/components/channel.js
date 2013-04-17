var ChannelService = require('../common/service/channelService');

module.exports = function(app, opts) {
  var service = new ChannelService(app, opts);
  app.set('channelService', service, true);
  service.name = '__channel__';
  return service;
};