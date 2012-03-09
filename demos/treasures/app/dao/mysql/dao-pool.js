/*
 * 用于创建dao层中的各种连接池
 */
var _poolModule = require('generic-pool');

/*
 * 创建redis的连接池
 */
var createRedisPool = function(confFile){

	var opt = require('./' + confFile);

	return _poolModule.Pool({
    			name     : 'redis',
    			create   : function(callback) {
        			var redis = require('redis');

					var client = redis.createClient(opt.port, opt.host);

        			callback(null, client);
    			},
    			destroy  : function(client) { client.quit(); },
    			max      : 10,
    			idleTimeoutMillis : 30000,
    			log : false
			});
}

/*
 * 创建mysql的连接池
 */
var createMysqlPool = function(confFile){
	
	var opt = require('./' + confFile);

	return _poolModule.Pool({
    		name     : 'mysql',
    		create   : function(callback) {
        		var mysql = require('mysql');
				var client = mysql.createClient({
					host:opt.host,
					user: opt.username,
					password: opt.password,
					database: opt.database
				});
        		callback(null, client);
    		},
    		destroy  : function(client) { client.end(); },
    		max      : 10,
    		idleTimeoutMillis : 30000,
    		log : false
		});
}

exports.createMysqlPool = createMysqlPool;

exports.createRedisPool = createRedisPool;