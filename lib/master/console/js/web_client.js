/* Log.io WebClient application logic
 * Sends enable/disable stream & log history requests to LogServer
 * Listens for ping & log messages from enabled Nodes
 */

// In browser context, models & underscore already exist in global scope.
// For unit tests, they must be explicitly imported.
// TODO: Use browserify (https://github.com/substack/node-browserify)
if (typeof _node === 'undefined') {
  var _node = require('./node.js');
  var _stream = require('./stream.js');
  var _history = require('./history.js');
  var _cm = require('./color_manager.js');
  var _ = require('underscore');
}

// WebClient is instantiated by a browser.  It contains the socket connection,
// as well as Node, Stream, and Histories pools.
var WebClient = function(io) {
  this.nodes = {};
  this.ids = {};
  this.streams = {};
  this.histories = {};
  this.stats = {
    messages: 0,
    nodes: 0,
    log_nodes: 0,
    log_files: 0,
    start: new Date()
  };
  this.colors = new _cm.ColorManager();
  this.connected = false;
  var wc = this;

  // Create socket
  //alert(window.location.hostname);
//  this.socket = io.connect('http://app47v4.photo.163.org:3005');
  this.socket = io.connect('http://localhost:3005');

  // Register connect callback
  this.socket.on('connect', function() {
    wc.connected = true;
    wc.socket.emit('announce_web_client');
    //wc.socket.emit('message',{method:'getNode',body:[]});
  });
  var isInited = false;
  // Add a new Node to pool
  this.socket.on('getNode', function(servers) {
  	if (isInited) return ;
  	isInited = true;
    for (var serverType in servers){
   		var typeServers = servers[serverType];
   		var ids = [];
  		for (var i=0; i<typeServers.length; i++) {
        var curServer = typeServers[i];
        ids.push(curServer.id);
   		}
  		wc.add_node(serverType, ids);
  	}
  });
  
  this.socket.on('add_node', function(message) {
	var nodeId = message.nodeId;
	var nodeType = message.nodeType;
	var logs = message.logs;
  	//for (var id in message.logs) {
  		if (!wc.ids[nodeId]){
  			wc.add_node(nodeType,[nodeId],logs);
  			wc.ids[nodeId] = logs;
  		} else {
  			console.log('duplicated server add ' + nodeId);
  		}
  	//}
  	//console.log(JSON.stringify(wc.ids));
  });
  
  // Remove Node from pool
  this.socket.on('remove_node', function(message) {
    wc.remove_node(message.node);
  });
  
//  this.socket.on('webmessage', function(message) {
//  	alert('ok')
//  	console.log(JSON.stringify(message));
//    //wc.remove_node(message.node);
//  });
  

  // Render new log message to screen
  this.socket.on('log', function(message) {
    var log_file = wc.nodes[message.node.id].log_nodes[message.node.id];
     log_file.log(message.msg);
  });

  // LogFile ping
  this.socket.on('ping', function(message) {
	//alert(message.node.id)
	//console.log(wc.nodes[message.node.id].log_files);
    var log_file = wc.nodes[message.node.id].log_files[message.node.id];
    //log_file.ping();
    wc.stats.messages++;
  });

  // Render history response to screen
  this.socket.on('history_response', function(message) {
    var history = wc.histories[message.history_id];
    history.add_lines(message.lines);
  });

  // Update total message count stats
  this.socket.on('stats', function(message) {
    if (!wc.stats.message_offset) {
      wc.stats.message_offset = message.message_count;
    }
    wc.stats.messages = message.message_count - wc.stats.message_offset;
  });

}

WebClient.prototype = {

  // Add a new Node to pool
  add_node: function(nodeType,ids,logs) {
    var node = new _node.Node(nodeType,ids,logs, this);
    node.render();
    var nodeId = ids[0];
    this.nodes[nodeId] = node;
    this.stats.nodes++;
    this.stats.log_nodes += _(node.log_nodes).size();
  },

  // Remove Node from pool
  remove_node: function(nlabel) {
    var node = this.nodes[nlabel];
    node.destroy();
    this.stats.nodes--;
    this.stats.log_nodes -= _(node.log_nodes).size();
    delete this.nodes[node.label];
  },

  // Render all LogFiles & Stream/History screens
  // Useful for screen open/closing
  rerender: function() {
    _(this.nodes).each(function(node, nlabel) {
      _(node.log_nodes).each(function(log_file, llabel) {
        log_file.render();
      });
    });
    _([this.streams, this.histories]).each(function(screens, num) {
      _(screens).each(function(screen, slabel) {
        if (screen.num-1 > num) { screen.num -= 1; }
      });
    });
  },

  // Resize screens, defined in web_client.jquery.js
  resize: function() { throw Error("WebClient.resize() not defined"); },

  // Create & render new Stream screen
  add_stream: function() {
    var stream = new _stream.Stream(this);
    this.streams[stream._id] = stream;
    stream.render();
    this.rerender();
  },

  // Close & destroy Stream screen
  remove_stream: function(stream) {
    stream.destroy();
    delete this.streams[stream._id];
    this.rerender();
  },

  // Create & render new History screen
  add_history: function() {
    var history = new _history.History(this);
    this.histories[history._id] = history;
    history.render();
    this.rerender();
  },

  // Close & destroy History screen
  remove_history: function(history) {
    history.destroy();
    delete this.histories[history._id];
    this.rerender();
  }
}

// Export for nodeunit tests
try {
  exports.WebClient = WebClient;
} catch(err) {
	
}
