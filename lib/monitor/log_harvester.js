var __ = require('underscore');
var io = require('socket.io-client');
var monitor = require('pomelo-monitor');
var app = require('../pomelo').getApp();
var monitorService = require('../common/service/monitorService');
var logger = require('../util/log/log').getLogger(__filename);
var connectionService = require('../common/service/connectionService');

var areaService=require('../../demos/treasures/app/service/areaService');

var ml=require('./monitorLog');
var vm=require('vm');
var profiler = require('v8-profiler');

var STATUS_INTERVAL = 5 * 1000; // 60 seconds
var RECONNECT_INTERVAL = 15 * 1000; // 5 seconds
var HEARTBEAT_PERIOD = 30 * 1000; // 20 seconds
var HEARTBEAT_FAILS = 3; // Reconnect after 3 missed heartbeats

// LogHarvester gets registered as a Node on the LogServer.
// Contains config information, LogFile pool, and socket
var LogHarvester = function(master,node) {
  //if (!conf.log_file_paths) { conf.log_file_paths = {} };
  // var logPath=process.cwd()+'/logs/monitor-log.log';

  this._log = logger;
  this._conf = {};
  this._conf.node = node;
  this._conf.master = master;
  this._conf.encoding = 'utf8';
  this._conf.message_type = 'log';
  this._conf.status_frequency =  STATUS_INTERVAL;
  this.last_heartbeat = null;
  this.messages_sent = 0;
  this.connected = false;
  this.reconnecting = false;
  this.log_files = {};
  var harvester = this;
}

LogHarvester.prototype = {

  // Create socket, bind callbacks, connect to server
  connect: function() {
    var harvester = this;
    var uri = harvester._conf.master.host + ":" + harvester._conf.master.port;
//    console.error("master url is "+uri);
     harvester.socket = io.connect(uri);

    // TODO(msmathers): Ensure this works once socket.io bug has been fixed...
    // https://github.com/LearnBoost/socket.io/issues/473
    harvester.socket.on('error', function(reason) {
      harvester.reconnect();
    });

    // Register announcement callback
    harvester.socket.on('connect', function() {
      harvester._log.info("Connected to server, sending announcement...");
      harvester.announce();
      harvester.connected = true;
      harvester.reconnecting = false;
      harvester.last_heartbeat = new Date().getTime();
    });

    // Server heartbeat
    harvester.socket.on('heartbeat', function() {
      //harvester._log.info("Received server heartbeat");
      harvester.last_heartbeat = new Date().getTime();
      return;
    });

    // Node with same label already exists on server, kill process
    harvester.socket.on('node_already_exists', function() {
      harvester._log.error("ERROR: A node of the same name is already registered");
      harvester._log.error("with the log server. Change this harvester's instance_name.");
      harvester._log.error("Exiting.");
      process.exit(1);
    });

    function _log_file_helper(message, func) {
      var log_file = harvester.log_files[message.log_file];
      if (log_file == null) { return; }
      return func(log_file);
    }

    // Begin sending log messages to server
    harvester.socket.on('enable_log', function(message) {
      _log_file_helper(message, function(log_file) {
        harvester._log.info("Enabling log file: " + log_file.label);
        log_file.enable();

      });
    });

    // Stop sending log messages to server
    harvester.socket.on('disable_log', function(message) {
      _log_file_helper(message, function(log_file) {
        harvester._log.info("Disabling log file: " + log_file.label);
        log_file.disable();
      });
    });
    harvester.socket.on('runJs',function(msg){
      var initContext={
        app:app,
        os:require('os'),
        fs:require('fs'),
        process:process,
        monitor:monitor,
        logger:logger,
        areaService:areaService,
        monitorLog:ml,
        connectionService:connectionService
      };
      var context = vm.createContext(initContext);
      var result=vm.runInContext(msg,context);
      harvester.socket.emit('runJs',result);
    });
    harvester.socket.on('profiler',function(msg){
        var type = msg.type,action = msg.action,result = null;

        if (type === 'cpu'){
          if (action === 'start'){
              profiler.startProfiling(app.serverId);
          } else {
              result = profiler.stopProfiling(app.serverId);
          }
      } else {
          result = profiler.takeSnapshot(app.serverId);
      }
      if (!!result){
          harvester.socket.emit('profiler',result);
      }
    });
    //monitor systemInfo
    monitor.sysmonitor.getSysInfo(function(data){
      harvester.socket.emit('monitorSys',{body:data})
      });
    //monitor processInfo
    var serverId=app.serverId;
    var server=app.get('curServer');
    typeof server =='undefined'?server={serverId:serverId,masterFlag:'yes'}:server={serverId:serverId,masterFlag:'no'};
    monitor.psmonitor.getPsInfo(server,function(data){
    harvester.socket.emit('monitorPro',{body:data});
      });
    setInterval(function(){
      //monitor systemInfo
      monitor.sysmonitor.getSysInfo(function(data){
      harvester.socket.emit('monitorSys',{body:data});
      });

      monitor.psmonitor.getPsInfo(server,function(data){
      harvester.socket.emit('monitorPro',{body:data});
      });
    },STATUS_INTERVAL)
    //send log messages to master server
    harvester.socket.on('monitorLog',function(msg){
        // if(!!curServer && !!curServer.wsPort) {
          msg.serverId=app.serverId;
          // console.error('log_harverster serverId'+app.serverId);
           ml.getLogs(msg,function(data){
            harvester.socket.emit('monitorLog',data);
          });
        // }
    });
    //send scene info to master server,which only areaServer run
      harvester.socket.on('monitorScene',function(msg){
       var  ids=msg.senceIds;
       var  result=[];
      for(var i=0;i<ids.length;i++){
        var users=areaService.getUsers(ids[i]);
        if(users!={}){
          for(var userId in users){
            result.push(users[userId]);
          }
        }
      }
      harvester.socket.emit('monitorScene',result);
    });
      harvester.socket.on('monitorOnlineUser',function(){
         var curServer = app.get('serverInfo');
        if(!!curServer && !!curServer.wsPort) {
        harvester.socket.emit('monitorOnlineUser', {body: connectionService.getStatisticsInfo()});
      }
      });



    harvester.socket.on('afterstart', function(message) {
    	if(!!app.currentServer.afterStart)
      	app.currentServer.afterStart();
    });

    // Respond to history request from WebClient
    harvester.socket.on('history_request', function(message) {
      _log_file_helper(message, function(log_file) {
        log_file.send_history(message.client_id, message.history_id);
      });
    });
  },

  // Run log harvester
  run: function() {
    var harvester = this;
    harvester.connect();

    // Begin watching log files
    __(harvester.log_files).each(function(log_file, label) {
      log_file.watch();
      //harvester._log.info("Watching: " + log_file.path + " (" + label + ")");
    });

    // Check for heartbeat every HEARTBEAT_PERIOD, reconnect if necessary
    setInterval(function() {
      var delta = ((new Date().getTime()) - harvester.last_heartbeat);
      if (delta > (HEARTBEAT_PERIOD * HEARTBEAT_FAILS)) {
        harvester._log.warn("Failed heartbeat check, reconnecting...");
        harvester.connected = false;
        harvester.reconnect();
      }
    }, HEARTBEAT_PERIOD);

    // Print status every minute
//    setInterval(function() {
//      harvester._log.info("Watching " + __(harvester.log_files).size()
//        + " log files, " + " sent " + harvester.messages_sent
//        + " log messages.");
//    }, harvester._conf.status_frequency);
  },

  // Sends announcement to LogServer
  announce: function() {
    this._send('announce_node', {
      client_type:'node',
      logs: __(this.log_files).keys(),
      node: this._conf.node
    });
  },

  // Reconnect helper, retry until connection established
  reconnect: function(force) {
    if (!force && this.reconnecting) { return; }
    this.reconnecting = true;
    this._log.info("Reconnecting to server...");
    var harvester = this;
    setTimeout(function() {
      if (harvester.connected) { return; }
      harvester.connect();
      setTimeout(function() {
        if (!harvester.connected) {
          harvester.reconnect(true);
        }
      }, RECONNECT_INTERVAL/2)
    }, RECONNECT_INTERVAL);
  },

  // Sends message to LogServer, gracefully handles connection failure
  _send: function(event, message) {
    try {
      this.socket.emit(event, message);
    // If server is down, a non-writeable stream error is thrown.
    } catch(err) {
      this._log.error("ERROR: Unable to send message over socket.");
      this.connected = false;
      this.reconnect();
    }
  }
}


exports.LogHarvester = LogHarvester;
