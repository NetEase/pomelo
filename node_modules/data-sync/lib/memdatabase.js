/**
 * Module dependencies.
 */

var commands = require('./commands')
	, utils = require('./utils/utils')
	,Queue = require('./utils/queue')
  , fs = require('fs');

var crypto = require('crypto');
var FileRewriter = require('../lib/rewriter/filerewriter');
var SyncTimer = require('../lib/timer/synctimer');

var mutate = [];

Object.keys(commands).forEach(function(cmd){
  var fn = commands[cmd];
  if (fn.mutates) mutate.push(cmd);
});

/**
 * Initialize a new `Database` with the given `server` and `options`.
 *
 * Options:
 *
 *   `filename`   Append-only file path
 *
 * @param {Server} server
 * @param {Object} options
 */

var MemDatabase = module.exports = function MemDatabase(server, options) {
  options = options || {};
  if (server) {
    this.dbs = [];
    this.selectDB(0);
    this.rewriter = options.rewriter || new FileRewriter;
    this.client = options.client;
    this.timer = options.timer || new SyncTimer;
    this.interval = options.interval || 1000 * 60 * 3;
    this.server = server;
    this.queue = options.queue ||   new Queue();
    this.filename = options.filename || process.cwd() + '/dbsync.log';
    this.stream = fs.createWriteStream(this.filename, { flags: 'a' });
    this.timer.start(this);
  } else {
    this.data = {};
  }
};

/**
 * Expose commands to store.
 */

MemDatabase.prototype = commands;

/**
 * Select database at the given `index`.
 *
 * @param {Number} index
 */

MemDatabase.prototype.selectDB = function(index){
  var db = this.dbs[index] = this.dbs[index] || new MemDatabase;
  this.db = db;
};

/**
 * detect the object is change
 * @param val
 * @returns {Boolean}
 */
MemDatabase.prototype.changed = function(val) {
	var isChanged = false;
	if (!val)
		return isChanged;
	var shasum = crypto.createHash('md5');
	var _footprint = val.footprint;
	var _flushtime = val.flushtime;
	delete val.footprint;
	delete val.flushtime;
	shasum.update(JSON.stringify(val));
	var footprint = shasum.digest('hex');
	if (_footprint!=footprint) {
		val.flushtime = Date.now();
		val.footprint = footprint;
  	isChanged = true;
	} else {
		val.flushtime = _flushtime;
		val.footprint = _footprint;
		isChanged = false;
	}
	return isChanged;
};

MemDatabase.prototype.use = function() {
  this.selectDB(0);
  var db = this.dbs[0];
  var keys = Object.keys(db);
  var dbkey = keys[0];
  return db[dbkey];
};

/**
 * Lookup `key`, when volatile compare timestamps to
 * expire the key.
 *
 * @param {String} key
 * @return {Object}
 */

MemDatabase.prototype.lookup = function(key){
  var obj = this.db.data[key];
  if (obj && 'number' == typeof obj.expires && Date.now() > obj.expires) {
    delete this.db.data[key];
    return;
  }
  return obj;
};

/**
 * Write the given `cmd`, and `args` to the AOF.
 *
 * @param {String} cmd
 * @param {Array} args
 */

MemDatabase.prototype.writeToAOF = function(cmd, args){
  //if (!~mutate.indexOf(cmd)) return;

  var argc = args.length
    , buf = 
      '*' + (argc + 1) + '\r\n'
    + cmd + '\r\n';

  // Write head length
  this.stream.write(buf);

  // Write Args
  for (var i = 0; i < argc; ++i) {
  	var key = utils.string(args[i]);
    this.stream.write(key);
    this.stream.write('\r\n');
    this.stream.write(JSON.stringify(args[i]));
    this.stream.write('\r\n');
  }
};
