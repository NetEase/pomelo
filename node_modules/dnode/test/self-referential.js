var dnode = require('../')
var test = require('tap').test;

test('simple', function (t) {
    t.plan(6);
    var port = Math.floor(Math.random() * 40000 + 10000);
    
    var server = dnode({
        timesTen : function (n,reply) {
            t.equal(n.number, 5);
            reply(n.number * 10);
        },
        print : function (n,reply) {
            t.strictEqual(n[0],1);
            t.strictEqual(n[1],2);
            t.strictEqual(n[2],3);
            t.strictEqual(n[3],n);
            reply(n);
        },
    }).listen(port);
    
    server.on('ready', function () {
        dnode.connect(port, function (remote, conn) {
            t.equal(conn.stream.remoteAddress, '127.0.0.1');
            var args = [1,2,3]
            args.push(args)
            
            remote.print(args, function (m) {
                t.deepEqual(m, args);
                
                conn.end();
                server.close();
                t.end();
            });
        });
    });
});
