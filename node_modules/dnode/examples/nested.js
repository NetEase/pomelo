#!/usr/bin/env node
var DNode = require('dnode');
var sys = require('sys');
var EventEmitter = require('events').EventEmitter;

// server-side:
var server1 = DNode({
    timesTen : function (n,reply) { reply(n * 10) }
}).listen(6060);

var server2 = DNode({
    timesTwenty : function (n,reply) { reply(n * 20) }
}).listen(6061);

var moo = new EventEmitter;

// client-side:
// Good thing this example is so contrived. Real code doesn't turn out this
// ugly very often on purpose.
server1.on('ready', function () {
    server2.on('ready', function () {
        DNode.connect(6060, function (remote1) {
            DNode.connect(6061, function (remote2) {
                moo.addListener('hi', function (x) {
                    remote1.timesTen(x, function (res) {
                        sys.puts(res);
                        remote2.timesTwenty(res, function (res2) {
                            sys.puts(res2);
                        });
                    });
                });
                remote2.timesTwenty(5, function (n) {
                    sys.puts(n); // 100
                    remote1.timesTen(0.1, function (n) {
                        sys.puts(n); // 1
                    });
                });
            });
        });
    });
});

setTimeout(function() {
    moo.emit('hi', 100);
}, 500);

setTimeout(function () {
    // kill the service after a while
    server1.end();
    server2.end();
}, 1000);

/*
    Output:
    100
    1
    ... after half a second ...
    1000
    20000
*/

