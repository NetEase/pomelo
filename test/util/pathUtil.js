var pathUtil = require('../../lib/util/pathUtil');
var utils = require('../../lib/util/utils');
var should = require('should');
var fs = require('fs');

var mockBase = process.cwd() + '/test/mock-base';

describe('path util test', function() {
  describe('#getSysRemotePath', function() {
    it('should return the system remote service path for frontend server', function() {
      var role = 'frontend';
      var expectSuffix = '/common/remote/frontend';
      var p = pathUtil.getSysRemotePath(role);
      should.exist(p);
      fs.existsSync(p).should.be.true;
      utils.endsWith(p, expectSuffix).should.be.true;
    });

    it('should return the system remote service path for backend server', function() {
      var role = 'backend';
      var expectSuffix = '/common/remote/backend';
      var p = pathUtil.getSysRemotePath(role);
      should.exist(p);
      fs.existsSync(p).should.be.true;
      utils.endsWith(p, expectSuffix).should.be.true;
    });

  });

  describe('#getUserRemotePath', function() {
    it('should return user remote service path for the associated server type', function() {
      var serverType = 'connector';
      var expectSuffix = '/app/servers/connector/remote';
      var p = pathUtil.getUserRemotePath(mockBase, serverType);
      should.exist(p);
      fs.existsSync(p).should.be.true;
      utils.endsWith(p, expectSuffix).should.be.true;
    });

    it('should return null if the directory not exist', function() {
      var serverType = 'area';
      var p = pathUtil.getUserRemotePath(mockBase, serverType);
      should.not.exist(p);

      serverType = 'some-dir-not-exist';
      p = pathUtil.getUserRemotePath(mockBase, serverType);
      should.not.exist(p);
    });
  });

  describe('#listUserRemoteDir', function() {
    it('should return sub-direcotry name list of servers/ directory', function() {
      var expectNames = ['connector', 'area'];
      var p = pathUtil.listUserRemoteDir(mockBase);
      should.exist(p);
      expectNames.length.should.equal(p.length);
      for(var i=0, l=expectNames.length; i<l; i++) {
        p.should.include(expectNames[i]);
      }
    });

    it('should throw err if the servers/ illegal', function() {
      (function() {
        pathUtil.listUserRemoteDir('some illegal base');
      }).should.throw();
    });
  });

  describe('#remotePathRecord', function() {
    var namespace = 'user';
    var serverType = 'connector';
    var path = '/some/path/to/remote';
    var r = pathUtil.remotePathRecord(namespace, serverType, path);
    should.exist(r);
    namespace.should.equal(r.namespace);
    serverType.should.equal(r.serverType);
    path.should.equal(r.path);
  });

  describe('#getHandlerPath', function() {
    it('should return user handler path for the associated server type', function() {
      var serverType = 'connector';
      var expectSuffix = '/app/servers/connector/handler';
      var p = pathUtil.getHandlerPath(mockBase, serverType);
      should.exist(p);
      fs.existsSync(p).should.be.true;
      utils.endsWith(p, expectSuffix).should.be.true;
    });

    it('should return null if the directory not exist', function() {
      var serverType = 'area';
      var p = pathUtil.getHandlerPath(mockBase, serverType);
      should.not.exist(p);

      serverType = 'some-dir-not-exist';
      p = pathUtil.getHandlerPath(mockBase, serverType);
      should.not.exist(p);
    });
  });

  describe('#getScriptPath', function() {
    var p = pathUtil.getScriptPath(mockBase);
    var expectSuffix = '/scripts';
    should.exist(p);
    utils.endsWith(p, expectSuffix).should.be.true;
  });

  describe('#getLogPath', function() {
    var p = pathUtil.getLogPath(mockBase);
    var expectSuffix = '/logs';
    should.exist(p);
    utils.endsWith(p, expectSuffix).should.be.true;
  });

});