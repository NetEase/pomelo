var DataSync = require('data-sync');
var sync = module.exports;
var instance = null;
var syncUtil = require('./syncUtil');
var utils = require('../util/utils');
/**
 * init sync
 */
sync.init = function(opts){
	  if (!!instance) {
		    return instance; 
	  } else {
		    var opt = opts || {};
		    opt.write = syncUtil.load(opts.path);
		    opt.client = opts.dbclient;
        opt.interval = opts.interval || 60*1000;
		    instance = new DataSync(this,opt);
		    return instance;
	  }
};

sync.stop = function(cb) {
    if (!instance) {
        utils.invokeCallback(cb,null,true);
    } else {
        instance.flushAll();
        setInterval(function(){
            var isDone = instance.isDone();
            if (!!isDone) {
                utils.invokeCallback(cb,null,true);
            }
        },200);
    } 
};

