
__resources__["/__builtin__/director.js"] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {
var util = require("util")
  , debug = require("debug")
  , BObject = require("base").BObject
  , pipe = require('pipe')
  , globalClocker = require('clocker').globalClocker
  , helper = require("helper")
  , view = require("view")
  , model = require("model");

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
  return function(e)
  {
    if (prevEvt && prevEvt._type == "mousePressed" && type == "mouseReleased")
    {
      //mouseclick
      createMouseEvtHdl(d, "mouseClicked")(prevEvt);
    }

    var evt = {type:type};
    var el = e.target;

    
    var osl = 0
    var ost = 0
    while (el) {
      osl += el.offsetLeft
      ost += el.offsetTop
      el = el.offsetParent
    }

    evt.mouseX = e.pageX - osl;
    evt.mouseY = e.pageY - ost;

    if (evt.mouseX < 0)
      evt.mouseX = 0;
    if (evt.mouseY < 0)
      evt.mouseY = 0;
    
    //donot permit event.id is copyable through util.copy in for..in.. expression
    //Object.defineProperty(evt, 'id', {value:d.eventIdGenerator++, writable:true, configurable:true, enumerable:false});
    //evt.id = d.eventIdGenerator ++;

    prevEvt = e;
    prevEvt._type = type;

    d.triggerEvent(evt);
   };
}

function createKeyEvtHdl(d, type)
{
  return function(e)
  {
    var evt = {type:type};
  
    // evt.key = d._defaultView.sketchpad().key;
    // evt.keyCode = d._defaultView.sketchpad().keyCode;

    evt.key = e.key;
    evt.keyCode = e.keyCode;
    //donot permit event.id is copyable through util.copy in for..in.. expression
    //Object.defineProperty(evt, 'id', {value:d.eventIdGenerator++, writable:true, configurable:true, enumerable:false});
    //evt.id = d.eventIdGenerator ++;

    d.triggerEvent(evt);
  };
}

function redrawLevel2View(level, view)
{
  var displayList = [];
  view.clear();
  level.logic().getScene().filt(displayList, function(node){return !!node.model();});      
  view.redraw(displayList);
}

var prevEvt;

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
    //this._defaultView.canvas().mouseClicked = createMouseEvtHdl(this, 'mouseClicked');
    this._defaultView.canvas().ondrag = createMouseEvtHdl(this, 'mouseDragged');
    this._defaultView.canvas().onmousemove = createMouseEvtHdl(this, 'mouseMoved');
    this._defaultView.canvas().onmouseout = createMouseEvtHdl(this, 'mouseOut');
    this._defaultView.canvas().onmouseover = createMouseEvtHdl(this, 'mouseOver');
    this._defaultView.canvas().onmousedown = createMouseEvtHdl(this, 'mousePressed');
    this._defaultView.canvas().onmouseup = createMouseEvtHdl(this, 'mouseReleased');
    
    this._defaultView.canvas().onkeydown = createKeyEvtHdl(this, 'keyPressed');
    this._defaultView.canvas().onkeyup = createKeyEvtHdl(this, 'keyReleased');
  },
  
  triggerEvent:function(evt)
  {
    if (this._level && this._level.sourcePipe())
    {
      pipe.triggerEvent(this._level.sourcePipe(), evt);
    }
  },
  
  step:function(t, dt)
  {
    this._timeStamper.stepForward(dt);
    this._now += 1;

    //allways check mouseover, mouseout.
    if (!this._defaultView.sketchpad().__mousePressed)
    {
      //createMouseEvtHdl(this, 'mouseMoved')();
    }

    if(this._setLevelList && this._setLevelList.length > 0)
    {
      function transAndDraw(d)
      {
        var setLevelInfo = d._setLevelList[0];
        var preLevel = d._level, 
            nextLevel = setLevelInfo.nextLevel,
            transInfo = setLevelInfo.transInfo;

        if(preLevel && d._preLevelView.sketchpad().loaded === false)
        {
          redrawLevel2View(preLevel, d._preLevelView);
          d._preLevelView.sketchpad().loaded = true;
          preLevel.deactive();
        }
        if(nextLevel && d._nextLevelView.sketchpad().loaded === false)
        {
          redrawLevel2View(nextLevel, d._nextLevelView);
          d._nextLevelView.sketchpad().loaded = true;
        }
      
        var displayList = transInfo.trans(d._preLevelModel, d._nextLevelModel, dt);
      
        d._defaultView.clear();
        d._defaultView.drawDispList(displayList);
        
        //when transition is done,this step will draw nothing, so must be redraw current level or do the next setlevel transition; 
        if(!transInfo.isDone())
          return false;
        else
        {
          d._level = nextLevel;
          if (d._level)
            d._level.active(d);
          
          d._preLevelView.sketchpad().loaded = false;
          d._preLevelModel = undefined;
          d._nextLevelView.sketchpad().loaded = false;
          d._nextLevelModel = undefined;
        
          d._setLevelList.splice(0, 1);
          if(d._setLevelList.length > 0)
          {
            d._preLevelModel = new model.ImageModel({image:d._preLevelView.sketchpad()});;
            d._nextLevelModel = new model.ImageModel({image:d._nextLevelView.sketchpad()});;
            transAndDraw(d);
          }
          else
            return true;
        //do not return, need to redraw next level;
        }
      }
      if(transAndDraw(this) == false)
        return;
    }
    if (this._level)
    {
      this._defaultView.clear();

      this._level.step(this._timeStamper.now(), dt);
      this._displayList.length = 0;
      this._level.logic().getScene().filt(this._displayList, function(node){return !!node.model();});      
      this._defaultView.redraw(this._displayList);
    }
  },
  
  setLevel:function(level, transInfo)
  {
    if(!transInfo)
    {
       if (this._level === level)
        return;

      if (this._level)
      {
        this._level.deactive();
      }
      this._level = level;
      if (this._level)
        this._level.active(this);
    }
    else
    {
      if(!this._setLevelList)
        this._setLevelList = [];
      this._setLevelList.push({nextLevel:level, transInfo:transInfo});

      if(!this._preLevelView)
      {
        var sketchpad = helper.createHiddenSketchpad(this._defaultView.sketchpad().width, this._defaultView.sketchpad().height);

        this._preLevelView = new view.HonestView({canvas:sketchpad});
        this._preLevelModel = new model.ImageModel({image:sketchpad});
      }
      if(this._preLevelView)
        this._preLevelView.sketchpad().loaded = false;

      if(!this._nextLevelView)
      {
        var sketchpad = helper.createHiddenSketchpad(this._defaultView.sketchpad().width, this._defaultView.sketchpad().height);

        this._nextLevelView = new view.HonestView(sketchpad);
        this._nextLevelModel = new model.ImageModel({image:sketchpad});
      }
      if(this._nextLevelView)
        this._nextLevelView.sketchpad().loaded = false;
    }
  },
  
  getLevel:function()
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
  
  getCurrentLevelImgModel:function()
  {
    var sketchpad = helper.createHiddenSketchpad(this._defaultView.sketchpad().width, this._defaultView.sketchpad().height);
    var view = new view.HonestView(sketchpad);
    
    redrawLevel2View(this._level, view);
    
    return model.ImageModel({image:sketchpad});
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