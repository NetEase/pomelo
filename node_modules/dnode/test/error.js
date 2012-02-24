var dnode = require('../');
var sys = require('sys');
var test = require('tap').test;

test('errors', function (t) {
    t.plan(4);
    var port = Math.floor(Math.random() * 40000 + 10000);
    var errors = { server : [], client : [] };
    
    var server = dnode(function (remote, conn) {
        conn.on('error', function (err) {
            errors.server.push(err);
        });
        
        this.one = function () {
            throw 'string throw'
        };
        
        this.two = function () {
            undefined.name
        };
        
        this.three = function () {
            remote.pow();
        };
    }).listen(port);
    
    var ts = setTimeout(function () {
        t.fail('server never ended');
    }, 5000);
    
    server.on('end', function () {
        clearTimeout(ts);
        t.deepEqual(errors.server[0], 'string throw');
        
        try { undefined.name }
        catch (refErr) {
            process.nextTick(function () {
                t.equal(refErr.message, errors.server[1].message);
                t.equal(refErr.type, errors.server[1].type);
                t.equal(errors.server.length, 2);
                t.end();
            });
        }
    });
    
    server.on('ready', function () {
        var client = dnode(function (client, conn) {
            conn.on('error', function (err) {
                errors.client.push(err);
            });
            
            conn.on('end', function () {
                t.deepEqual(errors.client, [ 'Local error' ]);
            });
            
            this.pow = function () {
                throw 'Local error';
            };
        }).connect(port, function (remote, conn) {
            remote.one();
            remote.two();
            remote.three();
            
            setTimeout(function () {
                conn.end();
                server.end();
                server.close();
            }, 500);
        });
    });
});

test('refused', function (t) {
    t.plan(2);
    
    var port = Math.floor(Math.random() * 40000 + 10000);
    var client = dnode.connect(port, function (remote, conn) {
        assert.fail('should have been refused, very unlikely');
    });
    
    client.on('error', function (err) {
        t.equal(err.code, 'ECONNREFUSED');
        t.equal(err.syscall, 'connect');
        t.end();
    });
});
