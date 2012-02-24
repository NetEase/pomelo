var assert = require('assert');
var detective = require('../');
var fs = require('fs');
var src = fs.readFileSync(__dirname + '/files/both.js');

exports.both = function () {
    var modules = detective.find(src);
    assert.deepEqual(modules.strings, [ 'a', 'b' ]);
    assert.deepEqual(modules.expressions, [ '"c"+x', '"d"+y' ]);
};
