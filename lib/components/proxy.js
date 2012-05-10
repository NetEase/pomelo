var utils = require('../util/utils');
var logger = require('../util/log/log').getLogger(__filename);
var path = require('path');
var Loader = require('module-loader');
var Proxy = require('local-proxy');

module.exports = function(app) {
  var servers = app.get('servers');
  if(!servers) {
    throw new Error('empty servers');
  }

  var proxyMap = app.get('proxyMap') || {};
  var userProxies = proxyMap['user'] = proxyMap['user'] || {};
  var sysProxies = proxyMap['sys'] = proxyMap['sys'] || {};
  for(var serverType in servers) {
    if(servers.hasOwnProperty(serverType)) {
      //check conflict
      if(!!userProxies[serverType]) {
        throw new Error('user proxy conflict, serverType:' + serverType);
      }
      if(!!sysProxies[serverType]) {
        throw new Error('sys proxy conflict, serverType:' + serverType);
      }

      //generate user proxy
      var userProxy = genProxy(app, serverType, utils.getConventionPath(app.get('dirname'), serverType, 'remote'), 'user');
      userProxies[serverType] = userProxy;
      //generate sys proxy
      var role = isFrontendServer(servers[serverType][0]) ? 'frontend' : 'backend';
      var sysProxy = genProxy(app, serverType, __dirname + '/../common/remote/' + role, 'sys');
      sysProxies[serverType] = sysProxy;
    }
  }
  
  app.set('proxyMap', proxyMap);
};

/**
 * generate local proxy for remote interface
 *
 * @param name server type
 * @param dir handler codes root dir in abosulte path
 * @param scope user or sys, default is user
 */
var genProxy = function(app, name, dir, scope) {
	logger.info('[app.genProxy] loading proxy module, name:' + name + ', dir:' + dir);
  
  if(!dir || dir[0] == '.') {
    throw new Error('dir should use absolute path, dir: ' + dir );
  }

	scope = scope || 'user';

	/**
	 * local proxy loading callback
	 * replace the origin module object with the proxy object
	 */
	function proxyCallback(namespace, mod) {
		return Proxy.createProxy({
			origin: mod,
			namespace: namespace,
			attach: {type: name},
			callback: function(namespace, method, args, attach, invoke) {
				var cb, opts;
				if(args.length == 0) {
          opts = {uid: ''};
					cb = function(){};
				} else {
          if(typeof args[0] === 'object') {
            opts = args[0];
          } else {
            opts = {uid: args[0]};
          }

					if(typeof args[args.length - 1] === 'function') {
						cb = args.pop();
					} else {
						cb = function(){};
					}
				}
        opts.uid = opts.uid||{};
        opts.type = attach.type;
				var msg = {service: namespace, method: method, args: args};
				app.get('mailRouter').route(opts, function(err, serverId) {
					if(!!err) {
						logger.error('fail to route type:' + attach.type + ', uid:' + uid + ', err:' + err.stack);
					}
				
					app.get('mailBox').dispatch(serverId, msg, null, cb);
				});
			}
		});
	}; //end of proxyCallback


  var exists = path.existsSync(dir);
  if (!exists){
    logger.debug('[remote path not exists] name:' + name + ', dir:' + dir);
    return;
  }

  var proxies = {};
  try {
    Loader.loadPath({path: dir, recurse: false, log:false, namespace: scope + '.' + name, rootObj: proxies, callback: proxyCallback});
    return proxies;
  } catch(err) {
    logger.error('[genProxyError] name:' + name + ' dir: '+ dir + ', err message:' + err.message);
    process.exit(1);
  }
}; 	//end of genProxy

var isFrontendServer = function(server) {
  return !!server && !!server.wsPort;
};

module.exports.name = 'proxy';
