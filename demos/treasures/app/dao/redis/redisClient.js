var redis = require('redis');

var app = require('../../../../lib/application');


var client = redis.createClient(app.redis.host,app.redis.port);//app-26.photo.163.org

var kvDb = module.exports;

kvDb.redis = client;
