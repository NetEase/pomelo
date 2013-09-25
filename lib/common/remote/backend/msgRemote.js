var utils = require('../../../util/utils');
/**
 * Remote service for backend servers.
 * Receive and process request message that forward from frontend server.
 */
module.exports = function(app) {
  return new Remote(app);
};

var Remote = function(app) {
  this.app = app;
};

/**
 * Forward message from frontend server to other server's handlers
 *
 * @param msg {Object} request message
 * @param session {Object} session object for current request
 * @param cb {Function} callback function
 */
Remote.prototype.forwardMessage = function(msg, session, cb) {
  var server = this.app.components.__server__;
  var sessionService = this.app.components.__localSession__;

  if(!server) {
    utils.invokeCallback(cb, new Error('server component not enable'));
    return;
  }

  if(!sessionService) {
    utils.invokeCallback(cb, new Error('local session component not enable'));
    return;
  }

  // generate local session for current request
  var lsession = sessionService.create(session);

  // handle the request
  server.handle(msg, lsession, function(err, resp) {
    utils.invokeCallback(cb, err, resp);
  });
};
