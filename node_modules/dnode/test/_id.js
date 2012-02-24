var dnode = require('../');
var test = require('tap').test;

test('_id', function (t) {
    t.plan(1);
    var port = Math.floor(Math.random() * 40000 + 10000);
    
    var server = dnode({ _id : 1337 }).listen(port);
    
    server.on('ready', function () {
        dnode.connect(port, function (remote, conn) {
            t.equal(remote._id, 1337);
            conn.end();
            server.close();
            t.end();
        });
    });
});
