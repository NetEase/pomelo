var app = require('../lib/application');
var pomelo = require('../');
var should = require('should');

var WAIT_TIME = 1000;
var mockBase = process.cwd() + '/test';

describe('application test', function(){
  afterEach(function() {
    app.state = 0;
    app.settings = {};
  });

  describe('#init', function() {
    it('should init the app instance', function() {
      app.init({base: mockBase});
      app.state.should.equal(1);  // magic number from application.js
    });
  });

  describe('#set and get', function() {
    it('should play the role of normal set and get', function() {
      should.not.exist(app.get('some undefined key'));

      var key = 'some defined key', value = 'some value';
      app.set(key, value);
      value.should.equal(app.get(key));
    });

    it('should return the value if pass just one parameter to the set method', function() {
      var key = 'some defined key', value = 'some value';
      should.not.exist(app.set(key));
      app.set(key, value);
      value.should.equal(app.set(key));
    });
  });

  describe("#enable and disable", function() {
    it('should play the role of enable and disable', function() {
      var key = 'some enable key';
      app.enabled(key).should.be.false;
      app.disabled(key).should.be.true;

      app.enable(key);
      app.enabled(key).should.be.true;
      app.disabled(key).should.be.false;

      app.disable(key);
      app.enabled(key).should.be.false;
      app.disabled(key).should.be.true;
    });
  });

  describe("#compoent", function() {
    it('should load the component and fire their lifecircle callback by app.start, app.afterStart, app.stop', function(done) {
      var startCount = 0, afterStartCount = 0, stopCount = 0;

      var mockComponent = {
        start: function(cb) {
          console.log('start invoked');
          startCount++;
          cb();
        },

        afterStart: function(cb) {
          console.log('afterStart invoked');
          afterStartCount++;
          cb();
        },

        stop: function(force, cb) {
          console.log('stop invoked');
          stopCount++;
          cb();
        }
      };

      app.init({base: mockBase});
      app.load(mockComponent);
      app.start(function(err) {
        should.not.exist(err);
      });

      setTimeout(function() {
        // wait for after start
        app.stop(false);

        setTimeout(function() {
          // wait for stop
          startCount.should.equal(1);
          afterStartCount.should.equal(1);
          stopCount.should.equal(1);
          done();
        }, WAIT_TIME);
      }, WAIT_TIME);
    });

    it('should access the component with a name by app.components.name after loaded', function() {
      var key1 = 'key1', comp1 = {content: 'some thing in comp1'};
      var comp2 = {name: 'key2', content: 'some thing in comp2'};
      var key3 = 'key3';
      var comp3 = function() {
        return {content: 'some thing in comp3', name: key3};
      };

      app.init({base: mockBase});
      app.load(key1, comp1);
      app.load(comp2);
      app.load(comp3);

      app.components.key1.should.eql(comp1);
      app.components.key2.should.eql(comp2);
      app.components.key3.should.eql(comp3());
    });

    it('should ignore duplicated components', function() {
      var key = 'key';
      var comp1 = {content: 'some thing in comp1'};
      var comp2 = {content: 'some thing in comp2'};

      app.init({base: mockBase});
      app.load(key, comp1);
      app.load(key, comp2);

      app.components[key].should.eql(comp1);
      app.components[key].should.not.eql(comp2);
    });
  });

  describe('#filter', function() {
    it('should add before filter and could fetch it later', function() {
      var filters = [
        function() {console.error('filter1');},
        function() {}
      ];

      app.init({base: mockBase});

      var i, l;
      for(i=0, l=filters.length; i<l; i++) {
        app.before(filters[i]);
      }

      var filters2 = app.get('__befores__');
      should.exist(filters2);
      filters2.length.should.equal(filters.length);
      for(i=0, l=filters2.length; i<l; i++) {
        filters2[i].should.equal(filters[i]);
      }
    });

    it('should add after filter and could fetch it later', function() {
      var filters = [
        function() {console.error('filter1');},
        function() {}
      ];

      app.init({base: mockBase});

      var i, l;
      for(i=0, l=filters.length; i<l; i++) {
        app.after(filters[i]);
      }

      var filters2 = app.get('__afters__');
      should.exist(filters2);
      filters2.length.should.equal(filters.length);
      for(i=0, l=filters2.length; i<l; i++) {
        filters2[i].should.equal(filters[i]);
      }
    });

    it('should add filter and could fetch it from before and after filter later', function() {
      var filters = [
        function() {console.error('filter1');},
        function() {}
      ];

      app.init({base: mockBase});

      var i, l;
      for(i=0, l=filters.length; i<l; i++) {
        app.filter(filters[i]);
      }

      var filters2 = app.get('__befores__');
      should.exist(filters2);
      filters2.length.should.equal(filters.length);
      for(i=0, l=filters2.length; i<l; i++) {
        filters2[i].should.equal(filters[i]);
      }

      var filters3 = app.get('__afters__');
      should.exist(filters3);
      filters3.length.should.equal(filters.length);
      for(i=0, l=filters3.length; i<l; i++) {
        filters2[i].should.equal(filters[i]);
      }
    });
  });

   describe('#globalFilter', function() {
    it('should add before global filter and could fetch it later', function() {
      var filters = [
        function() {console.error('global filter1');},
        function() {}
      ];

      app.init({base: mockBase});

      var i, l;
      for(i=0, l=filters.length; i<l; i++) {
        app.globalBefore(filters[i]);
      }

      var filters2 = app.get('__globalBefores__');
      should.exist(filters2);
      filters2.length.should.equal(filters.length);
      for(i=0, l=filters2.length; i<l; i++) {
        filters2[i].should.equal(filters[i]);
      }
    });

    it('should add after global filter and could fetch it later', function() {
      var filters = [
        function() {console.error('filter1');},
        function() {}
      ];

      app.init({base: mockBase});

      var i, l;
      for(i=0, l=filters.length; i<l; i++) {
        app.globalAfter(filters[i]);
      }

      var filters2 = app.get('__globalAfters__');
      should.exist(filters2);
      filters2.length.should.equal(filters.length);
      for(i=0, l=filters2.length; i<l; i++) {
        filters2[i].should.equal(filters[i]);
      }
    });

    it('should add filter and could fetch it from before and after filter later', function() {
      var filters = [
        function() {console.error('filter1');},
        function() {}
      ];

      app.init({base: mockBase});

      var i, l;
      for(i=0, l=filters.length; i<l; i++) {
        app.globalFilter(filters[i]);
      }

      var filters2 = app.get('__globalBefores__');
      should.exist(filters2);
      filters2.length.should.equal(filters.length);
      for(i=0, l=filters2.length; i<l; i++) {
        filters2[i].should.equal(filters[i]);
      }

      var filters3 = app.get('__globalAfters__');
      should.exist(filters3);
      filters3.length.should.equal(filters.length);
      for(i=0, l=filters3.length; i<l; i++) {
        filters2[i].should.equal(filters[i]);
      }
    });
  });

  describe('#configure', function() {
    it('should execute the code block wtih the right environment', function() {
      var proCount = 0, devCount = 0;
      var proEnv = 'production', devEnv = 'development', serverType = 'server';

      app.init({base: mockBase});
      app.set('serverType', serverType);
      app.set('env', proEnv);

      app.configure(proEnv, serverType, function() {
        proCount++;
      });

      app.configure(devEnv, serverType, function() {
        devCount++;
      });

      app.set('env', devEnv);

      app.configure(proEnv, serverType, function() {
        proCount++;
      });

      app.configure(devEnv, serverType, function() {
        devCount++;
      });

      proCount.should.equal(1);
      devCount.should.equal(1);
    });

    it('should execute the code block wtih the right server', function() {
      var server1Count = 0, server2Count = 0;
      var proEnv = 'production', serverType1 = 'server1', serverType2 = 'server2';

      app.init({base: mockBase});
      app.set('serverType', serverType1);
      app.set('env', proEnv);

      app.configure(proEnv, serverType1, function() {
        server1Count++;
      });

      app.configure(proEnv, serverType2, function() {
        server2Count++;
      });

      app.set('serverType', serverType2);

      app.configure(proEnv, serverType1, function() {
        server1Count++;
      });

      app.configure(proEnv, serverType2, function() {
        server2Count++;
      });

      server1Count.should.equal(1);
      server2Count.should.equal(1);
    });
  });

  describe('#route', function() {
    it('should add route record and could fetch it later', function() {
      var type1 = 'area', type2 = 'connector';
      var func1 = function() {console.log('func1');};
      var func2 = function() {console.log('func2');};

      app.init({base: mockBase});

      app.route(type1, func1);
      app.route(type2, func2);

      var routes = app.get('__routes__');
      should.exist(routes);
      func1.should.equal(routes[type1]);
      func2.should.equal(routes[type2]);
    });
  });

  describe('#transaction', function() {
    it('should execute all conditions and handlers', function() {
      var conditions = {
        test1: function(cb) {
          console.log('condition1');
          cb();
        },
        test2: function(cb) {
          console.log('condition2');
          cb();
        }
      };
      var flag = 1;
      var handlers = {
        do1: function(cb) {
          console.log('handler1');
          cb();
        },
        do2: function(cb) {
          console.log('handler2');
          if(flag < 3){
            flag ++;
            cb(new Error('error'));
          } else {
            cb();
          }
        }
      };
      app.transaction('test', conditions, handlers, 5);
    });

    it('shoud execute conditions with error and do not execute handlers', function() {
      var conditions = {
        test1: function(cb) {
          console.log('condition1');
          cb();
        },
        test2: function(cb) {
          console.log('condition2');
          cb(new Error('error'));
        },
        test3: function(cb) {
          console.log('condition3');
          cb();
        }
      };
      var handlers = {
        do1: function(cb) {
          console.log('handler1');
          cb();
        },
        do2: function(cb) {
          console.log('handler2');
          cb();
        }
      };
      app.transaction('test', conditions, handlers);
    });
  });

  describe('#add and remove servers', function() {
    it('should add servers and emit event and fetch the new server info by get methods', function(done) {
      var newServers = [
        {id: 'connector-server-1', serverType: 'connecctor', host: '127.0.0.1', port: 1234, clientPort: 3000, frontend: true},
        {id: 'area-server-1', serverType: 'area', host: '127.0.0.1', port: 2234}
      ];
      app.init({base: mockBase});
      app.event.on(pomelo.events.ADD_SERVERS, function(servers) {
        // check event args
        newServers.should.eql(servers);

        // check servers
        var curServers = app.getServers();
        should.exist(curServers);
        var item, i, l;
        for(i=0, l=newServers.length; i<l; i++) {
          item = newServers[i];
          item.should.eql(curServers[item.id]);
        }

        // check get server by id
        for(i=0, l=newServers.length; i<l; i++) {
          item = newServers[i];
          item.should.eql(app.getServerById(item.id));
        }

        // check server types
        var types = [];
        for(i=0, l=newServers.length; i<l; i++) {
          item = newServers[i];
          if(types.indexOf(item.serverType) < 0) {
            types.push(item.serverType);
          }
        }
        var types2 = app.getServerTypes();
        types.length.should.equal(types2.length);
        for(i=0, l=types.length; i<l; i++) {
          types2.should.include(types[i]);
        }

        // check server type list
        var slist;
        for(i=0, l=newServers.length; i<l; i++) {
          item = newServers[i];
          slist = app.getServersByType(item.serverType);
          should.exist(slist);
          contains(slist, item).should.be.true;
        }

        done();
      });

      app.addServers(newServers);
    });

    it('should remove server info and emit event', function(done) {
      var newServers = [
        {id: 'connector-server-1', serverType: 'connecctor', host: '127.0.0.1', port: 1234, clientPort: 3000, frontend: true},
        {id: 'area-server-1', serverType: 'area', host: '127.0.0.1', port: 2234},
        {id: 'path-server-1', serverType: 'path', host: '127.0.0.1', port: 2235}
      ];
      var destServers = [
        {id: 'connector-server-1', serverType: 'connecctor', host: '127.0.0.1', port: 1234, clientPort: 3000, frontend: true},
        {id: 'path-server-1', serverType: 'path', host: '127.0.0.1', port: 2235}
      ];
      var delIds = ['area-server-1'];
      var addCount = 0;
      var delCount = 0;

      app.init({base: mockBase});
      app.event.on(pomelo.events.ADD_SERVERS, function(servers) {
        // check event args
        newServers.should.eql(servers);
        addCount++;
      });

      app.event.on(pomelo.events.REMOVE_SERVERS, function(ids) {
        delIds.should.eql(ids);

        // check servers
        var curServers = app.getServers();
        should.exist(curServers);
        var item, i, l;
        for(i=0, l=destServers.length; i<l; i++) {
          item = destServers[i];
          item.should.eql(curServers[item.id]);
        }

        // check get server by id
        for(i=0, l=destServers.length; i<l; i++) {
          item = destServers[i];
          item.should.eql(app.getServerById(item.id));
        }

        // check server types
        // NOTICE: server types would not clear when remove server from app
        var types = [];
        for(i=0, l=newServers.length; i<l; i++) {
          item = newServers[i];
          if(types.indexOf(item.serverType) < 0) {
            types.push(item.serverType);
          }
        }
        var types2 = app.getServerTypes();
        types.length.should.equal(types2.length);
        for(i=0, l=types.length; i<l; i++) {
          types2.should.include(types[i]);
        }

        // check server type list
        var slist;
        for(i=0, l=destServers.length; i<l; i++) {
          item = destServers[i];
          slist = app.getServersByType(item.serverType);
          should.exist(slist);
          contains(slist, item).should.be.true;
        }

        done();
      });

      app.addServers(newServers);
      app.removeServers(delIds);
    });
  });

  describe('#beforeStopHook', function() {
    it('should be called before application stopped.', function(done) {
      var count = 0;
      app.init({base: mockBase});
      app.beforeStopHook(function() {
        count++;
      });
      app.start(function(err) {
        should.not.exist(err);
      });

      setTimeout(function() {
        // wait for after start
        app.stop(false);

        setTimeout(function() {
          // wait for stop
          count.should.equal(1);
          done();
        }, WAIT_TIME);
      }, WAIT_TIME);
    });
  });
  describe('#use', function() {
    it('should exist plugin component and event', function(done) {
      var plugin = {
        components: mockBase + '/mock-plugin/components/',
        events: mockBase + '/mock-plugin/events/'
      };
      var opts = {};
      app.use(plugin, opts);
      should.exist(app.event.listeners('bind_session'));
      should.exist(app.components.mockPlugin);
      done();
    });
  });
});

var contains = function(slist, sinfo) {
  for(var i=0, l=slist.length; i<l; i++) {
    if(slist[i].id === sinfo.id) {
      return true;
    }
  }
  return false;
};
