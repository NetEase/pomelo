var should = require('should');
var serialFilter = require('../../../lib/filters/handler/time');
var FilterService = require('../../../lib/common/service/filterService');
var util = require('util');
var mockSession = {
  key : "123"
};

var WAIT_TIME = 100;
describe("#serialFilter",function(){
  it("should do before filter ok",function(done){
    var service = new FilterService();
    var filter = serialFilter();
    service.before(filter);


    service.beforeFilter(null,mockSession,function(){
      should.exist(mockSession);

      should.exist(mockSession.__startTime__);
      done();
    });
  });

  it("should do after filter by doing before filter ok",function(done){
    var service = new FilterService();
    var filter = serialFilter();
    var _session ;
    service.before(filter);

    service.beforeFilter(null,mockSession,function(){
      should.exist(mockSession);
      should.exist(mockSession.__startTime__);
      _session = mockSession;
    });

    service.after(filter);

    service.afterFilter(null,{route:"hello"},mockSession,null,function(){
      should.exist(mockSession);
      should.strictEqual(mockSession,_session);
    });

    setTimeout(done,WAIT_TIME);
    done();
  });
});