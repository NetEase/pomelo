var filterManager = require('../lib/filterManager');
var utils = require('../lib/util/utils');
var should = require('should');

var filterMaker = (function(){
    var beforeCount = 0;
    var afterCount = 0;
    return {
			createBefore: function(name){
				return {
					before: function(msg, session, next){
						beforeCount += 1;
						console.log('filter '+name+ ' invoked!');
						utils.invokeCallback(next, null, msg, session);
					}
				};
			},
			createAfter: function(name){
				return {
					after: function(err,msg, session, next){
						afterCount += 1;
						console.log('filter '+name+ ' invoked!');
						utils.invokeCallback(next, null, msg, session);
					}
				};
			},
			getBeforeCount: function(){
				return beforeCount;
			},
			getAfterCount: function(){
				return afterCount;
			}
    };
})();

describe('filterManagerTest', function(){
    var testFilter1 = filterMaker.createBefore('beforefilter1');
    var testFilter2 = filterMaker.createBefore('beforefilter2');
    var testFilter3 = filterMaker.createBefore('beforefilter3');
    var testFilter4 = filterMaker.createAfter('afterfilter1');
    var testFilter5 = filterMaker.createAfter('afterfilter2');

    before(function(done){
        filterManager.clear();
        done();
    });
    after(function(done){
        done();
    });
    it('use should be ok!', function(done){
        should.equal(filterManager.beforeLen(),0);
        filterManager.before(testFilter1);
        should.equal(filterManager.beforeLen(), 1);
        filterManager.before(testFilter2);
        should.equal(filterManager.beforeLen(), 2);
        filterManager.before(testFilter3);
        should.equal(filterManager.beforeLen(), 3);
        filterManager.after(testFilter4);
        should.equal(filterManager.afterLen(), 1);
        filterManager.after(testFilter5);
        should.equal(filterManager.afterLen(), 2);
        done();
    });

    it('filter should be called!', function(done){
        var msg = {route: 'user.go', params: {xcc: 1}};
        var session = {uid:1};
        var cbCount = 0;
        filterManager.beforeFilter(msg, session, function(err){
            cbCount += 1;
        });
        cbCount.should.equal(1);

        filterManager.afterFilter(null, msg, session, function(err){
            cbCount += 1;
        });
        cbCount.should.equal(2);
        filterMaker.getBeforeCount().should.equal(3);
        filterMaker.getAfterCount().should.equal(2);
        done();
    });
});
