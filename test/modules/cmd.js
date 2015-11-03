var should = require('should');
var pomelo = require('../../');
var commander = require('../../lib/monitors/common/cmd');

describe('cmd test', function() {
    describe('#cmd init', function() {
        it('should execute the corresponding command with different cmd', function() {
            var flag;
            var rs;
            var client = {
                app: {
                    components: {
                        __connector__: {
                            blacklist: []
                        }
                    },
                    stop: function() {
                        flag = true;
                    },
                    kill: function(value) {
                        flag = value
                    },
                    addCrons: function(array) {
                        rs = array;
                    },
                    removeCrons: function(array) {
                        rs = array;
                    },
                    set: function(){},
                    isFrontend: function(){return true}
                }
            };

            var data = {command: 'stop'};
            commander.init(client, JSON.stringify(data));
            flag.should.eql(true);
/*
            data = {command: 2};
            commander.init(client, JSON.stringify(data));
            flag.should.eql(true);
*/
            data = {command: 'addCron', cron: {
                                            type: 'chat',
                                            id: 'chat-server-1'
                                      }
                   };
            commander.init(client, JSON.stringify(data));
            rs.length.should.eql(1);

            data = {command: 'removeCron', cron: {
                                            type: 'chat',
                                            id: 'chat-server-1'
                                      }
                   };
            commander.init(client, JSON.stringify(data));
            rs.length.should.eql(1);

            data = {command: 'blacklist', blacklist: ['127.0.0.1'] };
            commander.init(client, JSON.stringify(data));
            client.app.components.__connector__.blacklist.length.should.eql(1);
        });
    });
});
