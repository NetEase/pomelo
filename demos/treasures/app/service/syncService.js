/**
 * 场景服务的dao
 */
//var redis = require('./redis/redisClient').redis;

var logger = require('../../../../lib/util/log/log').getLogger(__filename);
var utils = require('../../../../lib/util/utils');
var dataSource = require('../dao/sync').redis;

var exp = module.exports;

exp.getDataSet = function(key){
  var set = dataSource.get(key);
  if(!!set)
    return set;

  return dataSource.getset(key, {});
};
