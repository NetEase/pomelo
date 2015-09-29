var redis = require('redis');
var commander = require('./common/cmd');
var constants = require('../util/constants');
var utils = require('../util/utils');
var logger = require('pomelo-logger').getLogger('pomelo', __filename);

var Monitor = function(app, opts){
    if(!(this instanceof Monitor)){
        return new Monitor(app, opts);
    }

    this.app = app;
    this.port = opts.port || 6379;
    this.host = opts.host || '127.0.0.1';
    this.password = opts.password || null;
    this.redisOpts = opts.redisOpts || {};
}

module.exports = Monitor;

Monitor.prototype.start = function(cb){
    var self = this;
    this.client = redis.createClient(this.port, this.host, this.redisOpts);

    var cbTimer = setTimeout(function() {
        utils.invokeCallback(cb, new Error(self.app.serverId + ' cannot connect to zookeeper.'));
    }, constants.TIME.DEFAULT_REDIS_CONNECT_TIMEOUT);

    this.client.once('connect', function(){
        logger.info('%s connected to redis successfully !', self.app.serverId);
        if(self.password){
            self.client.auth(self.password);
        }
        clearTimeout(cbTimer);
        self.timer = setInterval(watcherCluster2Command.bind(self), constants.TIME.DEFAULT_REDIS_REG);
        utils.invokeCallback(cb);

    });

    this.client.on('error', function(err){
        logger.error('redis err:', err);
    })
}

Monitor.prototype.close = function() {
  this.client.end();
  clearInterval(this.timer);
};

var watcherCluster2Command = function(){
    getClusterInfo(this.app, this.client, this.app.getCurServer());
    getCommand(this, this.client, this.app.getCurServer());

}

var getClusterInfo = function(app, redis, serverInfo){
    var results = {};
    var key = 'pomelo-regist:' + serverInfo.env;
    var args = [key, Date.now() + constants.TIME.DEFAULT_REDIS_EXPIRE, JSON.stringify(serverInfo)];
    redis.zadd(args, function(err, res){
        if(err){
            logger.error('zadd %j err: %j', args, err);
            return;
        }

        var query_args = [key, Date.now(), '+inf'];
        redis.zrangebyscore(query_args, function(err, res){
            if(err){
                logger.error('zrangebyscore %j err: %j', query_args, err);
                return;
            }

            for (var i = res.length - 1; i >= 0; i--) {
                var server = JSON.parse(res[i]);
                results[server.id] = server;
            }

            logger.info('cluster servers info: %j',results);
            app.replaceServers(results);
        });
    });
}

var getCommand = function(self, redis, serverInfo){
    var key = 'pomelo-regist:' + serverInfo.env + ':' + serverInfo.id;
    redis.get(key, function(err, res){
        if(err){
            logger.error('get pomelo-regist cmd err %j', err);
            return;
        }

        if(res){
            logger.debug('get cmd: ',res);
            redis.del(key, function(err){
                if(err){
                    logger.error('del command err %j', err);
                }else{
                    commander.init(self, res);
                }
            });
        }
    });
}