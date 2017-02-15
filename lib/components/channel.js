'use strict';

const ChannelService = require('../common/service/channelService');

module.exports = function(app, opts) {
  const service = new ChannelService(app, opts);
  app.set('channelService', service, true);
  service.name = '__channel__';
  return service;
};
