var dnode = require('../');
var test = require('tap').test;

test('circular refs', function (t) {
    t.plan(7);
    var port = Math.floor(Math.random() * 40000 + 10000);
    
    var server = dnode({
        sendObj : function (ref, f) {
            t.equal(ref.a, 1);
            t.equal(ref.b, 2);
            t.deepEqual(ref.c, ref);
            
            ref.d = ref.c;
            
            f(ref);
        },
    }).listen(port);
    
    server.on('ready', function () {
        dnode.connect(port, function (remote, conn) {
            var obj = { a : 1, b : 2 };
            obj.c = obj;
            
            remote.sendObj(obj, function (ref) {
                t.equal(ref.a, 1);
                t.equal(ref.b, 2);
                t.deepEqual(ref.c, ref);
                t.deepEqual(ref.d, ref);
                conn.end();
                server.close();
                t.end();
            });
        });
    });
});
