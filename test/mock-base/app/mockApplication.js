var Application = module.exports = {
    components: { __pushScheduler__: {},
                  __connector__: {},
                },
    settings: {}
 };

Application.set = function(setting, val, attach){
  if (arguments.length === 1) {
    return this.settings[setting];
  }
  this.settings[setting] = val;
  if(attach) {
    this[setting] = val;
  }
  return this;
}

Application.get = function(setting){
  return this.settings[setting];
}

Application.getServersByType = function(serverType) {
  return this.serverTypeMaps[serverType];
};

Application.replaceServers = function(servers) {
  if(!servers) {
    return;
  }

  this.servers = servers;
  this.serverTypeMaps = {};
  this.serverTypes = [];
  var serverArray = [];
  for(var id in servers) {
    var server = servers[id];
    var serverType = server['serverType'];
    var slist = this.serverTypeMaps[serverType];
    if(!slist) {
      this.serverTypeMaps[serverType] = slist = [];
    }
    this.serverTypeMaps[serverType].push(server);
    // update global server type list
    if(this.serverTypes.indexOf(serverType) < 0) {
      this.serverTypes.push(serverType);
    }
    serverArray.push(server);
  }
};
