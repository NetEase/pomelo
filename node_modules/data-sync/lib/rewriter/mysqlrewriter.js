/**
 * Module dependencies.
 */

var utils = require('../utils/utils')
  , fs = require('fs');

/**
 * Initialize a new AOF MysqlRewriter with the given `db`.
 * 
 * @param {Database}
 */

var MysqlRewriter = module.exports = function MysqlRewriter() {
};

/**
 * Initiate rewritting.
 */

MysqlRewriter.prototype.sync = function(server){
	if (server.client === undefined){
		throw error(' redis client must not null ');
	}
	this.client = server.client;
	var db = server.use();
	for(var key in db){
		var val = db[key];
		if (server.changed(val)){
			this.write(key, val);
		} else {
			if (Date.now() - val.flushtime  > 60 * 1000 * 60 *24){
				//TODO 一天的数据自动清理
				//this.write(key, val);
				//delete db[dbkey][key];  
			}
		} 
	}
	server.queue.shiftEach(function(key){
		client.del(key);
	});
};

/**
 * call this before shutdown server
 * Close tmpfile stream, and replace AOF
 * will our tempfile, then callback `fn(err)`.
 */

MysqlRewriter.prototype.end = function(fn){
  
};


/**
 * Write key / val.
 */

MysqlRewriter.prototype.write = function(key, val){
  var type = val.type || 'string';
  return this[type](key, val);
};

/**
 * Write string to `streams`.
 */

MysqlRewriter.prototype.string = function(key, val) {
	this.client.set(key,val);
};

MysqlRewriter.prototype.hash = function(key, val) {
	this.string(key,val);
};