var pomelo = require('../lib/pomelo');
var should = require('should');
var filterManager = require('../lib/filterManager');

describe('applicationTest', function(){
    var app = pomelo.createApp();
    
    before(function(done){
        filterManager.clear();
        done();
    });
    after(function(done){
        done();
    });
    describe('#set()', function(){
        it('set and get should be ok!', function(done){
            app.should.have.property('settings');
            app.set('test',true);
            var test = app.get('test');
            test.should.be.ok;
            done();
        });
        
        it('set json should be ok!', function(done){
            app.set('servers', __dirname+'/config/servers.json');
            
            var servers = app.get('servers');
            
            should.exist(servers);
            
            servers.should.have.property('development');
            servers.should.have.property('production');
            servers.should.have.property('localpro');
            
            done();
        });        
    });
    
    it('enable should be ok!', function(done){
        app.enable('openStack');
        var result = app.enabled('openStack');
        result.should.be.ok;
        
        app.disable('openStack');
        result = app.enabled('openStack');
        result.should.not.be.ok;
        
        done();
    });
    
    it('enable service should be ok!', function(done){
    	app.enable('schedulerService');
        var result = app.enabled('schedulerService');
        result.should.be.ok;
        
        app.disable('schedulerService');
        result = app.enabled('schedulerService');
        result.should.not.be.ok;
        done();
    });
    
    it('use call should be ok!', function(done){
        filterManager.stackLen().should.equal(0);
    	app.use(function(msg, session){return 1;});
        app.use('\*use', function(msg,session){return -1;});
        filterManager.stackLen().should.equal(2);
        done();
    });
    
    it('configure call should be work !', function(done){
        app.set('env', 'development');
        
        var callCount = 0;
        var devResult = false;
        app.configure('development', function(){
            callCount += 1;
            devResult = true;
        });
        app.configure('production', function(){
            callCount +=3;
            devResult = false;
        });
        app.configure('localpro', function(){
            callCount += 5;
        });
        
        devResult.should.be.ok;
        
        app.configure('development|production', function(){
            callCount += 7;
            devResult = false;
        });
        
        devResult.should.not.ok;
        callCount.should.equal(8);
        
        done();
    });
    
    it('gen handler should be ok!', function(done){
        app.genHandler('area',  __dirname + '/config/area/handler');
        should.exist(app.get('handlerMap'));
        //console.log('appTest genHandler: ' + JSON.stringify(app.get('handlerMap')));
        should.exist(app.get('handlerMap')['area']);
        
        var userHandler = app.get('handlerMap')['area'].userHandler;
        
        var result = userHandler.move();
        
        result.should.be.ok;
        
        done();
    });
    
    it('gen remote should be ok!', function(done){
        app.genRemote('area',  __dirname + '/config/area/remote');
        should.exist(app.get('remoteMap'));
        should.exist(app.get('remoteMap').user.area);
        
        var userService = app.get('remoteMap').user.area.userService;
        var result = userService.userLeave();
        result.should.not.be.ok;
        
        done();
    });
    
    it('gen proxy should be ok!', function(done){
        app.genProxy('area',  __dirname + '/config/area/remote');
        should.exist(app.get('proxyMap'));
        should.exist(app.get('proxyMap').user.area);
        
        var userService = app.get('proxyMap').user.area.userService;
        
        app.set('mailRouter', {
            route: function(params, callback){
                return false;	
            }	
        });
        userService.userLeave();
        done();
    });
    
    it('find server should be ok!', function(done){
        app.set('env', 'production');
        app.set('servers', __dirname+'/config/servers.json');
        var server = app.findServer('logic', 'logic-server-2');
        should.exist(server);
        server.id.should.equal('logic-server-2');
        
        try {
            app.findServer('wrong', 'haha');
        }
        catch (error){
        	should.exist('error');
        }
        done();
    });
    
});