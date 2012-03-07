var exp = module.exports;
var utils = require('../../../../../lib/util/utils');
var logger = require('../../../../../lib/util/log/log').getLogger(__filename);

exp.getUserInfo = function(uid, fn) {
	logger.info('[userService.getUserInfo] recv request, uid:' + uid);
  utils.invokeCallback(fn, null, {uid: uid, username: 'username'});
}


