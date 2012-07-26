
__resources__["/__builtin__/pipe.js"] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {
var assert = require("debug").assert;

var _ptype = "__ptype";
var _key = "__key";
var _next = "__next";

var s_head = {};
var s_nothing = {
  toString: function () { return "nothing-happen"; }
};


function nothing()
{
  return s_nothing;
}

var make_event = function (content, now)
{
  assert(typeof(now) === "number");
  var o = {};
  o[_key] = {
    content: content,
    time: now
  };
  o[_next] = null;
  return o;
}

var make_head = function()
{
  var o = {};
  o[_key] = s_head;
  o[_next] = null;
  return o;
}

var create_empty_pipe = function ()
{
  var o = {};
  o[_ptype] = "pipe";

  var imp = {};
  o[_key] = imp;
  imp.current = make_head();
  return o;
}

function createEventTrigger(clocker)
{
  var o = create_empty_pipe();
  o[_ptype] = "trigger";
  var imp = o[_key];
  imp.clocker = clocker;
  return o;
}

function isPipe(p)
{
  return p[_ptype] != null
}

function isEventTrigger(p)
{
  return p[_ptype] === "trigger"
}

function triggerEvent(ep, content)
{
  assert(isEventTrigger(ep))
  var imp = ep[_key]
  var e = make_event(content, imp.clocker.now())
  imp.current[_next] = e
  imp.current = e

  return e[_key];
}

var pull = function (p)
{
  var f = p[_key].pull 
  if (null != f)
  {
    f(p)
  }

  return p;
}

function port(p)
{
  assert(isPipe(p));
  pull(p);
  var imp = {};
  this[_key] = imp;

  imp.pipe = p;
  imp.pointer = p[_key].current;
  
  this.query = function ()
  {
    var imp = this[_key];
    pull(imp.pipe);
    var res = imp.pointer[_next];
    if (null === res)
    {
      return null
    }
    else
    {
      imp.pointer = res;
      return res[_key]
    }
  }

  this.peek = function ()
  {
    var imp = this[_key];
    pull(imp.pipe);
    var res = imp.pointer[_next];
    if (null === res)
    {
      return null
    }
    else
    {
      return res[_key]
    }
  }

  return this
}

function createPort(p)
{
  return new port(p);
}

// transform({content:xxx, time:xxx}) -> new-content
function mapP(p, transform)
{
  assert(isPipe(p));
  var self = create_empty_pipe();
  self[_ptype] = "map";
  var imp = self[_key];
  imp.dep = p
  pull(p)
  imp.pointer = p[_key].current
  imp.pull = function (self)
  {
    var imp = self[_key];
    pull(imp.dep);
    var prev = imp.pointer;
    var srcevent = prev[_next];
    while(null != srcevent)
    {
      var newcontent = transform(srcevent[_key]);
      var newe = make_event(newcontent, srcevent[_key].time);
      imp.current[_next] = newe;
      imp.current = newe;
      prev = srcevent;
      srcevent = srcevent[_next];
    }
    imp.pointer = prev;
  }

  return self;
}

// filter({content:xxx, time:xxx}) -> boolean
function filterP(p, filter)
{
  assert(isPipe(p));
  var self = create_empty_pipe();
  self[_ptype] = "filter";
  var imp = self[_key];
  imp.dep = p
  pull(p)
  imp.pointer = p[_key].current
  imp.pull = function (self)
  {
    var imp = self[_key];
    pull(imp.dep);
    var prev = imp.pointer;
    var srcevent = prev[_next];
    while(null != srcevent)
    {
      if (filter(srcevent[_key]))
      {
        var newe = make_event(srcevent[_key].content, srcevent[_key].time);
        imp.current[_next] = newe;
        imp.current = newe;
      }
      prev = srcevent;
      srcevent = srcevent[_next];
    }
    imp.pointer = prev
  }

  return self;
}


// new-event.content = {left: content1, right: content2}
function orP(p1, p2)
{
  assert(isPipe(p1) && isPipe(p2));
  var self = create_empty_pipe();
  self[_ptype] = "or";
  var imp = self[_key]
  imp.dep1 = p1
  imp.dep2 = p2
  pull(p1);
  pull(p2);
  imp.pointer1 = p1[_key].current
  imp.pointer2 = p2[_key].current
  imp.pull = function (self)
  {
    var imp = self[_key];
    pull(imp.dep1);
    pull(imp.dep2);
    var prev1 = imp.pointer1;
    var e1 = prev1[_next];
    var prev2 = imp.pointer2;
    var e2 = prev2[_next];
    while(null != e1 && null != e2)
    {
      var t1 = e1[_key].time;
      var t2 = e2[_key].time;
      var newcontent, newe;
      var tt = -1;
      if (t1 < t2)
      {
        newcontent = {
          left: e1[_key].content,
          right: nothing()
        }
        tt = t1;
        prev1 = e1;
        e1 = e1[_next];
      }
      else if (t1 === t2)
      {
        newcontent = {
          left: e1[_key].content, 
          right: e2[_key].content
        };
        tt = t1;
        prev1 = e1;
        prev2 = e2;
        e1 = e1[_next];
        e2 = e2[_next];
      }
      else
      {
        newcontent = {
          left: nothing(),
          right: e2[_key].content
        };
        tt = t2;
        prev2 = e2;
        e2 = e2[_next];
      }

      newe = make_event(newcontent, tt);
      imp.current[_next] = newe;
      imp.current = newe;
    }

    var e,prev;
    var kk = "left", other_kk = "right";
    var pk = "pointer1";
    if (e1 === null)
    {
      e = e2;
      prev = prev2;
      kk = "right";
      other_kk = "left";
      imp.pointer1 = prev1;
      pk = "pointer2";
    }
    else
    {
      e = e1;
      prev = prev1;
      imp.pointer2 = prev2;
    }

    while(null != e)
    {
      newcontent = {}
      newcontent[kk] = e[_key].content;
      newcontent[other_kk] = nothing();
      newe = make_event(newcontent, e[_key].time);
      imp.current[_next] = newe;
      imp.current = newe;
      prev = e;
      e = e[_next];
    } 

    imp[pk] = prev;
  }

  return self;
}


// 
function andP(p1, p2,threshold)
{
  assert(isPipe(p1) && isPipe(p2));
  threshold = (typeof(threshold) === "number") ? threshold : 0;
  var self = create_empty_pipe();
  self[_ptype] = "and";
  var imp = self[_key];
  imp.dep1 = p1;
  imp.dep2 = p2;
  pull(p1);
  pull(p2);
  imp.pointer1 = p1[_key].current
  imp.pointer2 = p2[_key].current
  imp.pull = function (self)
  {
    var imp = self[_key];
    pull(imp.dep1);
    pull(imp.dep2);
    var prev1 = imp.pointer1;
    var e1 = prev1[_next];
    var prev2 = imp.pointer2;
    var e2 = prev2[_next];
    while(null != e1 && null != e2)
    {
      var t1 = e1[_key].time;
      var t2 = e2[_key].time;
      var newcontent, newe;
      var tt = -1;
      if (Math.abs(t1 - t2) <= threshold)
      {
	// consider they are at the same time

        newcontent = {
          left: e1[_key].content, 
          right: e2[_key].content
        };
        prev1 = e1;
        prev2 = e2;
        e1 = e1[_next];
        e2 = e2[_next];
        newe = make_event(newcontent, t1);
        imp.current[_next] = newe;
        imp.current = newe;
      }
      else if (t1 < t2)
      {
        prev1 = e1;
        e1 = e1[_next];
      }
      else
      {
        prev2 = e2;
        e2 = e2[_next];
      }
    }

    imp.pointer1 = prev1;
    imp.pointer2 = prev2;
  }

  return self;
}

// new-event.content = content1 or content2
function mergeP(p1, p2)
{
  assert(isPipe(p1) && isPipe(p2));
  var self = create_empty_pipe();
  self[_ptype] = "merge";
  var imp = self[_key];
  imp.dep1 = p1;
  imp.dep2 = p2;
  pull(p1);
  pull(p2);
  imp.pointer1 = p1[_key].current
  imp.pointer2 = p2[_key].current
  self[_key].pull = function (self)
  {
    var imp = self[_key];
    pull(imp.dep1);
    pull(imp.dep2);
    var prev1 = imp.pointer1;
    var e1 = prev1[_next];
    var prev2 = imp.pointer2;
    var e2 = prev2[_next];
    while(null != e1 && null != e2)
    {
      var t1 = e1[_key].time;
      var t2 = e2[_key].time;
      var newcontent, newe;
      var tt = -1;
      if (t1 <= t2)
      {
        newcontent = e1[_key].content;
        tt = t1;
        prev1 = e1;
        e1 = e1[_next];
      }
      else
      {
        newcontent = e2[_key].content;
        tt = t2;
        prev2 = e2;
        e2 = e2[_next];
      }

      newe = make_event(newcontent, tt);
      imp.current[_next] = newe;
      imp.current = newe;
    }

    var e,prev;
    var pk = "pointer1";
    if (e1 === null)
    {
      e = e2;
      prev = prev2;
      imp.pointer1 = prev1;
      pk = "pointer2";
    }
    else
    {
      e = e1;
      prev = prev1;
      imp.pointer2 = prev2;
    }

    while(null != e)
    {
      newe = make_event(e[_key].content, e[_key].time);
      imp.current[_next] = newe;
      imp.current = newe;
      prev = e;
      e = e[_next];
    } 

    imp[pk] = prev;
  }

  return self;
}

// high-order pipe
function createSwitcher()
{
  var self = create_empty_pipe();
  self[_ptype] = "switcher";
  var imp = self[_key];
  imp.source = create_empty_pipe();
  imp.pointer = imp.source[_key].current;

  imp.switchSource = function (self, p)
  {
    var imp = self[_key];
    if(imp.source === p)
    {
      return;
    }

    assert(isPipe(p));
    imp.source = p;
    pull(p);
    imp.pointer = p[_key].current;
  }

  imp.pull = function (self)
  {
    var imp = self[_key];
    pull(imp.source);
    var prev = imp.pointer;
    var srcevent = prev[_next];
    while(null != srcevent)
    {
      var newe = make_event(srcevent[_key].content, srcevent[_key].time);
      imp.current[_next] = newe;
      imp.current = newe;
      prev = srcevent;
      srcevent = srcevent[_next];
    }
    imp.pointer = prev;
  }

  return self;
}

function switchSource(switcher, p)
{
  assert(switcher[_ptype] === "switcher");
  return switcher[_key].switchSource(switcher, p);
}

exports.createEventTrigger = createEventTrigger;
exports.triggerEvent = triggerEvent;
exports.nothing = nothing;
exports.createPort = createPort;
exports.mapP = mapP;
exports.filterP = filterP;
exports.orP = orP;
exports.andP = andP;
exports.mergeP = mergeP;
exports.createSwitcher = createSwitcher;
exports.switchSource = switchSource;
}};