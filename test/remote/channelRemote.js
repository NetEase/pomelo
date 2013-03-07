var lib = process.env.POMELO_COV ? 'lib-cov' : 'lib';
var should = require('should');
var pomelo = require('../../');
var remote = require('../../' + lib + '/common/remote/frontend/channelRemote');
var SessionService = require('../../' + lib + '/common/service/sessionService');

var mockBase = process.cwd() + '/test';

describe('channel remote test', function() {
  describe('#pushMessage', function() {
    it('should push message the the specified clients', function(done) {
      var sids = [1, 2, 3, 4, 5];
      var uids = [11, 12, 13];
      var frontendId = 'frontend-server-id';
      var mockRoute = 'mock-route-string';
      var mockMsg = {msg: 'some test msg'};
      var invokeCount = 0;
      var invokeUids = [];

      var sessionService = new SessionService();
      sessionService.sendMessageByUid = function(uid, msg) {
        mockMsg.should.eql(msg);
        invokeCount++;
        invokeUids.push(uid);
      };

      var session;
      for(var i=0, l=sids.length, j=0; i<l; i++) {
        session = sessionService.create(sids[i], frontendId);
        if(i % 2) {
          session.bind(uids[j]);
          j++;
        }
      }

      var app = pomelo.createApp({base: mockBase});
      app.components.__connector__ = {};
      app.components.__connector__.connector = {};
      app.set('sessionService', sessionService);
      var channelRemote = remote(app);
      channelRemote.pushMessage(mockRoute, mockMsg, uids, function() {
        invokeCount.should.equal(uids.length);
        invokeUids.length.should.equal(uids.length);
        for(var i=0, l=uids.length; i<l; i++) {
          invokeUids.should.include(uids[i]);
        }
        done();
      });
    });
  });

  describe('#broadcast', function() {
    it('should broadcast to all the client connected', function(done) {
      var sids = [1, 2, 3, 4, 5];
      var uids = [11, 12, 13, 14, 15];
      var frontendId = 'frontend-server-id';
      var mockRoute = 'mock-route-string';
      var mockMsg = {msg: 'some test msg'};
      var invokeCount = 0;
      var invokeSids = [];

      var sessionService = new SessionService();
      sessionService.sendMessage = function(sid, msg) {
        mockMsg.should.eql(msg);
        invokeCount++;
        invokeSids.push(sid);
      };

      var session;
      for(var i=0, l=sids.length; i<l; i++) {
        session = sessionService.create(sids[i], frontendId);
        if(i % 2) {
          session.bind(uids[i]);
        }
      }

      var app = pomelo.createApp({base: mockBase});
      app.components.__connector__ = {};
      app.components.__connector__.connector = {};
      app.set('sessionService', sessionService);
      var channelRemote = remote(app);
      channelRemote.broadcast(mockRoute, mockMsg, false, function() {
        invokeCount.should.equal(sids.length);
        invokeSids.length.should.equal(uids.length);
        for(var i=0, l=sids.length; i<l; i++) {
          invokeSids.should.include(sids[i]);
        }
        done();
      });
    });

    it('should broadcast to all the binded client connected', function(done) {
      var sids = [1, 2, 3, 4, 5, 6];
      var uids = [11, 12, 13];
      var frontendId = 'frontend-server-id';
      var mockRoute = 'mock-route-string';
      var mockMsg = {msg: 'some test msg'};
      var invokeCount = 0;
      var invokeUids = [];

      var sessionService = new SessionService();
      sessionService.sendMessageByUid = function(uid, msg) {
        mockMsg.should.eql(msg);
        invokeCount++;
        invokeUids.push(uid);
      };

      var session;
      for(var i=0, l=sids.length, j=0; i<l; i++) {
        session = sessionService.create(sids[i], frontendId);
        if(i % 2) {
          session.bind(uids[j]);
          j++;
        }
      }

      var app = pomelo.createApp({base: mockBase});
      app.components.__connector__ = {};
      app.components.__connector__.connector = {};
      app.set('sessionService', sessionService);
      var channelRemote = remote(app);
      channelRemote.broadcast(mockRoute, mockMsg, true, function() {
        invokeCount.should.equal(uids.length);
        invokeUids.length.should.equal(uids.length);
        for(var i=0, l=uids.length; i<l; i++) {
          invokeUids.should.include(uids[i]);
        }
        done();
      });
    });
  });
});