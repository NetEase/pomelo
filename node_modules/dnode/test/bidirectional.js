var dnode = require('../');
var test = require('tap').test;

test('bidirectional', function (t) {
    t.plan(5);
    var port = Math.floor(Math.random() * 40000 + 10000);
    var counts = { timesX : 0, clientX : 0, x : 0 };
    
    var server = dnode(function (client) {
        this.timesX = function (n,f) {
            t.equal(n, 3, "timesX's n == 3");
            counts.timesX ++;
            client.x(function (x) {
                t.equal(x, 20, 'client.x == 20');
                counts.clientX ++;
                f(n * x);
            });
        }; 
    }).listen(port);
    
    server.on('ready', function () {
        dnode({
            x : function (f) {
                counts.x ++;
                f(20);
            }
        }).connect(port, function (remote, conn) {
            remote.timesX(3, function (res) {
                t.equal(res, 60, 'result of 20 * 3 == 60');
                conn.end();
                server.close();
            });
        });
    });
    
    server.once('close', function () {
        t.equal(counts.timesX, 1, 'timesX called once');
        t.equal(counts.clientX, 1, 'clientX called once');
        t.end();
    });
});
