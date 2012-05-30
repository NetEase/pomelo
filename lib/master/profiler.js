var profiler = require('v8-profiler');
var fs = require('fs');
var server = require('./server').serverAgent;
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
	this.enable = function(params, sendResult) {
		sendResult({
			result : true
		});
	};

	this.causesRecompilation = function(params, sendResult) {
		sendResult({
			result : false
		});
	};

	this.isSampling = function(params, sendResult) {
		sendResult({
			result : true
		});
	};

	this.hasHeapProfiler = function(params, sendResult) {
		sendResult({
			result : true
		});
	};

	this.getProfileHeaders = function(params, sendResult) {
		var headers = [];

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

		sendResult({
			headers : headers
		});
	};

	this.takeHeapSnapshot = function(params, sendResult, sendEvent) {
		var uid = params.uid;
		var node = server.nodes[uid];
		var self = this;

		if (!!node) {
			node.socket.on('profiler', function(data) {
				var uid = data.params.uid || 0;
				var existshot = self.profiles[HeapProfileType][uid];
				if (!existshot || existshot.finish) {
					existshot = {};
					existshot.data = [];
					existshot.finish = false;
					existshot.uid = uid;
				}
				if (data.method === 'Profiler.addHeapSnapshotChunk') {
					var chunk = data.params.chunk;
					existshot.data.push(chunk);
				} else {
					existshot.finish = true;
				}
				self.profiles[HeapProfileType][uid] = existshot;
			});
			node.socket.emit('profiler', {
				type : 'heap',
				action : 'start',
				uid : uid
			});
			sendEvent({
				method : 'Profiler.addProfileHeader',
				params : {
					header : {
						title : uid,
						uid : uid,
						typeId : HeapProfileType
					}
				}
			});
		}
		return;
		// var snapshot = profiler.takeSnapshot();
		var snapshot = profiler.takeSnapshot(function(done, total) {
			sendEvent({
				method : 'Profiler.reportHeapSnapshotProgress',
				params : {
					done : done,
					total : total
				}
			});
		});

		this.profiles[HeapProfileType][uid] = snapshot;

		sendEvent({
			method : 'Profiler.addProfileHeader',
			params : {
				header : {
					title : uid,
					uid : uid,
					typeId : HeapProfileType
				}
			}
		});

		// sendResult({});
	};

	this.getProfile = function(params, sendResult, sendEvent) {
		var uid = params.uid;
		var profile = this.profiles[params.type][params.uid];
		var self = this;
		if (!profile || !profile.finish) {
			var timerId = setInterval(function() {
				profile = self.profiles[params.type][params.uid];
				if (!!profile) {
					clearInterval(timerId);
					self.asyncGet(params, profile, sendResult, sendEvent);
				} else {
					console.error('please wait ..............')
				}
			}, 5000);
		} else {
			self.asyncGet(params, profile, sendResult, sendEvent);
		}

	};

	this.asyncGet = function(params, snapshot, sendResult, sendEvent) {
		var uid = params.uid;
		if (params.type == HeapProfileType) {
			for ( var index in snapshot.data) {
				var chunk = snapshot.data[index];
				sendEvent({ method : 'Profiler.addHeapSnapshotChunk', params : { uid : uid, chunk : chunk } });
			}
			sendEvent({ method : 'Profiler.finishHeapSnapshot', params : { uid : uid } });
			sendResult({ profile : { title : uid, uid : uid, typeId : HeapProfileType } });
		} else if (params.type == CPUProfileType) {
			sendResult({
				profile : {
					title : uid,
					uid : uid,
					typeId : CPUProfileType,
					head : snapshot.data.head,
					bottomUpHead : snapshot.data.bottomUpHead
				}
			});
		}
	};

	this.clearProfiles = function(params, sendResult, sendEvent) {
		this.profiles.HEAP = {};
		this.profiles.CPU = {};
		profiler.deleteAllSnapshots();
		profiler.deleteAllProfiles();
	};

	this.start = function(params, sendResult, sendEvent) {
		var uid = params.uid;
		var node = server.nodes[uid];
		var self = this;
		if (!!node) {
			node.socket.emit('profiler', { type : 'CPU', action : 'start', uid : uid });
			sendEvent({ method : 'Profiler.setRecordingProfile', params : { isProfiling : true } });
		}
		sendResult({});
	};

	this.stop = function(params, sendResult, sendEvent) {
		var uid = params.uid;
		var node = server.nodes[uid];
		var self = this;
		if (!node) {return}
			node.socket.emit('profiler', { type : 'CPU', action : 'stop', uid : uid });
			node.socket.on('cpuprofiler', function(data) {
				var profiler = self.profiles[CPUProfileType][uid];
				if (!profiler || profiler.finish){
					profiler = {};
					profiler.data = null;
					profiler.finish = true;
					profiler.typeId = CPUProfileType;
					profiler.uid = uid;
				}
				profiler.data = data;
				self.profiles[CPUProfileType][uid] = profiler;
				sendEvent({ method : 'Profiler.addProfileHeader', params : { header : { title : uid, uid : uid, typeId : CPUProfileType } } }); });		
	}

}).call(ProfilerAgent.prototype);

module.exports = new ProfilerAgent();
