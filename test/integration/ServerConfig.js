var connectorServer = require('../lib/connector/connectorServer'); //占用 4050 端口
var areaServer = require('../lib/area/areaServer'); //占用 5050 端口

/**
 * 单进程模式服务器总配置
 */
var configs = module.exports;

/**
 * 待启动服务器列表，按出现顺序逐一启动
 */
configs.servers = [connectorServer, areaServer];