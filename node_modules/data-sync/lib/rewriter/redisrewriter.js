/**
 * Module dependencies.
 */

var utils = require('../utils/utils')
  , fs = require('fs');

/**
 * Initialize a new AOF RedisRewriter with the given `db`.
 * 
 * @param {Database}
 */

var RedisRewriter = module.exports = function RedisRewriter() {

};

/**
 * Initiate rewritting.
 */

RedisRewriter.prototype.sync = function(server){
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
 * Close tmpfile stream, and replace AOF
 * will our tempfile, then callback `fn(err)`.
 */

RedisRewriter.prototype.end = function(fn){

};


/**
 * Write key / val.
 */

RedisRewriter.prototype.write = function(key, val){
  var type = val.type || 'string';
  return this[type](key, val);
};

/**
 * Write string to `streams`.
 */

RedisRewriter.prototype.string = function(key, val) {
	this.client.set(key,val);
};
/**
 * haset set
 * @param key
 * @param val
 */
RedisRewriter.prototype.hash = function(key, val) {
	this.string(key,val);
};