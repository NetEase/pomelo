var should = require('should');
var timeoutFilter = require('../../../lib/filters/handler/timeout');
var FilterService = require('../../../lib/common/service/filterService');
var util = require('util');
var mockSession = {
  key : "123"
};

var WAIT_TIME = 100;
describe("#serialFilter",function(){
  it("should do before filter ok",function(done){
    var service = new FilterService();
    var filter = timeoutFilter();
    service.before(filter);

    service.beforeFilter(null,mockSession,function(){
      should.exist(mockSession);

      should.exist(mockSession.__timeout__);
      done();
    });
  });

  it("should do after filter by doing before filter ok",function(done){
    var service = new FilterService();
    var filter = timeoutFilter();
    var _session ;
    service.before(filter);

    service.beforeFilter(null,mockSession,function(){
      should.exist(mockSession);
      should.exist(mockSession.__timeout__);
      _session = mockSession;
    });

    service.after(filter);

    service.afterFilter(null,null,mockSession,null,function(){
      should.exist(mockSession);
      should.strictEqual(mockSession,_session);
    });

    setTimeout(done,WAIT_TIME);
    done();
  });
});