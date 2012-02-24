var dnode = require('../');
var net = require('net');
var test = require('tap').test;

test('stream', function (t) {
    t.plan(1);
    var port = Math.floor(Math.random() * 40000 + 10000);
    
    var server = dnode({
        meow : function f (g) { g('cats') }
    });
    
    var netServer = net.createServer();
    server.listen(netServer);
    
    var times = 0;
    netServer.listen(port, function () {
        var netClient = net.createConnection(port);
        dnode.connect(netClient, function (remote) {
            remote.meow(function (cats) {
                t.equal(cats, 'cats');
                
                netClient.end();
                netServer.close();
                t.end();
            });
        });
    });
});
