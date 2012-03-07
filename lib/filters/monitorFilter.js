var filter = module.exports;
var logger = require('../util/log/log').getLogger(__filename);

filter.handle = function(context, next){
  logger.info("Monitro filter before");
  var start = Date.now();
  next(null, context);
  var end = Date.now();
  
  logger.info("Monitor filter : " + JSON.stringify(context) + ' ' + (end - start));
}