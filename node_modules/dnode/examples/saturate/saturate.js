#!/usr/bin/env node

var connect = require('connect');
var server = connect.createServer(
    connect.static(__dirname)
);

var clients = {};

var Hash = require('traverse/hash');
function publish () {
    var args = [].slice.call(arguments);
    Hash(clients).forEach(
        function (emit) { emit.apply({}, args) }
    );
}

var DNode = require('dnode');
DNode(function (client, conn) {
    conn.on('ready', function () {
        clients[conn.id] = client.emit;
    });
    
    conn.on('end', function () {
        delete clients[conn.id];
    });
}).listen(server);

console.log('http://localhost:6061/');
server.listen(6061);

setInterval(function () {
    var n = Math.floor(Math.random() * 3e4);
    var buf = new Buffer(n);
    publish('data', buf.toString());
}, 50);
