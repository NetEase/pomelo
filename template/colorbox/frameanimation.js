
__resources__["/__builtin__/frameanimation.js"] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {
var animate = require("animate");
var ImageModel = require("model").ImageModel;
var ClipModel = require("model").ClipModel;
var debug = require("debug");
var h = require("helper");
var util = require("util");
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
var genFrameTimeline = function(imgModel, HSpan, VSpan, 
                                startX, startY, 
                                defEndX, defEndY, interval, totalTime)
{
  var lastElapsed = 0;
  var elapsed = 0;/*record elapsed time during last time x, y changed*/
  var x = startX;
  var y = startY;

  return function(p)
  {
    var curElapsed = p * totalTime;
    var dt = curElapsed - lastElapsed;

    elapsed += dt;
    lastElapsed = curElapsed;

    var imgWidth = imgModel.width;
    var imgHeight = imgModel.height;
    var endX = defEndX == -1 ? imgWidth : defEndX;
    var endY = defEndY == -1 ? imgHeight : defEndY;

    while (elapsed >= interval)
    {
      elapsed -= interval;
      
      x += HSpan;

      //jump to next line?
      if (x >= imgWidth)
      {
        x = 0;
        y += VSpan;
      }

      //check if frame play over
      if (((x+HSpan) > endX && (y+VSpan) == endY) ||
          (y + VSpan) > endY)
      {
        x = startX;
        y = startY;

        break;
      }
    }
    
    return {x:x, y:y};
  };
};

var FrameAnimation = animate.AnimationBase.extend({
  init:function(param)
  {
    FrameAnimation.superClass.init.call(this, param);

    this._imgModel = new ImageModel({image:param.image});
    this._target = new ClipModel({w:param.w, h:param.h, model:this._imgModel, flipX:param.flipX, flipY:param.flipY});

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

    debug.assert(typeof(param.totalTime) == "number" && typeof(param.interval) == "number", "parameter error!");
    this._totalTime = param.totalTime;
    this._interval = param.interval;

    if (typeof(param.factor) == 'number')
      this._factor = param.factor;
    else
      this._factor = function(t){return t;};

    this._target.x = this._startX;
    this._target.y = this._startY;

    this._elapsed = 0;
    
    this._timeline = genFrameTimeline(this._imgModel, this._hSpan, this._vSpan, this._startX, this._startY, this._endX, this._endY, this._interval, this._totalTime);
    
    this._state = "prepared";
  },
  
  prepare: function()
  {
    if (this.isPaused())
      this.resume();

    this._state = "prepared";
    
    this._elapsed = 0;
    this._timeline = genFrameTimeline(this._imgModel, this._hSpan, this._vSpan, this._startX, this._startY, this._endX, this._endY, this._interval, this._totalTime);

    FrameAnimation.superClass.prepare.call(this);
  },
  
  
  isDone: function()
  {
    return this._elapsed >= this._totalTime; //this._state == "end";//
  },
  
  doTick: function(t, dt, target)
  {
    if (this.isDone())
      return;
  
    if (this._state == "prepared")
    {
      this._elapsed = 0;
      this._state = "running";
    }
    else
    {
      this._elapsed += this._factor(dt);
      if (this._elapsed >= this._totalTime)
      {
        this._elapsed = this._totalTime;
        this._state = "end";
      }
    }

    //������������һ���뿪���յ����䣬��percentȡֵ1��ʱ�����ȡ��endFrame��ֵ��
    var percent = this._elapsed / this._totalTime;
    percent = percent >= 1.0 ? 0.99 : percent;

    var val = this._timeline(percent);
    this._target.x = val.x;
    this._target.y = val.y;

    if (this.hasCBs())
      this.cb(this._elapsed/this._totalTime);
  },

  
  target: function ()
  {
    return this._target;
  },

  elapsed:function()
  {
    return this._elapsed;
  },

  totalTime:function()
  {
    return this._totalTime;
  },

  curFrame:function()
  {
    return Math.floor(this._elapsed / this._interval);
  },

  setCurFrame:function(idx)
  {
    return this._elapsed = idx * this._interval;
  },

  value:function(time, percent)
  {
    var value = {variable:["x", "y"]};
    var elapsed = this._elapsed;

    if (typeof(time) == 'number')
    {
      elapsed = time > this._totalTime ? this._totalTime : time;
    }
    else if (time == undefined && typeof(percent) == 'number')
    {
      elapsed = this._totalTime * (percent > 1 ? 1 : percent);
    }

    var percent = this._elapsed / this._totalTime;
    percent = percent >= 1.0 ? 0.99 : percent;

    value.value = this._timeline(percent);

    return [value];
  },
});

/*
  Oneway to define a FrameData:
  example for FrameData:
  KeyFrame:
  var frame1 = {
     offset:{x:0, y:0},
     size:{w:80, h:40},
  };

  var frame2 = {
     offset:{x:80, y:0},
     size:{w:80, h:40},
  };

  FrameData:
  {
    image:"images/bird.png",
    keyFrames:
      [
        {frame:frame1,duration:200},
        {frame:frame2,duration:200},
      ]
  }

  ��������ÿ֡�������ǲ�ͬ��ͼƬ��Դ����Ϊnode��������ȥ�л�clipModel
*/

var genFramesDetailTimeline = function(frameData)
{
  var totalTime = 0;
  frameData.keyFrames.forEach(function(keyFrame)  
                              {
                                totalTime += keyFrame.duration;
                              });
  return function(p)
  {
    var elapsed = p * totalTime;
    var frame;

    frameData.keyFrames.some(function(keyFrame)
                             {
                               if (elapsed <= keyFrame.duration)
                               {
                                 frame = keyFrame.frame;
                                 return true;
                               }
                               else
                               {
                                 elapsed -= keyFrame.duration;
                                 return false;
                               }
                             });

    if (frame == undefined && frameData.keyFrames.length > 0)
      frame = frameData.keyFrames[frameData.keyFrames.length-1];

    return frame;
  }
}

var DetailedFrameAnimation = animate.AnimationBase.extend({
  init:function(param)
  {
    DetailedFrameAnimation.superClass.init.call(this, param);

    var image;
    if (typeof(param.image) == "string")
    {
      image = h.loadImage(param.image);
    }
    else
    {
      image = param.iamge;
    }

    this._imgModel = new ImageModel({image:image});
    this._target = new ClipModel({w:0, h:0, model:this._imgModel});

    var totalTime = 0;
    param.keyFrames.forEach(function(keyFrame)
                                {
                                  totalTime += keyFrame.duration;
                                });
    this._totalTime = totalTime;
    this._frameData = util.copy(param);
    this._frameData.image = image;
    if (this._frameData.factor == undefined)
      this._frameData.factor = function(t){return t;};

    this._timeline = genFramesDetailTimeline(this._frameData);

    this._elapsed = 0;
    this._state = "prepared";
  },
  
  prepare: function()
  {
    if (this.isPaused())
      this.resume();

    this._state = "prepared";
    
    this._elapsed = 0;
    this._timeline = genFramesDetailTimeline(this._frameData);

    DetailedFrameAnimation.superClass.prepare.call(this);
  },

  isDone: function()
  {
    return this._elapsed >= this._totalTime; //this._state == "end";//
  },

  doTick: function(t, dt, target)
  {
    if (this.isDone())
      return;
    
    if (this._state == "prepared")
    {
      this._elapsed = 0;
      this._state = "running";
    }
    else
    {
      this._elapsed += this._frameData.factor(dt);
      if (this._elapsed >= this._totalTime)
      {
        this._elapsed = this._totalTime;
        this._state = "end";
      }
    }

    var frame = this._timeline(this._elapsed/this._totalTime);

    debug.assert(this._target || target, "Animation, there is no target!");
    debug.assert(typeof(frame.offset.x) == "number" && typeof(frame.offset.y) == "number" && typeof(frame.size.w) == "number" && typeof(frame.size.h) == "number",
                 "the value which timeline calc is wrong");
    this._target.w = frame.size.w;
    this._target.h = frame.size.h;
    this._target.x = frame.offset.x;
    this._target.y = frame.offset.y;

    if (this.hasCBs())
      this.cb(this._elapsed/this._totalTime);
  },
  
  target: function ()
  {
    return this._target;
  },

  elapsed:function()
  {
    return this._elapsed;
  },

  totalTime:function()
  {
    return this._totalTime;
  },

  variable:function()
  {
    return ["w", "h", "x", "y"];
  },

  value:function(time, percent)
  {
    var value = {variable:this.variable()};
    var elapsed = this._elapsed;

    if (typeof(time) == 'number')
    {
      elapsed = time > this._totalTime ? this._totalTime : time;
    }
    else if (time == undefined && typeof(percent) == 'number')
    {
      elapsed = this._totalTime * (percent > 1 ? 1 : percent);
    }

    value.value = this._timeline(elapsed / this._totalTime);

    return [value];
  },
});

/*
  another way to define a FrameData:
  FrameData:
  {
    img:"images/bird.png",
    keyFrames:
    {
      interval:200,
      totalTime:200*8,
      startFrame:0,
      endFrame:8
    }
  }
*/

exports.FrameAnimation = FrameAnimation;
exports.DetailedFrameAnimation = DetailedFrameAnimation;

}};