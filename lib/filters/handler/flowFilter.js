var flowFilterLog = require('pomelo-logger').getLogger('flowFilter', __filename);

module.exports = function () {
  return new Filter();
};

var Filter = function () {
  this.requestQueue = []
  this.runApiList = []
};

var msgTotalInCount = 0  //进入flowFilter的请求总执行数
var msgTotalOutCount = 0 //完成flowFilter的请求总执行数
var flowHighLimit = 100  //Api最大可以同时执行handler数量
var flowLowLimit = 30    //Api最小可以同时执行handler数量
var handlerWarnTimeOut = 5 * 1000 //handler执行超时警告（单位：毫秒）
var handlerErrorTimeOut = 30 * 1000 //handler执行超时错误（单位：毫秒）

var structRunApiItem = function (msg, session) {
  return {
    runApiId: msg.runApiId,
    sid: session.id,
    uid: session.uid,
    inTime: msg.runApiInTime,
    route: msg.__route__,
    frontendId: session.frontendId
  }
}

var popApiPrintWarn = function (popApiItem, timeout) { flowFilterLog.warn(
  " [uid:%s][sid:%s][frontendId:%s][route:%s][timeOut:%sms]",
  popApiItem.uid, popApiItem.sid, popApiItem.frontendId, popApiItem.route, timeout) }
var popApiPrintError = function (popApiItem, timeout) { flowFilterLog.error(
  " [uid:%s][sid:%s][frontendId:%s][route:%s][timeOut:%sms]",
  popApiItem.uid, popApiItem.sid, popApiItem.frontendId, popApiItem.route, timeout) }
var popApiPrintInfo = function (popApiItem, timeout) { flowFilterLog.info(
  " [uid:%s][sid:%s][frontendId:%s][route:%s][timeOut:%sms]",
  popApiItem.uid, popApiItem.sid, popApiItem.frontendId, popApiItem.route, timeout) }

var popApiPrint = function (popApiItem) {
  if (popApiItem) {
    var timeout = Date.now() - popApiItem.inTime
    if (timeout >= handlerWarnTimeOut && timeout < handlerErrorTimeOut) {
      popApiPrintWarn(popApiItem, timeout)
    } else if (timeout >= handlerErrorTimeOut) {
      popApiPrintError(popApiItem, timeout)
    } else {
      popApiPrintInfo(popApiItem, timeout)
    }
  }
}

Filter.prototype.runApiListCheck = function () {
  var now = Date.now()
  for (var i = 0; i < this.runApiList.length; i++) {
    var item = this.runApiList[i]
    var timeOut = now - item.inTime
    if (timeOut >= handlerErrorTimeOut) {
      var popItem = this.runApiList.splice(i, 1)[0]
      popApiPrintError(popItem, timeOut)
      i--
    }
  }
}

Filter.prototype.runApiListPush = function (msg, session) {
  msg.runApiInTime = Date.now()
  msg.runApiId = session.id.toString() + msg.runApiInTime.toString()
  this.runApiList.push(structRunApiItem(msg, session))
  flowFilterLog.info(" [runApiListPush = %s]", this.runApiList.length);
}

Filter.prototype.runApiListPop = function (msg, session) {
  var runApiId = msg.runApiId
  var popApiItem = null
  for (var i in this.runApiList) {
    if (this.runApiList[i].runApiId == runApiId) {
      popApiItem = this.runApiList.splice(i, 1)[0]
      break
    }
  }
  flowFilterLog.info(" [runApiListPop = %s]", this.runApiList.length);
  return popApiItem
}

Filter.prototype.handlerQueue = function () {
  var handlerQueueCount = flowLowLimit - this.runApiList.length
  flowFilterLog.info(" [handlerQueue] flowLowLimit : %s, runApiCount : %s, queueCount : %s",
    flowLowLimit, this.runApiList.length, this.requestQueue.length);
  for (var i = 0; i < handlerQueueCount && i < this.requestQueue.length; i++) {
    var handlerNextItem = this.requestQueue.shift();
    this.runApiListPush(handlerNextItem.msg, handlerNextItem.session);
    flowFilterLog.info(" [run(pop)][requestQueue = %s][runApiList = %s]",
      this.requestQueue.length, this.runApiList.length);
    process.nextTick(function () {
      handlerNextItem.next();
    })
  }
}
Filter.prototype.requestQueuePush = function (queueItem) {
  this.requestQueue.push(queueItem)
  flowFilterLog.info(" [requestQueue]push : %s", this.requestQueue.length);
}

Filter.prototype.before = function (msg, session, next) {
  flowFilterLog.info(" msgTotalInCount=%s", msgTotalInCount++);
  flowFilterLog.info(" [before][route:%s][session_id=%s][uid=%s]", msg.__route__, session.id, session.uid);
  this.runApiListCheck();

  var session = session || "";
  var uid = session.uid || "";

  if (session == "") {
    next(new Error('flowFilterLog session invalid'));
    return;
  }

  if (uid == "") {
    next(new Error('flowFilterLog session.uid invalid'));
    return;
  }

  if (this.requestQueue.length > 0) {
    //push to queue
    this.requestQueuePush({ msg: msg, session: session, next: next })
  }
  else {
    if (this.runApiList.length < flowHighLimit) {
      //push to api
      this.runApiListPush(msg, session)
      flowFilterLog.info(" [run(direct)][requestQueue = %s][runApiList = %s]",
        this.requestQueue.length, this.runApiList.length);
      next()
      return
    } else {
      //push to queue
      this.requestQueuePush({ msg: msg, session: session, next: next })
    }
  }

  if (this.runApiList.length < flowLowLimit) {
    this.handlerQueue()
  }
}
Filter.prototype.after = function (err, msg, session, resp, next) {
  flowFilterLog.info(" msgTotalOutCount=%s", msgTotalOutCount++);
  flowFilterLog.info(" [after][route:%s][session_id=%s][uid=%s]", msg.__route__, session.id, session.uid);
  popApiPrint(this.runApiListPop(msg, session))
  if (this.runApiList.length < flowLowLimit) {
    this.handlerQueue()
  }
  next(err, msg);
}

