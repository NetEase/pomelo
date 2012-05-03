/* LogFile model used by LogHarvester */

var fs = require('fs');
var __ = require('underscore');
var LOG_LINEBREAK = "\n";
var HISTORY_LENGTH = 100000;

var LogFile = function(path, label, harvester) {
  this.label = label;
  this.path = path;
  this.harvester = harvester;
  this._enabled = false;
}

LogFile.prototype = {

  // Watch file for changes, send log messages to LogFile
  watch: function() {
    var log_file = this;

    // fs.watchFile() uses inotify on linux systems
    // fs.watchFile(this.path, function(curr, prev) {
      // if (log_file.harvester.connected && curr.size > prev.size) {
        // log_file.ping();
        // log_file._enabled = true;
        // if (log_file._enabled) {
          // // Read changed lines
          // var stream = fs.createReadStream(log_file.path, {
            // encoding: log_file.harvester._conf.encoding,
            // start: prev.size,
            // end: curr.size
          // });
// 
          // // Send log messages to LogServer
          // stream.on('data', function (data) {
            // var lines = data.split(LOG_LINEBREAK);
            // __(lines).each(function(msg, i) {
              // // Ignore last element, will either be empty or partial line
              // if (i<lines.length-1) {
                // log_file.send_log(msg);
              // }
            // });
          // });
        // }
      // }
    // });
  },

  // Begin sending log messages to LogServer
  enable: function() {
    this._enabled = true;
  },

  // Stop sending log changes to LogServer
  disable: function() {
    this._enabled = false;
  },

  // Sends log message to server
  send_log: function(message) {
    this.harvester._send(this.harvester._conf.message_type, {
      node: this.harvester._conf.node,
      log_file: this.label,
      msg: message
    });
    this.harvester.messages_sent++;
  },

  // Sends all lines from the last 100000 characters of file
  send_history: function(client_id, history_id) {
    var length = HISTORY_LENGTH;
    var lines = [];
    
    // Read from file, create array of lines
    // TODO: Notify server/client if file doesn't exist
    try {
      var stat = fs.statSync(this.path);
      var fd = fs.openSync(this.path, 'r');
      var text = fs.readSync(fd, length, Math.max(0, stat.size - length));
      lines = text[0].split(LOG_LINEBREAK).reverse();
    } catch(err) {}

    // Send log lines to LogServer
    this.harvester._send('history_response', {
      node: this.harvester._conf.node,
      history_id: history_id,
      client_id: client_id,
      log_file: this.label,
      lines: lines
    });
  },

  // Sends ping to LogServer
  ping: function() {
    this.harvester._send('ping', {
      node: this.harvester._conf.node,
      log_file: this.label
    });
  }
}

module.exports = {
  LogFile: LogFile,
  HISTORY_LENGTH: HISTORY_LENGTH
}
