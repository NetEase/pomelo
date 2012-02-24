var dnode = require('../');
var test = require('tap').test;

test('unicode', function (t) {
    t.plan(2);
    var port = Math.floor(Math.random() * 40000 + 10000);
    
    var server = dnode({
        unicodes : function (reply) {
            reply('☔☔☔☁☼☁❄');
        }
    }).listen(port);
    
    server.on('ready', function () {
        dnode.connect(port, function (remote, conn) {
            t.equal(conn.stream.remoteAddress, '127.0.0.1');
            remote.unicodes(function (str) {
                t.equal(str, '☔☔☔☁☼☁❄', 'remote unicodes == ☔☔☔☁☼☁❄');
                
                conn.end();
                server.close();
                t.end();
            });
        });
    });
});
