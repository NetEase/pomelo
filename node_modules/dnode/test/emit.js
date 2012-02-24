var test = require('tap').test;
var EventEmitter = require('events').EventEmitter;
var dnode = require('../');

test('emit events', function (t) {
    t.plan(2);
    var port = Math.floor(Math.random() * ((1<<16)-1e4)) + 1e4;
    
    var subs = [];
    function publish (name) {
        var args = [].slice.call(arguments, 1);
        subs.forEach(function (sub) {
            sub.emit(name, args);
        });
    }
    
    var server = dnode(function (remote, conn) {
        this.subscribe = function (emit) {
            subs.push({ emit : emit, id : conn.id });
            
            conn.on('end', function () {
                for (var i = 0; i < subs.length; i++) {
                    if (subs.id === conn.id) {
                        subs.splice(i, 1);
                        break;
                    }
                }
            });
        };
    }).listen(port);
    
    server.on('ready', function () {
        setTimeout(function () {
            var iv = setInterval(function () {
                publish('data', Math.floor(Math.random() * 100));
            }, 20);
            
            server.on('close', function () {
                clearInterval(iv);
            });
        }, 20);
        
        var xs = [];
        var x = dnode.connect(port, function (remote) {
            var em = new EventEmitter;
            em.on('data', function (n) { xs.push(n) });
            remote.subscribe(em.emit.bind(em));
        });
        
        var ys = [];
        var y = dnode.connect(port, function (remote) {
            var em = new EventEmitter;
            em.on('data', function (n) { ys.push(n) });
            remote.subscribe(em.emit.bind(em))
        });
        
        setTimeout(function () {
            t.ok(xs.length > 5);
            t.deepEqual(xs, ys);
            
            x.end();
            y.end();
            
            server.close();
            t.end();
        }, 200);
    });
});
