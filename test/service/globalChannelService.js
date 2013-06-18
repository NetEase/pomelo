var lib = process.env.POMELO_COV ? 'lib-cov' : 'lib';
var should = require('should');
var pomelo = require('../../');
var GlobalChannelService = require('../../' + lib + '/common/service/globalChannelService');
var async = require('async');

describe('global channel service test', function() {

  it('should add member to a channel, get it and remove it latter', function(done) {
    var app = {};
    var opts = {};
    var service = new GlobalChannelService(app, opts);

    var name = 'test-channel';
    var uid = 'test-uid-1';
    var sid = 'test-sid-1';
    async.waterfall([
      function(cb) {
        service.add(name, uid, sid, cb);
      },
      function(cb) {
        service.getMembers(name, sid, cb);
      },
      function(uids, cb) {
        should.exit(uids);
        uid.should.equal(uids[0]);
        service.leave();
      }
    ]);

  });
});