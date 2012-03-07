
__resources__["/__builtin__/director.js"] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {
var util = require("util")
  , debug = require("debug")
  , BObject = require("base").BObject
  , pipe = require('pipe')
  , globalClocker = require('clocker').globalClocker;

var TimeStamper = BObject.extend({
  init:function(param)
  {
    TimeStamper.superClass.init.call(this, param);
    
    param = param || {};
    
    if (param.startTime != undefined)
      this._startTime = param.startTime;
    else
      this._startTime = 0;  
    
    this._curTime = this._startTime;
    
    if (param.step != undefined)
      this._step = param.step;
    else
      this._step = 1;
  },
  
  stepForward:function(dt)
  {
    if (dt != undefined)
      this._curTime += dt;
    else
      this._curTime += this._step;
  },
  
  now:function()
  {
    return this._curTime;
  },
});
  
var timeStamp = new TimeStamper();

//event helper functions
function createMouseEvtHdl(d, type)
{
  return function()
  {
    var evt = {type:type};
    evt.mouseX = d._defaultView.sketchpad().mouseX;
    evt.mouseY = d._defaultView.sketchpad().mouseY;
    evt.pmouseX = d._defaultView.sketchpad().pmouseX;
    evt.pmouseY = d._defaultView.sketchpad().pmouseY;
    
    //donot permit event.id is copyable through util.copy in for..in.. expression
    //Object.defineProperty(evt, 'id', {value:d.eventIdGenerator++, writable:true, configurable:true, enumerable:false});
    //evt.id = d.eventIdGenerator ++;

    d.trigerEvent(evt);
   };
}

function createKeyEvtHdl(d, type)
{
  return function()
  {
    var evt = {type:type};
  
    evt.key = d._defaultView.sketchpad().key;
    evt.keyCode = d._defaultView.sketchpad().keyCode;
    
    //donot permit event.id is copyable through util.copy in for..in.. expression
    //Object.defineProperty(evt, 'id', {value:d.eventIdGenerator++, writable:true, configurable:true, enumerable:false});
    //evt.id = d.eventIdGenerator ++;
        
    d.trigerEvent(evt);
  };
}

var Director = BObject.extend({
  eventIdGenerator:0,
  
  init:function(param)
  {
    if (Director.__instance__)
      return Director.__instance__;

    Director.superClass.init.call(this, param);
    
    this._timeStamper = new TimeStamper();
    this._sysPipe = pipe.createEventTrigger(this._timeStamper);
    
    debug.assert(param.view, 'param error');
    
    this._defaultView = param.view;
    this._displayList = [];

    this._now = 0;

    this.registerEvents();

    Director.__instance__ = this;
    
    var self = this;
    var clockf = function()
    {
      return self._now;
    };
    
    globalClocker(clockf);
  },

  registerEvents:function()
  {
    this._defaultView.sketchpad().mouseClicked = createMouseEvtHdl(this, 'mouseClicked');
    this._defaultView.sketchpad().mouseDragged = createMouseEvtHdl(this, 'mouseDragged');
    this._defaultView.sketchpad().mouseMoved = createMouseEvtHdl(this, 'mouseMoved');
    this._defaultView.sketchpad().mouseOut = createMouseEvtHdl(this, 'mouseOut');
    this._defaultView.sketchpad().mouseOver = createMouseEvtHdl(this, 'mouseOver');
    this._defaultView.sketchpad().mousePressed = createMouseEvtHdl(this, 'mousePressed');
    this._defaultView.sketchpad().mouseReleased = createMouseEvtHdl(this, 'mouseReleased');
    
    this._defaultView.sketchpad().keyPressed = createKeyEvtHdl(this, 'keyPressed');
    this._defaultView.sketchpad().keyReleased = createKeyEvtHdl(this, 'keyReleased');
  },
  
  trigerEvent:function(evt)
  {
    if (this._level)
    {
      pipe.triggerEvent(this._level.sysPipe(), evt);
    }
  },
  
  step:function(t, dt)
  {
    this._timeStamper.stepForward(dt);
    this._now += 1;

    //allways check mouseover, mouseout.
    if (!this._defaultView.sketchpad().__mousePressed)
    {
      createMouseEvtHdl(this, 'mouseMoved')();
    }

    if (this._level)
    {
      this._level.step(this._timeStamper.now(), dt);
      this._displayList.length = 0;
      this._level.logic().getScene().filt(this._displayList, function(node){return !!node.model();});
      this._defaultView.redraw(this._displayList);
    }
  },
  
  setLevel:function(level)
  {
    if (this._level)
      this._level.deactive();
    
    this._level = level;
    if (this._level)
      this._level.active(this);
  },
  
  getlevel:function()
  {
    return this._level;
  },
  
  sysPipe:function()
  {
    return this._sysPipe;
  },

  defaultView:function()
  {
    return this._defaultView;
  },
});

function director(param)
{ 
  if (!Director.__instance__)
  {
    Director.__instance__ = new Director(param);
  }

  return Director.__instance__;
}

exports.Director = Director;
exports.director = director;
exports.timeStamp = timeStamp;
exports.TimeStamper = TimeStamper;

}};