// simple dnode chat server with browserify

var express = require('express');
var app = express.createServer();
app.use(express.static(__dirname));

var browserify = require('browserify');
app.use(browserify(__dirname + '/entry.js', { watch : true }));

app.listen(6061);
console.log('http://localhost:6061/');

var EventEmitter = require('events').EventEmitter;
var emitter = new EventEmitter;

var clients = {};

var dnode = require('../../');
dnode(ChatServer).listen(app);

function ChatServer (client, con) {
    var evNames = [ 'joined', 'said', 'parted' ];
    
    con.on('ready', function () {
        evNames.forEach(function (name) {
            emitter.on(name, client[name]);
        });
        emitter.emit('joined', client.name);
        
        clients[client.name] = client;
    });
    
    con.on('end', function () {
        evNames.forEach(function (name) {
            if (typeof client[name] === 'function') {
                emitter.removeListener(name, client[name]);
            }
        });
        emitter.emit('parted', client.name);
        delete clients[client.name];
    });
    
    this.say = function (msg) {
        emitter.emit('said', client.name, msg);
    };
    
    this.names = function (cb) {
        cb(Object.keys(clients))
    };
}
