var dnode = require('../');
var test = require('tap').test;

test('unix', function (t) {
    t.plan(1);
    
    var sfile = '/tmp/unix_socket_' + Math.floor(
        Math.random() * Math.pow(2, 32)
    ).toString(16);
    
    var server = dnode({ f : function (cb) { cb(1337) } }).listen(sfile);
    
    server.on('ready', function () {
        dnode.connect(sfile, function (remote, conn) {
            remote.f(function (x) {
                t.equal(x, 1337);
                server.close();
                conn.end();
                t.end();
            });
        });
    });
});
