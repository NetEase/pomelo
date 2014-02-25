var lib = process.env.POMELO_COV ? 'lib-cov' : 'lib';
var should = require('should');
var pomelo = require('../../');
var ChannelService = require('../../' + lib + '/common/service/channelService');

var mockBase = process.cwd() + '/test';
var channelName = 'test_channel';
var mockApp = {serverId: 'test-server-1'};

describe('channel test', function() {
  describe('#add', function() {
    it('should add a member into channel and could fetch it later', function() {
      var channelService = new ChannelService(mockApp);
      var channel = channelService.createChannel(channelName);
      should.exist(channel);

      var uid = 'uid1', sid = 'sid1';
      channel.add(uid, sid).should.be.true;

      var member = channel.getMember(uid);
      should.exist(member);
      uid.should.equal(member.uid);
      sid.should.equal(member.sid);
    });

    it('should fail if the sid not specified', function() {
      var channelService = new ChannelService(mockApp);
      var channel = channelService.createChannel(channelName);
      should.exist(channel);

      var uid = 'uid1';
      channel.add(uid, null).should.be.false;
    });

    it('should fail after the channel has been destroied', function() {
      var channelService = new ChannelService(mockApp);
      var channel = channelService.createChannel(channelName);
      should.exist(channel);

      channel.destroy();

      var uid = 'uid1', sid = 'sid1';
      channel.add(uid, sid).should.be.false;
    });
  });

  describe('#leave', function() {
    it('should remove the member from channel when leave', function() {
      var channelService = new ChannelService(mockApp);
      var channel = channelService.createChannel(channelName);
      should.exist(channel);

      var uid = 'uid1', sid = 'sid1';
      channel.add(uid, sid).should.be.true;

      var member = channel.getMember(uid);
      should.exist(member);

      channel.leave(uid, sid);
      member = channel.getMember(uid);
      should.not.exist(member);
    });

    it('should fail if uid or sid not specified', function() {
      var channelService = new ChannelService(mockApp);
      var channel = channelService.createChannel(channelName);
      should.exist(channel);

      var uid = 'uid1', sid = 'sid1';
      channel.add(uid, sid).should.be.true;

      channel.leave(uid, null).should.be.false;
      channel.leave(null, sid).should.be.false;
    });
  });

  describe('#getMembers', function() {
    it('should return all the members of channel', function() {
      var uinfos = [
        {uid: 'uid1', sid: 'sid1'},
        {uid: 'uid2', sid: 'sid2'},
        {uid: 'uid3', sid: 'sid3'}
      ];

      var channelService = new ChannelService(mockApp);
      var channel = channelService.createChannel(channelName);

      var i, l, item;
      for(i=0, l=uinfos.length; i<l; i++) {
        item = uinfos[i];
        channel.add(item.uid, item.sid);
      }

      var members = channel.getMembers();
      should.exist(members);
      members.length.should.equal(uinfos.length);
      for(i=0, l=uinfos.length; i<l; i++) {
        item = uinfos[i];
        members.should.include(item.uid);
      }
    });
  });

  describe('#pushMessage', function() {
    it('should push message to the right frontend server by sid', function(done) {
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

      var channel = channelService.createChannel(channelName);
      for(var i=0, l=mockUids.length; i<l; i++) {
        channel.add(mockUids[i].uid, mockUids[i].sid);
      }

      channel.pushMessage(mockMsg, function() {
        invokeCount.should.equal(2);
        done();
      });
    });
    it('should fail if channel has destroied', function() {
      var channelService = new ChannelService(mockApp);
      var channel = channelService.createChannel(channelName);
      should.exist(channel);

      channel.destroy();

      channel.pushMessage({}, function(err) {
        should.exist(err);
        err.message.should.equal('channel is not running now');
      });
    });
  });
});