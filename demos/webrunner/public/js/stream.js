/* Stream model definitions for Log.io web client
 */

try {
  var _ = require('underscore');
} catch(err) {}

// Stream screens show live changes from multiple LogFiles
var Stream = function(web_client) {
  this._dom;
  this._id = String(new Date().getTime());
  this._paused = false;
  this.log_files = {};
  this.highlight = null;
  this.highlight_count = 0;
  this.web_client = web_client;
  this.num = _(this.web_client.streams).size() + 1;
};

Stream.prototype = {
  add_log_file: function(log_file) {
    if (!this.log_files[log_file.node.label]) {
      this.log_files[log_file.node.label] = {};
    }
    if (!this.log_files[log_file.node.label][log_file.label]) {
      this.log_files[log_file.node.label][log_file.label] = log_file;
    }
  },
  remove_log_file: function(log_file) {
    delete this.log_files[log_file.node.label][log_file.label];
  },
  close: function() {
    var stream = this;
    _(this.log_files).each(function(log_files, nlabel) {
      _(log_files).each(function(log_file, llabel) {
        log_file.detach_stream(stream);
      });
    });
    this.web_client.remove_stream(stream);
  },
  get_label: function() {
    var label = "Stream " + this.num;
    return label;
  },
  add_highlight: function(regex) {
    this.highlight = regex;
  },
  remove_highlight: function() {
    this.highlight = null;
    this.highlight_count = 0;
  },
  pause: function() { this._paused = true; },
  start: function() { this._paused = false; },
  render: function() { throw "Stream.render() not defined"; },
  destroy: function() { throw "Stream.destroy() not defined"; },
  log: function(log_file, msg) { throw "Stream.log() not defined"; }
};

try {
  module.exports = {
    Stream: Stream
  }
} catch(err) {}
