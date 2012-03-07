
__resources__["/__builtin__/animate.js"] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {
var util = require("util")
, debug = require("debug")
, BObject = require("base").BObject;

var tweenFunctions = 
  {
    linear :                         function(v) { return v },

    set :                            function(v) { return Math.floor(v) },

    discrete :                       function(v) { return Math.floor(v) },

    sine :                           function(v) { return 0.5-0.5*Math.cos(v*Math.PI) },

    sproing :                        function(v) { return (0.5-0.5*Math.cos(v*3.59261946538606)) * 1.05263157894737},

    square :                         function(v) { return v*v},

    cube :                           function(v) { return v*v*v},

    sqrt :                           function(v) { return Math.sqrt(v)},

    curt :                           function(v) { return Math.pow(v, -0.333333333333)}
  };

/*-------------------------------------------------------------------------------------------
new timeline implement--> support easily combination
-------------------------------------------------------------------------------------------*/

var linear = tweenFunctions['linear'];
var set = tweenFunctions['set'];
var discrete = tweenFunctions['discrete'];
var sine = tweenFunctions['sine'];
var sproing = tweenFunctions['sproing'];
var square = tweenFunctions['square'];
var cube = tweenFunctions['cube'];
var sqrt = tweenFunctions['sqrt'];
var curt = tweenFunctions['curt'];

var lift = function(f)
{
  return function(tl)
  {
    return function(p)
    {
      return f(tl(p));
    };
  };
};

var consttl = function(v)
{
  return function(p)
  {
    return v;
  };
};

var slerptl = function(v1, v2, tl)
{
  var t1 = consttl(v1);
  var t2 = consttl(v2);
  var t3 = tl;

  // t1(p) + (t2(p) - t1(p)) * t3(p)
  return addtl(t1, multl(t3, subtl(t2, t1)));
};

var maptl = function(op, tl)
{
  return function(p)
  {
    return op(tl(p));
  };
};

var reversetl = function(tl)
{
  return function(p)
  {
    return tl(1-p);
  };
};

//if you do not want give me
var foldltl = function(op, tls, v)
{
  return function(p)
  {
    var v1, t, i;

    for (i=0, v1=v; i<tls.length; i++)
    {
      t = tls[i](p);

      v1 = op(v1, t);
    }

    return v1;
  }
};

var addtl;
var subtl;
var multl;

(function()
 {
   var createoptable = function(primitiveop)
   {
     var objectobject = function(v1, v2)
     {
       var ret = typeof(v1) == "object" ? {} : [];

       debug.assert(typeof(v1) == typeof(v2), "logical error");

       util.each(v1, function(val, key)
                 {
                   if (typeof(val) == "object" || typeof(val) == "array")
                     ret[key] = objectobject(val, v2[key]);
                   else
                     ret[key] = primitiveop(val, v2[key]);
                 });

       return ret;
     };

     var objectnumber = function(v1, v2)
     {
       var ret = typeof(v1) == "object" ? {} : [];

       util.each(v1, function(val, key)
                 {
                   if (typeof(val) == "object" || typeof(val) == "array")
                     ret[key] = objectnumber(val, v2);
                   else
                     ret[key] = primitiveop(val, v2);
                 });

       return ret;
     };

     var numberobject = function(v1, v2)
     {
       return objectnumber(v2, v1);
     };
     
     var numbernumber = function(v1, v2)
     {
       return primitiveop(v1, v2);
     }

     return {
       objectobject:objectobject,
       arrayarray:objectobject,
       objectarray:objectobject,
       arrayobject:objectobject,
       objectnumber:objectnumber,
       arraynumber:objectnumber,
       numberobject:numberobject,
       numberarray:numberobject,
       numbernumber:numbernumber,
     };
   };

   var createop = function(table)
   {
     return function(v1, v2)
     {   
       if (v1 == undefined || v2 == undefined)
         return v1 || v2;

       var optype = typeof(v1) + typeof(v2);
       if (!table[optype])
       {
         debug.error("I donot known how to opeate the two value");
         return undefined;
       }
       
       return table[typeof(v1) + typeof(v2)](v1, v2);
     };
   };
  
   var addop = createop(createoptable(function(v1, v2){return v1 + v2;}));
   var mulop = createop(createoptable(function(v1, v2){return v1 * v2;}));
   var subop = createop(createoptable(function(v1, v2){return v1 - v2;}));
   var divop = createop(createoptable(function(v1, v2){return v1/v2;}));

   var createFoldtlCombinator = function(op)
   {
     return function()
     {
       if (arguments.length == 1)
         return arguments[0];

       var args = [];
       for (var i = 0; i<arguments.length; i++)
       {
         args.push(arguments[i]);
       }

       return foldltl(op, args, undefined);
     };
   };

   addtl = createFoldtlCombinator(addop);
   subtl = createFoldtlCombinator(subop);
   multl = createFoldtlCombinator(mulop);
 }());

//animation

var AnimationBase = BObject.extend({
  init:function(param)
  {
    AnimationBase.superClass.init.call(this);
  },
  
  id:function()
  {
    return this.identifier;
  },
  
  prepare:function(target)
  {
    debug.assert(false, "Animation base-->should not in");
  },
  
  isDone:function()
  {
    return false;
  },

  boundTarget: function ()
  {
  },
  
  tick: function (t, dt, target)
  {
    var tg = this.boundTarget();
    tg = tg ? tg : target;

    if (this.onFrameBegin)
    {
      this.onFrameBegin(t,dt);
    }
    
    this.doTick(t,dt, target);

    if (this.onFrameEnd)
    {
      this.onFrameEnd(t,dt);
    }
  },

  doTick:function(t, dt, target)
  {
    debug.assert(false, "Animation base-->should not in");
  },
  
  copy:function()
  {
    debug.assert(false, "Animation base-->should not in");
  },
  
  reverse:function()
  {
    debug.assert(false, "Animation base-->should not in");
  },
});

var Animation = AnimationBase.extend({
  init: function(params)
  {
    Animation.superClass.init.call(this, params);
    
    this._variable = params.variable;
    this._timeline = params.timeline;
    this._totalTime = params.totalTime;
  
    debug.assert(this._variable && this._timeline && typeof(this._totalTime) == 'number', "Animation parameters error");

    this._elapsed = 0;
    this._target = params.target;

    //state: prepared, running, end
    //when prepared, next tick will run
    this._state = "prepared";
  },
  
  prepare: function()
  {
    this._state = "prepared";
    
    this._elapsed = 0;
  },
  
  isDone: function()
  {
    return this._elapsed >= this._totalTime; //this._state == "end";//
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
    else if (typeof(variable) == 'array')
    {
      variable.forEach(function(item, i, array)
                       {
                         this._setTargetVal(item, val, target);
                       }, 
                       this);
    }
  },

  boundTarget: function ()
  {
    return this._target;
  },
  
  doTick: function(t, dt, target)
  {
    if (this.isDone())
      return 0;
    
    if (this._state == "prepared")
    {
      this._elapsed = 0;
      this._state = "running";
    }
    else
    {
      this._elapsed += dt;
      if (this._elapsed >= this._totalTime)
      {
        this._elapsed = this._totalTime;
        this._state = "end";
      }
    }

    var val = this._timeline(this._elapsed/this._totalTime);

    debug.assert(this._target || target, "Animation, there is no target!");
    this._setTargetVal(this._variable, val, this._target ? this._target : target);
  },
  
  copy:function()
  {
    var newOne = new Animation({variable:this._variable, timeline:this._timeline, totalTime:this._totalTime, target:this._target});
    return newOne;
  },
  
  reverse:function()
  {
    var newOne = new Animation({variable:this._variable, timeline:reversetl(this._timeline), totalTime:this._totalTime, target:this._target});
    return newOne;
  },
  
  setTarget:function(target)
  {
    this._target = target;
  },
});

var SequenceAnimation = AnimationBase.extend({
  init: function(params)
  {
    SequenceAnimation.superClass.init.call(this, params);
    
    debug.assert(params.animations, 'SequenceAnimation constructor param error');

    this._animations = params.animations;
    
    this._curanimation = null;
  },
  
  prepare: function()
  {
    if (0 == this._animations.length)
    {
      //do nothing;
      return;
    }

    this._curanimation = this._animations[0];
    this._curanimation.prepare();

    //this.tick(0, 0, target);
  },
  
  isDone: function()
  {
    if (0 == this._animations.length)
      return true;
   
    return this._curanimation == this._animations[this._animations.length-1] && this._animations[this._animations.length-1].isDone();
  },
  
  doTick: function(t, dt, target)
  {
    if (this.isDone())
      return 0;
    
    this._curanimation.tick(t, dt, target);
    
    if (this._curanimation.isDone())
    {
      var curIdx = this._animations.indexOf(this._curanimation);
      if (curIdx == this._animations.length-1)
      {
      }
      else
      {
        this._curanimation = this._animations[curIdx+1];
        this._curanimation.prepare();
      }
    }
  },
  
  copy:function()
  {
    var animations = this._animations.map(function(item)
                                        {
                                          return item.copy();
                                        });
    return new SequenceAnimation({animations:animations});
  },
  
  reverse:function()
  {
    var animations = this._animations.map(function(item)
                                        {
                                          return item.reverse();
                                        });
    return new SequenceAnimation({animations:animations.reverse()});
  },
});

var TimesAnimation = AnimationBase.extend({
  init:function(param)
  {
    TimesAnimation.superClass.init.call(this, param);
    
    this._times = param.times;
    this._animation = param.animation;
  },
  
  prepare:function()
  {
    this._animation.prepare();
    this._elapsedTimes = 1;
    
    //this.tick(0, 0, target);
  },
  
  isDone:function()
  {
    return this._elapsedTimes == this._times && this._animation.isDone();
  },
  
  doTick: function(t, dt, target)
  {
    this._animation.tick(t, dt, target);
    if (this._animation.isDone() && (this._elapsedTimes < this._times))
    {
      this._elapsedTimes ++;
      this._animation.prepare();
    }
  },
  
  copy:function()
  {
    return new TimesAnimation({animation:this._animation.copy(), times:this._times});
  },
  
  reverse:function()
  {
    return new TimesAnimation({animation:this._animation.reverse(), times:this._times});
  },
});

var LoopAnimation = AnimationBase.extend({
  init:function(params)
  {
    LoopAnimation.superClass.init.call(this, params);
    
    this._animation = params.animation;
  },
  
  prepare: function()
  {
    this._animation.prepare();
    //this._animation.tick(0, 0, target);
  },
  
  isDone: function()
  {
    return false;
  },
  
  doTick: function(t, dt, target)
  {
    this._animation.tick(t, dt, target);
    if (this._animation.isDone())
    {
      this._animation.prepare();
    }
  },
  
  copy:function()
  {
    return new LoopAnimation({animation:this._animation.copy()});
  },
  
  reverse:function()
  {
    return new LoopAnimation({animation:this._animation.reverse()});
  },
});

var ParallelAnimation = AnimationBase.extend({
  init:function(param)
  {
    ParallelAnimation.superClass.init.call(this, param);
    
    if (param.animations)
      this._animations = param.animations;
    else
      this._animations = [];
  },
  
  prepare:function()
  {
    this._animations.forEach(function(animation, i, arr)
                            {
                              animation.prepare();
                            });
  },
  
  isDone:function()
  {
    return this._animations.every(function(animation, i, arr)
                         {
                           return animation.isDone();
                         });
  },
  
  doTick: function(t, dt, target)
  {
    this._animations.forEach(function(animation, i, arr)
                            {
                              animation.tick(t, dt, target);
                            });
  },
  
  copy:function()
  {
    var animations = this._animations.map(function(animation)
                                        {
                                          return animation.copy();
                                        });
    return new ParallelAnimation({animations:animations});
  },
  
  reverse:function()
  {
    var animations = this._animations.map(function(animation)
                                        {
                                          return animation.reverse();
                                        });
    return new ParallelAnimation({animations:animations.reverse()});
  },
});

/*
  var moveAnimator = new MoveTo([0, {x:0, y:100}, 'linear'],
  [1000, {x:200, y:400}, 'sine'],
  [2000, {x:0, y:0]);
*/
function makeAnimationsByArray(variable, args)
{
  var animations = []
  , totalTime, timeline, animation, i, tweenfun;
  
  for (i = 0; i<args.length-1; i++)
  {
    totalTime = args[i+1][0] - args[i][0];
    if (typeof(args[i][2]) == "string")
      tweenfun = slerptl(args[i][1], args[i+1][1], tweenFunctions[args[i][2]]);
    else
      tweenfun = args[i][2];
    timeline = /*new Timeline1({startValue:args[i][1], endValue:args[i+1][1], tween:args[i][2]});*/tweenfun;
    animation = new Animation({variable:variable, timeline:timeline, totalTime:totalTime});
    animations.push(animation);
  }
  
  return animations;
}

var MoveTo = SequenceAnimation.extend({
  init:function()
  {
    var animations = makeAnimationsByArray('position', arguments);
    
    MoveTo.superClass.init.call(this, {animations:animations});
  },
});


/*
  var angleTo = new RotateTo([[0, Math.PI/2, 'linear'],
  [100, Math.PI/3, 'sine'],
  [3000, 8*Math.PI]]);
*/
var RotateTo = SequenceAnimation.extend({
  init:function()
  {
    var animations = makeAnimationsByArray('radian', arguments);
    
    RotateTo.superClass.init.call(this, {animations:animations});
  },
});

/*
  var scaleTo = new ScaleTo([[0, {x:0, y:0}, 'sine'],
  [100, {x:1, y:1}, 'cube'],
  [1000, {x:2, y:2}, ]]);
*/
var ScaleTo = SequenceAnimation.extend({
  init:function()
  {
    var animations = makeAnimationsByArray('scale', arguments);
    
    ScaleTo.superClass.init.call(this, {animations:animations});
  },
});


//exports.Timeline = Timeline1;
exports.Animation = Animation;
exports.SequenceAnimation = SequenceAnimation;
exports.TimesAnimation = TimesAnimation;
exports.ParallelAnimation = ParallelAnimation;
exports.LoopAnimation = LoopAnimation;
exports.MoveTo = MoveTo;
exports.RotateTo = RotateTo;
exports.ScaleTo = ScaleTo;

exports.seq = function(animations)
{
  return new SequenceAnimation({animations:animations});
};

exports.parallel = function(animations)
{
  return new ParallelAnimation({animations:animations});
};

exports.times = function(animation, times)
{
  return new TimesAnimation({animation:animation, times:times});
}

exports.loop = function(animation)
{
  return new TimesAnimation({animation:animation, times:Infinity});
};

var Animator = BObject.extend({
  init:function(param)
  {
    Animator.superClass.init.call(this, param);
    this._animations = [];
  },

  tick:function(t, dt, target)
  {
    var hasDone = false;

    this._animations.forEach(function(animation, i, arr)
                             {
                               animation.tick(t, dt, target);
                               if (animation.isDone())
                                 hasDone = true;
                             });

    if (!hasDone)
      return;

    this._animations = this._animations.filter(function(animation)
                                               {
                                                 return !animation.isDone();
                                               });
  },

  addAnimation:function(animation)
  {
    this._animations.push(animation);
  },

  removeAnimation:function(id, animation)
  {
    if (id == undefined)
      id = animation.identifier;

    var idx = -1;

    this._animations.some(function(animation, i)
                                    {
                                      if (animation.identifier == id)
                                      {
                                        idx = i;
                                        return true;
                                      }
                                      else
                                        return false;
                                    });

    if (idx != -1)
      this._animations.splice(idx, 1);
  },
});

exports.linear = linear;
exports.set = set;
exports.discrete = discrete;
exports.sine = sine;
exports.sproing = sproing;
exports.square = square;
exports.cube = cube;
exports.sqrt = sqrt;
exports.curt = curt;
exports.reversetl = reversetl;
exports.slerptl = slerptl;
exports.maptl = maptl;
exports.foldltl = foldltl;
exports.addtl = addtl;
exports.subtl = subtl;
exports.multl = multl;
exports.lift = lift;
exports.consttl = consttl;
exports.Animator = Animator;

}};