/*
 * 提供sql的CRUD操作
 */
var _pool;

var _utils = require('../../../../../lib/util/utils');

var NND = module.exports = {};

/*
 * 初始化数据库连接池
 */
NND.init = function(){
	var app = require('../../../../../lib/pomelo').getApp();
	_pool = require('./dao-pool').createMysqlPool(app);
}

NND.query = function(sql, args, callback){

	_pool.acquire(function(err, client) {
        if (!!err) {
            console.log('[sqlqueryErr] '+err.stack);
        	return;
        }
	
	    client.query(sql, args, function(err, res) {
	    
	        _pool.release(client);
	        
	        _utils.invokeCallback(callback, err, res);
	        
	    });
	});
}

NND.insert = NND.query;
NND.update = NND.query;
NND.delete = NND.query;

NND.shutdown = function(){
	_pool.destroyAllNow();
}

