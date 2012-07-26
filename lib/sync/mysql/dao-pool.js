/*
 * 用于创建dao层中的各种连接池
 */
var _poolModule = require('generic-pool');

/*
 * 创建mysql的连接池
 */
var createMysqlPool = function(app){
	return _poolModule.Pool({
    		name     : 'mysql',
    		create   : function(callback) {
        		var mysql = require('mysql');
				var client = mysql.createClient({
					host:app.mysql.host,
					user: app.mysql.user,
					password: app.mysql.password,
					database: app.mysql.database
				});
        		callback(null, client);
    		},
    		destroy  : function(client) { client.end(); },
    		max      : 10,
    		idleTimeoutMillis : 30000,
    		log : false
		});
};

exports.createMysqlPool = createMysqlPool;
