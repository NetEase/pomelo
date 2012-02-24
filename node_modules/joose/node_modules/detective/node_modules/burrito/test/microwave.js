var assert = require('assert');
var burrito = require('../');

exports.microwave = function () {
    var times = 0;
    var context = {
        f : function (x) { return x + 1 },
        g : function (x) { return x + 2 },
        h : function (x) { return x + 3 },
        z : function (x) {
            times ++;
            return x * 10;
        },
    };
    
    var res = burrito.microwave('f(g(h(5)))', context, function (node) {
        if (node.name === 'call') {
            node.wrap(function (s) {
                return 'z(' + s + ')';
            });
        }
    });
    
    assert.equal(res, (((((5 + 3) * 10) + 2) * 10) + 1) * 10);
    assert.equal(times, 3);
};

exports.emptyContext = function () {
    var res = burrito.microwave('Math.sin(2)', function (node) {
        if (node.name === 'num') node.wrap('Math.PI / %s');
    });
    assert.equal(res, 1);
};
