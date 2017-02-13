'use strict';

const plog = require('pomelo-logger');

const utils = require('../../../util/utils');
const logger = plog.getLogger('pomelo', __filename);
const PmlError = require('../../../errors').PomeloError;

/**
 * Remote channel service for frontend server.
 * Receive push request from backend servers and push it to clients.
 */
module.exports = function createChannelRemote(app) {
  return new Remote(app);
};

function Remote(app) {
  this.app = app;
}

/**
 * Push message to client by uids.
 *
 * @param  {String}   route route string of message
 * @param  {Object}   msg   message
 * @param  {Array}    uids  user ids that would receive the message
 * @param  {Object}   opts  push options
 * @param  {Function} cb    callback function
 */
Remote.prototype.pushMessage = function(route, msg, uids, opts, cb) {
  if (!msg) {
    logger.error('Can not send empty message! route : %j, compressed msg : %j',
                 route, msg);
    utils.invokeCallback(cb, new PmlError('can not send empty message.'));
    return;
  }

  const connector = this.app.components.__connector__;

  const sessionService = this.app.get('sessionService');
  const fails = [];
  const sids = [];
  let sessions;

  let i;
  let j;
  for (i = 0; i < uids.length; i++) {
    sessions = sessionService.getByUid(uids[i]);
    if (!sessions) {
      fails.push(uids[i]);
    } else {
      for (j = 0; j < sessions.length; j++) {
        sids.push(sessions[j].id);
      }
    }
  }

  logger.debug('[%s] pushMessage uids: %j, msg: %j, sids: %j',
               this.app.serverId, uids, msg, sids);

  connector.send(null, route, msg, sids, opts, (err) => {
    utils.invokeCallback(cb, err, fails);
  });
};

/**
 * Broadcast to all the client connectd with current frontend server.
 *
 * @param  {String}    route  route string
 * @param  {Object}    msg    message
 * @param  {Boolean}   opts   broadcast options.
 * @param  {Function}  cb     callback function
 */
Remote.prototype.broadcast = function broadcast(route, msg, opts, cb) {
  const connector = this.app.components.__connector__;

  connector.send(null, route, msg, null, opts, cb);
};
