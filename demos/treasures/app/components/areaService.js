var logger = require('../../../../lib/util/log/log').getLogger(__filename);
var areaService = require('../service/areaService');
var utils = require('../util/utils');
var exp = module.exports;

exp.start = function(app, opts, cb) {
  logger.info('begin to start areaService component.');
  areaService.init();
  logger.info('areaService inited.');
  utils.invokeCallback(cb);
};

exp.name = 'areaService';
