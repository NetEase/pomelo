var should = require('should');
var toobusyFilter = require('../../../lib/filters/handler/toobusy');
var FilterService = require('../../../lib/common/service/filterService');
var util = require('util');
var mockSession = {
  key : "123"
};

describe("#toobusyFilter",function(){
  it("should do before filter ok",function(done){
    var service = new FilterService();
    var filter = toobusyFilter();
    service.before(filter);

    service.beforeFilter(null,mockSession,function(err){
      should.not.exist(err);
      should.exist(mockSession);
      done();
    });
  });

  it("should do before filter error because of too busy",function(done){
    var service = new FilterService();
    var filter = toobusyFilter();
    service.before(filter);

    var exit = false;
    function load() {
      service.beforeFilter(null,mockSession,function(err, resp){
        should.exist(mockSession);
        console.log('err: ' + err);
        if (!!err) {
          exit = true;
        }
      });

      console.log('exit: ' + exit);
      if (exit) {
        return done();
      }
      var start = new Date();
      while ((new Date() - start) < 250) {
        for (var i = 0; i < 1e5;) i++;
      }
      setTimeout(load, 0);
    }
    load();

  });
});
