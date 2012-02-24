var burrito = require('../');
var assert = require('assert');
var fs = require('fs');
var src = fs.readFileSync(__dirname + '/fail/src.js', 'utf8');

exports.fail = function () {
    burrito(src, function (node) {});
};
