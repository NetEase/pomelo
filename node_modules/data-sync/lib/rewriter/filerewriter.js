
var utils = require('../utils/utils')
  , fs = require('fs');
var crypto = require('crypto');

/**
 * Initialize a new AOF Rewriter with the given `db`.
 * 
 * @param {Database}
 */

var FileRewriter = module.exports = function FileRewriter() {
  var self = this;
  this.filename =  process.cwd() + '/dump.db'; //+ (Math.random() * 0xfffffff | 0);
  this.streams = fs.createWriteStream(this.filename,{ flags: 'w' });
};

/**
 * Initiate rewritting.
 */

FileRewriter.prototype.sync = function(server){
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
		console.log('delete ' + key);
	});
  //this.end();
};

/**
 * Close tmpfile streams, and replace AOF
 * will our tempfile, then callback `fn(err)`.
 */

FileRewriter.prototype.end = function(fn){
  this.streams.end();
};

/**
 * Write key / val.
 */

FileRewriter.prototype.write = function(key, val){
  var type = val.type || 'string';
  return this[type](key, val);
};

/**
 * Write string to `streams`.
 */

FileRewriter.prototype.string = function(key, val) {
  this.streams.write('$' + key.length + '\r\n');
  this.streams.write(key);
  this.streams.write('\r\n');
  this.streams.write(JSON.stringify(val));
  this.streams.write('\r\n');
};

FileRewriter.prototype.hash = function(key, val) {
	this.string(key,val);
};