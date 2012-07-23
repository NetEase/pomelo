var starter = require('../master/starter');
var utils = require('../util/utils');
var logger = require('../util/log/log').getLogger(__filename);


var exp = module.exports;

exp.start = function(app, opts, cb) {
  logger.info('begin to start master component.');
  listen(app);
  runServers(app, app.get('servers'));
  logger.info('master started.');

  utils.invokeCallback(cb);
};

var listen = function(app) {
  var master = app.master;
  app.set('serverId', master.id);
  var serverInst = require('../master/server.js');
  serverInst.listen(master);
  app.set('currentServer', serverInst);
};

var runServers = function(app, servers, except){
  for (var serverType in servers){
    var typeServers = servers[serverType];
    for (var i=0; i<typeServers.length; i++) {
      var curServer = typeServers[i];
      curServer.serverType = serverType;
       if(app.__debug)
          debug(app,curServer);
       else
          run(app, curServer);
    }
  }
};

var run = function(app, server){
  var cmd = 'cd '+ process.cwd()+ ' && node '+app.main+'  ' + app.env + '  ' + server.serverType + ' ' + server.id;
  if (server.host =='127.0.0.1' || server.host == 'localhost') {
    cmd =  'cd '+ process.cwd()+ ' && node ' +app.main +'  '+ app.env + '  ' + server.serverType + ' ' + server.id;
    starter.run(cmd);
  } else {
    starter.sshrun(cmd,server.host);
  }
};

var debug = function(app, server){
    var cmd = 'cd '+ process.cwd()+ ' && node debug '+app.main+'  ' + app.env + '  ' + server.serverType + ' ' + server.id;

    if (server.host =='127.0.0.1' || server.host == 'localhost') {
        cmd =  'cd '+ process.cwd()+ ' && node debug ' +app.main +'  '+ app.env + '  ' + server.serverType + ' ' + server.id;
        starter.run(cmd);
    } else {
        starter.sshrun(cmd,server.host);
    }
};

exp.name = 'master';
