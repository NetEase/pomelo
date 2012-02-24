var assert = require('assert');
var Store = require('dnode-protocol').Store;

exports.store = function () {
    var s = new Store;
    
    assert.eql(s.items.length, 0);
    
    var i = 0;
    var cb = function() {
        i++;
    };
    
    var fn1 = function () {
        cb();
    };
    s.add(fn1);
    assert.eql(s.items.length, 1);
    s.get(0)();
    fn1();
    assert.eql(i, 2);
    assert.eql(s.items[0].times, undefined);
    
    var fn2 = function() {
        cb();
    };
    fn2.times = 2;
    s.add(fn2);
    assert.eql(s.items.length, 2);
    s.get(1)();
    fn2();
    assert.eql(i, 4);
    assert.eql(s.items[1].times, 1);
    s.get(1)();
    assert.eql(s.items[1], undefined);
    
    var fn3 = function() {
        cb2();
    };
    s.add(fn3);
    assert.eql(s.items.length, 3);
};


