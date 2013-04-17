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
        session.should.eql(service.getByUid(uid));
        eventCount.should.equal(1);
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
    it('should kick the session', function(done) {
      var service = new SessionService();
      var sid = 1, fid = 'frontend-server-1';
      var socket = {
        emit: function(){},
        disconnect: function(){}
      };
      var uid = 'changchang';
      var eventCount = 0;

      var session = service.create(sid, fid, socket);
      session.on('closed', function() {
        eventCount++;
      });

      service.bind(sid, uid, function(err) {
        service.kick(uid, function(err) {
          should.not.exist(err);
          should.not.exist(service.get(sid));
          should.not.exist(service.getByUid(uid));
          eventCount.should.equal(1);
          done();
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
});

describe('mock local session test', function() {
  describe('#bind', function() {
    it('should get session by uid after binded', function(done) {
      var service = new SessionService();
      var sid = 1, fid = 'frontend-server-1', socket = {};
      var uid = 'changchang';
      var eventCount = 0;

      var session = service.create(sid, fid, socket);
      var msession = session.mockLocalSession();

      should.exist(msession);

      msession.on('bind', function(euid) {
        eventCount++;
        uid.should.equal(euid);
      });

      msession.bind(uid, function(err) {
        should.not.exist(err);
        session.should.eql(service.getByUid(uid));
        eventCount.should.equal(1);
        done();
      });
    });
  });

  describe('#set/get', function() {
    it('should update the key/value pair in mock local session but not session',
        function() {
      var service = new SessionService();
      var sid = 1, fid = 'frontend-server-1', socket = {};
      var key = 'key-1', value = 'value-1';

      var session = service.create(sid, fid, socket);
      var msession = session.mockLocalSession();

      msession.set(key, value);

      should.not.exist(session.get(key));
      value.should.eql(msession.get(key));
    });
  });

  describe('#push', function() {
    it('should push the specified key/value pair to session', function(done) {
      var service = new SessionService();
      var sid = 1, fid = 'frontend-server-1', socket = {};
      var key = 'key-1', value = 'value-1', key2 = 'key-2', value2 = {};

      var session = service.create(sid, fid, socket);
      var msession = session.mockLocalSession();

      msession.set(key, value);
      msession.set(key2, value2);

      msession.push(key, function(err) {
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
      var msession = session.mockLocalSession();

      msession.set(key, value);
      msession.set(key2, value2);

      msession.pushAll(function(err) {
        should.not.exist(err);
        value.should.eql(session.get(key));
        value2.should.eql(session.get(key2));
        done();
      });
    });
  });
});