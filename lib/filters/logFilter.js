var utils = require('../util/utils');

var filter = module.exports;

var logger = require('../util/log/log').getLogger(__filename);

filter.handle = function(msg, session, fn){
    logger.info(' [handle session] route:' + msg.route+ ' params: ' + JSON.stringify(msg.params));     
    utils.invokeCallback(fn, null, msg, session);
}
