var DataSync = require('data-sync');
var sync = module.exports;
var instance = null;
var syncUtil = require('./syncUtil');
/**
 * init sync
 */
sync.init = function(client,path){
	  if (!!instance) {
		    return instance; 
	  } else {
		    var opt = {};
		    opt.write = syncUtil.load(path);
		    opt.client = client;
		    instance = new DataSync(this,opt);
		    return instance;
	  }
};

