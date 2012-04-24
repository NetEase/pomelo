var utils = require('../util/utils');

var filter = module.exports;

var logger = require('../util/log/log').getLogger(__filename);
var monitor_logger = require('../util/log/log').getLogger('monitor-log');

filter.handle = function(msg, session, fn){
    logger.info(' [handle session] route:' + msg.route+ ' params: ' + JSON.stringify(msg.params));    
    monitor_logger.info(JSON.stringify(msg)) ;
    utils.invokeCallback(fn, null, msg, session);
}
