var assert = require('assert');
var burrito = require('../');

exports.wrapError = function () {
    try {
        var src = burrito('f() && g()', function (node) {
            if (node.name === 'binary') node.wrap('h(%a, %b')
        });
        assert.fail('should have blown up');
    }
    catch (err) {
        assert.ok(err.message.match(/unexpected/i));
        assert.ok(err instanceof SyntaxError);
        assert.ok(!err.stack.match(/uglify-js/));
        assert.equal(err.line, 0);
        assert.equal(err.col, 10);
        assert.equal(err.pos, 10);
    }
};

exports.nonString = function () {
    assert.throws(function () {
        burrito.parse(new Buffer('[]'));
    });
    
    assert.throws(function () {
        burrito.parse(new String('[]'));
    });
    
    assert.throws(function () {
        burrito.parse();
    });
};

exports.syntaxError = function () {
    try {
        var src = burrito('f() && g())', function (node) {
            if (node.name === 'binary') node.wrap('h(%a, %b)')
        });
        assert.fail('should have blown up');
    }
    catch (err) {
        assert.ok(err.message.match(/unexpected/i));
        assert.ok(err instanceof SyntaxError);
        assert.ok(!err.stack.match(/uglify-js/));
    }
};
