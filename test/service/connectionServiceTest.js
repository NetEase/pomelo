var should = require('should');
var ConnectionService = require('../../lib/common/service/connectionService');

var mockApp = {
	settings: {
		serverId: 'connector-server-1'
	}, 

	get: function(key) {
		return this.settings[key];
	}
};

var mockPlayer1 = {
	uid : "123",
	info : {
		name : "fantasyni"
	}
};

var mockPlayer2 = {
	uid : "111",
	info : {
		name : "fni"
	}
};

describe("connectionService",function(){
	it('should add login user info',function(done){
		var mockService1 = new ConnectionService(mockApp);
		
		mockService1.addLoginedUser(mockPlayer1.uid,mockPlayer1.info);
		mockService1.loginedCount.should.equal(1);

		should.exist(mockService1.logined[mockPlayer1.uid]);

		mockService1.addLoginedUser(mockPlayer1.uid,mockPlayer1.info);
		mockService1.loginedCount.should.equal(1);

		should.exist(mockService1.logined[mockPlayer1.uid]);

		mockService1.addLoginedUser(mockPlayer2.uid,mockPlayer2.info);
		mockService1.loginedCount.should.equal(2);

		should.exist(mockService1.logined[mockPlayer2.uid]);
		done();
	});

	it('should remove login user info',function(done){
		var mockService1 = new ConnectionService(mockApp);

		mockService1.addLoginedUser(mockPlayer1.uid,mockPlayer1.info);
		mockService1.addLoginedUser(mockPlayer2.uid,mockPlayer2.info);

		mockService1.loginedCount.should.equal(2);
		
		mockService1.removeLoginedUser(mockPlayer1.uid);

		mockService1.loginedCount.should.equal(1);
		should.not.exist(mockService1.logined[mockPlayer1.uid]);

		done();
	});

	it('should getStatisticsInfo',function(done){
		var mockService1 = new ConnectionService(mockApp);

		mockService1.addLoginedUser(mockPlayer1.uid,mockPlayer1.info);
		mockService1.addLoginedUser(mockPlayer2.uid,mockPlayer2.info);
		mockService1.increaseConnectionCount();
		mockService1.increaseConnectionCount();

		var statisticsInfo = mockService1.getStatisticsInfo();

		statisticsInfo.should.have.property('serverId','connector-server-1');
		statisticsInfo.should.have.property('totalConnCount',2);
		statisticsInfo.should.have.property('loginedCount',2);
		statisticsInfo.should.have.property('loginedList').with.lengthOf(2);

		done();
	});
});
