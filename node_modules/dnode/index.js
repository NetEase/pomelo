var net = require('net');
var tls = require('tls');
var http = require('http');
var EventEmitter = require('events').EventEmitter;

var protocol = require('dnode-protocol');
var Lazy = require('lazy');
var SocketIO = require('./lib/stream_socketio');

exports = module.exports = dnode;

function dnode (wrapper) {
    if (!(this instanceof dnode)) return new dnode(wrapper);
    
    this.proto = protocol(wrapper);
    this.stack = [];
    this.streams = [];
    return this;
}

dnode.prototype = new EventEmitter;

dnode.prototype.use = function (middleware) {
    this.stack.push(middleware);
    return this;
};

dnode.prototype.connect = function () {
    var params = protocol.parseArgs(arguments);
    var stream = params.stream;
    var client = null;
    var self   = this;  
    
    if (params.port) {
        params.host = params.host || '127.0.0.1';
        if (params.key) {
            var options = {
                key: params.key,
                cert: params.cert,
                ca: params.ca,
                requestCert: params.requestCert,
                rejectUnauthorized: params.rejectUnauthorized
            };
            stream = tls.connect(params.port, params.host, options, function() {
                attachDnode();
            });
        }
        else {
            stream = net.createConnection(params.port, params.host);
            stream.on('connect', function() {
                attachDnode();
            });
        }
    }
    else if (params.path) {
        stream = net.createConnection(params.path);
        stream.on('connect', function() {
            attachDnode();
        });
    }
    else {
        attachDnode();
    } 
    
    stream.remoteAddress = params.host;
    stream.remotePort = params.port;
    
    var args = arguments; 
    
    if (params.reconnect) {
        stream.on('error', (function (err) {
            if (err.code === 'ECONNREFUSED') {
                if (client) client.emit('refused');
                
                setTimeout((function () {
                    if (client) client.emit('reconnect');
                    dnode.prototype.connect.apply(this, args);
                }).bind(this), params.reconnect);
            }
            else if (client) client.emit('error', err)
            else this.emit('error', err)
        }).bind(this));
        
        stream.once('end', (function () {
            if (!params.reconnect) return;
            client.emit('drop');
            
            setTimeout((function () {
                if (!params.reconnect) return;
                client.emit('reconnect');
                dnode.prototype.connect.apply(this, args);
            }).bind(this), params.reconnect);
        }).bind(this));
    }
    else {
        stream.on('error', (function (err) {
            if (client) client.emit('error', err)
            else this.emit('error', err)
        }).bind(this));
    }
    
    function attachDnode() {
        client = createClient(self.proto, stream);
        
        client.end = function () {
            if (params.reconnect) params.reconnect = 0;
            stream.end();
        };
        
        self.stack.forEach(function (middleware) {
            middleware.call(client.instance, client.remote, client);
        });
        
        if (params.block) {
            client.on('remote', function () {
                params.block.call(client.instance, client.remote, client);
            });
        }
        
        process.nextTick(function () {
            if (client.listeners('error').length === 0) {
                // default error handler to keep everything from crashing
                client.on('error', function (err) {
                    console.error(err && err.stack || err);
                })
            }
        });
        
        client.start();
    };
    
    this.streams.push(stream);
    return this;
};

dnode.prototype.listen = function () {
    var self = this;
    var params = protocol.parseArgs(arguments);
    var server = params.server;
    
    if (params.port) {
        if (params.key) {
            var options = {
                key: params.key,
                cert: params.cert,
                ca: params.ca,
                requestCert: params.requestCert,
                rejectUnauthorized: params.rejectUnauthorized
            };
            server = tls.createServer(options);
            server.on('error', this.emit.bind(this, 'error'));
            if (params.host) {
                server.listen(
                    params.port, params.host,
                    this.emit.bind(this, 'ready')
                );
            }
            else {
                server.listen(
                    params.port,
                    this.emit.bind(this, 'ready')
                );
            }
        }
        else {
            server = net.createServer();
            server.on('error', this.emit.bind(this, 'error'));
            server.listen(
                params.port, params.host,
                this.emit.bind(this, 'ready')
            );
        }
    }
    else if (params.path) {
        server = net.createServer();
        server.on('error', this.emit.bind(this, 'error'));
        server.listen(
            params.path,
            this.emit.bind(this, 'ready')
        );
    }
    else if (server && (
        server instanceof http.Server
        || server.hasOwnProperty('httpAllowHalfOpen')
        || params.webserver
    )) {
        // a webserver, use socket.io
        server = SocketIO(
            server || params.webserver,
            params.mount || '/dnode.js',
            params.io || {}
        );
    }
    
    if (!server) {
        this.emit('error', new Error('Not sure how to fire up this listener'));
    }
    
    var clients = {};
    var listenFor = server instanceof tls.Server
        ? 'secureConnection'
        : 'connection'
    ;
    
    server.on(listenFor, function (stream) {
        var client = createClient(self.proto, stream);
        clients[client.id] = client;
        
        self.stack.forEach(function (middleware) {
            middleware.call(client.instance, client.remote, client);
        });
        
        if (params.block) {
            client.on('remote', function () {
                params.block.call(client.instance, client.remote, client);
            });
        }
        
        client.start();
    });
    
    this.server = server;
    server.on('close', this.emit.bind(this, 'close'));
    
    return this;
};

function createClient (proto, stream) {
    var client = proto.create();
    
    process.nextTick(function () {
        if (client.listeners('error').length === 0) {
            // default error handler to keep everything from crashing
            client.on('error', function (err) {
                console.error(err && err.stack || err);
            })
        }
    });
    
    client.stream = stream;
    client.end = stream.end.bind(stream);
    client.destroy = stream.destroy.bind(stream);
    
    stream.on('end', client.emit.bind(client, 'end'));
    
    client.on('request', function (req) {
        if (stream.writable) {
            stream.write(JSON.stringify(req) + '\n');
        }
        else {
            client.emit('dropped', req);
        }
    });
    
    Lazy(stream).lines
        .map(String)
        .forEach(client.parse)
    ;
    
    return client;
}

dnode.prototype.end = function () {
    Object.keys(this.proto.sessions)
        .forEach((function (id) {
            this.proto.sessions[id].stream.end()
        }).bind(this))
    ;
    this.emit('end');
};

dnode.prototype.close = function () {
    this.server.close();
};
 
dnode.connect = function () {
    var d = dnode();
    return d.connect.apply(d, arguments);
};

dnode.listen = function () {
    var d = dnode();
    return d.listen.apply(d, arguments);
};
