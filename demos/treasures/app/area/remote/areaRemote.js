var utils = require('../../../../../lib/util/utils');
var pomelo = require('../../../../../lib/pomelo');
var areaService = require('../../service/areaService');

var exp = module.exports;
var logger = require('../../../../../lib/pomelo').log.getLogger(__filename);


exp.transferUser = function(msg, cb){
  userService.transferUser(msg, function(err){
    if(!!err){
      logger.error('transfer user failed! msg:' + JSON.stringify(msg));
      utils.invokeCallback(cb, err);
    }else{
      logger.info('transfer user success! msg:' + JSON.stringify(msg));
      utils.invokeCallback(cb);
    }
  })
};

exp.pushMessageToAll = function(msg, cb){
  areaService.pushMessageToAll(msg, function(err){
    if(!!err){
      logger.error('Send message failed! msg: ' + JSON.stringify(msg));
      utils.invokeCallback(cb, err);
    }else{
      logger.info('Send message success! msg: ' + JSON.stringify(msg));
      utils.invokeCallback(cb, err);
    }
  });
};
