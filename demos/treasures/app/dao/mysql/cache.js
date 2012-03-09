/*
 * 提供cache的set和get操作接口
 */
var _pool;

var _utils = require('../../../../../lib/util/utils');

var NNC = module.exports = {};

/*
 * 初始化cache客户端的连接池
 */
NNC.init = function(confFile){

	_pool = require('./dao-pool').createRedisPool(confFile);

}

NNC.set = function(key, value, callback){

	_pool.acquire(function(err, client) {
	
	    client.set(key, value, function(err, res) {
	    
	        _pool.release(client);
	        
	        _utils.invokeCallback(callback, err, res);
	        
	    });
	});
}

NNC.get = function(key, callback){

	_pool.acquire(function(err, client) {
	
	    client.get(key, function(err, res) {
	    
	        _pool.release(client);
	        
	        _utils.invokeCallback(callback, err, res);
	        
	    });
	});
}

NNC.shutdown = function(){
	_pool.destroyAllNow();
}