var zookeeper = require('node-zookeeper-client');
var CreateMode = zookeeper.CreateMode;
var Event = zookeeper.Event;
var util = require('util');
var EventEmitter = require('events').EventEmitter;
var logger = require('pomelo-logger').getLogger(__filename);

var zookeeperClient = null;

function getClient(app){
  if(!zookeeperClient){
    zookeeperClient = new Zookeeper(app);
  }

  return zookeeperClient;
}

function Zookeeper(app){
  this.app = app;
  this.hosts = '127.0.0.1:2181';
  this.path = '/pomelo/master';
  this.lockPath = this.path + '/lock';
  this.nodePath = this.lockPath + '/' + this.app.serverId + '-';
  this.version = null;
  this.onDataSet = false;

  this.client = zookeeper.createClient(this.hosts, {sessionTimeout:1000});

  watchNode(this.client, this.path, onMasterUpdate.bind(this));
  this.client.connect();
}

util.inherits(Zookeeper, EventEmitter);


Zookeeper.prototype.close = function(cb){
  this.client.close(cb);
};

Zookeeper.prototype.setData = function(data, cb){
  var buffer = new Buffer(JSON.stringify(data));
  var self = this;

  this.client.setData(this.path, buffer, function(err, result){
    if(cb){
      cb(err, result);
    }
  });
};

Zookeeper.prototype.getData = function(cb){
  this.client.getData(this.path, function(err, data){
    if(err){
      logger.warn('get master info faild!');
      cb(err);
      return;
    }

    cb(null, data.toString());
  });
};

Zookeeper.prototype.getLock = function(cb){
  var client = this.client;
  var serverId = this.app.serverId;
  var self = this;

  if(this.version){
    checkLock(this, cb);
  }else{
    client.create(this.nodePath, serverId, CreateMode.EPHEMERAL_SEQUENTIAL, function(err, path){
      if(err){
        logger.warn('getLock error! node path  %j, serverId : %j, err : %j', self.nodePath, serverId, err);
        cb(err);
        return;
      }

      self.version = parseInt(path.substr(path.lastIndexOf('-')+1), 10);
      checkLock(self, cb);
    });
  }
};

function checkLock(self, cb){
  var client = self.client;
  var version = self.version;
  var lockPath = self.lockPath;

  client.getChildren(lockPath, function(err, children, stat){
    if(err){
      logger.warn('get children error!');
      cb(err);
      return;
    }

    var data = getVersion(children);
    var versions = data.versions;

    logger.warn(children);
    logger.error('versions : %j, version : %j', versions, version);
    if(version === versions[0]){
      cb(null, true);
    }else{
      var node = getWatchNode(version, data);
      var nodePath = lockPath + '/' + node;
      if(node){
        watchNode(client, nodePath, onNodeChange.bind(self));
        cb(null, false);
        return;
      }else{
        cb('Can not find watch node!');
      }
    }
  });
}

function getVersion(children){
  logger.warn('get version by children : %j', children);

  var versions = [];
  var map = {};

  for(var i = 0; i < children.length; i++){
    var child = children[i];
    var version = parseInt(child.substr(child.lastIndexOf('-') + 1), 10);

    versions.push(version);
    map[version] = child;
  }

  versions.sort();

  logger.warn('version result, versions: %j, map : %j', versions, map);
  return {
    versions : versions,
    map : map
  };
}

function getWatchNode(version, data){
  var versions = data.versions;
  var map = data.map;

  for(var i = 1; i < versions.length; i++){
    if(version === versions[i]){
      return map[versions[i-1]];
    }
  }

  return null;
}

function watchNode(client, path, func){
  logger.warn('watch node path : %j', path);
  client.exists(path, func, function(err, stat){
    if(err || !stat){
      logger.warn('Watch path not exist! path: %j', path);
    }
  });
}

function onNodeChange(event){
  if(event.type === Event.NODE_DELETED){
    console.error('emit promote');

    this.emit('onPromote');
  }
}

function onMasterUpdate(event){
  console.warn('onData change %j', event);
  if(event.type === Event.NODE_DATA_CHANGED){
    this.emit('onMasterUpdate');
  }

  if(event.type !== Event.NODE_DELETED){
    watchNode(this.client, this.path, onMasterUpdate.bind(this));
  }
}

module.exports.getClient = getClient;