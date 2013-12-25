var lib = process.env.POMELO_COV ? 'lib-cov' : 'lib';
var should = require('should');
var pomelo = require('../../');
var remote = require('../../' + lib + '/common/remote/frontend/channelRemote');
var SessionService = require('../../' + lib + '/common/service/sessionService');
var ChannelService = require('../../' + lib + '/common/service/channelService');
var countDownLatch = require('../../' + lib + '/util/countDownLatch');
var MockChannelManager = require('../manager/mockChannelManager');


var mockBase = process.cwd() + '/test';

var WAIT_TIME = 200;

describe('channel remote test', function() {
  describe('#pushMessage', function() {
    it('should push message the the specified clients', function(done) {
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
          sessionService.bind(session.id, uids[j]);
          j++;
        }
      }

      var app = pomelo.createApp({base: mockBase});
      app.components.__connector__ = {
        send: function(reqId, route, msg, recvs, opts, cb) {
          app.components.__pushScheduler__.schedule(reqId, route, msg, recvs, opts, cb);
        }
      };
      app.components.__connector__.connector = {};
      app.components.__pushScheduler__ = {
        schedule: function(reqId, route, msg, recvs, opts, cb) {
          mockMsg.should.eql(msg);
          invokeCount += recvs.length;
          var sess;
          for(var i=0; i<recvs.length; i++) {
            sess = sessionService.get(recvs[i]);
            if(sess) {
              invokeUids.push(sess.uid);
            }
          }
          cb();
        }
      };
      app.set('sessionService', sessionService);
      var channelRemote = remote(app);
      channelRemote.pushMessage(mockRoute, mockMsg, uids, {isPush: true}, function() {
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

      var sessionService = new SessionService();
      var channelService = new ChannelService();

      var session;
      for(var i=0, l=sids.length; i<l; i++) {
        session = sessionService.create(sids[i], frontendId);
        if(i % 2) {
          session.bind(uids[i]);
        }
      }

      var app = pomelo.createApp({base: mockBase});
      app.components.__connector__ = {
        send: function(reqId, route, msg, recvs, opts, cb) {
          app.components.__pushScheduler__.schedule(reqId, route, msg, recvs, opts, cb);
        }
      };
      app.components.__connector__.connector = {};
      app.components.__pushScheduler__ = {
        schedule: function(reqId, route, msg, recvs, opts, cb) {
          invokeCount++;
          mockMsg.should.eql(msg);
          should.exist(opts);
          should.equal(opts.type, 'broadcast');
          cb();
        }
      };
      app.set('sessionService', sessionService);
      app.set('channelService', channelService);
      var channelRemote = remote(app);
      channelRemote.broadcast(mockRoute, mockMsg, {type: 'broadcast'}, function() {
        invokeCount.should.equal(1);
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
      var channelService = new ChannelService();

      var session;
      for(var i=0, l=sids.length, j=0; i<l; i++) {
        session = sessionService.create(sids[i], frontendId);
        if(i % 2) {
          session.bind(uids[j]);
          j++;
        }
      }

      var app = pomelo.createApp({base: mockBase});
      app.components.__connector__ = {
        send: function(reqId, route, msg, recvs, opts, cb) {
          app.components.__pushScheduler__.schedule(reqId, route, msg, recvs, opts, cb);
        }
      };
      app.components.__connector__.connector = {};
      app.components.__pushScheduler__ = {
        schedule: function(reqId, route, msg, recvs, opts, cb) {
          invokeCount++;
          mockMsg.should.eql(msg);
          should.exist(opts);
          should.equal(opts.type, 'broadcast');
          true.should.equal(opts.userOptions.binded);
          cb();
        }
      };
      app.set('sessionService', sessionService);
      app.set('channelService', channelService);
      var channelRemote = remote(app);
      channelRemote.broadcast(mockRoute, mockMsg, {type: 'broadcast', userOptions: {binded: true}}, function() {
        invokeCount.should.equal(1);
        done();
      });
    });
  });
});
