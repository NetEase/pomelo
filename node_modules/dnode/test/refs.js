var dnode = require('../');
var test = require('tap').test;

test('refs', function (t) {
    t.plan(2);
    var port = Math.floor(Math.random() * 40000 + 10000);
    
    var server = dnode({
        a : 1,
        b : 2,
    }).listen(port);
    
    server.on('ready', function () {
        dnode.connect(port, function (remote, conn) {
            conn.end();
            server.close();
            t.equal(remote.a, 1);
            t.equal(remote.b, 2);
            t.end();
        });
    });
});
