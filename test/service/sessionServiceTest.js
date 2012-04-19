var sessionService = require('../../lib/common/service/sessionService');
var should = require('should');

describe('sessionServiceTest', function(){
    var curKey = 'xcc123go';
    var curUid = 1001;
    var session;
	it('sessionService should be ok!', function(done){
    	session = sessionService.createSession({uid:curUid, key: curKey} , true);
        var keySession = sessionService.getSession(curKey);
        //should.exist(keySession);
        should.strictEqual(session, keySession);
        sessionService.removeSession(curKey);
        keySession = sessionService.getSession(curKey);
        should.not.exist(keySession);
        done();
	});
    it('user logined should be ok!', function(done){
    	session = sessionService.createSession({uid:curUid, key: curKey} , true);
        session.userLogined(curUid);
        var uidSession = sessionService.getSessionByUid(curUid);
        should.exist(uidSession);
        should.strictEqual(session, uidSession);
        sessionService.removeSession(curKey);
        //uidSession = sessionService.getSessionByUid(curUid);
        //should.not.exist(uidSession);
        done();
    });
});

