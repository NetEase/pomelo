/* LogNode model definitions for Log.io web client
 */

try {
  var _ = require('underscore');
} catch(err) {}

// LogNode is a file on a Node's filesystem.
// Users can enable/disable streams, and view histories
var LogNode = function(node, label) {
  this._dom;
  this.node = node;
  this.label = label;
  this.streams = {};
  this.histories = {};
  this._enabled = false;
}

LogNode.prototype = {
  log: function(msg) {
    var log = this;
    //alert('log node');
    _(this.streams).each(function(stream, sid) {
//      debugger;
      stream.log(log, msg);
    });
  },
  attach_stream: function(stream) {
	//alert('LogNode attache');
    if (!this._enabled) {
      this.color = this.node.web_client.colors.next();
    }
    stream.add_log_file(this);
    this.streams[stream._id] = stream;
    if (!this._enabled) {
      this._enabled = true;

      // Tell server to watch log file
      this.node.web_client.socket.emit('enable_log', {
        node: this.node.label,
        log_file: this.label
      });
    }
  },
  detach_stream: function(stream) {
    stream.remove_log_file(this);
    delete this.streams[stream._id];
    if (!this.is_enabled() && this.color) {
      this.node.web_client.colors.release(this.color);
      this.color = null;
    }
    this._enabled = this.is_enabled();
    if (!this._enabled) {

      // Tell server we don't care about log file anymore
      this.node.web_client.socket.emit('disable_log', {
        node: this.node.label,
        log_file: this.label
      });
    }
  },
  enable_history: function(history) {
    if (history.log_file) {
      history.log_file.disable_history(history._id);
    }
    history.add_log_file(this);
    this.histories[history._id] = history;
  },
  disable_history: function(history) {
    delete this.histories[history._id];
  },
  view_history: function(history) {
    history.get_history(this);
    this.enable_history(history);
  },
  is_enabled: function() {
    return _(this.streams).size() > 0;
  },
  render: function() { throw "LogNode.render() not defined." },
  ping: function() { throw "LogNode.ping() not defined." }
};

try {
  module.exports = {
    LogNode: LogNode
  }
} catch(err) {}
