var utils = require('../util/Utils');

var filter = module.exports;

var logger = require('../util/log/log').getLogger(__filename);

filter.handle = function(session, fn){
    logger.info(' [handle session] route: '+session.route+ ' params: '+JSON.stringify(session.params));     
    utils.invokeCallback(session, fn);
}


