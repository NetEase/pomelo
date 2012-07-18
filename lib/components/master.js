/**
 * Component for master.
 * Init and start master server.
 */
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

/**
 * Start master server and lister the master port.
 *
 * @param app {Object} app context
 */
var listen = function(app) {
  var master = app.master;
  app.set('serverId', master.id);
  var serverInst = require('../master/server.js');
  serverInst.listen(master);
  app.set('currentServer', serverInst);
};

/**
 * Make the master server run other server instances by server info list.
 *
 * @param app {Object} app context
 * @param servers {Object} server info list
 */
var runServers = function(app, servers){
  for (var serverType in servers){
    var typeServers = servers[serverType];
    for (var i=0; i<typeServers.length; i++) {
      var curServer = typeServers[i];
      curServer.serverType = serverType;
      run(app, curServer);
    }
  }
};

/**
 * Run server instance.
 * If the server is config run in current host then run it directly.
 * If the server is config run in remote host then try to run it by ssh.
 *
 * @param app {Object} app context
 * @param server {Object} server info
 */
var run = function(app, server){
  var cmd = 'cd '+ process.cwd()+ ' && node '+app.main+'  ' + app.env + '  ' + server.serverType + ' ' + server.id;
  if (server.host =='127.0.0.1' || server.host == 'localhost') {
    cmd =  'cd '+ process.cwd()+ ' && node ' +app.main +'  '+ app.env + '  ' + server.serverType + ' ' + server.id;
    starter.run(cmd);
  } else {
    starter.sshrun(cmd,server.host);
  }
};

exp.name = 'master';
