#!/usr/bin/env node
// Connect to the auth server and display a quote from it.

var DNode = require('dnode');
var sys = require('sys');

if (process.argv.length < 4) {
    sys.puts('Usage: ./client.js user pass');
    process.exit();
}

var user = process.argv[2];
var pass = process.argv[3];

DNode.connect(7007, function (remote,conn) {
    remote.authenticate(user, pass, function (session) {
        if (session) {
            sys.puts('Authentication success');
            session.quote(function (q) {
                sys.puts('\nAnd now for a quote by ' + q.who + ':\n\n');
                sys.puts(q.quote + '\n\n');
                conn.end();
            });
        }
        else {
            sys.puts('Authentication failure');
            conn.end();
        }
    });
});
