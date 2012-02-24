var test = require('tap').test;
var dnode = require('../');
var http = require('http');
var express = require('express');

test('checkCookieHTTP', function (t) {
    t.plan(3);
    var port = Math.floor(10000 + (Math.random() * Math.pow(2,16) - 10000));
    
    var web = http.createServer(function (req, res) {
        res.setHeader('set-cookie', [ 'foo=bar' ]);
        
        if (req.url === '/') {
            res.setStatus(200);
            res.setHeader('content-type', 'text/html');
            res.end('pow');
        }
    });
    var server = dnode().listen(web);
    
    web.listen(port, function () {
        var req = {
            host : 'localhost',
            port : port,
            path : '/dnode.js',
        };
        http.get(req, function (res) {
            t.equal(res.statusCode, 200);
            t.equal(res.headers['content-type'], 'text/javascript');
            t.deepEqual(res.headers['set-cookie'], [ 'foo=bar' ]);
            
            web.close();
            server.end();
        });
    });
});

test('checkCookieExpress', function (t) {
    t.plan(3);
    var port = Math.floor(10000 + (Math.random() * Math.pow(2,16) - 10000));
    
    var app = express.createServer();
    app.use(function (req, res, next) {
        res.setHeader('set-cookie', [ 'foo=bar' ]);
        next();
    }); 
    
    app.get('/', function (req, res) {
        res.setStatus(200);
        res.setHeader('content-type', 'text/html');
        res.end('pow');
    });
    
    var server = dnode().listen(app);
    
    app.listen(port, function () {
        var req = {
            host : 'localhost',
            port : port,
            path : '/dnode.js',
        };
        http.get(req, function (res) {
            t.equal(res.statusCode, 200);
            t.deepEqual(res.headers['set-cookie'], [ 'foo=bar' ]);
            t.equal(res.headers['content-type'], 'text/javascript');
            
            app.close();
            server.end();
            t.end();
        });
    });
});
