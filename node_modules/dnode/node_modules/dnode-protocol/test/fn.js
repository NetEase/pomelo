var assert = require('assert');
var proto = require('../');
var Traverse = require('traverse');
var EventEmitter = require('events').EventEmitter;

exports.protoFn = function () {
    var server = proto(function (remote, conn) {
        assert.ok(conn);
        assert.ok(conn instanceof EventEmitter);
        
        var tr = setTimeout(function () {
            assert.fail('never got ready event');
        }, 5000);
        
        conn.on('ready', function () {
            clearTimeout(tr);
            assert.eql(remote, { a : 1, b : 2 });
        });
        
        this.x = function (f, g) {
            setTimeout(f.bind({}, 7, 8, 9), 50);
            setTimeout(g.bind({}, [ 'q', 'r' ]), 100);
        };
        this.y = 555;
    });
    
    var client = proto({ a : 1, b : 2 });
    
    var s = server.create();
    var c = client.create();
    
    var sreqs = [];
    s.on('request', function (req) {
        sreqs.push(Traverse.clone(req));
        c.handle(req);
    });
    
    var creqs = [];
    c.on('request', function (req) {
        creqs.push(Traverse.clone(req));
        s.handle(req);
    });
    
    var tf = setTimeout(function () {
        assert.fail('never called f');
    }, 5000);
    
    var tg = setTimeout(function () {
        assert.fail('never called g');
    }, 5000);
    
    s.start();
    
    assert.eql(sreqs, [ {
        method : 'methods',
        arguments : [ { x : '[Function]', y : 555 } ],
        callbacks : { 0 : [ '0', 'x' ] },
        links : [],
    } ]);
    
    c.start();
    
    assert.eql(creqs, [ {
        method : 'methods',
        arguments : [ { a : 1, b : 2 } ],
        callbacks : {},
        links : [],
    } ]);
    
    c.request('x', [
        function (x, y , z) {
            clearTimeout(tf); 
            assert.eql([ x, y, z ], [ 7, 8, 9 ]);
        },
        function (qr) {
            clearTimeout(tg);
            assert.eql(qr, [ 'q', 'r' ]);
        }
    ]);
    
    assert.eql(creqs.slice(1), [ {
        method : 'x',
        arguments : [ '[Function]', '[Function]' ],
        callbacks : { 0 : [ '0' ], 1 : [ '1' ] },
        links : [],
    } ]);
    
    var tt = setTimeout(function () {
        assert.fail('broken json never emitted an error');
    }, 5000);
    c.on('error', function (err) {
        clearTimeout(tt);
        assert.ok(err.stack);
        assert.ok(err.message.match(/^Error parsing JSON/));
        assert.ok(err instanceof SyntaxError);
    });
    c.parse('{');
};
