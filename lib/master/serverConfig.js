var serverConfig = module.exports;
var path = require('path');

var servers = {};
var groups = [];

serverConfig.init = function (filename) {
  serverConfig = require(path.resolve(filename));
	for(var key in serverConfig){
	  var group = {};
		var groupServers = [];
		var groupServersConfig = serverConfig[key];
	  var serverCount = groupServersConfig.length;
	  for (var i = 0, l = serverCount; i < l; i++) {
		  var config = groupServersConfig[i];
		  //var serverName = key;
			//var server = serverName + ' mock ' ;//require('./lib/' + serverName + '/' + serverName + 'Server');
			if (!!servers[config.id]){
				throw new Error(' duplicate server config with id ' + config.id);
			} else {
				servers[config.id] = config;
				config.name = key;
				groupServers.push(config);
			}
	  }
	  group.name = key;
	  group.list = groupServers;
	  groups.push(group);
	}
};

serverConfig.getAll = function(){
	return servers;
}

serverConfig.getByGroup = function(){
	return groups;
}

serverConfig.getById = function(id){
	return servers[id];
}

serverConfig.getByKey = function(name){
	return groups[name];
}