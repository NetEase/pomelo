var app = require('../../../../lib/pomelo').getApp();
var dbclient = require('./mysql/mysql').init(app);

var DataSync = require('data-sync');

var sync = module.exports;
var _sync = null;
/**
 * init sync
 */
sync.init = function(client){
	if (_sync != null) {
		return _sync; 
	} else {
		var write = require('./syncutil');
		var opt = {};
		opt.write = write;
		opt.client = client;
		_sync = new DataSync(this,opt);
		sync.redis = _sync;
		return _sync;
	}
}

