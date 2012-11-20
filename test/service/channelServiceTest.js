var should = require('should');
var pomelo = require('../../');
var ChannelService = require('../../lib/common/service/channelService');

var channelName = 'test_channel';
var mockBase = process.cwd() + '/test';

describe('channel manager test', function() {
	describe('createChannel', function() {
		it('should create and return a channel with the specified name', function() {
			var channelService = new ChannelService();
			var channel = channelService.createChannel(channelName);
			should.exist(channel);
			channelName.should.equal(channel.name);
		});
	});

	describe('getChannel', function() {
		it('should return the channel with the specified name if it exists', function() {
			var channelService = new ChannelService();
			channelService.createChannel(channelName);
			var channel = channelService.getChannel(channelName);
			should.exist(channel);
			channelName.should.equal(channel.name);
		});

		it('should return undefined if the channel dose not exist', function() {
			var channelService = new ChannelService();
			var channel = channelService.getChannel(channelName);
			should.not.exist(channel);
		});

		it('should create and return a new channel if create parameter is set', function() {
			var channelService = new ChannelService();
			var channel = channelService.getChannel(channelName, true);
			should.exist(channel);
			channelName.should.equal(channel.name);
		});
	});

	describe('pushMessageByUids', function() {
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
				var args = rmsg['args'];
				var msg = JSON.parse(args[0]);
				var uids = args[1];
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

			channelService.pushMessageByUids(mockMsg, mockUids, function() {
				invokeCount.should.equal(2);
				done();
			});
		});
	});
});