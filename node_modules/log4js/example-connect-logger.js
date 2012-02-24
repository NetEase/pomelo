var log4js = require('./lib/log4js');
log4js.addAppender(log4js.fileAppender('cheese.log'), 'cheese');

var logger = log4js.getLogger('cheese');
logger.setLevel('INFO');

var app = require('express').createServer();
app.configure(function() {
    app.use(log4js.connectLogger(logger, { level: log4js.levels.INFO }));
});
app.get('*', function(req,res) {
    res.send('hello world\n <a href="/cheese">cheese</a>\n');
});
app.listen(5000);
