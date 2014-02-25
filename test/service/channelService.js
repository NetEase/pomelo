var lib = process.env.POMELO_COV ? 'lib-cov' : 'lib';
var should = require('should');
var pomelo = require('../../');
var ChannelService = require('../../' + lib + '/common/service/channelService');

var channelName = 'test_channel';
var mockBase = process.cwd() + '/test';
var mockApp = {serverId: 'test-server-1'};

describe('channel manager test', function() {
  describe('#createChannel', function() {
    it('should create and return a channel with the specified name', function() {
      var channelService = new ChannelService(mockApp);
      var channel = channelService.createChannel(channelName);
      should.exist(channel);
      channelName.should.equal(channel.name);
    });

    it('should return the same channel if the name has already existed', function() {
      var channelService = new ChannelService(mockApp);
      var channel = channelService.createChannel(channelName);
      should.exist(channel);
      channelName.should.equal(channel.name);
      var channel2 = channelService.createChannel(channelName);
      channel.should.equal(channel2);
    });
  });

  describe('#destroyChannel', function() {
    it('should delete the channel instance', function() {
      var channelService = new ChannelService(mockApp);
      var channel = channelService.createChannel(channelName);
      should.exist(channel);
      channelName.should.equal(channel.name);
      channelService.destroyChannel(channelName);
      var channel2 = channelService.createChannel(channelName);
      channel.should.not.equal(channel2);
    });
  });

  describe('#getChannel', function() {
    it('should return the channel with the specified name if it exists', function() {
      var channelService = new ChannelService(mockApp);
      channelService.createChannel(channelName);
      var channel = channelService.getChannel(channelName);
      should.exist(channel);
      channelName.should.equal(channel.name);
    });

    it('should return undefined if the channel dose not exist', function() {
      var channelService = new ChannelService(mockApp);
      var channel = channelService.getChannel(channelName);
      should.not.exist(channel);
    });

    it('should create and return a new channel if create parameter is set', function() {
      var channelService = new ChannelService(mockApp);
      var channel = channelService.getChannel(channelName, true);
      should.exist(channel);
      channelName.should.equal(channel.name);
    });
  });

  describe('#pushMessageByUids', function() {
    it('should push message to the right frontend server', function(done) {
      var sid1 = 'sid1', sid2 = 'sid2';
      var uid1 = 'uid1', uid2 = 'uid2', uid3 = 'uid3';
      var orgRoute = 'test.route.string';
      var mockUids = [
        {sid: sid1, uid: uid1},
        {sid: sid2, uid: uid2},
        {sid: sid2, uid: uid3}
      ];
      var mockMsg = {key: 'some remote message'};
      var uidMap = {};
      for(var i in mockUids) {
        uidMap[mockUids[i].uid] = mockUids[i];
      }

      var invokeCount = 0;

      var mockRpcInvoke = function(sid, rmsg, cb) {
        invokeCount++;
        var args = rmsg.args;
        var route = args[0];
        var msg = args[1];
        var uids = args[2];
        mockMsg.should.eql(msg);

        for(var j=0, l=uids.length; j<l; j++) {
          var uid = uids[j];
          var r2 = uidMap[uid];
          r2.sid.should.equal(sid);
        }

        cb();
      };

      var app = pomelo.createApp({base: mockBase});
      app.rpcInvoke = mockRpcInvoke;
      var channelService = new ChannelService(app);

      channelService.pushMessageByUids(orgRoute, mockMsg, mockUids, function() {
        invokeCount.should.equal(2);
        done();
      });
    });

    it('should return an err if uids is empty', function(done) {
      var mockMsg = {key: 'some remote message'};
      var app = pomelo.createApp({base: mockBase});
      var channelService = new ChannelService(app);

      channelService.pushMessageByUids(mockMsg, null, function(err) {
        should.exist(err);
        err.message.should.equal('uids should not be empty');
        done();
      });
    });

    it('should return err if all message fail to push', function(done) {
      var sid1 = 'sid1', sid2 = 'sid2';
      var uid1 = 'uid1', uid2 = 'uid2', uid3 = 'uid3';
      var mockUids = [
        {sid: sid1, uid: uid1},
        {sid: sid2, uid: uid2},
        {sid: sid2, uid: uid3}
      ];
      var mockMsg = {key: 'some remote message'};
      var uidMap = {};
      for(var i in mockUids) {
        uidMap[mockUids[i].uid] = mockUids[i];
      }

      var invokeCount = 0;

      var mockRpcInvoke = function(sid, rmsg, cb) {
        invokeCount++;
        cb(new Error('[TestMockError] mock rpc error'));
      };

      var app = pomelo.createApp({base: mockBase});
      app.rpcInvoke = mockRpcInvoke;
      var channelService = new ChannelService(app);

      channelService.pushMessageByUids(mockMsg, mockUids, function(err) {
        invokeCount.should.equal(2);
        should.exist(err);
        err.message.should.equal('all uids push message fail');
        done();
      });
    });

    it('should return fail uid list if fail to push messge to some of the uids', function(done) {
      var sid1 = 'sid1', sid2 = 'sid2';
      var uid1 = 'uid1', uid2 = 'uid2', uid3 = 'uid3';
      var mockUids = [{sid: sid1, uid: uid1}, {sid: sid2, uid: uid2}, {sid: sid2, uid: uid3}];
      var mockMsg = {key: 'some remote message'};
      var uidMap = {};
      for(var i in mockUids) {
        uidMap[mockUids[i].uid] = mockUids[i];
      }

      var invokeCount = 0;

      var mockRpcInvoke = function(sid, rmsg, cb) {
        invokeCount++;
        if(rmsg.args[2].indexOf(uid1) >= 0) {
          cb(null, [uid1]);
        } else if(rmsg.args[2].indexOf(uid3) >= 0) {
          cb(null, [uid3]);
        } else {
          cb();
        }
      };

      var app = pomelo.createApp({base: mockBase});
      app.rpcInvoke = mockRpcInvoke;
      var channelService = new ChannelService(app);

      channelService.pushMessageByUids(mockMsg, mockUids, function(err, fails) {
        invokeCount.should.equal(2);
        should.not.exist(err);
        should.exist(fails);
        fails.length.should.equal(2);
        fails.should.include(uid1);
        fails.should.include(uid3);
        done();
      });
    });
  });

  describe('#broadcast', function() {
    it('should push message to all specified frontend servers', function(done) {
      var mockServers = [
        {id: 'connector-1', serverType: 'connector', other: 'xxx1'},
        {id: 'connector-2', serverType: 'connector', other: 'xxx2'},
        {id: 'area-1', serverType: 'area', other: 'yyy1'},
        {id: 'gate-1', serverType: 'gate', other: 'zzz1'},
        {id: 'gate-2', serverType: 'gate', other: 'xxx1'},
        {id: 'gate-3', serverType: 'gate', other: 'yyy1'}
      ];
      var connectorIds = ['connector-1', 'connector-2'];
      var mockSType = 'connector';
      var mockRoute = 'test.route.string';
      var mockBinded = true;
      var opts = {binded: mockBinded};
      var mockMsg = {key: 'some remote message'};

      var invokeCount = 0;
      var sids = [];

      var mockRpcInvoke = function(sid, rmsg, cb) {
        invokeCount++;
        var args = rmsg.args;
        var route = args[0];
        var msg = args[1];
        var opts = args[2];
        mockMsg.should.eql(msg);
        mockRoute.should.equal(route);
        should.exist(opts);
        mockBinded.should.equal(opts.userOptions.binded);
        sids.push(sid);
        cb();
      };

      var app = pomelo.createApp({base: mockBase});
      app.rpcInvoke = mockRpcInvoke;
      app.addServers(mockServers);
      var channelService = new ChannelService(app);

      channelService.broadcast(mockSType, mockRoute, mockMsg,
                               opts, function() {
        invokeCount.should.equal(2);
        sids.length.should.equal(connectorIds.length);
        for(var i=0, l=connectorIds.length; i<l; i++) {
          sids.should.include(connectorIds[i]);
        }
        done();
      });
    });
  });
});
