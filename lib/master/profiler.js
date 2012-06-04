var fs = require('fs');
var HeapProfileType = 'HEAP';
var CPUProfileType = 'CPU';

function ProfilerAgent() {
	this.profiles = {
		HEAP : {},
		CPU : {}
	};

	this.isProfilingCPU = false;
}

(function() {
	this.enable = function(id,params) {
		
		this.sendResult(id,{
			result : true
		});
	};

	this.causesRecompilation = function(id,params) {
		this.sendResult(id,{
			result : false
		});
	};

	this.isSampling = function(id,params) {
		var self = this;
		self.sendResult(id,{
			result : true
		});
	};

	this.hasHeapProfiler = function(id,params) {
		var self = this;
		self.sendResult(id,{
			result : true
		});
	};

	this.getProfileHeaders = function(id,params) {
		var headers = [];
    var self = this;
		for ( var type in this.profiles) {
			for ( var profileId in this.profiles[type]) {
				var profile = this.profiles[type][profileId];
				headers.push({
					title : profile.title,
					uid : profile.uid,
					typeId : type
				});
			}
		}
   console.error("header %j",headers)
		self.sendResult(id,{
			headers : headers
		});
	};

	this.takeHeapSnapshot = function(id,params) {
		var uid = params.uid;
		var server = require('./server').serverAgent;
		var node = server.nodes[uid];
		var self = this;
		if (!node) {return;}
		node.socket.emit('profiler', { type : 'heap', action : 'start', uid : uid });
		self.sendEvent({ method : 'Profiler.addProfileHeader', params : { header : { title : uid, uid : uid, typeId : HeapProfileType } } });
		self.sendResult(id,{});
	};
	
	this.takeSnapCallBack = function (data) {
		var self = this;
  var uid = data.params.uid || 0;
			var snapShot = self.profiles[HeapProfileType][uid];
			if (!snapShot || snapShot.finish) {
				snapShot = {};
				snapShot.data = [];
				snapShot.finish = false;
				snapShot.uid = uid;
				snapShot.title = uid;
			}
			if (data.method === 'Profiler.addHeapSnapshotChunk') {
				var chunk = data.params.chunk;
				snapShot.data.push(chunk);
			} else {
				snapShot.finish = true;
			}
			self.profiles[HeapProfileType][uid] = snapShot;
	};

	this.getProfile = function(id,params) {
		var uid = params.uid;
		var profile = this.profiles[params.type][params.uid];
		var self = this;
		if (!profile || !profile.finish) {
			var timerId = setInterval(function() {
				profile = self.profiles[params.type][params.uid];
				if (!!profile) {
					clearInterval(timerId);
					self.asyncGet(id,params, profile);
				} else {
					console.error('please wait ..............');
				}
			}, 5000);
		} else {
			self.asyncGet(id,params, profile);
		}

	};

	this.asyncGet = function(id,params, snapshot) {
		var uid = params.uid;
		var self = this;
		if (params.type == HeapProfileType) {
			for ( var index in snapshot.data) {
				var chunk = snapshot.data[index];
				self.sendEvent({ method : 'Profiler.addHeapSnapshotChunk', params : { uid : uid, chunk : chunk } });
			}
			self.sendEvent({ method : 'Profiler.finishHeapSnapshot', params : { uid : uid } });
			self.sendResult(id,{ profile : { title : snapshot.title, uid : uid, typeId : HeapProfileType } });
		} else if (params.type == CPUProfileType) {
			self.sendResult(id,{
				profile : {
					title : snapshot.title,
					uid : uid,
					typeId : CPUProfileType,
					head : snapshot.data.head,
					bottomUpHead : snapshot.data.bottomUpHead
				}
			});
		}
	};

	this.clearProfiles = function(id,params) {
		this.profiles.HEAP = {};
		this.profiles.CPU = {};
		//profiler.deleteAllSnapshots();
		//profiler.deleteAllProfiles();
	};

	this.setSocket = function(socket){
		this.socket = socket;
	};
	
	this.sendResult = function(id,res){
		if (!!this.socket)
	  this.socket.send(JSON.stringify({ id : id, result : res }));
	};
	
	
this.sendEvent = function(res){
		if (!!this.socket)
			this.socket.send(JSON.stringify(res));
	};
	
	this.start = function(id,params) {
		var uid = params.uid;
		var server = require('./server').serverAgent;
		var node = server.nodes[uid];
		var self = this;
		if (!!node) {
			node.socket.emit('profiler', { type : 'CPU', action : 'start', uid : uid });
			self.sendEvent({ method : 'Profiler.setRecordingProfile', params : { isProfiling : true } });
		}
		self.sendResult(id,{});
	};

	this.stop = function(id,params) {
		var uid = params.uid;
		var server = require('./server').serverAgent;
		var node = server.nodes[uid];
		var self = this;
		if (!node) {return;}
		node.socket.emit('profiler', { type : 'CPU', action : 'stop', uid : uid });
	};
	
	this.stopCallBack = function(res) {
		var self = this;
		 var uid = res.msg.uid;
				var profiler = self.profiles[CPUProfileType][uid];
				if (!profiler || profiler.finish){
					profiler = {};
					profiler.data = null;
					profiler.finish = true;
					profiler.typeId = CPUProfileType;
					profiler.uid = uid;
					profiler.title = uid;
				}
				profiler.data = res;
				self.profiles[CPUProfileType][uid] = profiler;
				self.sendEvent({ method : 'Profiler.addProfileHeader', params : { header : { title : profiler.title, uid : uid, typeId : CPUProfileType } } }); 
};

}).call(ProfilerAgent.prototype);

var instance = new ProfilerAgent();

module.exports = instance;
