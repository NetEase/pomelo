var assert = require('assert');
var browserify = require('browserify');
var vm = require('vm');

exports.browserify = function () {
    var src = browserify(__dirname + '/../dist/browserify.js').bundle();
    Function(src);
};
