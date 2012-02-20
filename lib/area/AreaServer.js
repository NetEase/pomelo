var Dnode = require('dnode');
var config = require('./Config');

var agentClient = require('./client/AgentClient');
var logicClient = require('./client/LogicClient');
var eventClient = require('./client/EventClient');
var channelClient = require('./client/ChannelClient');

var sceneHandler = require('./handler/SceneHandler');
var sceneManagerHandler = require('./handler/SceneManagerHandler');

var ServerProxy = require('../common/proxy/DNServerProxy');

var logger = require('../util/log/log').getLogger(__filename);

var server = module.exports;
var dserver;
var sceneServer;
var sceneManagerServer;

/**
 * 场景服务器启动前回调(可选)
 */
server.beforeStart = function() {
    
};

/**
 * 启动服务器
 */
server.start = function() {
//  dserver = Dnode({
//	//AGENT 服务调用  
//	getCurrentScene	: agentHandlers.getCurrentScene,
//	setCurrentScene	: agentHandlers.setCurrentScene,
//	getScenes		: agentHandlers.getScenes,
//	setCurrentScene	: agentHandlers.updateState,
//	setCurrentScene	: agentHandlers.subscribeState,
//	//逻辑服务调用
//	hello			: logicHandlers.hello,
//	//自己调用
//	registScene		: sceneHandlers.registScene,
//	removeScene		: sceneHandlers.removeScene,
//	publishState	: sceneHandlers.publishState,
//	getStates		: sceneHandlers.getStates
//	
//  });
  //dserver.listen(config.port);
  sceneManagerServer = ServerProxy.createProxy({id: 'scene-manager', port: config.managerPort, origins: [sceneManagerHandler]});
  logger.info('sceneManager Server started ',{'port':config.managerPort,'id:':'scene-manager'});
  sceneServer = ServerProxy.createProxy({id: 'scene-server-1', port: config.port, origins: [sceneHandler.getInstance(),agentClient,eventClient,logicClient,channelClient]});
  logger.info('scene Server started ',{'port':config.port,'id:':'scene-server-1'});
};

/**
 * 服务器关闭前回调(可选)
 */
server.beforeStop = function() {
	logger.info('Ready to stop Scene Server');
};

/**
 * 之后的操作
 */
server.afterStart = function(){
	sceneHandler.getInstance().start(sceneManagerServer,sceneServer);
 	//console.log('Scene Server started');
 	//客户端启动起来
 	eventClient.start();
 	//
 	agentClient.start();
 	//
 	logicClient.start();
 	//
 	channelClient.start();
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
  channelClient.destroy();
};