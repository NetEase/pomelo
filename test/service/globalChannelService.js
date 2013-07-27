var lib = process.env.POMELO_COV ? 'lib-cov' : 'lib';
var should = require('should');
var pomelo = require('../../');
var GlobalChannelService = require('../../' + lib + '/common/service/globalChannelService');
var async = require('async');
var MockChannelManager = require('../manager/mockChannelManager');

/**
 * NOTICE: configure your redis listening on 127.0.0.1:6379 first
 */

describe('global channel service test', function() {

  it('should add member to a channel, get it and remove it latter', function(done) {
    var app = {};
    var opts = {
      port: 6379,
      host: '127.0.0.1',
      channelManager: MockChannelManager
    };
    var service = new GlobalChannelService(app, opts);

    var name = 'test-channel';
    var uid = 'test-uid-1';
    var sid = 'test-sid-1';
    async.waterfall([
      function(cb) {
        service.start(cb);
      },
      function(cb) {
        // join a channel
        service.add(name, uid, sid, cb);
      },
      function(cb) {
        // get from a channel
        service.getMembersBySid(name, sid, cb);
      },
      function(uids, cb) {
        should.exist(uids);
        uid.should.equal(uids[0]);
        // leave the channel
        service.leave(name, uid, sid, cb);
      },
      function(cb) {
        // get from a channel again
        service.getMembersBySid(name, sid, cb);
      },
      function(uids, cb) {
        should.exist(uids);
        uids.length.should.equal(0);
        cb();
      },
      function(cb) {
        service.stop(true, cb);
      }
    ], function(err) {
      should.not.exist(err);
      done();
    });
  });

  it('should join a channel from different frontend server and destroy it together', function(done) {
    var sids = [
      'frontend-server-1',
      'frontend-server-2'
    ];
    var servers = {};
    for(var i=0; i<sids.length; i++) {
      servers[sids[i]] = {};
    }
    var app = {
      getServers: function() {
        return servers;
      },
      isFrontend: function() {
        return true;
      }
    };
    var opts = {
      port: 6379,
      host: '127.0.0.1',
      channelManager: MockChannelManager
    };
    var service = new GlobalChannelService(app, opts);

    var name = 'test-channel';
    var orgUids = ['test-uid-1', 'test-uid-2'];

    async.waterfall([
      function(cb) {
        service.start(cb);
      },
      function(cb) {
        // join a channel
        service.add(name, orgUids[0], sids[0], cb);
      },
      function(cb) {
        // get from a channel
        service.getMembersBySid(name, sids[0], cb);
      },
      function(uids, cb) {
        should.exist(uids);
        orgUids[0].should.equal(uids[0]);
        // join a channel
        service.add(name, orgUids[1], sids[1], cb);
      },
      function(cb) {
        // get from a channel
        service.getMembersBySid(name, sids[1], cb);
      },
      function(uids, cb) {
        should.exist(uids);
        orgUids[1].should.equal(uids[0]);
        service.destroyChannel(name, cb);
      },
      function(cb) {
        // get from a channel again
        service.getMembersBySid(name, sids[0], cb);
      },
      function(uids, cb) {
        should.exist(uids);
        uids.length.should.equal(0);
        // get from a channel again
        service.getMembersBySid(name, sids[1], cb);
      },
      function(uids, cb) {
        should.exist(uids);
        uids.length.should.equal(0);
        service.stop(true, cb);
      }
    ], function(err) {
      should.not.exist(err);
      done();
    });
  });
});