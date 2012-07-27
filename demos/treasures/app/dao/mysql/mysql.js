/*
 * 提供sql的CRUD操作
 */

var sqlclient = module.exports;

var _pool;

var NND = {};

/*
 * 初始化数据库连接池
 */
NND.init = function(app){
	_pool = require('./dao-pool').createMysqlPool(app);
};

NND.query = function(sql, args, callback){
	_pool.acquire(function(err, client) {
		if (!!err) {
			console.error('[sqlqueryErr] '+err.stack);
			return;
		}
		client.query(sql, args, function(err, res) {
			_pool.release(client);
			callback.apply(null, [err, res]);
		});
	});
};


NND.shutdown = function(){
	_pool.destroyAllNow();
};

/**
 * init database
 */
sqlclient.init = function(app) {
	if (!!_pool){
		return sqlclient;
	} else {
		NND.init(app);
		sqlclient.insert = NND.query;
		sqlclient.update = NND.query;
		sqlclient.delete = NND.query;
		sqlclient.query = NND.query;
      return sqlclient;
	}
};
/**
 * shutdown database
 */
sqlclient.shutdown = function() {
	NND.shutdown(app);
};






