var manager = module.exports;

var configs = require('./Config'); 
var ServerProxy = require('../common/proxy/DNServerProxy');
var SessionHandler = require('./handler/SessionHandler');
var ChannelHandler = require('./handler/ChannelHandler');
var logger = require('../util/log/log').getLogger(__filename);

/**
 * agent handler 管理类
 * handler是直接暴露给其他服务器调用的远程接口
 */
var proxy;
/**
 * 开启handlers监听
 */
manager.start = function() {
	proxy = ServerProxy.createProxy({
		id: configs.backendId, 
		port: configs.backendPort, 
		origins: [SessionHandler.getInstance(), ChannelHandler.getInstance()]
	});
	logger.info('agent server backend started ' , {'port':configs.backendPort,'id':configs.backendId});
};

/**
 * 停止handlers监听
 */
manager.stop = function() {
	if(!proxy) {
		return;
	}
	
	proxy.close();
	proxy = null;
};