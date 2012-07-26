/**
 * Remote service for backend servers. 
 * Receive and process request message that forward from frontend server.
 */
var pomelo = require('../../../pomelo');
var logger = require('../../../util/log/log').getLogger(__filename);
var sessionService = require('../../service/mockSessionService');
var utils = require('../../../util/utils');
var forward_logger = require('../../../util/log/log').getLogger('forward-log');

/**
 * Forward message from frontend server to other server's handlers
 *
 * @param params {Object} route parameter
 * @param msg {Object} request message
 * @param session {Object} session object for current request
 * @param cb {Function} callback function
 */
module.exports.forwardMessage = function(params, msg, session, cb) {
  var server = pomelo.getApp().get('currentServer');
  if(!server) {
    utils.invokeCallback(new Error('server component not enable'));
    return;
  }

  // generate session for current request
  session = sessionService.createSession(session);
  session.response = function(resp) {
    if(!!this.__sessionSent__) {
      logger.warn('session has sent');
      return;
    }
    this.__sessionSent__ = true;
    utils.invokeCallback(cb, null, resp);
  };
  // handle the request
  server.handle(msg, session, function(err) {
    if(!session.__sessionSent__) {
      //ignore if has sent in session
      utils.invokeCallback(cb, err);
    }
  });
};
