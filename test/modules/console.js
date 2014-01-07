var lib = process.env.POMELO_COV ? 'lib-cov' : 'lib';
var should = require('should');
var pomelo = require('../../');
var consoleModule = require('../../' + lib + '/modules/console');

describe('console module test', function() {
	describe('#monitorHandler', function() {
		it('should execute the corresponding command with different signals', function() {
			var flag;
			var rs;
			var opts = {
				app: {
					stop: function(value) {
						flag = value;
					},
					addCrons: function(array) {
						rs = array;
					},
					removeCrons: function(array) {
						rs = array;
					}
				}
			};
			var module = new consoleModule(opts);
			var agent1 = {
				type: 'area'
			};
			var msg1 = {signal: 'stop'};
			module.monitorHandler(agent1, msg1);
			flag.should.eql(true);

			var msg2 = {signal: 'list'};
			var agent2 = {
				type: 'chat',
				id: 'chat-server-1'
			};
			module.monitorHandler(agent2, msg2, function(obj) {
				obj.serverId.should.eql('chat-server-1');
				obj.body.serverType.should.eql('chat');
			});

			var msg3 = {signal: 'addCron'};
			module.monitorHandler(null, msg3, null);
		 	rs.length.should.eql(1);

		 	var msg4 = {signal: 'removeCron'};
		 	module.monitorHandler(null, msg4, null);
		 	rs.length.should.eql(1);
		});
	});

	describe('#clientHandler', function() {
    var _exit;
    var _setTimeout;
    var exitCount = 0;

    before(function(done) {
      _exit = process.exit;
      _setTimeout = setTimeout;
      done();
    });

    after(function(done) {
      process.exit = _exit;
      setTimeout = _setTimeout;
      done();
    });

		var opts = {
				app: {
					clusterSeq: {},
					stop: function(value) {
						return value;
					},
					getServerById: function() {
						return {
							host: '127.0.0.1'
						};
					},
					getServers: function() {
						return {
							'chat-server-1': {

							}
						}
					},
					get: function(value) {
						switch(value) {
							case 'main':
							  return __dirname + '/../../index.js';
							case 'env':
							  return 'dev';
						}
					}
				}
			};
		var module = new consoleModule(opts);
		it('should execute kill command', function(done) {
			var msg = {signal: 'kill'};
      process.exit = function() {exitCount++;};
      setTimeout = function(cb, timeout) {
        if (timeout > 3000) {
          timeout = 3000;
        }
        _setTimeout(cb, timeout);
      };

      var agent1 = {
				request: function(recordId, moduleId, msg, cb) {
					cb('chat-server-1');
        },
				idMap: {
					'chat-server-1': {
						type: 'chat',
						id: 'chat-server-1'
					}
				}
			};
			module.clientHandler(agent1, msg, function(err, result) {
        should.not.exist(err);
        should.exist(result.code);
			});

      var agent2 = {
				request: function(recordId, moduleId, msg, cb) {
					cb(null);
        },
				idMap: {
					'chat-server-1': {
						type: 'chat',
						id: 'chat-server-1'
					}
				}
			};
			module.clientHandler(agent2, msg, function(err, result) {
        should.not.exist(err);
        should.exist(result.code);
        result.code.should.eql('remain');
        exitCount.should.greaterThan(0);
        done();
			});
		});

		it('should execute stop command', function(done) {
			var msg1 = {signal: 'stop', ids: ['chat-server-1']};
			var msg2 = {signal: 'stop', ids:[]};
			var agent = {
				notifyById: function(serverId, moduleId, msg) {

				},
				notifyAll: function(moduleId, msg) {

				}
			};
			module.clientHandler(agent, msg1, function(err, result) {
				result.status.should.eql('part');
			});

			module.clientHandler(agent, msg2, function(err, result) {
				result.status.should.eql('all');
				done();
			});
		});
		it('should execute list command', function() {
			var msg = {signal: 'list'};
			var agent = {
				request: function(recordId, moduleId, msg, cb) {
					cb({serverId: 'chat-server-1', body: {'server':{}}});
				},
				idMap: {
					'chat-server-1': {
						type: 'chat',
						id: 'chat-server-1'
					}
				}
			};
			module.clientHandler(agent, msg, function(err, result) {
				should.exist(result.msg);
			});
		});
		it('should execute add command', function() {
			var msg1 = {signal: 'add', args: ['host=127.0.0.1', 'port=88888', 'clusterCount=2']};
			var msg2 = {signal: 'add', args: ['host=127.0.0.1', 'port=88888', 'id=chat-server-1', 'serverType=chat']};
			var agent = {};
			module.clientHandler(agent, msg1, function(err, result) {
				should.not.exist(err);
				result.length.should.eql(0);
			});
			module.clientHandler(agent, msg2, function(err, result) {
				result.status.should.eql('ok');
			});
		});
	});
});
