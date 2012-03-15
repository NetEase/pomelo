var exp = module.exports;
var utils = require('../../../../../lib/util/utils');

exp.userLeave = function(uid, cb) {
	console.log('[userLeave] uid:' + uid);
	utils.invokeCallback(cb);
};