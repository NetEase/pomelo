/* History screen model definitions for Log.io web client
 */

try {
  var _ = require('underscore');
} catch(err) {}

// History screens show the last ~1000 lines of a LogFile
var History = function(web_client) {
  this._dom;
  this._id = String(new Date().getTime());
  this.log_file = null;
  this.highlight = null;
  this.highlight_count = 0;
  this.web_client = web_client;
  this.num = _(web_client.histories).size() + 1;
};

History.prototype = {
  get_history: function(log_file) {
    this.web_client.socket.emit('history_request', {
      node: log_file.node.label,
      log_file: log_file.label,
      history_id: this._id
    });
  },
  add_log_file: function(log_file) {
    this.log_file = log_file;
  },
  close: function() {
    this.web_client.remove_history(this);
  },
  get_label: function() {
    var label = "History " + this.num;
    if (this.log_file) {
      label += " - " + this.log_file.node.label + ":" + this.log_file.label;
    };
    return label;
  },
  add_highlight: function(regex) {
    this.highlight = regex;
  },
  remove_highlight: function() {
    this.highlight = null;
    this.highlight_count = 0;
  },
  render: function() { alert(11);throw "History.render() not defined"; },
  destroy: function() { throw "History.destroy() not defined"; },
  add_lines: function(lines) { throw "History.add_lines() not defined"; }
};

try {
  module.exports = {
    History: History
  }
} catch(err) {}
