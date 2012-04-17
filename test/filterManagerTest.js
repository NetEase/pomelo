var filterManager = require('../lib/filterManager');
var utils = require('../lib/util/utils');
var should = require('should');

var filterMaker = (function(){
    var count = 0;
    return {
    	create: function(name){
            return {
            	handle: function(msg, session, fn){
            		count+=1;
                    console.log('filter '+name+ ' invoked!');
            		utils.invokeCallback(fn, null, msg, session);
            	}
            }
    	},
        getTotalCount: function(){
        	return count;
        }
    }
})();

describe('filterManagerTest', function(){
    var testFilter1 = filterMaker.create('filter1');
    var testFilter2 = filterMaker.create('filter2');
    var testFilter3 = filterMaker.create('filter3');
    
    before(function(done){
        filterManager.clear();
        done();
    });
    after(function(done){
        done();
    });
    it('use should be ok!', function(done){
        should.equal(filterManager.stackLen(),0);
        filterManager.use(testFilter1);
        should.equal(filterManager.stackLen(), 1);
        filterManager.use(testFilter2);
        should.equal(filterManager.stackLen(), 2);
        filterManager.use(testFilter3);
        should.equal(filterManager.stackLen(), 3);
        done();
    });
    
    it('filter should be called!', function(done){
        var msg = {route: 'user.go', params: {xcc: 1}};
        var session = {uid:1};
        var cbCount = 0;
        filterManager.filter(msg, session, function(err, msg, session){
            cbCount += 1;
        });
        cbCount.should.equal(1);
        
        filterMaker.getTotalCount().should.equal(3);
        done();
    });
});
