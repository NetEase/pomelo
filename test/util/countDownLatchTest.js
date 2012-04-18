var countDownLatch = require('../../lib/util/countDownLatch');
var should = require('should');

var cbCreator = (function(){
    var count =0;

    return {
    	callback: function(){
            count++;
    	    console.log('call back invoked, count: '+count);
    	}, 
    	getCount: function(){
        	return count;
        }, 
        count: count
   };
})();


describe('countDownLatchTest', function(){
    
    var countDownLatch1;
    var countDownLatch2;
    
    before(function(done){
        countDownLatch1 = countDownLatch.createCountDownLatch(5, cbCreator.callback);
        countDownLatch2 = countDownLatch.createCountDownLatch(2, cbCreator.callback);
        done();
    });
    
    it('countdownLatch should be invoked callback 5 times', function(done){
        countDownLatch1.done();
        console.log(' cbCreator.getCount(): '+cbCreator.getCount());
        should.exist(cbCreator.getCount());
        cbCreator.getCount().should.equal(0);
        countDownLatch1.done();
        cbCreator.getCount().should.equal(0);
        countDownLatch1.done();
        cbCreator.getCount().should.equal(0);
        countDownLatch1.done();
        cbCreator.getCount().should.equal(0);
        countDownLatch1.done();
        cbCreator.getCount().should.equal(1);
        cbCreator.count.should.equal(0);
        
        countDownLatch2.done();
        cbCreator.getCount().should.equal(1);
        cbCreator.count.should.equal(0);
        countDownLatch2.done();
        cbCreator.getCount().should.equal(2);
        cbCreator.count.should.equal(0);
        done();
    });
    
    
});