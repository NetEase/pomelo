var gateway = module.exports;

var handlerManager = require('./handlerManager');
//var logger = require('./util/log/log').getLogger(__filename);


/**
 * 服务端转发，发给HandlerManager或RemoteManager处理
 * @param msg
 */
gateway.forward = function(msg, cb) {
	//rpcPkg.service = "aaa.bbb.ccc";
    console.log(' enterServerGateWay');
    handlerManager.execHandler(msg, cb);
	//rpcMap[rpcMsg.handler][rpcPkg.method](rpcPkg.params);
};

