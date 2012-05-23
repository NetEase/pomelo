var pomelo = require('../../../pomelo');
var logger = require('../../../util/log/log').getLogger(__filename);
var sessionService = require('../../service/mockSessionService');
var utils = require('../../../util/utils');
var forward_logger = require('../../../util/log/log').getLogger('forward-log');

/**
 * forward message from frontend server to other server's handlers
 */
module.exports.forwardMessage = function(params, msg, session, cb) {
  var uid = params.uid;
  var areaId = params.areaId;
  var filterManager = pomelo.getApp().get('filterManger');

  var server = pomelo.getApp().get('currentServer');
  if(!server) {
    utils.invokeCallback(new Error('server component not enable'));
    return;
  }

  session = sessionService.createSession(session);
  session.response = function(resp) {
    utils.invokeCallback(cb, null, resp);
  };
  server.handle(msg, session, function(err) {
    if(!session.__sessionSent__) {
      //ignore if has sent in session
      utils.invokeCallback(cb, err);
    }
  });
};
