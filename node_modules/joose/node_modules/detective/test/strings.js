var assert = require('assert');
var detective = require('../');
var fs = require('fs');
var src = fs.readFileSync(__dirname + '/files/strings.js');

exports.single = function () {
    assert.deepEqual(detective(src), [ 'a', 'b', 'c', 'events', 'doom', 'y', 'events2' ]);
};
