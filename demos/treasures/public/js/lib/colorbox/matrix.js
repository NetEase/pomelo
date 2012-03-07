
__resources__["/__builtin__/matrix.js"] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {
var util = require("util")
,BObject = require("base").BObject
,geo = require("geometry")
,debug=require("debug")


/*-----------------------------------------------------------------------*/
//defineProperty getter, setter

//position, angle, scale   -->  matrix
function createFSet(propName, f)
{
  return function(val)
  {
    return f.call(this, propName, val);
  };
}

function createFGet(propName, f)
{
  return function()
  {
    return f.call(this, propName);
  }
}

function getter(propName)
{
  return util.copy(this['_'+propName]);
}

function setter(propName, val)
{
  this.stepForwardTimeStamp();

  return this['_'+propName] = util.copy(val);
}

/*
** position getter, setter
*/
function setPosition(propName, pos)
{
  if (!this._position)
  {
    this._position = {x:0, y:0 ,z:0};
  }
  
  this._position.x = pos.x;
  this._position.y = pos.y;
  if (typeof(pos.z) == 'number')
  {    
    this._position.z = pos.z;
  }
  
  this.stepForwardTimeStamp();
}

var Matrix = BObject.extend({
  init:function(param)
  {
    Matrix.superClass.init.call(this, param);

    if (typeof(param.radian) != 'number')
      this._radian = 0;
    else
      this._radian = param.radian;

    if (param.position)
      this._position = util.copy(param.position);
    else
      this._position = {x:0, y:0, z:0};

    if (param.scale)
      this._scale = util.copy(param.scale);
    else
      this._scale = {x:1, y:1};

    debug.assert(param.timeStamp, "matrix must has timestamp");
    
    this._stamper = param.timeStamp;
    this._curStamp = this._stamper.now();
    this._pStamp = undefined;

    Object.defineProperty(this, "position", {get:createFGet("position", getter),  set:createFSet("position", setPosition), configurable:true,});
    Object.defineProperty(this, "radian",   {get:createFGet("radian", getter),     set:createFSet("radian", setter), configurable:true,});
    Object.defineProperty(this, "scale",    {get:createFGet("scale", getter),     set:createFSet("scale", setter), configurable:true,});
  },

  matrix:function()
  {
    if (this._pStamp == undefined || this._pStamp < this._curStamp)
    {
      this._matrix = geo.affineTransformIdentity();

      this._matrix = geo.affineTransformTranslate(this._matrix, this._position.x, this._position.y, this._position.z);
      
      if (this._radian != 0)
        this._matrix = geo.affineTransformRotate(this._matrix, this._radian);
      
      if (!geo.pointEqualToPoint(this._scale, geo.ccp(1, 1)))
        this._matrix = geo.affineTransformScale(this._matrix, this._scale.x, this._scale.y); 
      
      this._pStamp = this._stamper.now();
    }

    return this._matrix;
  },

  stamp:function()
  {
    return this._pStamp;
  },

  dirty:function()
  {
    return this._pStamp == undefined || this._pStamp < this._curStamp;
  },

  stepForwardTimeStamp:function()
  {
    if (this._stamper)
    {
      this._stamper.stepForward();
      this._curStamp = this._stamper.now(); 
    }
    else
    {
      debug.assert(false, "where Timestamp?");
    }
  },
});

var DepMatrix = Matrix.extend({
  init:function(param)
  {
    DepMatrix.superClass.init.call(this, param);

    this._dep = param.dep;

    //ZP:!!!Warning: You can not extend DepMatrix object now. when use strict mode, js will throw type error.
    this._matrix = undefined;

    Object.preventExtensions(this);
  },

  setDep:function(dep)
  {
    this._dep = dep;
    this._pStamp = undefined;
  },

  matrix:function()
  {
    if (this.dirty())
    {
      //donot util.copy the dep's matrix. geo.affineTransform will generate a new one
      this._matrix = this._dep ? this._dep.exec('matrix') : geo.affineTransformIdentity();

      this._matrix = geo.affineTransformTranslate(this._matrix, this._position.x, this._position.y, this._position.z);
      
      if (this._radian != 0)
        this._matrix = geo.affineTransformRotate(this._matrix, this._radian);
      
      if (!geo.pointEqualToPoint(this._scale, geo.ccp(1, 1)))
        this._matrix = geo.affineTransformScale(this._matrix, this._scale.x, this._scale.y); 
      
      this._pStamp = this._stamper.now();
    }

    return this._matrix;
  },

  dirty:function()
  {
    //1, self dirty
    //2, dep  dirty
    //3, dep is newer than self
    return DepMatrix.superClass.dirty.call(this) || 
      (this._dep && this._dep.exec('matrixDirty')) ||
      (this._dep && this.stamp() < this._dep.exec('matrixStamp'));
  },
});


exports.Matrix = Matrix;
exports.DepMatrix = DepMatrix;

}};