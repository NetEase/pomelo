
__resources__["/__builtin__/component.js"] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {
var BObject = require("base").BObject
  , util = require("util")
  , debug = require("debug")
  , Animator = require('animate').Animator
  , TimeStamper = require('director').TimeStamper
  , pipe = require('pipe')
  , DepMatrix = require("matrix").DepMatrix
  , ClipModel = require("model").ClipModel
  , ImageModel = require("model").ImageModel

var Component = BObject.extend({
  init:function(param)
  {
    Component.superClass.init.call(this, param);
  },
  
  update:function(host, t, dt)
  {
    debug.error('cannot be here');
  },
  
  abilities:function()
  {
    return []; 
  },
});

var AnimatorComponent = Component.extend({
  init:function(param)
  {
    AnimatorComponent.superClass.init.call(this, param);
    
    this._animator = new Animator();
  },
  
  update:function(host, t, dt)
  {
    this._animator.tick(t, dt, host.exec('getMatrixHdl'));
  },
  
  addAnimation:function(host, animation, node, bSmooth)
  {
    this._animator.addAnimation(animation);

    if (!bSmooth)
      animation.prepare();
  },
  
  removeAnimation:function(host, id)
  {
    this._animator.removeAnimation(id);
  },

  removeAllAnimations:function(host)
  {
    this._animator.removeAllAnimations();
  },
  
  abilities:function()
  {
    return ['addAnimation', 'removeAnimation', 'removeAllAnimations']; 
  },
});

var MessageComponent = Component.extend({
  init:function(param)
  {
    MessageComponent.superClass.init.call(this, param);

    this._timeStamper = new TimeStamper();
    this._pipe = pipe.createEventTrigger(this._timeStamper);
    this._port = pipe.createPort(this._pipe);
    this._callback = param.callback;
  },
  
  update:function(host, t, dt)
  {
    var pMsg = this._port.query()
    , msg
    
    while(pMsg)
    {
      msg = pMsg.content;
      
      if (this._callback)
        this._callback(msg, host);
      
      pMsg = this._port.query();
    }

    this._timeStamper.stepForward();
  },
  
  sendMessage:function(host, msg)
  {
    pipe.triggerEvent(this._pipe, msg);
  },
  
  abilities:function()
  {
    return ['sendMessage'];
  },
});

var EventHandleComponent = Component.extend({
  init:function(param)
  {
    EventHandleComponent.superClass.init.call(this, param);
    
    var portFilter = function(pEvt){
      //var ret = false;
      /*
        util.each(param.types, function(type, i){
        if (type == pEvt.content.type)
        ret = true;
        });
      */
      /*
        param.types.forEach(function(type)
        {
        if (type == pEvt.content.type)
        ret = true;
        });
      */
      return param.types.some(function(type)
                              {
                                return type == pEvt.content.type;
                              });
    };

    this._oriPipe = pipe.filterP(param.pipe, portFilter);
    this._port = pipe.createPort(this._oriPipe);
    this._decider = param.decider;
    this._callback = param.callback;
    this._timeStamper = new TimeStamper();

    this._selfPipe = pipe.createEventTrigger(this._timeStamper);
    this._selfPort = pipe.createPort(this._selfPipe);
  },

  _handleEvent:function(host)
  {
    var pEvt = this._selfPort.query()
    , event;

    while (pEvt)
    {
      event = pEvt.content;

      this._callback(event, host);

      pEvt = this._selfPort.query();
    }
  },

  update:function(host, t, dt)
  {
    this._timeStamper.stepForward();

    this._handleEvent(host);

    var pEvt = this._port.query();
    var event;

    while (pEvt)
    {
      event = pEvt.content;

      this._decider.decide(host, event, this._selfPipe);
      
      pEvt = this._port.query();
    }
  },
});

var HoverEventComponent = BObject.extend({
  init:function(param)
  {
    param.types = ['mouseMoved'];
    return new EventHandleComponent(param);
  },
});

var MouseButtonEventComponent = BObject.extend({
  init:function(param)
  {
    param.types = ['mousePressed', 'mouseReleased', 'mouseClicked', 'mouseDragged'];

    return new EventHandleComponent(param);
  },
});

var KeyEventComponent = BObject.extend({
  init:function(param)
  {
    param.types = ['keyPressed', 'keyReleased'];

    return new EventHandleComponent(param);
  },
});

/*
**1,image

**2,w:frame width
**3,h:frame height

**4,HSpan:default is w
**5,VSpan:default is h

**6,startFrame:index of start frame
**7,endFrame:index of end frame

**8,times:default is 1.
**9,interval:

**10,factor:
*/
var FrameSeqComponent = Component.extend({
  init:function(param)
  {
    var imgModel = new ImageModel({image:param.image});
    this._clipModel = new ClipModel({w:param.w, h:param.h, model:imgModel});

    if (typeof(param.HSpan) == 'number')
      this._hSpan = param.HSpan;
    else
      this._hSpan = param.w;

    if (typeof(param.VSpan) == 'number')
      this._vSpan = param.VSpan;
    else
      this._vSpan = param.h;

    var startFrame = {x:0, y:0};
    if (typeof(param.startFrame) == 'number')
    {
      startFrame.x = param.startFrame;
      startFrame.y = 0;
    }
    else if (param.startFrame)
    {
      startFrame = param.startFrame;
    }
    
    var endFrame = {x:-1, y:-1};
    if (typeof(param.endFrame) == "number")
    {
      endFrame.x = param.endFrame;
      endFrame.y = 1;
    }
    else if (param.endFrame)
    {
      endFrame = param.endFrame;
    }

    debug.assert((typeof(startFrame.x) == 'number' && 
                  typeof(startFrame.y) == 'number' &&
                  typeof(endFrame.x) == 'number' &&
                  typeof(endFrame.y == 'number')), "parameter error");

    this._startX = startFrame.x * param.w;
    this._startY = startFrame.y * param.h;
    this._endX = endFrame.x == -1 ? -1 : endFrame.x * param.w;
    this._endY = endFrame.y == -1 ? -1 : endFrame.y * param.h;

    if (typeof(param.times) == 'number')
      this._times = param.times;
    else
      this._times = 1;

    this._interval = param.interval;

    if (typeof(param.factor) == 'number')
      this._factor = param.factor;
    else
      this._factor = 1;

    this._clipModel.x = this._x = this._startX;
    this._clipModel.y = this._y = this._startY;

    this._elapsed = 0;
  },

  update:function(host, t, dt)
  {
    var imgWidth = this._clipModel.model.width;
    var imgHeight = this._clipModel.model.height;
    var endX = this._endX == -1 ? imgWidth : this._endX;
    var endY = this._endY == -1 ? imgHeight : this._endY;
    var compelete = false;

    dt = dt * this._factor;

    if (this._times == 0)
      return;

    this._elapsed += dt;
    
    while (this._elapsed >= this._interval)
    {
      this._elapsed -= this._interval;
      
      this._x += this._hSpan;

      //jump to next line?
      if (this._x >= imgWidth)
      {
        this._x = 0;
        this._y += this._vSpan;
      }

      //check if frame play over
      if (((this._x+this._hSpan) > endX && (this._y+this._vSpan) == endY) ||
          (this._y + this._vSpan) > endY)
      {
        this._times --;
        
        this._x = this._startX;
        this._y = this._startY;

        if (0 == this._times)
          break;
      }
    }

    this._clipModel.x = this._x;
    this._clipModel.y = this._y;
  },

  setFrameSeqFactor:function(host, factor)
  {
    debug.assert(typeof(factor) == "number", "frameseq component setFrameSeqFactor parameter error");
    
    this._factor = factor;
  },

  getModel:function(host)
  {
    return this._clipModel;
  },

  ablities:function()
  {
    return ["getModel", "setFrameSeqFactor"];
  },
});

var MatrixComponent = Component.extend({
  init:function(param)
  {
    MatrixComponent.superClass.init.call(this, param);

    this._matrix = new DepMatrix({timeStamp:require('director').timeStamp});
  },

  getMatrixHdl:function(host)
  {
    return this._matrix;
  },

  setMatrixDep:function(host, dep)
  {
    return this._matrix.setDep(dep);
  },

  matrixStamp:function(host)
  {
    return this._matrix.stamp();
  },

  update:function(host, t, dt)
  {
  },

  matrixDirty:function(host)
  {
    return this._matrix.dirty();
  },

  matrix:function(host)
  {
    return this._matrix.matrix();
  },
  
  translate:function(host, x, y, z)
  {
    if (x === undefined)
    {
      return this._matrix.position;
    }
    else
    {
      this._matrix.position = {x:x, y:y, z:z};
    }
  },
  
  rotate:function(host, radian)
  {
    if (radian === undefined)
    {
      return this._matrix.radian;
    }
    else
    {
      this._matrix.radian = radian;
    }
  },
  
  scale:function(host, s)
  {
    if (s === undefined)
    {
      return this._matrix.scale;
    }
    else
    {
      this._matrix.scale = {x:s.x, y:s.y};
    }
  },

  applyTranslate:function(host, x, y, z)
  {
    var pos = this._matrix.position;
    pos.x += x;
    pos.y += y;
    if (typeof(z) === 'number')
      pos.z += z;

    this._matrix.position = pos;
  },
  
  applyRotate:function(host, radian)
  {
    this._matrix.radian = this._matrix.radian + radian;
  },
  
  applyScale:function(host, s)
  {
    var scale = this._matrix.scale;
    this._matrix.scale = {x:scale.x * s.x, y:scale.y * s.y};
  },

  

  abilities:function()
  {
    return ['getMatrixHdl', 'setMatrixDep', 'matrixStamp', 'matrixDirty', 'matrix', 'ablities', 'translate', 'rotate', 'scale', 'applyTranslate', 'applyRotate', 'applyScale'];
  },
});

var EmitterComponent = Component.extend({
  init:function(param)
  {
    EmitterComponent.superClass.init.call(this, param);
    
    debug.assert(param.emitter, "parameter error");

    this._emitter = param.emitter;
  },
  
  update:function(host, t, dt)
  {
    this._emitter.exec("update", dt, null, {});
  },

  getEmitter:function(host)
  {
    return this._emitter;
  },
  
  abilities:function()
  {
    return ["getEmitter"]; 
  },
});


exports.Component = Component;
exports.AnimatorComponent = AnimatorComponent;
exports.MessageComponent = MessageComponent;
exports.EventHandleComponent = EventHandleComponent;
exports.MatrixComponent = MatrixComponent;
exports.KeyEventComponent = KeyEventComponent;
exports.MouseButtonEventComponent = MouseButtonEventComponent;
exports.HoverEventComponent = HoverEventComponent;
exports.EventHandleComponent = EventHandleComponent;
exports.FrameSeqComponent = FrameSeqComponent;
exports.EmitterComponent = EmitterComponent;

}};