#!/usr/bin/env node
// Serve an object with authentication

var DNode = require('dnode');
var sys = require('sys');
var fs = require('fs');

var quotes = JSON.parse(
    fs.readFileSync(__dirname + '/quotes.json').toString()
);

// Serve up a Session object only after the client supplies the valid user/pass
DNode(function (client, connection) {
    this.authenticate = function (user, pass, cb) {
        if (user == 'moo' && pass == 'hax') {
            sys.puts('Sign in as ' + sys.inspect(user) + ' succeeded!');
            cb(new Session({
                user : user,
                client : client,
                connection : connection,
            }));
        }
        else {
            sys.puts('Sign in as ' + sys.inspect(user) + ' failed!');
            cb(null);
        }
    };
}).listen(7007);

// Clients who connect get an instance of this session object:
function Session (params) {
    var conn = params.connection;
    var user = params.user;
    var client = params.client;
    
    conn.addListener('end', function () {
        sys.puts('User ' + sys.inspect(user) + ' disconnected');
    });
    
    this.quote = function (f) {
        var i = Math.floor(Math.random() * quotes.length);
       f(quotes[i]);
    };
}
