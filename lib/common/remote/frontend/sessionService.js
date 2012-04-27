var exp = module.exports;
var sessionService = require('../../service/sessionService');
var utils = require('../../../util/utils');

function changeArea(msg, cb){
  var uid = msg.uid;
  var session = sessionService.getSessionByUid(uid);

  if(!!session){
    session.areaId = msg.areaId;
    utils.invokeCallback(cb, null);
  }else{
    utils.invokeCallback(cb, 'Session for ' + uid + ' not Exist!');
  }
}

exp.changeArea = changeArea;
