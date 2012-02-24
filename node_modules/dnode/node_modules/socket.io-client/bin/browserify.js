#!/usr/bin/env node
var fs = require('fs');
var dist = fs.readFileSync(__dirname + '/../dist/socket.io.js');
var src = '(function () {'
    + 'var io = module.exports;'
    + dist
    + '}).call(window)'
;
fs.writeFileSync(__dirname + '/../dist/browserify.js', src);
