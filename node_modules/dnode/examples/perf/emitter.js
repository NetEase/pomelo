var dnode = require('dnode');
var EventEmitter = require('events').EventEmitter;

var clients = {};
setInterval(function () {
    Object.keys(clients).forEach(function (id) {
        var i = Math.floor(Math.random() * Math.pow(2,32));
        clients[id].emit(i);
    });
}, 1000 / 50); // 50 fps

dnode(function (client, conn) {
    conn.on('ready', function () {
        clients[conn.id] = client;
    });
    
    conn.on('end', function () {
        delete clients[conn.id];
    });
}).listen(7575);
