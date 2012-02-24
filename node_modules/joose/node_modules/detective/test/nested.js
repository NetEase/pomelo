var assert = require('assert');
var detective = require('../');
var fs = require('fs');
var src = fs.readFileSync(__dirname + '/files/nested.js');

exports.nested = function () {
    assert.deepEqual(detective(src), [ 'a', 'b', 'c' ]);
};
