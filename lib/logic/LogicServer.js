var config = require('./Config');
var Dnode = require('dnode');
var allHandlers = require('./handler/LogicHandler');

var ServerProxy = require('../common/proxy/DNServerProxy');

var logger = require('../util/log/log').getLogger(__filename);

var server = module.exports;
var dserver;

/**
 * 服务器启动前回调(可选)
 */
server.beforeStart = function() {
    
};

/**
 * 启动服务器
 */
server.start = function() {
//  dserver = Dnode({
//    getUserInfo: allHandlers.getUserInfo,
//    generateTreasures: allHandlers.generateTreasures,
//    pickItem: allHandlers.pickItem,
//    register: allHandlers.register
//  });
  //allHandlers.start();
  //dserver.listen(config.port);
  ServerProxy.createProxy({id: 'logic-server-1', port: config.port, origins: [allHandlers]});
  logger.info('Logic Server started' , {'port':config.port,'id':'logic-server-1'});
};


server.afterStart = function(){
	
	allHandlers.start(); 
	//console.log('Logic Server started');
	
}


/**
 * 服务器关闭前回调(可选)
 */
server.beforeStop = function() {
	logger.info('before stop logic Server');
};

/**
 * 关闭服务器
 */
server.close = function() {
  if(!!dserver) {
    dserver.end();
    dserver.close();
    dserver = null;
    logger.info('Stopped logic Server');
  }
};