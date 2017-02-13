'use strict';

const plog = require('pomelo-logger');

const utils = require('../../../util/utils');
const logger = plog.getLogger('forward-log', __filename);
const PmlError = require('../../../errors').PomeloError;
/**
 * Remote service for backend servers.
 * Receive and handle request message forwarded from frontend server.
 */
module.exports = function createMsgRemote(app) {
  return new Remote(app);
};

function Remote(app) {
  this.app = app;
}

/**
 * Forward message from frontend server to other server's handlers
 *
 * @param msg {Object} request message
 * @param session {Object} session object for current request
 * @param cb {Function} callback function
 */
Remote.prototype.forwardMessage = function forwardMessage(msg, session, cb) {
  const server = this.app.components.__server__;
  const sessionService = this.app.components.__backendSession__;

  if (!server) {
    logger.error('server component not enable on %s', this.app.serverId);
    utils.invokeCallback(cb, new PmlError('server component not enable'));
    return;
  }

  if (!sessionService) {
    logger.error('backend session component not enable on %s',
                 this.app.serverId);
    utils.invokeCallback(cb,
                         new PmlError('backend sesssion component disabled'));
    return;
  }

  // generate backend session for current request
  const backendSession = sessionService.create(session);

  // handle the request

  logger.debug('backend server [%s] handle message: %j',
               this.app.serverId, msg);

  server.handle(msg, backendSession, (err, resp, opts) => {
    utils.invokeCallback(cb, err, resp, opts);
  });
};
