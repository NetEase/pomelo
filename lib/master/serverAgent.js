/* Master Server
 * Listens for socket.io connections from Nodes and WebClients
 */

var io = require('socket.io');
var __ = require('underscore');
var _node = require('./node.js');
var _wc = require('./web_client.js');
var app = require('../pomelo').getApp();
var logger = require('../util/log/log').getLogger(__filename);
var sysLogger = require('../util/log/log').getLogger('systemInfo-log');
var proLogger = require('../util/log/log').getLogger('processInfo-log');

var monitorService = require('../common/service/monitorService');

var monitor = require('pomelo-monitor');
var ms=require('../monitor/monitorScript');
var serverUtil = require('./serverUtil');

var STATUS_INTERVAL = 5 * 1000; // 60 seconds
var HEARTBEAT_INTERVAL = 30 * 1000; // 20 seconds

var clients = {};
var clientStatus = {};
var STARTED = 0; // started
var CONNECTED = 1; // started

var conLogs=[];// cache the connnector logs
var rpcLogs=[];// cache the rpc logs
var forLogs=[];// cache the forward logs
// var onlineUsers=[];//cache the onlineUsers
var onlineUserList=[];// cache the onlineUsers
var totalConnCount=0;
var loginedCount=0;

var sceneInfos=[];

var profiler = require('./profiler');

// ServerAgent runs a regular HTTP server
// Announce messages add each client to the appropriate pools
var ServerAgent = function() {
    this._log = logger;
    this.nodes = {};
    this.web_clients = {};
    this.message_count = 0;
    this.connStatus = {};
    this.serverAddressMap = {};
    var self = this;

    // Print status every minute
    setInterval(function() {
        self._log.info("Nodes: " + __(self.nodes).size() + ", " +
                             "WebClients: " + __(self.web_clients).size() + ", " +
                             "Messages Sent: " + self.message_count);
    }, STATUS_INTERVAL);

    setInterval(function(){
        var nodes=self.nodes;
        for(var nodeId in nodes){
            var node=nodes[nodeId];
            sysLogger.info(JSON.stringify(node.info.systemInfo));
            proLogger.info(JSON.stringify(node.info.processInfo));
        }
    },5*60*1000);

}


ServerAgent.prototype = {
    listen: function(port) {
        this.io = io.listen(port);
        this.register();
        var self = this;
        setInterval(function() {
            self.io.sockets.in('nodes').emit('clientmessage', {method: 'getConnectionInfo'});
        }, 5000);
    },

    // Registers new Node with ServerAgent, announces to WebClients
    announce_node: function(socket, message) {
        var self = this;
        var nodeId = message.node.id;
        var nodeType = message.node.type;
        var nodeHost = message.node.host;
        var nodePort = message.node.port;
        var logs = message.logs;
        // console.log(' announce_node %j ',message.node);
        // If this node already exists, ignore announcemen
        if (!!self.nodes[nodeId]) {
            this._log.warn("Warning: Node '" + nodeId + "' already exists, ignoring");
            // socket.emit('node_already_exists');
            // return;
        }

        self.serverAddressMap[nodeId] = nodeHost + ':' + nodePort;

        var node = new _node.Node(nodeType,nodeId,logs, socket, this);
        self.nodes[nodeId] = node;
        // Tell all WebClients about new Node
        __(self.web_clients).each(function(web_client) {
            web_client.add_node(node);
        });

        socket.on('disconnect', function() {
            delete self.serverAddressMap[nodeId];
            delete self.connStatus[nodeId];
            delete self.nodes[nodeId];
        });
        // socket.on()

        socket.on('monitorSys',function(msg){
            var nodeSize=__(self.nodes).size();
            var body=msg.body;
            var wholeMsg={
                system:body.hostname+','+body.type+','+body.arch+''+body.release+','+body.uptime,
                cpu:JSON.stringify(body.cpus[0])+';'+JSON.stringify(body.cpus[1]),
                start_time:body.iostat.date
            };
            var oneData={Time:body.iostat.date,hostname:body.hostname,serverId:nodeId,cpu_user:body.iostat.cpu.cpu_user,
                         cpu_nice:body.iostat.cpu.cpu_nice,cpu_system:body.iostat.cpu.cpu_system,cpu_iowait:body.iostat.cpu.cpu_iowait,
                         cpu_steal:body.iostat.cpu.cpu_steal,cpu_idle:body.iostat.cpu.cpu_idle,tps:body.iostat.disk.tps,
                         kb_read:body.iostat.disk.kb_read,kb_wrtn:body.iostat.disk.kb_wrtn,kb_read_per:body.iostat.disk.kb_read_per,
                         kb_wrtn_per:body.iostat.disk.kb_wrtn_per,totalmem:body.totalmem,freemem:body.freemem,'free/total':(body.freemem/body.totalmem),
                         m_1:body.loadavg[0],m_5:body.loadavg[1],m_15:body.loadavg[2]};
            node.info.systemInfo=oneData;
            // self.io.sockets.in('web_clients').emit('systemInfo',{serverId:nodeId,data:oneData,serverSize:
				    // nodeSize});
        });
        socket.on('monitorPro',function(msg){
            // var nodeSize=__(self.nodes).size();
            node.info.processInfo=msg.body;
            // self.io.sockets.in('web_clients').emit('processInfo',{serverSize:nodeSize,nodeItems:msg.body});
        });

        // monitorLog contains connector and rpc logs
        socket.on('monitorLog',function(msg){
            var datas=msg.dataArray;
            var logfile=msg.logfile;
            if(logfile==='con-log'){
                for(var i=0;i<datas.length;i++){
                    conLogs.push(datas[i]);
                }
                var countData=serverUtil.getCountData(conLogs);
                self.io.sockets.in('web_clients').emit(msg.logfile, {data:conLogs,countData:countData});
            }
            if(logfile==='for-log'){
                for(var i=0;i<datas.length;i++){
                    forLogs.push(datas[i]);
                }
                var countData=serverUtil.getCountData(forLogs);
                self.io.sockets.in('web_clients').emit(msg.logfile, {data:forLogs,countData:countData});
            }
            if(logfile==='rpc-log'){
                for(var i=0;i<datas.length;i++){
                    rpcLogs.push(datas[i]);
                }
                var countData=serverUtil.getCountData(rpcLogs);
                self.io.sockets.in('web_clients').emit(msg.logfile, {data:rpcLogs,countData:countData});
            }
            // self.io.sockets.in('web_clients').emit(msg.logfile, msg);
        });
        // sceneInfo
        socket.on('monitorScene',function(msg){
            var length=0;
            if(msg){length=msg.length;}
            if(length>0){
                for(var i=0;i<length;i++){
                    msg[i].position='('+msg[i].x+','+msg[i].y+')';
                    msg[i].serverId=nodeId;
                    sceneInfos.push(msg[i])
                }
                self.io.sockets.in('web_clients').emit('getSenceInfo',{data:sceneInfos});
            }
        });

        socket.on('monitorOnlineUser',function(msg){
            // console.error('monitorOnlineUser msg :'+JSON.stringify(msg));
            var body=msg.body;
            totalConnCount+=body.totalConnCount;
            loginedCount+=body.loginedCount;
            var onlineUsers=body.loginedList;
            for(var i=0;i<onlineUsers.length;i++){

                onlineUsers[i].serverId=body.serverId;
                onlineUserList.push(onlineUsers[i]);
            }
            self.io.sockets.in('web_clients').emit('getOnlineUser',{totalConnCount:totalConnCount,loginedCount:loginedCount,onlineUserList:onlineUserList});
        });

        socket.on('runJs',function(result){
            self.io.sockets.in('web_clients').emit('runScript',result);
        });
        
        socket.on('cpuprofiler',function(data){
  	 			  profiler.stopCallBack(data);
    	  });
        socket.on('heapprofiler',function(data){
				    profiler.takeSnapCallBack(data);
			  });

        self.checkReady();
    },
    // Registers new WebClient with ServerAgent
    announce_web_client: function(socket) {
        var self = this;
        var web_client = new _wc.WebClient(socket, self);
        self.web_clients[web_client.id] = web_client;

        // Tell new WebClient about all nodes
        __(self.nodes).each(function(node, nlabel) {
            web_client.add_node(node);
        });

        socket.on('disconnect', function() {
            delete self.web_clients[web_client.id];
        });

    },
    reFreshData:function(){
        var self=this;
        systemInfo=[];
        processInfo=[];
        var nodes=self.nodes;
        for(var nodeId in nodes){
            var node = nodes[nodeId];
            systemInfo.push(node.info.systemInfo);
            processInfo.push(node.info.processInfo);
        }
    },

    // Register announcement, disconnect callbacks
    register: function() {
        var self = this;
        self.io.set('log level', 1); // TODO(msmathers): Make configurable
        self.io.sockets.on('connection', function(socket) {
            socket.on('announce_node', function(message) {
                self._log.info("Registering new node" + JSON.stringify(message));
                self.announce_node(socket, message);
            });
            socket.on('announce_web_client', function(message) {
                self._log.info(" Registering new web_client ");
                self.announce_web_client(socket);
    		        socket.on('webmessage', function(msg) {
                    // console.log('master server get webmessage: ' +
						        // JSON.stringify(msg));
    		            if(!msg || !msg.method) {return;}
    	  	          var serverId = msg.id;
    	  	          var sysInfo = '';
    			          if (!self.nodes[serverId]){
    	  		            sysInfo = 'can not connect to client ' + serverId;
    	  		            socket.emit('webmessage',{method:msg.method,data:sysInfo});
    	  		            console.error("self.nodes[serverId] is not exist");
    	  	          }	else {
    	  		            var node = self.nodes[serverId];
    	  		            setInterval(function(){
    	  		                node.socket.emit('clientmessage',msg);
    	  		            },1000);
    	  		            console.error("self.nodes["+serverId+"] is  exist"+msg);
    	  	          }
     			          return ;
    		        });	// on message end
                // on webMessage
                socket.on('webMessage',function(msg){
                    if(!msg || !msg.method) {
                        return;
                    }
                    if(msg.method==='getSystemInfo'){
                        self.reFreshData();
                        socket.emit(msg.method,{data:systemInfo});
                        setInterval(function(){
                            self.reFreshData();
                            socket.emit('getSystemInfo',{data:systemInfo});
                        },STATUS_INTERVAL);
                    }
                    if(msg.method==='getProcessInfo'){
                        self.reFreshData();
                        socket.emit(msg.method,{data:processInfo});
                        setInterval(function(){
                            self.reFreshData();
                            socket.emit('getProcessInfo',{data:processInfo});
                        },STATUS_INTERVAL);
                    }
                    if(msg.method==='getConLog'){
                        conLogs=[];
                        self.io.sockets.in('nodes').emit('monitorLog',msg);
                    }
                    if(msg.method==='getForLog'){
                        forLogs=[];
                        self.io.sockets.in('nodes').emit('monitorLog',msg);
                    }
                    if(msg.method==='getRpcLog'){
                        rpcLogs=[];
                        self.io.sockets.in('nodes').emit('monitorLog',msg);
                    }
                    if(msg.method==='getOnlineUser'){
                        onlineUserList=[];// cache the onlineUsers
                        totalConnCount=0;
                        loginedCount=0;
                        self.io.sockets.in('nodes').emit('monitorOnlineUser');
                        setInterval(function(){
                            onlineUserList=[];// cache the onlineUsers
                            totalConnCount=0;
                            loginedCount=0;
                            self.io.sockets.in('nodes').emit('monitorOnlineUser');
                        },STATUS_INTERVAL);
                    }
                    if(msg.method==='getSenceInfo'){
                        sceneInfos=[];
                        var areasmap=app.get('areasMap');
                        for(var areaId in areasmap){
                            var areaNode = self.nodes[areaId];
                            var ids=areasmap[areaId];
                            areaNode.socket.emit('monitorScene',{senceIds:ids});
                        }
                        setInterval(function(){
                            sceneInfos=[];
                            var areasmap=app.get('areasMap');
                            for(var areaId in areasmap){
                                var areaNode = self.nodes[areaId];
                                var ids=areasmap[areaId];
                                areaNode.socket.emit('monitorScene',{senceIds:ids});
                            }
                        },STATUS_INTERVAL);
                    }
                    if(msg.method==='getSer_Scr'){
                        var nodes=self.nodes;
                        var serverArray=[];
                        var scriptArray=[];
                        for(var nodeId in nodes){
                            serverArray.push({name:nodeId,serverId:nodeId});
                        }
                        ms.readDir(function(filenames){
                            for(var i=0;i<filenames.length;i++){
                                scriptArray.push({name:filenames[i],script:filenames[i]});
                            }
                            socket.emit('getSer_Scr',{serverArray:serverArray,scriptArray:scriptArray});
                        });
                    }
                    if(msg.method==='getFile'){
                        var fileBody=ms.readFile(msg.filename);
                        if(!fileBody){
                            logger.info('the filename content is null or error occur!');
                        }else{
                            socket.emit('getFile',fileBody+'');
                        }
                    }
                    if(msg.method==='saveFile'){
                        ms.writeFile(msg.filename,msg.data,function(success){
                            socket.emit('saveFile',success);
                        });
                    };
                    if(msg.method==='runScript'){
                        var nodeId=msg.serverId;
                        var script=msg.scriptJs;
                        var node=self.nodes[nodeId];
                        node.socket.emit('runJs',script);
                    }
                });
    		        socket.on('quit', function() {
                    app.quit();
     		            return ;
    		        });	// on message end
            });
        });

        // Broadcast stats to all clients
        setInterval(function() {
            self.io.sockets.in('web_clients').emit('stats', {
                message_count: self.message_count
            });
        }, 1000);
        // Broadcast heartbeat to all clients
        setInterval(function() {
            self.io.sockets.emit('heartbeat');
        }, HEARTBEAT_INTERVAL);
    },
    getNode:function(msg){
  	    msg.socket.emit(msg.method,app.servers);
        // msg.socket.emit('gkMessage',{nodeSize:10});
    },
    checkReady : function(){
	      logger.info('master server begin check all server was connected to server...');
		    var allStarted = true;
		    var self = this;
		    var servers = app.servers;
		    for (serverType in servers){
			      if (serverType==='master') continue;
			      var typeServers = servers[serverType];
		        for (var i=0; i < typeServers.length; i++){
		            var server = typeServers[i];
				        if(!self.nodes[server.id]){
					          allStarted = false;
					          logger.warn(' server not ready.waiting from ' + server.id + ' connect.......');
					      }
		        }
		    }
		    if (allStarted){
			      logger.info('begin notify to connect each other');
			      for (var id in self.nodes){
				        self.nodes[id].socket.emit('afterstart');
			      }
		    }
    },

    getStatus: function() {
        return this.connStatus;
    },

    getLowLoadServer: function() {
        var min = 100000000;  // some very large number
        var minSid = null;
        for(var sid in this.connStatus) {
            var record = this.connStatus[sid];
            if(record.count < min) {
                min = record.count;
                minSid = sid;
            }
        }

        var address = this.serverAddressMap[minSid];
        if(!address) {
            // if no address, try to get the first on in server address map
            for(var sid in this.serverAddressMap) {
                address = this.serverAddressMap[sid];
                break;
            }
        }

        return address;
    }

}

exports.ServerAgent = ServerAgent;
