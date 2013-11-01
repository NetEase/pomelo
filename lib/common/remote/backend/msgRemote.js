/**
 * Remote service for backend servers.
 * Receive and handle request message forwarded from frontend server.
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
  var sessionService = this.app.components.__backendSession__;

  if(!server) {
    cb(new Error('server component is not enabled.'));
    return;
  }

  if(!sessionService) {
    cb(new Error('backend session component is not enabled'));
    return;
  }

  // generate backend session for current request
  var backendSession = sessionService.create(session);

  // handle the request
  server.handle(msg, backendSession, function(err, resp) {
    cb(err, resp);
  });
};
