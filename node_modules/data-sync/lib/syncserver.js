var MemDatabase = require('./memdatabase');

/**
 * Module dependencies.
 */

/**
 * Initialize a new `Server` with the given `options`.
 * 
 * @param {Object} options
 */

var SyncServer = module.exports = function SyncServer(options) {
  var self = this
    , options = options || {};

  // Startup time
  this.start = new Date;

  // Initialize data-store
  this.db = new MemDatabase(this, options);

  // Force AOF support for now
  this.aof = true;


};



SyncServer.prototype.register = function(key,entity,cb) {
  this.db.writeToAOF('register', [entity]);
  this.db.set(key,entity,cb);
};

SyncServer.prototype.get = function(key,cb) {
  this.db.get(key,cb);
};

SyncServer.prototype.unregister = function(key,cb) {
	 if (!!entity) {
		 this.db.del(key);
	 } else {
		 //console.error(' entity can not be null ');
	 }
};