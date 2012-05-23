var MemDatabase = require('data-sync');
var app = require('../../../../lib/pomelo').getApp();
var dbclient = require('./mysql/mysql').init(app);


var write = require('./syncutil');
var opt = {};
opt.write = write;
opt.client = dbclient;
opt.interval = 1000 * 10;

var sync = module.exports = new MemDatabase(this,opt);

sync.redis = sync;




