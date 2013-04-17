var lib = process.env.POMELO_COV ? 'lib-cov' : 'lib';
var should = require('should');
var HandlerService = require('../../' + lib + '/common/service/handlerService');

var mockApp = {
  serverType: 'connector',

  get: function(key) {
    return this[key];
  }
};

var mockSession = {
  exportSession: function() {
    return this;
  }
};

var mockMsg = {key: 'some request message'};
var mockRouteRecord = {serverType: 'connector', handler: 'testHandler', method: 'testMethod'};

describe('handler service test', function() {
  describe('handle', function() {
    it('should dispatch the request to the handler if the route match current server type', function(done) {
      var invoke1Count = 0, invoke2Count = 0;
      // mock datas
      var mockHandlers = {
        testHandler: {
          testMethod: function(msg, session, next) {
            invoke1Count++;
            msg.should.eql(mockMsg);
            next();
          }
        },
        test2Handler: {
          testMethod: function(msg, session, next) {
            invoke2Count++;
            next();
          }
        }
      };

      var service = new HandlerService(mockApp, mockHandlers);

      service.handle(mockRouteRecord, mockMsg, mockSession, function() {
        invoke1Count.should.equal(1);
        invoke2Count.should.equal(0);
        done();
      });
    });

    it('should return an error if can not find the appropriate handler locally', function(done) {
      var mockHandlers = {};
      var service = new HandlerService(mockApp, mockHandlers);

      service.handle(mockRouteRecord, mockMsg, mockSession, function(err) {
        should.exist(err);
        done();
      });
    });
  });
});