var utils = require('../util/utils');
var logger = require('../util/log/log').getLogger(__filename);
var taskManager = require('../common/service/taskManager');

var filter = module.exports;

filter.handle = function(msg, session, next){
  if(!session || !session.key) {
  	utils.invokeCallback(next, new Error('fail to do serialize for session or session.key is empty.'));
  	return;
  }
  
  taskManager.addTask(session.key, function(task) {
  	var oldResp = session.response;
  	var start = Date.now();
  	session.response = function() {
			if(task.done()) {
				//if not timeout
				oldResp.apply(session, arguments);
			} else {
				//report a timeout error
				logger.error('[serialFilter] already timeout, start:' + start + ', return:' + Date.now() + ', msg:' + JSON.stringify(msg));
			}
	};
  	utils.invokeCallback(next, null, msg, session);
  }, function() {
  	logger.error('[serialFilter] msg timeout, msg:' + JSON.stringify(msg));
  });
}
