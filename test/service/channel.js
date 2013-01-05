var lib = process.env.POMELO_COV ? 'lib-cov' : 'lib';
var should = require('should');
var pomelo = require('../../');
var ChannelService = require('../../' + lib + '/common/service/channelService');

var channelName = 'test_channel';

describe('channel test', function() {
  describe('#add', function() {
    it('should add a member into channel and could fetch it later', function() {
      var channelService = new ChannelService();
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
      var channelService = new ChannelService();
      var channel = channelService.createChannel(channelName);
      should.exist(channel);

      var uid = 'uid1';
      channel.add(uid, null).should.be.false;
    });

    it('should fail after the channel was destroied', function() {
      var channelService = new ChannelService();
      var channel = channelService.createChannel(channelName);
      should.exist(channel);

      channel.destroy();

      var uid = 'uid1', sid = 'sid1';
      channel.add(uid, sid).should.be.false;
    });
  });

  describe('#leave', function() {
    it('should remove the member from channel when leave', function() {
      var channelService = new ChannelService();
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
      var channelService = new ChannelService();
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

      var channelService = new ChannelService();
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
});