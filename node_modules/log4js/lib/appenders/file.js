var layouts = require('../layouts')
, path = require('path')
, fs = require('fs');

/**
 * File Appender writing the logs to a text file. Supports rolling of logs by size.
 *
 * @param file file log messages will be written to
 * @param layout a function that takes a logevent and returns a string (defaults to basicLayout).
 * @param logSize - the maximum size (in bytes) for a log file, if not provided then logs won't be rotated.
 * @param numBackups - the number of log files to keep after logSize has been reached (default 5)
 */
function fileAppender (file, layout, logSize, numBackups) {
    var bytesWritten = 0;
    file = path.normalize(file);
    layout = layout || layouts.basicLayout;
    numBackups = numBackups === undefined ? 5 : numBackups;
    //there has to be at least one backup if logSize has been specified
    numBackups = numBackups === 0 ? 1 : numBackups;

    function setupLogRolling () {
        try {
            var stat = fs.statSync(file);
            bytesWritten = stat.size;
            if (bytesWritten >= logSize) {
                rollThatLog();
            }
        } catch (e) {
            //file does not exist
            bytesWritten = 0;
        }
    }

    function rollThatLog () {
        function index(filename) {
            return parseInt(filename.substring((path.basename(file) + '.').length), 10) || 0;
        }

        var nameMatcher = new RegExp('^' + path.basename(file));
        function justTheLogFiles (item) {
            return nameMatcher.test(item);
        }

        function byIndex(a, b) {
            if (index(a) > index(b)) {
                return 1;
            } else if (index(a) < index(b) ) {
                return -1;
            } else {
                return 0;
            }
        }

        function increaseFileIndex (fileToRename) {
            var idx = index(fileToRename);
            if (idx < numBackups) {
                //on windows, you can get a EEXIST error if you rename a file to an existing file
                //so, we'll try to delete the file we're renaming to first
                try {
                    fs.unlinkSync(file + '.' + (idx+1));
                } catch (e) {
                    //couldn't delete, but that could be because it doesn't exist
                    //try renaming anyway
                }
                fs.renameSync(path.join(path.dirname(file), fileToRename), file + '.' + (idx + 1));
            }
        }

        //roll the backups (rename file.n to file.n+1, where n <= numBackups)
        fs.readdirSync(path.dirname(file))
          .filter(justTheLogFiles)
            .sort(byIndex)
              .reverse()
                .forEach(increaseFileIndex);

        //let's make a new file
        var newLogFileFD = fs.openSync(file, 'a', 0644)
      , oldLogFileFD = logFile.fd;
        logFile.fd = newLogFileFD;
        fs.close(oldLogFileFD);
        //reset the counter
        bytesWritten = 0;
    }

    function fileExists (filename) {
        try {
            fs.statSync(filename);
            return true;
        } catch (e) {
            return false;
        }
    }

    function openTheStream() {
        var stream = fs.createWriteStream(file, { flags: 'a', mode: 0644, encoding: 'utf8' });
        stream.on("open", function() {
            canWrite = true;
            flushBuffer();
        });
        stream.on("error", function (err) {
            console.error("log4js.fileAppender - Writing to file %s, error happened ", file, err);
        });
        stream.on("drain", function() {
            canWrite = true;
            flushBuffer();
            if (logEventBuffer.length > 0) {
                writeToLog(logEventBuffer.shift());
            }
        });
        return stream;
    }

    function flushBuffer() {
        while (logEventBuffer.length > 0 && canWrite) {
            writeToLog(logEventBuffer.shift());
        }
    }

    var logEventBuffer = []
    , canWrite = false
    , logFile = openTheStream();

    if (logSize > 0) {
        setupLogRolling();
    }

    //close the file on process exit.
    process.on('exit', function() {
        flushBuffer();
        logFile.end();
        logFile.destroy();
    });

    function writeToLog(loggingEvent) {
        var logMessage = layout(loggingEvent)+'\n';
        //not entirely accurate, but it'll do.
        bytesWritten += logMessage.length;
        canWrite = logFile.write(logMessage, "utf8");
        if (bytesWritten >= logSize) {
            rollThatLog();
        }
    }

    return function(loggingEvent) {
        logEventBuffer.push(loggingEvent);
        flushBuffer();
    };
}

function configure(config) {
    var layout;
    if (config.layout) {
	layout = layouts.layout(config.layout.type, config.layout);
    }
    return fileAppender(config.filename, layout, config.maxLogSize, config.backups);
}

exports.name = "file";
exports.appender = fileAppender;
exports.configure = configure;
