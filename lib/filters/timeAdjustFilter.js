var utils = require('../util/utils');
var logger = require('../util/log/log').getLogger(__filename);

var filter = module.exports;

var sessionTimes = {};

filter.handle = function(msg, session, next){
  if(!session || !session.key) {
		utils.invokeCallback(next, new Error('fail to do serialize for session or session.key is empty.'));
		return;
  }

	var clientTimestamp = msg.params.timestamp;
	var serverTimestamp = Date.now();
	var diff = serverTimestamp - clientTimestamp;

	var sessionTime = sessionTimes[msg.key];

	//create one if not exist
	if (!sessionTime){
		sessionTime = {clientTimestamp: clientTimestamp, serverTimestamp: serverTimestamp, diff: diff};
		sessionTimes[msg.key] = sessionTime;
		logger.debug('create session time: '+ JSON.stringify(sessionTime)+ ' key: '+session.key);
	}

	if (Math.abs(sessionTime.diff - diff)>3000){ // diff is illegal, maybe client is cheating, illegal
		throw new Error('[illegal client time] time diff is changing too fast! are you cheating? curDiff: '+diff+ '  origDiff:'+sessionTime.diff);
	}

	//other wise, always trust the client timestamp,
	// client timestamp plug net lag time is more precise than server time
	msg.params.timestamp += sessionTime.diff;

	// over 10 minutes elapsed , readjust sessionTime
	if (serverTimestamp - sessionTime.serverTimestamp > 10*60*1000){
		sessionTime = {clientTimestamp: clientTimestamp, serverTimestamp: serverTimestamp, diff: diff};
		logger.debug('readjust session time: '+ JSON.stringify(sessionTime)+ ' key: '+session.key);
	}

  utils.invokeCallback(next, null, msg, session);
}
