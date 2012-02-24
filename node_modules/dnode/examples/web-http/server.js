var http = require('http');
var fs = require('fs');
var dnode = require('dnode');

var index = fs.readFileSync(__dirname + '/index.html');

var server = http.createServer(function (req, res) {
    if (req.url === '/') {
        res.writeHead(200, { 'Content-Type' : 'text/html' });
        res.end(index);
    }
});

dnode(function (client) {
    this.cat = function (cb) {
        cb('meow');
    };
}).listen(server);

server.listen(6857);
console.log('http://localhost:6857/');
