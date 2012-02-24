var assert = require('assert');
var burrito = require('../');
var vm = require('vm');

exports.ast = function () {
    var ast = burrito.parse('f(g(h(5)))', false, true);
    var src = burrito(ast, function (node) {
        if (node.name === 'call') {
            node.wrap(function (s) {
                return 'z(' + s + ')';
            });
        }
    });
    
    var times = 0;
    assert.equal(
        vm.runInNewContext(src, {
            f : function (x) { return x + 1 },
            g : function (x) { return x + 2 },
            h : function (x) { return x + 3 },
            z : function (x) {
                times ++;
                return x * 10;
            },
        }),
        (((((5 + 3) * 10) + 2) * 10) + 1) * 10
    );
    assert.equal(times, 3);
};
