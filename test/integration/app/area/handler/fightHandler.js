var utils = require('../../../../lib/util/utils');

var handler = module.exports;

handler.kick = function(session, cb){
    var params = session.params;
	console.log(' fight user: '+ params.sourceUsername+'  target: ' + params.targetUsername);
    utils.invokeCallback(cb, null, 'kick ass in server sUsername: '+params.sourceUsername+ ' target: ' + params.targetUsername, 'iAttach');
}