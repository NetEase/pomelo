var connect = require('connect');
var browserify = require('browserify');
var dnode = require('dnode');

var server = connect.createServer();

server.use(connect.static(__dirname));

server.use(browserify({
    require : 'dnode',
    mount : '/browserify.js'
}));

dnode(function (client) {
    this.cat = function (cb) {
        cb('meow');
    };
}).listen(server);

server.listen(6857);
console.log('http://localhost:6857/');
