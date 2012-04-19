var app = require('../../../../lib/pomelo').getApp();
var exp = module.exports;

exp.calculator = function(opts, cb){
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
  
    utils.invokeCallback(cb, null, list[crc.crc32(opts.uid) % list.length].id);    
  }
  
}
