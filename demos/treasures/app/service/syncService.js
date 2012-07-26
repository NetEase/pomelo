/**
 * 场景服务的dao
 */
//var redis = require('./redis/redisClient').redis;

var logger = require('../../../../lib/util/log/log').getLogger(__filename);
var utils = require('../../../../lib/util/utils');
var pomelo = require('../../../../lib/pomelo');

var exp = module.exports;

exp.getDataSet = function(key){
 	var app = pomelo.getApp();
  var dataSource = app.sync;
  var set = dataSource.get(key);
  if(!!set)
    return set;

  return dataSource.getset(key, {});
};
