
__resources__["/__builtin__/particle.js"] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {

var oo = require("oo");
var Entity = oo.Entity;
var Trait = oo.Trait;
var assert = require("debug").assert;
var Matrix = require("matrix").Matrix;
var CircleModel = require("model").CircleModel;
var geo = require("geometry");
var util = require("util");

var initAgent = function ()
{
  this.slot("_life", 10); // 期望寿命 10秒
  this.slot("_age", 0);
  this.slot("_state", "wait");  // wait, running, end

  // Matrix等待被替换!!!!!
  var ts = {
    now: function () { return 1; },
    stepForward: function () {}
  };
  this.slot("space", new Matrix({timeStamp:ts}));
  this.slot("_parentMatrix", geo.affineTransformIdentity());

  var cm = new CircleModel({
    radius:5, 
    fill: {r:255, g:0, b:0, a: 255},
    ratioAnchorPoint: {x: 0.5, y:0.5}
  });
  this.slot("model", cm);

};

var TAgent = Trait.extend({
  clone:function (traits, xMethods, custom)
  {
    var inst = this.create(traits, xMethods);
    //debug
    inst._name = this._name + " clone";

    // Matrix等待被替换!!!!!
    var ts = {
      now: function () { return 1; },
      stepForward: function () {}
    };
  
    inst.slot("space", new Matrix({timeStamp:ts}));

    inst.exec("reset");
   
    if (custom)
    {
      var customArgs = slice.call(arguments,3);
      custom.apply(inst, customArgs);
    }

    return inst;
  },
  
  reset: function ()
  {
    this.slot("_age", 0);
    this.slot("_state", "wait");
    var space = this.slot("space");
    space.position = {x:0, y:0, z:0};
    space.scale = {x:1, y:1};
    space.radian = 0;
    this.slot("_parentMatrix", geo.affineTransformIdentity());
  },

  life: function (newv)
  {
    return this.slot("_life", newv);
  },

  age: function ()
  {
    return this.slot("_age");
  },

  state: function ()
  {
    return this.slot("_state");
  },

  updateDynamic: function (dt, owner, env)
  {
    return true;
  },

  update: function (dt, owner, env)
  {
    var state = this.slot("_state");
    if (state === "end")
    {
      return "end";
    }

    var age = this.slot("_age");
    age += dt;
    this.slot("_age", age);
    if (age > this.slot("_life"))
    {
      this.slot("_state", "end");
      return "end";
    }

    var ret = this.exec("updateDynamic", dt, owner, env);
    
    //这里拿父空间信息做事情
    
    //var parentMat = owner.exec("worldMatrix");
    //this.slot("_parentMatrix", parentMat);

    if (ret)
    {
      this.slot("_state", "running");
    }
    else
    {
      this.slot("_state", "end");
      return "end";
    }

    return "running";
  },


  worldMatrix: function ()
  {
    var space = this.slot("space");
    var parentMat = this.slot("_parentMatrix");

    var mat = geo.affineTransformTranslate(util.copy(parentMat), 
                                           space.position.x, 
                                           space.position.y, 
                                           space.position.z);
    mat = geo.affineTransformRotate(mat, space.radian);
    mat = geo.affineTransformScale(mat, space.scale.x, space.scale.y); 
    return mat;
  },
  
  _recOutputModel: function (list)
  {
    if ("end" === this.slot("_state"))
    {
      return;
    }

    var mat = this.exec("worldMatrix");
    var model = this.slot("model");
    if (model)
    {
      list.push([mat, model]);
    }

    return true;
  },
});

var Particle = Entity.create([TAgent],{},initAgent);

var initEmitter = function ()
{
  this.slot("shotRate", 3.0);
  this.slot("bulletsPerShot", 1.0);
  this.slot("particle", Particle); // 发射的粒子类型

  this.slot("_accumShots", 0.0);
  this.slot("_group", new Array(10));
  this.slot("_memberCount", 0); 
}

var Emitter = Particle.create([],{
  clone:function (traits, xMethods, custom)
  {
    var inst = this.execProto("clone", traits, xMethods);
    inst.slot("_group", new Array(this.exec("maxCount")));
    if (custom)
    {
      var customArgs = slice.call(arguments,3);
      custom.apply(inst, customArgs);
    }

    return inst;
  },

  reset: function ()
  {
    this.execProto("reset");
    this.slot("_memberCount", 0);
    this.slot("_accumShots", 0);
  },

  memberCount: function ()
  {
    return this.slot("_memberCount");
  },

  maxCount: function(count)
  {
    if (undefined == count)
    {
      return this.slot("_group").length;
    }
    else
    {
      if (this.slot("_group").length !== count)
      {
        this.slot("_group", new Array(count));
      }
      return count;
    }
  },
  
  initParticle: function (particle, which, familyCount, env)
  {
  },

  _processNewBorns: function (env, fromWhere)
  {
    if (undefined == fromWhere)
    {
      return;
    }

    var memberCount = this.slot("_memberCount");
    var familyCount = memberCount - fromWhere;
    var parentMat = this.exec("worldMatrix");
    var grp = this.slot("_group");
    for (var i = fromWhere; i < memberCount; ++i)
    {
      grp[i].slot("_parentMatrix", parentMat);
      this.exec("initParticle", grp[i], i - fromWhere, familyCount, env); 
    }
  },

  emitParticles: function (bullets)
  {
    var memberCount = this.slot("_memberCount");
    bullets = Math.min(bullets, this.exec("maxCount") - memberCount);
    if (bullets <= 0)
    {
      return;
    }
    
    var group = this.slot("_group");
    var ptcl = this.slot("particle");
    for (var i = 0; i < bullets; ++i)
    {
      var np = group[i + memberCount];
      if (np)
      {
        // reuse
        np.exec("reset");
      }
      else
      {
        group[i + memberCount] = ptcl.exec("clone",[],{});
      }
    }
    
    this.slot("_memberCount", memberCount + bullets);
    return memberCount;
  },

  tryEmit: function (dt, owner, env)
  {
    var sr = this.slot("shotRate");
    var as = this.slot("_accumShots");
    
    var srv = sr;
    if ("function" === typeof sr)
    {
      srv = sr(this, this.slot("_age"));
    }
    as += srv * dt;
    this.slot("_accumShots", as);

    if (1 < as)
    {
      var shots = Math.floor(as);
      this.slot("_accumShots", as - shots);
      var bps = this.slot("bulletsPerShot");
      var bpsv = bps;
      if ("function" === typeof bps)
      {
        bpsv = bps(this, this.slot("_age"));
      }
      var bullets = shots * bpsv;
      var fromWhere = this.exec("emitParticles", bullets);
      this.exec("_processNewBorns", env, fromWhere);
      this.exec("updateParticles", 0, env, fromWhere);
    }
  },

  updateParticles: function (dt, env, start)
  {
    var grp = this.slot("_group");
    var memberCount = this.slot("_memberCount");
    var i = start ? start : 0;
    while(i < memberCount)
    {
      //是否要让已经出生的粒子一直随着emitter变换?

      var pret = grp[i].exec("update",dt, this, env);
      if (pret === "end")
      {
        // swap with the particle at the end
        // dead particle can be reused
        var tmp = grp[i];
        grp[i] = grp[memberCount - 1];
        grp[memberCount - 1] = tmp;
        --memberCount;
        this.slot("_memberCount", memberCount);
      }
      else
      {
        ++i;
      }
    }
  },

  update: function (dt, owner, env)
  {
    var ret = this.execProto("update", dt, owner, env);
    if ("running" === ret)
    {
      this.exec("updateParticles", dt, env);
      this.exec("tryEmit", dt, owner, env);
    }
    return ret;
  },

  _recOutputModel: function (list)
  {
    var ret = this.execProto("_recOutputModel", list);

    if (undefined == ret)
    {
      return;
    }

    var grp = this.slot("_group");
    var memberCount = this.slot("_memberCount");
    for(var i = 0; i < memberCount; ++i)
    {
      grp[i].exec("_recOutputModel", list);
    }

    return true;
  },

  outputAllModels: function (list)
  {
    this.exec("_recOutputModel", list);
  }

},initEmitter);

Particle._name = "Particle";
Emitter._name = "Emitter";

exports.Particle = Particle;
exports.Emitter = Emitter;

}};