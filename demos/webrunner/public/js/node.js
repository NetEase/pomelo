/* Node model definitions for Log.io web client
 */

try {
  var _ = require('underscore');
  var _lf = require('./log_file.js');
} catch(err) {}

// Node is a machine/server/instance running a LogHarvester
// Contains label mapping to LogFile instances
var Node = function(label, logs, web_client) {
  this._dom;
  this.label = label;
  this.log_files = {};
  this.web_client = web_client;
  var node = this;

  // Create new LogFiles
  _(logs).each(function(llabel, num) {
    var log_file = new _lf.LogFile(node, llabel);
    node.log_files[llabel] = log_file;
  });
}

Node.prototype = {
  render: function() { throw "Node.render() not defined"; },
  destroy: function() { throw "Node.destroy() not defined"; }
};

try {
  module.exports = {
    Node: Node
  }
} catch(err) {}
