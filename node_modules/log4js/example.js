var log4js = require('./lib/log4js');
//log the cheese logger messages to a file, and the console ones as well.
log4js.addAppender(log4js.fileAppender('cheese.log'), 'cheese', 'console');

var logger = log4js.getLogger('cheese');
//only errors and above get logged.
logger.setLevel('ERROR');

//console logging methds have been replaced with log4js ones.
console.error("AAArgh! Something went wrong", { some: "otherObject", useful_for: "debug purposes" });

//these will not appear (logging level beneath error)
logger.trace('Entering cheese testing');
logger.debug('Got cheese.');
logger.info('Cheese is Gouda.');
logger.warn('Cheese is quite smelly.');
//these end up on the console and in cheese.log
logger.error('Cheese %s is too ripe!', "gouda");
logger.fatal('Cheese was breeding ground for listeria.');



