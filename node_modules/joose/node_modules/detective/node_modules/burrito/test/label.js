var assert = require('assert');
var burrito = require('../');

exports.callLabel = function () {
    var times = 0;
    var src = burrito('foo(10)', function (node) {
        if (node.name === 'call') {
            assert.equal(node.label(), 'foo');
            times ++;
        }
    });
    
    assert.equal(times, 1);
};

exports.varLabel = function () {
    var times = 0;
    var src = burrito('var x = 2', function (node) {
        if (node.name === 'var') {
            assert.deepEqual(node.label(), [ 'x' ]);
            times ++;
        }
    });
    
    assert.equal(times, 1);
};

exports.varsLabel = function () {
    var times = 0;
    var src = burrito('var x = 2, y = 3', function (node) {
        if (node.name === 'var') {
            assert.deepEqual(node.label(), [ 'x', 'y' ]);
            times ++;
        }
    });
    
    assert.equal(times, 1);
};

exports.defunLabel = function () {
    var times = 0;
    var src = burrito('function moo () {}', function (node) {
        if (node.name === 'defun') {
            assert.deepEqual(node.label(), 'moo');
            times ++;
        }
    });
    
    assert.equal(times, 1);
};

exports.functionLabel = function () {
    var times = 0;
    var src = burrito('(function zzz () {})()', function (node) {
        if (node.name === 'function') {
            assert.deepEqual(node.label(), 'zzz');
            times ++;
        }
    });
    
    assert.equal(times, 1);
};

exports.anonFunctionLabel = function () {
    var times = 0;
    var src = burrito('(function () {})()', function (node) {
        if (node.name === 'function') {
            assert.ok(node.label() === null);
            times ++;
        }
    });
    
    assert.equal(times, 1);
};

exports.dotCallLabel = function () {
    var times = 0;
    var src = burrito('process.nextTick(fn)', function (node) {
        if (node.name === 'call') {
            assert.equal(node.label(), 'nextTick');
            times ++;
        }
    });
    
    assert.equal(times, 1);
};

exports.tripleDotLabel = function () {
    var times = 0;
    var src = burrito('a.b.c(fn)', function (node) {
        if (node.name === 'call') {
            assert.equal(node.label(), 'c');
            times ++;
        }
    });
    
    assert.equal(times, 1);
};

exports.exprLabel = function () {
    var times = 0;
    var src = burrito('a.b[x+1](fn)', function (node) {
        if (node.name === 'call') {
            assert.ok(node.label() === null);
            times ++;
        }
    });
    
    assert.equal(times, 1);
};
