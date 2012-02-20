var dnode = require('dnode');
var sio = require('socket.io');
var configs = require('./Config');
var locConst = require('./Constant');
var logger = require('../util/log/log').getLogger(__filename);
var ServerManager = require('./ServerManager');
var SessionHandler = require('./handler/SessionHandler');
var procManager = require('./ProcessorManager');
var handlerManager = require('./HandlerManager'); 
var filterManager = require('./FilterManager');
var EventEmitter = require('events').EventEmitter;
var taskManager = require('./TaskManager');

/**
 * agent server
 */
var server = module.exports;
var maps = configs.processorMaps;
var wsocket;	//websocket 监听
var reqCircle = new EventEmitter();

/**
 * 服务器启动前回调(可选)
 */
server.beforeStart = function() {
	//logger.info('begin to start agent server...');
	//初始化processor
	procManager.addProcessors(configs.processorMap);
	//初始化filter
	filterManager.addFilters(configs.filters);
	//注册任务管理器事件
	reqCircle.on(locConst.EVENT.REQUEST_FINISH, function(msg, session) {
		if(!!session && !!msg)
			taskManager.taskFinish(session.sid, msg.pflag);
	});
};

/**
 * 启动服务器
 */
server.start = function() {
	//启动handler监听后端接口
	handlerManager.start();
};

/**
 * 服务器启动后回调(可选)
 */
server.afterStart = function() {
	//启动server manager，连接后端服务器
	ServerManager.getInstance();
	//监听websocket端口，开始处理客户端请求
	startWebsocket();
	//logger.info('agent server started.');
};

/**
 * 服务器关闭前回调(可选)
 */
server.beforeClose = function() {
};

/**
 * 关闭服务器
 */
server.close = function() {
	handler.close();
};

/**
 * 开始监听websocket
 * 
 * @returns
 */
var startWebsocket = function() {
	wsocket = sio.listen(configs.frontendPort);
	logger.info('agent server websocket listen ' , {'port':configs.frontendPort});
	
	wsocket.set('log level', 1);
	wsocket.sockets.on('connection', function (socket) {
		/**
		 * 客户端新请求到达回调
		 */
		socket.on('message', function(msg) {
			if(!msg) {
				//忽略空请求
				return;
			}
			filterManager.doFilter(socket, msg, {}, processRequest);
		});	//on message end
	});	//on connection end
};

/**
 * 处理请求
 * 
 * @param socket 客户端连接socket
 * @param msg 客户端发送请求
 * @param context 处理上下文
 * @returns
 */
var processRequest = function(socket, msg, context) {
	var session = context.session;
	ServerManager.getInstance().forwardMessage(session, msg, function(err, res, attach) {
		// 后端服务器处理完毕回调
		// 检查处理成功与否
		if (!!err) {
			processError(err, socket);
			return;
		}

		// 处理后端服务器的附带消息
		if (!!attach) {
			processAttach(attach.type, {req: msg, resp: res, attach: attach, err: err, socket: socket}, function(err, resp) {
				if(!!err) {
					processError(err, socket);
					return;
				}
				// 将处理结果返回给客户端
				processResult(socket, resp, msg, session);
			});
		} else {
			// 无attach则直接将处理结果返回给客户端
			processResult(socket, res, msg, session);
		}
	});	//forwardMessage end
};

/**
 * 处理成功结果
 * 
 * @param socket 与客户端连接的socket
 * @param resp 待发送给客户端的消息
 * @param req 客户端的请求
 * @param session session对象，可以为null
 * @returns
 */
var processResult = function(socket, resp, req, session) {
	try {
		//给响应加上时间戳
		resp.timestamp = Date.now();
		socket.emit('message', resp);
	} catch(err) {
		//捕捉发送失败
		logger.error(err);
	}
	if(!!session) {
		reqCircle.emit(locConst.EVENT.REQUEST_FINISH, req, session);
	}
};

/**
 * 错误处理
 * @param err
 * @param socket
 * @returns
 */
var processError = function(err, socket) {
	logger.error('fail to process message ', {'err': JSON.stringify(err)});
	//TODO: 返回错误响应给客户端?临时先把err丢回去吧-_-
	err.timestamp = Date.now();	//也加上时间戳吧。。。
	socket.emit('message', err);
};

/**
 * 处理后端服务器的附带消息
 * 
 * @param type attach 类型
 * param属性定义(主要提供当前的请求上下文)
 * req: 用户的请求
 * resp: 后端服务器处理的结果
 * attach: 后端服务器附带的信息
 * err: 后端传过来的错误对象
 */
var processAttach = function(type, param, cb) {
	procManager.process(type, param, cb);
};
