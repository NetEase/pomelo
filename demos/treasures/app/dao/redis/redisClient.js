var redis = require('redis');
var app = require('../../../../../lib/pomelo').getApp();

var client = redis.createClient(app.redis.port,app.redis.host);//app-26.photo.163.org

var kvDb = module.exports;

kvDb.redis = client;


