var pomelo = require('../../../../lib/pomelo');
var utils = require('../../../../lib/util/utils');
var crc = require('crc');
var logger = require('../../../../lib/pomelo').log.getLogger(__filename);


var exp = module.exports;

exp.calculator = function(opts, cb){
  var app = pomelo.getApp();
  // logger.error('serverId :' + app.get('serverId') + "areaId :" + JSON.stringify(opts));
  // logger.error("arae Info : " + JSON.stringify(app.get('areas')[opts.areaId]));
  if(opts.type == 'area'){
    var areas = app.get('areas');
    
    if(!opts) {
      utils.invokeCallback(cb, new Error('empty server configs.'));
      return;
    }
    
    var server = areas[opts.areaId].server;

    if(!server) {
      utils.invokeCallback(cb, new Error('can not find server info for type:' + opts.type));
      return;
    }
    utils.invokeCallback(cb, null, server);    
    
  }else{
    if(!opts || !opts.servers) {
      utils.invokeCallback(cb, new Error('empty server configs.'));
      return;
    }
    var servers = opts.servers;
    var list = servers[opts.type];
    if(!list) {
      utils.invokeCallback(cb, new Error('can not find server info for type:' + opts.type));
      return;
    }
    var index = Math.abs(crc.crc32(opts.uid.toString())) % list.length;
    utils.invokeCallback(cb, null, list[index].id);    
  }
  
}
