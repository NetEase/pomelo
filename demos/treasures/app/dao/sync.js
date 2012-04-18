var MemDatabase = require('data-sync');

var dbclient = require('./mysql/mysql');
var Mysqlrewriter = require('./mysqlrewriter');

var opt = {};
opt.client = dbclient;
opt.rewriter = new Mysqlrewriter();
opt.interval = 1000 * 10;

var redis = new MemDatabase(this,opt) ;

var sync = module.exports;

sync.redis = redis;


