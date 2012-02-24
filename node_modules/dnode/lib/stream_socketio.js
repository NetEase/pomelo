var EventEmitter = require('events').EventEmitter;
var Stream = require('stream').Stream;
var io = require('socket.io');
var fs = require('fs');

var bundle = (function () {
    var cache = null;
    var file = __dirname + '/../browser/bundle.js';
    
    return function (req, res) {
        if (cache) {
            res.setHeader('content-type', 'text/javascript');
            res.setHeader('last-modified', cache.modified.toGMTString());
            res.setHeader('date', new Date().toGMTString());
            
            var ims = req.headers['if-modified-since'];
            if (ims) {
                var m = new Date(ims);
                if (m >= cache.modified) {
                    res.statusCode = 304;
                    res.end();
                    return;
                }
            }
            
            res.statusCode = 200;
            res.end(cache.source);
        }
        else fs.stat(file, function (err0, stat) {
            fs.readFile(file, function (err1, src) {
                if (err0 || err1) {
                    var e = err0 || err1;
                    console.error(e.message || e);
                    res.statusCode = 500;
                    res.setHeader('content-type', 'text/plain');
                    res.end('an error occured loading the bundle');
                }
                else {
                    cache = {
                        source : src,
                        modified : stat.mtime,
                    };
                    bundle(req, res);
                }
            });
        });
    };
})();

module.exports = function (webserver, mount, ioOptions) {
    if (ioOptions['log level'] === undefined) {
        ioOptions['log level'] = -1;
    }
    
    var sock = io.listen(webserver, ioOptions);
    sock.set('logger', {
        error : function () {},
        warn : function () {},
        info : function () {},
        debug : function () {}
    });
    
    var server = new EventEmitter;
    server.socket = sock;
    
    if (mount && webserver.use) {
        webserver.use(function (req, res, next) {
            if (req.url.split('?')[0] === mount) {
                bundle(req, res);
            }
            else next()
        });
    }
    else if (mount) {
        if (!webserver._events) webserver._events = {};
        var ev = webserver._events;
        
        if (!ev.request) ev.request = [];
        if (!Array.isArray(ev.request)) ev.request = [ ev.request ];
        
        ev.request.push(function (req, res) {
            if (!res.finished && req.url.split('?')[0] === mount) {
                bundle(req, res);
            }
        });
    }
    
    sock.sockets.on('connection', function (client) {
        var stream = new Stream;
        
        stream.socketio = client;
        stream.readable = true;
        stream.writable = true;
        
        stream.write = client.send.bind(client);
        stream.end = stream.destroy = client.disconnect.bind(client);
        
        client.on('message', stream.emit.bind(stream, 'data'));
        client.on('error', stream.emit.bind(stream, 'error'));
        
        client.on('disconnect', function () {
            stream.writable = false;
            stream.readable = false;
            stream.emit('end');
        });
        
        server.emit('connection', stream);
    });
    
    return server;
};
