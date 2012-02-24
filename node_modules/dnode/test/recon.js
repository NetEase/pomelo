var dnode = require('../');
var test = require('tap').test;

test('recon', function (t) {
    t.plan(4);
    var port = Math.floor(Math.random() * 40000 + 10000);
    
    var scounts = { connect : 0, ready : 0 };
    var ccounts = { connect : 0, ready : 0 };
    
    var server = dnode(function (remote, conn) {
        scounts.connect ++;
        conn.on('ready', function () {
            scounts.ready ++;
        });
    }).listen(port);
    
    dnode(function (remote, conn) {
        ccounts.connect ++;
        conn.on('ready', function () {
            ccounts.ready ++;
            setTimeout(function () {
                if (ccounts.ready >= 4) {
                    conn.end();
                }
                else {
                    conn.stream.end();
                }
            }, 25);
        });
        
    }).connect(port, { reconnect : 100 });
    
    setTimeout(function () {
        t.ok(scounts.connect >= 2);
        t.ok(scounts.ready >= 2);
        
        t.equal(ccounts.connect, scounts.connect);
        t.equal(ccounts.ready, scounts.ready);
        
        server.close();
        t.end();
    }, 1000);
});
