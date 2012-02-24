var express = require('express');
var server = express.createServer();
var dnode = require('dnode');

server.use(express.static(__dirname));

dnode(function (client) {
    this.cat = function (cb) {
        cb('meow');
    };
}).listen(server);

server.listen(6857);
console.log('http://localhost:6857/');
