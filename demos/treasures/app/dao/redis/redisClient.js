var redis = require('redis');

var config = require('./config')

var client = redis.createClient(config.redisport,config.host);//app-26.photo.163.org

var kvDb = module.exports;

kvDb.redis = client;
