var SchedulerService = function(app, opts) {
  opts = opts || {};
  this.app = app;
  this.sessions = {};   // sid -> msg queue

};

module.exports = SchedulerService;

SchedulerService.prototype.schedule = function(route, msg, recvs, opts) {
  opts = opts || {};
  if(opts.isBroadcast) {
    doBroadcast(this.app, msg, opts);
  } else {
    doBatchPush(this.app, msg, recvs);
  }
};

var doBroadcast = function(app, msg, opts) {
  var channelService = this.app.get('channelService');
  var sessionService = this.app.get('sessionService');

  if(opts.binded) {
    sessionService.forEachBindedSession(function(session) {
      if(channelService.broadcastFilter &&
         !channelService.broadcastFilter(session, msg, opts.filterParam)) {
        return;
      }

      sessionService.sendMessageByUid(session.uid, msg);
    });
  } else {
    sessionService.forEachSession(function(session) {
      if(channelService.broadcastFilter &&
         !channelService.broadcastFilter(session, msg, opts.filterParam)) {
        return;
      }

      sessionService.sendMessage(session.id, msg);
    });
  }
};

var doBatchPush = function(app, msg, recvs) {
  var sessionService = this.app.get('sessionService');
  for(var i=0, l=recvs.length; i<l; i++) {
    sessionService.sendMessageByUid(recvs[i], msg);
  }
};