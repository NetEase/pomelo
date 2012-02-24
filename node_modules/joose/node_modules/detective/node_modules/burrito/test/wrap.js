var assert = require('assert');
var burrito = require('../');
var vm = require('vm');

exports.preserveTernaryParentheses = function () {
    var originalSource = '"anything" + (x ? y : z) + "anything"';
    var burritoSource = burrito(originalSource, function (node) {
        // do nothing. we just want to check that ternary parens are persisted
    });
    
    var ctxt = {
        x : false,
        y : 'y_'+~~(Math.random()*10),
        z : 'z_'+~~(Math.random()*10)
    };
    
    var expectedOutput = vm.runInNewContext(originalSource, ctxt);
    var burritoOutput = vm.runInNewContext(burritoSource, ctxt);
    
    assert.equal(burritoOutput, expectedOutput);
    
    ctxt.x = true;
    
    expectedOutput = vm.runInNewContext(originalSource, ctxt);
    burritoOutput = vm.runInNewContext(burritoSource, ctxt);
    
    assert.equal(burritoOutput, expectedOutput);
};

exports.wrapCalls = function () {
    var src = burrito('f() && g(h())\nfoo()', function (node) {
        if (node.name === 'call') node.wrap('qqq(%s)');
        if (node.name === 'binary') node.wrap('bbb(%s)');
        assert.ok(node.state);
        assert.equal(this, node.state);
    });
    
    var tg = setTimeout(function () {
        assert.fail('g() never called');
    }, 5000);
    
    var times = { bbb : 0, qqq : 0 };
    
    var res = [];
    vm.runInNewContext(src, {
        bbb : function (x) {
            times.bbb ++;
            res.push(x);
            return x;
        },
        qqq : function (x) {
            times.qqq ++;
            res.push(x);
            return x;
        },
        f : function () { return true },
        g : function (h) {
            clearTimeout(tg);
            assert.equal(h, 7);
            return h !== 7
        },
        h : function () { return 7 },
        foo : function () { return 'foo!' },
    });
    
    assert.deepEqual(res, [
        true, // f()
        7, // h()
        false, // g(h())
        false, // f() && g(h())
        'foo!', // foo()
    ]);
    assert.equal(times.bbb, 1);
    assert.equal(times.qqq, 4);
};

exports.wrapFn = function () {
    var src = burrito('f(g(h(5)))', function (node) {
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

exports.binaryString = function () {
    var src = 'z(x + y)';
    var context = {
        x : 3,
        y : 4,
        z : function (n) { return n * 10 },
    };
    
    var res = burrito.microwave(src, context, function (node) {
        if (node.name === 'binary') {
            node.wrap('%a*2 - %b*2');
        }
    });
    
    assert.equal(res, 10 * (3*2 - 4*2));
};

exports.binaryFn = function () {
    var src = 'z(x + y)';
    var context = {
        x : 3,
        y : 4,
        z : function (n) { return n * 10 },
    };
    
    var res = burrito.microwave(src, context, function (node) {
        if (node.name === 'binary') {
            node.wrap(function (expr, a, b) {
                return '(' + a + ')*2 - ' + '(' + b + ')*2';
            });
        }
    });
    
    assert.equal(res, 10 * (3*2 - 4*2));
};

exports.intersperse = function () {
    var src = '(' + (function () {
        f();
        g();
    }).toString() + ')()';
    
    var times = { f : 0, g : 0, zzz : 0 };
    
    var context = {
        f : function () { times.f ++ },
        g : function () { times.g ++ },
        zzz : function () { times.zzz ++ },
    };
    
    burrito.microwave(src, context, function (node) {
        if (node.name === 'stat') node.wrap('{ zzz(); %s }');
    });
    
    assert.deepEqual(times, { f : 1, g : 1, zzz : 3 });
};
