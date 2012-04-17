var mockSessionService = require('../../lib/common/service/mockSessionService');
var should = require('should');

describe('mockSessionServiceTest', function(){
	it('session create should be ok!', function(done){
		var session = mockSessionService.create({uid:1001, key: 'xcc123go'});
        session.userLogined(1001).should.not.be.ok;
        
        var expSession = session.exportSession();
        
        should.exqual(expSession.uid, session.uid);
        done();
	});
});

