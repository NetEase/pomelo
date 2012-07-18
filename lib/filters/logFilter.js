/**
 * Logger filter that would record every request message.
 */
var utils = require('../util/utils');

var filter = module.exports;

var logger = require('../util/log/log').getLogger(__filename);

filter.filter = function(msg, session, next){
    logger.info(' [handle session] ' + JSON.stringify(msg));     
    utils.invokeCallback(next, null, msg, session);
};
