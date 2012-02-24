var express = require('express');
var app = express.createServer();
app.use(express.static(__dirname));

var dnode = require('../');
dnode(function (client) {
    this.cat = function (cb) {
        cb('meow', function (dog) {
            dog('woof');
        });
    };
}).listen(app);

var port = process.argv[2] || 8420;
app.listen(port);
console.log('Listening on :' + port);
