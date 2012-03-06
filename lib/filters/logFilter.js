var utils = require('../util/utils');

var filter = module.exports;

var logger = require('../util/log/log').getLogger(__filename);

filter.handle = function(session, fn){
    logger.info(' [handle session] route: '+session.route+ ' params: '+JSON.stringify(session.params));     
    utils.invokeCallback(fn, null, session);
}


