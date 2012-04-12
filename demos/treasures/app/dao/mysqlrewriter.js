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
		throw error(' db  client must not null ');
	}
	this.client = server.client;
	var db = server.use();
	for(var key in db){
		if (key.indexOf('_u_')==-1) continue;
		var obj = db[key];
		if (server.changed(obj)){
			this.write(obj.val);
		} else {
			if (Date.now() - obj.flushtime  > 60 * 1000 * 60 *24){
				//TODO 一天的数据自动清理
				//this.write(key, val);
				//delete db[dbkey][key];  
			}
		} 
	}
	server.queue.shiftEach(function(key){
		//this.client.del(key);
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

MysqlRewriter.prototype.write = function(val){
  //for (var id in vals) 
  {
 	//var val = vals[id];
	//console.error(' ' + JSON.stringify(val)+ '  ' + val.x+ '  ' +val.y + '  ' +val.uid);
    var sql = 'update Hero set x = ? ,y = ? ,sceneId = ? ,where id = ?';
    var args = [val.x, val.y, val.sceneId, val.uid];
    this.client.update(sql, args, function(err, res){
      if(err !== null){
        //console.error(sql + ' ' + JSON.stringify(val));
     } else {
    	 //console.error('flash dbok ' + sql + ' ' + JSON.stringify(val));
    }
    });
  }
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