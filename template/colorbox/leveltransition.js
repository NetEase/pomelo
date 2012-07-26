
__resources__["/__builtin__/leveltransition.js"] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {
var director = require("director")
  , debug = require("debug")
  , slerptl = require("animate").slerptl
  , consttl = require("animate").consttl
  , addtl = require("animate").addtl
  , multl = require("animate").multl
  , subtl = require("animate").subtl
  , tweenFunctions = require("animate").tweenFunctions
  , Matrix = require("matrix").Matrix
  , BObject = require("base").BObject;


var TransAniBase = BObject.extend({
  init:function(param)
  {
    TransAniBase.superClass.init.call(this);
  },
  
  id:function()
  {
    return this.identifier;
  },

  doTick:function(t, target)
  {
    debug.assert(false, "TransAniBase -->should not in");
  }
});


var TransAni = TransAniBase.extend({
  init: function(params)
  {
    TransAni.superClass.init.call(this, params);
    
    this._variable = params.variable;
    this._timeline = params.timeline;
    //total time is a percent:[0, 1];
    this._totalTime = params.totalTime;
    this._endTime = params.endTime;
  
    debug.assert(this._variable && this._timeline, "TransAni parameters error");
  },
  
  _setTargetVal: function(variable, val, target)
  {
    if (typeof(variable) == 'string')
    {
      target[variable] = val;
    }
    else if (typeof(variable) == 'function')
    {
      variable(val, target);
    }
    else
    {
    	debug.assert(typeof(variable) == 'string', "TransAni parameters error");
    }
  },

  doTick: function(t, target)
  {
    var val = this._timeline(t);

    debug.assert(this._target || target, "Animation, there is no target!");
    this._setTargetVal(this._variable, val, target);
  },
  
  isDone: function(t)
  {
  	return t >= this._endTime;
  },
  
  getEndTime: function()
  {
    return this._endTime;
  },
  
  getTotalTime: function()
  {
    return this._endTime;
  },
});

var SequenceTransAni = TransAniBase.extend({
  init: function(params)
  {
    SequenceTransAni.superClass.init.call(this, params);
    
    debug.assert(params.transanis, 'SequenceTransAni constructor param error');

    this._transanis = params.transanis;
    
    if(this._transanis.length > 0)
      this._curtransani = this._transanis[0];
  },
  
  doTick: function(t, target)
  {
    var curIdx = this._transanis.indexOf(this._curtransani);
    var preEnd = 0;
    
    if(curIdx > 0)
    {
      var preTransani = this._transanis[curIdx - 1];
      preEnd = preTransani.getEndTime();
    }
    
    this._curtransani.doTick((t - preEnd)/this._curtransani.getTotalTime(), target);
    
    if (this._curtransani.isDone(t))
    {
      if (curIdx == this._transanis.length-1)
      {
      }
      else
      {
        this._curtransani = this._transanis[curIdx+1];
      }
    }
  },
  
  isDone: function(t)
  {
    return this._curtransani == this._transanis[this._transanis.length-1] && this._transanis[this._transanis.length-1].isDone(t);
  },

});

var ParallelTransAni = TransAniBase.extend({
  init:function(param)
  {
    ParallelTransAni.superClass.init.call(this, param);
    
    if (param.transanis)
      this._transanis = param.transanis;
    else
      this._transanis = [];
  },
  
  isDone:function(t)
  {
    return this._transanis.every(function(transani, i, arr)
                         {
                           return transani.isDone(t);
                         });
  },
  
  doTick: function(t, target)
  {
    this._transanis.forEach(function(transani, i, arr)
                            {
                              transani.doTick(t, target);
                            });
  },
});
    
function makeTransAniByArray(variable, args)
{
  var transAnis = [], timeline, transAni, i;
  var kk = 0;
  
  for (i = 0; i<args.length-1; i++)
  {
    totalTime = args[i+1][0] - args[i][0];
    debug.assert(typeof(args[i][2]) == "string", "makeTransAniByArray bad param");
    
    timeline = slerptl(args[i][1], args[i+1][1], tweenFunctions[args[i][2]]);
    transAni = new TransAni({variable:variable, timeline:timeline, totalTime:totalTime, endTime:args[i+1][0]});
    transAnis.push(transAni);
  }
  
  return transAnis;
}

/*
  var moveAnimator = new MoveTo([0, {x:0, y:100}, 'linear'],
  [0.5, {x:200, y:400}, 'sine'],
  [1, {x:0, y:0]);
*/
var MoveTo = SequenceTransAni.extend({
  init:function()
  {
    var transAnis = makeTransAniByArray('position', arguments);
    
    MoveTo.superClass.init.call(this, {transanis:transAnis});
  },
});


/*
  var angleTo = new RotateTo([[0, Math.PI/2, 'linear'],
  [1/3, Math.PI/3, 'sine'],
  [1, 8*Math.PI]]);
*/
var RotateTo = SequenceTransAni.extend({
  init:function()
  {
    var transAnis = makeTransAniByArray('radian', arguments);
    
    RotateTo.superClass.init.call(this, {transanis:transAnis});
  },
});

/*
  var scaleTo = new ScaleTo([[0, {x:0, y:0}, 'sine'],
  [0.1, {x:1, y:1}, 'cube'],
  [1, {x:2, y:2}, 'cube']]);
*/
var ScaleTo = SequenceTransAni.extend({
  init:function()
  {
    var transAnis = makeTransAniByArray('scale', arguments);
    
    ScaleTo.superClass.init.call(this, {transanis:transAnis});
  },
});

function fade(val, target)
{
  target.set("alpha", val);
}

var FadeTo = SequenceTransAni.extend({
  init:function()
  {
    var transAnis = makeTransAniByArray(fade, arguments);
    
    FadeTo.superClass.init.call(this, {transanis:transAnis});
  },
});


var leaveLevelTransAnis =
  {
    "left2right": function(w, h)
    {
      var ma = new MoveTo(
        [0, {x:0, y:0}, 'linear'],
        [1, {x:w, y:0}, 'linear']
      );
      
      return new ParallelTransAni({
      transanis:[ma]
      });
    },
    
    "right2left": function(w, h)
    {
      var ma = new MoveTo(
        [0, {x:0, y:0}, 'linear'],
        [1, {x:-w, y:0}, 'linear']
      );
      
      return new ParallelTransAni({
      transanis:[ma]
      });
    },
    
    "top2bottom": function(w, h)
    {
      var ma = new MoveTo(
        [0, {x:0, y:0}, 'linear'],
        [1, {x:0, y:h}, 'linear']
      );
      
      return new ParallelTransAni({
        transanis:[ma]
      });
    },
    
    "bottom2top": function(w, h)
    {
      var ma = new MoveTo(
        [0, {x:0, y:0}, 'linear'],
        [1, {x:0, y:-h}, 'linear']
      );
      
      return new ParallelTransAni({
        transanis:[ma]
      });
    },
    
    "zoomOut": function(w, h)
    {
      var ma1 = new MoveTo(
        [0, {x:0, y:0}, 'linear'],
        [1, {x:w, y:h}, 'linear']
      );
        
      var ma2 = new ScaleTo(
        [0, {x:1, y:1}, 'sine'],
        [1, {x:0.1, y:0.1}, 'linear']
        );
      
      return new ParallelTransAni({
        transanis:[ma1, ma2]
      });
    },
    
    "zoomInRotate180": function( w, h)
    {
      var ma1 = new MoveTo(
        [0, {x:0, y:0}, 'linear'],
        [1, {x:w, y:h}, 'linear']
      );
      
      var ma2 = new ScaleTo(
        [0, {x:1, y:1}, 'sine'],
        [2/3, {x:0.3, y:0.3}, 'linear'],
        [1, {x:1, y:1}, 'linear']
        );

      var ma3 = new RotateTo(
        [0, 0, 'linear'],
        [1, Math.PI*2, 'linear']
        );

      return new ParallelTransAni({
        transanis:[ma1, ma2, ma3]
      });
    },
    
    "fadeOut": function()
    {
      var ma = new FadeTo(
        [0, 1, 'linear'],
        [1, 0, 'linear']
      );
      
     return new ParallelTransAni({
        transanis:[ma]
        });
    },
  };
  
var enterLevelTransAnis = 
  {
    "left2right": function(w, h)
    {
      var ma = new MoveTo(
        [0, {x:w, y:0}, 'linear'],
        [1, {x:0, y:0}, 'linear']
      );
      
      return new ParallelTransAni({
        transanis:[ma]
      });
    },
    
    "right2left": function(w, h)
    {
      var ma = new MoveTo(
        [0, {x:-w, y:0}, 'linear'],
        [1, {x:0, y:0}, 'linear']
      );
      
      return new ParallelTransAni({
        transanis:[ma]
      });
    },
    
    "top2bottom": function(w, h)
    {
      var ma = new MoveTo(
        [0, {x:0, y:-h}, 'linear'],
        [1, {x:0, y:0}, 'linear']
      );
      
      return new ParallelTransAni({
        transanis:[ma]
      });
    },
    
    "bottom2top": function(w, h)
    {
      var ma = new MoveTo(
        [0, {x:0, y:h}, 'linear'],
        [1, {x:0, y:0}, 'linear']
      );
      
      return new ParallelTransAni({
        transanis:[ma]
      });
    },
    
    "zoomIn": function(w, h)
    {
      var ma1 = new MoveTo(
        [0, {x:w, y:h}, 'linear'],
        [1, {x:0, y:0}, 'linear']
      );
      
      var ma2 = new ScaleTo(
        [0, {x:0.1, y:0.1}, 'sine'],
        [1, {x:1, y:1}, 'linear']);

      return new ParallelTransAni({
        transanis:[ma1, ma2]
      });
    },
    
    "zoomInRotate360": function(w, h)
    {
      var ma1 = new MoveTo(
        [0, {x:w, y:h}, 'linear'],
        [1, {x:0, y:0}, 'linear']
      );
      
      var ma2 = new ScaleTo(
        [0, {x:0.1, y:0.1}, 'sine'],
        [0.5, {x:0.7, y:0.7}, 'sine'],
        [1, {x:1, y:1}, 'sine']);
     
     
      var ma3 = new RotateTo(
        [0, 0, 'linear'],
        [1, Math.PI*2, 'linear']);

     
      return new ParallelTransAni({
        transanis:[ma1, ma2, ma3]
      });
    },
    
    "fadeIn": function()
    {
      var ma = new FadeTo(
        [0, 0, 'linear'],
        [1, 1, 'linear']
      );
      
      return new ParallelTransAni({
        transanis:[ma]
        });
    },
  };
  
fadeInTransAni = enterLevelTransAnis["fadeIn"]();

fadeOutTransAni = leaveLevelTransAnis["fadeOut"]();

function transGenerator(ani)
{
  return function(imgModel, t)
  {
    var displayList = [];
    var mat = new Matrix({timeStamp:director.timeStamp});

    if(imgModel)
    {
      ani.doTick(t, mat);
      displayList.push([mat.matrix(), imgModel]);
    }
    
    return displayList;
  }
}

function leaveLevelTransGenerator(director, leaveTranStr)
{
  var transani = leaveLevelTransAnis[leaveTranStr](director._defaultView.sketchpad().width, director._defaultView.sketchpad().height);
  
  return transGenerator(transani);
}

function enterLevelTransGenerator(director, enterTranStr)
{
  var transani = enterLevelTransAnis[enterTranStr](director._defaultView.sketchpad().width, director._defaultView.sketchpad().height);
  
  return transGenerator(transani);
}

function levelFadeFun(ani, imgModel, t)
{
  var displayList = [];
  var mat = new Matrix({timeStamp:director.timeStamp});
  
  if(imgModel)
  {
    ani.doTick(t, imgModel);
    displayList.push([mat.matrix(), imgModel]);
  }
  
  return displayList;
}

function leaveLevelFadeOut(imgModel, t)
{
  return levelFadeFun(fadeOutTransAni, imgModel, t);
}

function enterLevelFadeIn(imgModel, t)
{
  return levelFadeFun(fadeInTransAni, imgModel, t);
}

function createSetLevelParallelTrans(leaveTrans, enterTrans, leaveTime, enterTime)
{
  return {
  	leaveTime : leaveTime,
  	enterTime : enterTime,
  	leaveTrans : leaveTrans,
  	enterTrans : enterTrans,
  	elapsed : 0,
  	trans : function(leaveImgModel, enterImgModel, t)
  		{
  			var percent, displayList = [];
  			
  			this.elapsed += t;
  			if(this.isDone())
  				return displayList;
  			
  			percent = this.elapsed/this.leaveTime;
  			if(percent <= 1 && this.leaveTrans)
  			  displayList = this.leaveTrans(leaveImgModel, percent);
  			percent = this.elapsed/ this.enterTime;
  			if(percent <= 1 && this.leaveTrans)
  			  displayList = displayList.concat(this.enterTrans(enterImgModel, percent));
  			
  			return displayList;  			
  		},
  	isDone : function()
  		{
  			var totalTime = this.leaveTime > this.enterTime ? this.leaveTime : this.enterTime
  			return this.elapsed >= totalTime;
  		}
  	};
}

function createSetLevelSequenceTrans(leaveTrans, enterTrans, leaveTime, enterTime)
{
  return {
  	leaveTime : leaveTime,
  	enterTime : enterTime,
  	leaveTrans : leaveTrans,
  	enterTrans : enterTrans,
  	elapsed : 0,
  	trans : function(leaveImgModel, enterImgModel, dt)
  		{
  			var percent, displayList = [];
  			
  			this.elapsed += dt;
  			if(this.isDone())
  				return displayList;
  			
  			percent = this.elapsed/this.leaveTime;
  			if(percent <= 1 && this.leaveTrans)
  			  displayList = this.leaveTrans(leaveImgModel, percent);
  			else
  			{
  			  percent = (this.elapsed - this.leaveTime)/ this.enterTime;
  			  if(percent <= 1 && this.leaveTrans)
  			    displayList = this.enterTrans(enterImgModel, percent);
  			}
  			
  			return displayList;  			
  		},
  	isDone : function()
  		{
  			var totalTime = this.leaveTime + this.enterTime;
  			return this.elapsed >= totalTime;
  		}
  	};
}

exports.leaveLevelTransGenerator = leaveLevelTransGenerator;
exports.enterLevelTransGenerator = enterLevelTransGenerator;
exports.createSetLevelParallelTrans = createSetLevelParallelTrans;
exports.createSetLevelSequenceTrans = createSetLevelSequenceTrans;
exports.leaveLevelFadeOut = leaveLevelFadeOut;
exports.enterLevelFadeIn = enterLevelFadeIn;
}};