var pomelo = require('../../../../lib/pomelo');
var utils = require('../../../../lib/util/utils');
var crc = require('crc');
var logger = require('../../../../lib/pomelo').log.getLogger(__filename);


var exp = module.exports;

exp.calculator = function(opts, cb){
  var app = pomelo.app;
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
    
  } else if(opts.type === 'connector') {
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

    if(!!opts.frontendId) {
      utils.invokeCallback(cb, null, frontendId);
      return;
    }

    pomelo.app.rpc.status.statusRemote.queryStatus(opts.uid, function(err, sid) {
      if(!!err) {
        utils.invokeCallback(cb, new Error('fail to query status for uid:' + uid + ', err:' + err.stack));
        return;
      }
      utils.invokeCallback(cb, null, sid);
      return;
    });
  } else {
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
  
};
