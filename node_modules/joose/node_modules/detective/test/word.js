var assert = require('assert');
var detective = require('../');
var fs = require('fs');
var src = fs.readFileSync(__dirname + '/files/word.js');

exports.word = function () {
    assert.deepEqual(
        detective(src, { word : 'load' }),
        [ 'a', 'b', 'c', 'events', 'doom', 'y', 'events2' ]
    );
};
