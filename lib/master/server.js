var app = require('../pomelo').getApp();
var ServerAgent = require('./serverAgent').ServerAgent;
var logger = require('../util/log/log').getLogger(__filename);
var express = require('express');

/**
 * master server
 */
var server = module.exports;
var dserver;
var handler = {};

handler.pushStatus = function (serverType, serverId) {
    logger.info(' report status serverType: ' + serverType + ' serverId: ' + serverId);
};

/**
 * 服务器启动前回调(可选)
 */
server.beforeStart = function () {
};

/**
 * 启动服务器
 */
server.start = function () {
};

var serverAgent = null;

server.listen = function (server) {
    this.serverAgent = new ServerAgent();
    this.serverAgent.listen(server.port);
    app.set('serverAgent', this.serverAgent);
    logger.info(' [master server] start listen on server: ' + JSON.stringify(server));
    app.startMonitor();
    this.startQueryServer(server.queryPort);
    var profilerAgent = require('./profilerAgent');
    profilerAgent.start(server.wsPort || 2337);
};

server.afterStart = function () {
    process.on('SIGHUP', function () {

        app.quit();
    });
    process.on('SIGINT', function () {
        var nodes = app.get('serverAgent').nodes;
        var systemInfo = [];
        var processInfo = [];
        var rs = 'serverId            serverType       pid         time  \n';

        for (var nodeId in nodes) {
            var node = nodes[nodeId];
            processInfo.push(node.info.processInfo);
        }

        for (var i = 0; i < processInfo.length; i++) {
            if (processInfo[i] === undefined) continue;
            var obj = obj2str(processInfo[i]);
            var jstr = JSON.parse(obj);
            rs += jstr.serverId + '    ' + jstr.serverType + '    ' + jstr.pid + '      ' + jstr.time + '\n'
        }

        function obj2str(o) {
            var r = [], i, j = 0, len;
            if (o == null) {
                return o;
            }
            if (typeof o == 'string') {
                return '"' + o + '"';
            }
            if (typeof o == 'object') {
                if (!o.sort) {
                    r[j++] = '{';
                    for (i in o) {
                        r[j++] = '"';
                        r[j++] = i;
                        r[j++] = '":';
                        r[j++] = obj2str(o[i]);
                        r[j++] = ',';
                    }
                    r[j - 1] = '}';
                } else {
                    r[j++] = '[';
                    for (i = 0, len = o.length; i < len; ++i) {
                        r[j++] = obj2str(o[i]);
                        r[j++] = ',';
                    }
                    r[len == 0 ? j : j - 1] = ']';
                }
                return r.join('');
            }
            return o.toString();
        }

        var io = require('socket.io').listen(3000);
        io.sockets.on('connection', function (socket) {
            socket.on('ferret', function (name, fn) {
                fn(rs);
            });
        });
    });
};

server.startQueryServer = function (port) {
    var app = express.createServer();
    app.use(app.router);
    app.configure('development', function () {
        app.use(express.errorHandler({ dumpExceptions:true, showStack:true }));
    });

    app.configure('production', function () {
        app.use(express.errorHandler());
    });

    var self = this;

    // Routes
    app.get('/', function (req, res) {
        res.writeHeader(200, {
            'content-type':'text/javascript'
        });
        res.end('window.__front_address__=\'' + self.serverAgent.getLowLoadServer() + '\';');
    });

    app.get('/status', function (req, res) {
        res.writeHeader(200, {
            'content-type':'text/plain'
        });
        res.end(JSON.stringify(self.serverAgent.getStatus()));
    });

    app.listen(port);
};

