var log4js = require('./lib/log4js')
, cluster = require('cluster')
, numCPUs = require('os').cpus().length
, i = 0;

if (cluster.isMaster) {
    log4js.configure({
        appenders: [
            {
                type: "multiprocess",
                mode: "master",
                appender: {
                    type: "console"
                }
            }
        ]
    });

    console.info("Master creating %d workers", numCPUs);
    for (i=0; i < numCPUs; i++) {
        cluster.fork();
    }

    cluster.on('death', function(worker) {
        console.info("Worker %d died.", worker.pid);
//        cluster.fork();
    });
} else {
    log4js.configure({
        appenders: [
            {
                type: "multiprocess",
                mode: "worker"
            }
        ]
    });
    function logSomething(i) {
        return function() {
            console.info("Worker %d - logging something %d", process.pid, i);
        }
    }

    console.info("Worker %d started.", process.pid);
    for (i=0; i < 1000; i++) {
        process.nextTick(logSomething(i));
    }
}



