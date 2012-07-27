var log = require('../../lib/util/log/log');
var should = require('should');


describe('logTest', function(){
	it('get AppenderFile should be ok', function(done){
		log.configure(__dirname+'/../config/log4js.json');
		should.exist(log.appenders);
		console.log('log appenders: '+JSON.stringify(log.appenders));

		log.getAppenderFile('monitor').should.equal('./logs/monitor-log.log');
		done();
	});
});
