var lib = process.env.POMELO_COV ? 'lib-cov' : 'lib';
var should = require('should');
var pomelo = require('../../');
var SessionService = require('../../' + lib + '/common/service/sessionService');

describe('session service test', function() {
  describe('#bind', function() {
    it('should get session by uid after binded', function(done) {
      var service = new SessionService();
      var sid = 1, fid = 'frontend-server-1', socket = {};
      var uid = 'changchang';
      var eventCount = 0;

      var session = service.create(sid, fid, socket);

      should.exist(session);

      session.should.eql(service.get(sid));

      session.on('bind', function(euid) {
        eventCount++;
        uid.should.equal(euid);
      });

      service.bind(sid, uid, function(err) {
        should.not.exist(err);
        var sessions = service.getByUid(uid);
        should.exist(sessions);
        sessions.length.should.equal(1);
        session.should.eql(sessions[0]);
        eventCount.should.equal(1);
        service.bind(sid, uid, function(err) {
          should.not.exist(err);
          done();
        });
      });
    });
    it('should fail if already binded uid', function(done) {
      var service = new SessionService();
      var sid = 1, fid = 'frontend-server-1', socket = {};
      var uid = 'py', test_uid = 'test';

      var session = service.create(sid, fid, socket);

      service.bind(sid, uid, null);

      service.bind(sid, test_uid, function(err) {
        should.exist(err);
        done();
      });
    });
    it('should fail if try to bind a session not exist', function(done) {
      var service = new SessionService();
      var sid = 1, uid = 'changchang';

      service.bind(sid, uid, function(err) {
        should.exist(err);
        done();
      });
    });
  });

  describe('#unbind', function() {
    it('should fail unbind session if session not exist', function(done) {
      var service = new SessionService();
      var sid = 1;
      var uid = 'py';
  
      service.unbind(sid, uid, function(err) {
        should.exist(err);
        done();
      });      
    });
    it('should fail unbind session if session not binded', function(done) {
      var service = new SessionService();
      var sid = 1, fid = 'frontend-server-1', socket = {};
      var uid = 'py';

      var session = service.create(sid, fid, socket);

      service.unbind(sid, uid, function(err) {
        should.exist(err);
        done();
      });
    });
    it('should fail to get session after session unbinded', function(done) {
      var service = new SessionService();
      var sid = 1, fid = 'frontend-server-1', socket = {};
      var uid = 'py';

      var session = service.create(sid, fid, socket);
      service.bind(sid, uid, null);

      service.unbind(sid, uid, function(err) {
        should.not.exist(err);
        var sessions = service.getByUid(uid);
        should.not.exist(sessions);
        done();
      });
    });
  });

  describe('#remove', function() {
    it('should not get the session after remove', function(done) {
      var service = new SessionService();
      var sid = 1, fid = 'frontend-server-1', socket = {};
      var uid = 'changchang';

      var session = service.create(sid, fid, socket);

      service.bind(sid, uid, function(err) {
        service.remove(sid);
        should.not.exist(service.get(sid));
        should.not.exist(service.getByUid(uid));
        done();
      });
    });
  });

  describe('#import', function() {
    it('should update the session with the key/value pair', function(done) {
      var service = new SessionService();
      var sid = 1, fid = 'frontend-server-1', socket = {};
      var key = 'key-1', value = 'value-1';

      var session = service.create(sid, fid, socket);

      service.import(sid, key, value, function(err) {
        should.not.exist(err);
        value.should.eql(session.get(key));
        done();
      });
    });

    it('should fail if try to update a session not exist', function(done) {
      var service = new SessionService();
      var sid = 1;
      var key = 'key-1', value = 'value-1';

      service.import(sid, key, value, function(err) {
        should.exist(err);
        done();
      });
    });

    it('should update the session with the key/value pairs', function(done) {
      var service = new SessionService();
      var sid = 1, fid = 'frontend-server-1', socket = {};
      var key = 'key-1', value = 'value-1', key2 = 'key-2', value2 = {};

      var settings = {};
      settings[key] = value;
      settings[key2] = value2;

      var session = service.create(sid, fid, socket);

      service.importAll(sid, settings, function(err) {
        should.not.exist(err);
        value.should.eql(session.get(key));
        value2.should.eql(session.get(key2));
        done();
      });
    });

    it('should fail if try to update a session not exist', function(done) {
      var service = new SessionService();
      var sid = 1;
      var key = 'key-1', value = 'value-1';

      service.import(sid, key, value, function(err) {
        should.exist(err);
        done();
      });
    });

    it('should fail if try to update a session not exist', function(done) {
      var service = new SessionService();
      var sid = 1;
      var key = 'key-1', value = 'value-1', key2 = 'key-2', value2 = {};

      var settings = {};
      settings[key] = value;
      settings[key2] = value2;

      service.importAll(sid, settings, function(err) {
        should.exist(err);
        done();
      });
    });
  });

  describe('#kick', function() {
    it('should kick the sessions', function(done) {
      var service = new SessionService();
      var sid1 = 1, fid1 = 'frontend-server-1';
      var sid2 = 2, fid2 = 'frontend-server-1';

      var socket = {
        emit: function(){},
        disconnect: function(){}
      };
      var uid = 'changchang';
      var eventCount = 0;

      var session1 = service.create(sid1, fid1, socket);
      var session2 = service.create(sid2, fid2, socket);
      session1.on('closed', function() {
        eventCount++;
      });

      session2.on('closed', function() {
        eventCount++;
      });

      service.bind(sid1, uid, function(err) {
        service.bind(sid2, uid, function(err) {
          service.kick(uid, function(err) {
            should.not.exist(err);
            should.not.exist(service.get(sid1));
            should.not.exist(service.get(sid2));
            should.not.exist(service.getByUid(uid));
            eventCount.should.equal(2);
            done();
          });
        });
      });
    });

    it('should kick the session by sessionId', function(done) {
      var service = new SessionService();
      var sid1 = 1, fid1 = 'frontend-server-1';
      var sid2 = 2, fid2 = 'frontend-server-1';

      var socket = {
        emit: function(){},
        disconnect: function(){}
      };
      var uid = 'changchang';
      var eventCount = 0;

      var session1 = service.create(sid1, fid1, socket);
      var session2 = service.create(sid2, fid2, socket);
      session1.on('closed', function() {
        eventCount++;
      });

      session2.on('closed', function() {
        eventCount++;
      });

      service.bind(sid1, uid, function(err) {
        service.bind(sid2, uid, function(err) {
          service.kickBySessionId(sid1, function(err) {
            should.not.exist(err);
            should.not.exist(service.get(sid1));
            should.exist(service.get(sid2));
            should.exist(service.getByUid(uid));
            eventCount.should.equal(1);
            done();
          });
        });
      });
    });

    it('should ok if kick a session not exist', function(done) {
      var service = new SessionService();
      var uid = 'changchang';

      service.kick(uid, function(err) {
        should.not.exist(err);
        done();
      });
    });

    it('should kick session by sid', function(done) {
      var service = new SessionService();
      var sid = 1, fid = 'frontend-server-1';
      var socket = {
        emit: function(){},
        disconnect: function(){}
      };
      var eventCount = 0;

      var session = service.create(sid, fid, socket);
      session.on('closed', function() {
        eventCount++;
      });

      service.kickBySessionId(sid, function(err) {
        should.not.exist(err);
        should.not.exist(service.get(sid));
        eventCount.should.equal(1);
        done();
      });
    });

    it('should ok if kick a session not exist', function(done) {
      var service = new SessionService();
      var sid = 1;

      service.kickBySessionId(sid, function(err) {
        should.not.exist(err);
        done();
      });
    });
  });

  describe('#forEachSession', function() {
    it('should iterate all created sessions', function(done) {
      var service = new SessionService();
      var sid = 1, fid = 'frontend-server-1', socket = {};
      var eventCount = 0;

      var outter_session = service.create(sid, fid, socket);

      service.forEachSession(function(session) {
        should.exist(session);
        outter_session.id.should.eql(session.id);
        done();
      });
    });
  });

  describe('#forEachBindedSession', function() {
    it('should iterate all binded sessions', function(done) {
      var service = new SessionService();
      var sid = 1, fid = 'frontend-server-1', socket = {};
      var uid = 'py';

      var outter_session = service.create(sid, fid, socket);
      service.bind(sid, uid, null);

      service.forEachBindedSession(function(session) {
        should.exist(session);
        outter_session.id.should.eql(session.id);
        outter_session.uid.should.eql(session.uid);
        done();
      });
    });
  });
});

describe('frontend session test', function() {
  describe('#bind', function() {
    it('should get session by uid after binded', function(done) {
      var service = new SessionService();
      var sid = 1, fid = 'frontend-server-1', socket = {};
      var uid = 'changchang';
      var eventCount = 0;

      var session = service.create(sid, fid, socket);
      var fsession = session.toFrontendSession();

      should.exist(fsession);

      fsession.on('bind', function(euid) {
        eventCount++;
        uid.should.equal(euid);
      });

      fsession.bind(uid, function(err) {
        should.not.exist(err);
        var sessions = service.getByUid(uid);
        should.exist(sessions);
        sessions.length.should.equal(1);
        session.should.eql(sessions[0]);
        eventCount.should.equal(1);
        done();
      });
    });
  });

  describe('#unbind', function() {
    it('should fail to get session after session unbinded', function(done) {
      var service = new SessionService();
      var sid = 1, fid = 'frontend-server-1', socket = {};
      var uid = 'py';

      var session = service.create(sid, fid, socket);
      var fsession = session.toFrontendSession();

      fsession.bind(uid, null);
      fsession.unbind(uid, function(err) {
        should.not.exist(err);
        var sessions = service.getByUid(uid);
        should.not.exist(sessions);
        done();
      });
    });
  });

  describe('#set/get', function() {
    it('should update the key/value pair in frontend session but not session',
        function() {
      var service = new SessionService();
      var sid = 1, fid = 'frontend-server-1', socket = {};
      var key = 'key-1', value = 'value-1';

      var session = service.create(sid, fid, socket);
      var fsession = session.toFrontendSession();

      fsession.set(key, value);

      should.not.exist(session.get(key));
      value.should.eql(fsession.get(key));
    });
  });

  describe('#push', function() {
    it('should push the specified key/value pair to session', function(done) {
      var service = new SessionService();
      var sid = 1, fid = 'frontend-server-1', socket = {};
      var key = 'key-1', value = 'value-1', key2 = 'key-2', value2 = {};

      var session = service.create(sid, fid, socket);
      var fsession = session.toFrontendSession();

      fsession.set(key, value);
      fsession.set(key2, value2);

      fsession.push(key, function(err) {
        should.not.exist(err);
        value.should.eql(session.get(key));
        should.not.exist(session.get(key2));
        done();
      });
    });

    it('should push all the key/value pairs to session', function(done) {
      var service = new SessionService();
      var sid = 1, fid = 'frontend-server-1', socket = {};
      var key = 'key-1', value = 'value-1', key2 = 'key-2', value2 = {};

      var session = service.create(sid, fid, socket);
      var fsession = session.toFrontendSession();

      fsession.set(key, value);
      fsession.set(key2, value2);

      fsession.pushAll(function(err) {
        should.not.exist(err);
        value.should.eql(session.get(key));
        value2.should.eql(session.get(key2));
        done();
      });
    });
  });
  
  describe('#export', function() {
    it('should equal frontend session after export', function(done) {
      var service = new SessionService();
      var sid = 1, fid = 'frontend-server-1', socket = {};
      var uid = 'py';

      var session = service.create(sid, fid, socket);
      var fsession = session.toFrontendSession();
      var esession = fsession.export();
      esession.id.should.eql(fsession.id);
      esession.frontendId.should.eql(fsession.frontendId);
      done();
    });
  });
});
