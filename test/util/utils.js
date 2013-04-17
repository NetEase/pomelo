var lib = process.env.POMELO_COV ? 'lib-cov' : 'lib';
var utils = require('../../' + lib + '/util/utils');
var should = require('should');

describe('utils test', function() {
  describe('#invokeCallback', function() {
    it('should invoke the function with the parameters', function() {
      var p1 = 1, p2 = 'str';

      var func = function(arg1, arg2) {
        p1.should.equal(arg1);
        p2.should.equal(arg2);
      };

      utils.invokeCallback(func, p1, p2);
    });

    it('should ok if cb is null', function() {
      var p1 = 1, p2 = 'str';
      (function() {
        utils.invokeCallback(null, p1, p2);
      }).should.not.throw();
    });
  });

  describe('#size', function() {
    it('should return the own property count of the object', function() {
      var obj = {
        p1: 'str',
        p2: 1,
        m1: function() {}
      };

      utils.size(obj).should.equal(2);
    });
  });

  describe('#startsWith', function() {
    it('should return true if the string do start with the prefix', function() {
      var src = 'prefix with a string';
      var prefix = 'prefix';

      utils.startsWith(src, prefix).should.be.true;
    });

    it('should return false if the string not start with the prefix', function() {
      var src = 'prefix with a string';
      var prefix = 'prefix222';

      utils.startsWith(src, prefix).should.be.false;

      prefix = 'with';
      utils.startsWith(src, prefix).should.be.false;
    });

    it('should return false if the src not a string', function() {
      utils.startsWith(1, 'str').should.be.false;
    });
  });

  describe('#endsWith', function() {
    it('should return true if the string do end with the prefix', function() {
      var src = 'string with a suffix';
      var suffix = 'suffix';

      utils.endsWith(src, suffix).should.be.true;
    });

    it('should return false if the string not end with the prefix', function() {
      var src = 'string with a suffix';
      var suffix = 'suffix222';

      utils.endsWith(src, suffix).should.be.false;

      suffix = 'with';
      utils.endsWith(src, suffix).should.be.false;
    });

    it('should return false if the src not a string', function() {
      utils.endsWith(1, 'str').should.be.false;
    });
  });

});