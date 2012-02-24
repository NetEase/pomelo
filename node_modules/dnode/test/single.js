var dnode = require('../')
var test = require('tap').test;

test('simple', function (t) {
    t.plan(3);
    var port = Math.floor(Math.random() * 40000 + 10000);
    
    var server = dnode({
        timesTen : function (n,reply) {
            t.equal(n.number, 5);
            reply(n.number * 10);
        },
        print : function (n,reply) {
            reply(sys.inspect(n));
        },
    }).listen(port);
    
    server.on('ready', function () {
        dnode.connect(port, function (remote, conn) {
            t.equal(conn.stream.remoteAddress, '127.0.0.1');
            var args = {
                number : 5,
                func : function () {},
            };
            
            remote.timesTen(args, function (m) {
                t.equal(m, 50, '5 * 10 == 50');
                conn.end();
                server.close();
                t.end();
            });
        });
    });
});
