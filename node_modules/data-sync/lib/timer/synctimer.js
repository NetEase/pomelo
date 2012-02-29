/**
 * Module dependencies.
 */

var SyncTimer = module.exports = function SyncTimer() {
  var self = this;
};

/**
 * start sync timer .
 */

SyncTimer.prototype.start = function(db){
	setInterval(function(){
		//console.log('Background append only file rewriting started');
		db.sync();	
	},db.interval);
};

