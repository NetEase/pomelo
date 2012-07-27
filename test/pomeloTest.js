var pomelo = require('../lib/pomelo');
var should = require('should');

describe('pomelo', function(){
    describe('#createApp', function(){
        it('should create and get app, be the same instance', function(done){
          var app = pomelo.createApp();
          should.exist(app);

          var app2 = pomelo.app;
          should.exist(app2);
          should.strictEqual(app, app2);
          done();
        });
    });
});

