
__resources__["/__builtin__/model.js"] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {
var BObject = require("base").BObject
  , util = require("util")
  , debug = require("debug")
  , geo = require("geometry")
  , buildMap = require('tiled_map').buildMap
  , helper = require("helper")

/*-----------------------------------------------------------------------*/
//defineProperty getter, setter

//position, angle, scale   -->  matrix
function createFSet(propName, f)
{
  return function(val)
  {
    this.cache = {};
    //nested function's this is window, so I force it to the outter's this
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
  return this['_'+propName] = util.copy(val);
}

function setRatioAnchorPoint(propName, val)
{
  this._anchorPointIsRatio = true;
  this._ratioAnchorPoint = util.copy(val);
}

function getRatioAnchorPoint()
{
  return this._ratioAnchorPoint;
}


function setAnchorPoint(propName, val)
{
  this._anchorPointIsRatio = false;
  this._anchorPoint = util.copy(val);
  delete this._ratioAnchorPoint;
}

var getAnchorPoint = function()
{
  if (this._anchorPointIsRatio)
    return {ratio:true, point:util.copy(this._ratioAnchorPoint)}
  else
    return {ratio:false, point:util.copy(this._anchorPoint)};
}

/*-----------------------------------------------------------------------*/
var Model = BObject.extend({
  init:function(param)
  {
    Model.superClass.init.call(this, param);
    
    Object.defineProperty(this, 'ratioAnchorPoint',       {get:getRatioAnchorPoint,             set:createFSet("ratioAnchorPoint", setRatioAnchorPoint), configurable:true,});
    Object.defineProperty(this, "anchorPoint",            {get:getAnchorPoint,                  set:createFSet("anchorPoint", setAnchorPoint), configurable:true,});
    
    definePredefinedProps(this.constructor, this);

    param = param || {};
    
    util.extend(this, param);

    if (param.ratioAnchorPoint == undefined && param.anchorPoint == undefined)  
      this.set('anchorPoint', {x:0, y:0});
    
    if (this.type == undefined)
      this.type = 'model';
    
  },
  
  get:function(key)
  {
    if (this.hasOwnProperty(key))
      return this[key];
    else
      debug.log("model get undefined property:"+key);
  },
  
  set:function(key, val)
  {
    this[key] = val;
  },
  
});

Model.define = function(arg1, arg2)
{
  if (!this.hasOwnProperty("_predefinedProps"))
    this._predefinedProps = {};
    
  var defineKey = util.callback(this, function(key, val){
    if (this._predefinedProps.hasOwnProperty(key))
    {
      debug.assert(false, 'redefined property:'+key);
    }
       
    this._predefinedProps[key] = val;
  });
  
  if (typeof(arg1) == 'string')
    defineKey(arg1, arg2);
  else
    util.each(arg1, function(v, key){
      defineKey(key, v);
    });
}

function definePredefinedProps(constructor, obj)
{
  var setter = function(propName, val){
    this['_' + propName] = val;
  };

  var getter = function(propName)
  {
    return this['_' + propName];
  }

  while (constructor)
  {
    if (constructor._predefinedProps)
      util.each(constructor._predefinedProps, function(val, key){
        Object.defineProperty(obj, key, 
                              {
                                configurable: true,
                                get:createFGet(key, getter), 
                                set:createFSet(key, setter)
                              });
        obj[key] = val;
      });
    
    constructor = constructor.__proto__;
  }
}

Model.define({usedModel:false});

var CircleModel = Model.extend({
  init:function(param)
  {
    CircleModel.superClass.init.call(this, param);
    this.type = 'circle';
  },
});

CircleModel.define({
  radius: 0,
  fill: "rgba(255, 255, 255, 255)",//{r:255, g:255, b:255, a: 255},
  stroke: undefined,//{r:255, g:255, b:0, a: 255},
})

var ConvexModel = Model.extend({
  init:function(param)
  {
    ConvexModel.superClass.init.call(this, param);
    this.type = 'convex';

    Object.defineProperty(this, 
                          "vertexes",
                          {
                            get: createFGet("vertexes", getter),  
                            set: createFSet("vertexes", setter),
                            configurable:true,
                          });

    this.vertexes = param.vertexes;
  },
});

ConvexModel.define({
  vertexes: [],
  fill: "rgba(255, 255, 255, 255)",//{r:255, g:255, b:255, a: 255},
  stroke:undefined, //{r:255, g:255, b:0, a: 255},
})

var RectModel = Model.extend({
  init:function(param)
  {
    RectModel.superClass.init.call(this, param);
    
    this.type = "rect";

    debug.assert(typeof(this.width) == "number" && typeof(this.height) == "number", "logical error");
  },
});

RectModel.define({
  width:0,
  height:0,
  x:0,
  y:0,
  fill: "rgba(255, 255, 255, 255)",//{r:255, g:255, b:255, a: 255},
  stroke: undefined,
})

var rectInside = function(m, x, y, vr)
{
  if (m.x <= x && x <= (m.x+m.width) &&
      m.y <= y && y <= (m.y+m.height))
    return true;
}

var rectBbox = function(m, vr)
{
  return {left:m.x, top:m.y, width:m.width, height:m.height};
}

var rectDraw = function(m, vr)
{
  var ctx = vr.sketchpad();

  var fillc = m.fill;
  var sc = m.stroke;

  debug.assert(typeof(fillc) == "string" || fillc == undefined, "parameter error color format should be rgb(0, 0, 0) or rgba(0, 0, 0, 0)");

  var oldfc = ctx.fillStyle;
  var oldsc = ctx.strokeStyle;
  ctx.fillStyle = fillc;
  //ctx.strokeStyle = sc;

  // ctx.beginPath();
  // ctx.rect(m.x, m.y, m.width, m.height);
  // ctx.closePath();

  ctx.fillRect(m.x, m.y, m.width, m.height);

  ctx.fillStyle = oldfc;
  ctx.strokeStyle = oldsc;
  //var oldFillStyle = ctx.fillStyle;
  //var oldStrokeStyle = ctx.strokeStyle;

  //ctx.fillStyle = oldFillStyle;
  //ctx.strokeStyle = oldStrokeStyle;
}

var transparentColor = [0, 0, 0, 0];

var getcolors = function(str)
{
  var colors = str.split(',');
  if (colors[0].substr(0, 4) == "rgba")
    colors[0] = colors[0].substr(5);
  else
    colors[0] = colors[0].substr(4);
  
  colors = colors.map(function(c)
                      {
                        return parseFloat(c);
                      });

  if (undefined == colors[3])
    colors[3] = 255;
  
  if (colors.some(function(c){return isNaN(c) || typeof(c) != "number"}))
    return transparentColor;

  return colors;
}

var rectDraw_pjs = function(m, vr)
{
  var pjs = vr.sketchpad();
  var oldStyles = {fill:pjs.getCurrentFillColor(), stroke:pjs.getCurrentStrokeColor()};

  var fillc = m.get("fill");
  if (fillc === undefined || fillc.substr(0, 3) != "rgb")
  {
    pjs.noFill();
  }
  else
  {
    var colors = getcolors(fillc);
    //pjs.fill(fillc.r, fillc.g, fillc.b, fillc.a);
    pjs.fill(colors[0], colors[1], colors[2], colors[3]);
  }
  
  var sc = m.get("stroke");
  
  if (sc === undefined || sc.substr(0, 3) != "rgb")
  {
    pjs.noStroke();
  }
  else
  {
    var colors = getcolors(fillc);
    pjs.stroke(colors[0], colors[1], colors[2], colors[3]);
  }
}

require('view').HonestView.register('rect', {bbox:rectBbox, draw:rectDraw, inside:rectInside,});
require('view').ProcessingView.register('rect', {bbox:rectBbox, draw:rectDraw_pjs, inside:rectInside,});

var TextModel = Model.extend({
  init:function(param)
  {
    TextModel.superClass.init.call(this, param);
    this.type = 'text';
  },
});

TextModel.define({
  text: "",
  height: 18,
  font: "Arial",
  fill: "rgba(255, 255, 255, 255)",//{r:255, g:255, b:255, a: 255},
  stroke: undefined,//{r:255, g:255, b:0, a: 255},
})

var defaultWidthForUnloaded = 100;
var defaultHeightForUnloaded = 100;


var ImageModel = Model.extend({
  init:function(param)
  {
    ImageModel.superClass.init.call(this, param);
    this.type = 'image';

    Object.defineProperty(this,
                          "width",
                          {
                            get: function () 
                            { 
                              var img = this.get("image");
                              if (img.loaded)
                              {
                                return img.width;
                              }
                              else
                              {
                                return defaultWidthForUnloaded;
                              }
                            },
                          });

    Object.defineProperty(this,
                          "height",
                          {
                            get: function () 
                            { 
                              var img = this.get("image");
                              if (img.loaded)
                              {
                                return img.height;
                              }
                              else
                              {
                                return defaultHeightForUnloaded;
                              }
                            },
                          });

  },

});

ImageModel.define({
  image: helper.loadImage(""),
  width: 1,
  height: 1,
  fill:"rgba(255, 255, 255, 255)",// {r:255, g:255, b:255, a:255},
  stroke: undefined,//{r:255, g:0, b:0, a:255},
  alpha:1,
})

var MapModel = Model.extend({
  init:function(param)
  {
    MapModel.superClass.init.call(this, param);

    this.type = 'map';

    if (param.resource == undefined){
      debug.error('MapModel constructor: param error');
      return;
    }

    this.map = buildMap(param.resource);
  }
});

var ClipModel = Model.extend({
  init:function(param)
  {
    ClipModel.superClass.init.call(this, param);

    this.type = 'clip';

    this.model = param.model;

    debug.assert(typeof(this.x) == 'number' &&
                 typeof(this.y) == 'number' &&
                 typeof(this.w) == 'number' &&
                 typeof(this.h) == 'number' && 
                 this.model, "ClipModel parameter error!");
  },
});

ClipModel.define({
  x:0,
  y:0,
  w:0,
  h:0,
});

function getClipModelBoundingBox(model, vr)
{
  // Ӧ���ǻ��ڱ�������ϵ��
  return {left:0, top:0, width:model.w, height:model.h};
}

var viewClipModel_gen = 
  function(bProcessingView)
{
  var offscreen_buffer;

  return function(model, vr)
  {
    debug.assert(model.type == 'clip' && model.model, 'bad model');
    
    if (bProcessingView)
    {
      var pjs = vr.sketchpad();

      var octx = pjs.externals.context;
    }
    else
    {
      var octx = vr.sketchpad();
    }

    octx.save();

    if (model.flipX)
    {
      octx.translate(model.w, 0);
      octx.scale(-1, 1);
    }

    if (model.flipY)
    {
      octx.translate(0, model.h);
      octx.scale(1, -1);
    }

    octx.beginPath();
    octx.rect(0,0,model.w, model.h);
    octx.clip();

    octx.translate(-model.x, -model.y);

    vr.draw(model.model);

    octx.restore();
  };
};

function clipModelInside(model, x, y, vr)
{
  // ������clip�ı�������ϵ
  return 0 <= x && x <= model.w
    && 0 <= y && y <= model.h
    && vr.inside(model.model, 
                 {
                   x: x + model.x, 
                   y: y + model.y
                 },
                 vr);
}

var ProcedureModel = Model.extend({
  init:function(param)
  {
    ProcedureModel.superClass.init.call(this, param);

    this.type = "ProcedureModel";
  },
});

ProcedureModel.define({
  draw:function(){},
  bbox:function(){return {left:0, top:0, width:0, height:0}},
  inside:function(){return false;},
});

var getProcModelbbox = function(m, vr)
{
  return m.bbox(m, vr);
}

var drawProcModel = function(m, pjs)
{
  return m.draw(m, pjs);
}

var testInsideProcModel = function(m, x, y, vr)
{
  return m.inside(m, x, y, vr);
}

require('view').HonestView.register('ProcedureModel', {bbox:getProcModelbbox, draw:drawProcModel, inside:testInsideProcModel});
require('view').ProcessingView.register('ProcedureModel', {bbox:getProcModelbbox, draw:drawProcModel, inside:testInsideProcModel});

var PhysicsModel = Model.extend({
  init:function(param)
  {
    PhysicsModel.superClass.init.call(this, param);
    
    //debug.assert(this.node, 'PhysicsModel param error, where is node');
    
    this.type = 'PhysicsBody';

    var anchorPointGet = function(propName)
    {
      var body = this.node.exec('getBody');
      //return {ratio:false, point:body.GetLocalCenter()};
      return {ratio:false, point:{x:0, y:0}};
    };

    var anchorPointSet = function(propName, val)
    {
      debug.assert(false, 'physicsModel:do not permit change anchorPoint through physics model!');
    };

    Object.defineProperty(this, 'anchorPoint', {configurable:true, get:createFGet('anchorPoint', anchorPointGet), set:createFSet('anchorPoint', anchorPointSet), enumerable:true});
  },
});

function getPhysicsModelBoundingBox(model, vr)
{
  if (model.model)
  {
    return vr.bbox(model.model, vr);
  }

  //Note:
  /*
    box2d��body��boundingΪ����shape��bounding��union�Ľ�����
    box2d��body������̬����ɾ��shape����body��shape list�仯��ʱ����box2dû�л���֪ͨ��model�� model��������bounding��cache������ÿ�μ���body��shapelist�Ƿ������仯��
    ����̫����������ʱû�м���body��bouding��ֻ����һ����������������

    ��ʹ������boundingbox��ʱ������Ҫע�⣺Infinity����0����ΪNaN ��...
   */
  bounding = {left:-Infinity, top:-Infinity, width:Infinity, height:Infinity};

  return bounding;
}

function physicsModelTestInside(model, x, y, vr)
{
  if (model.model)
  {
    return vr.inside(model.model, {x:x, y:y}, vr);
  }

  var body = model.node.exec('getBody');
  var pos = {x:x ,y:y};
  var newPos = body.GetWorldPoint(pos);
  
  var fixture = body.GetFixtureList();
  while (fixture)
  {
    if (fixture.TestPoint(newPos))
      return true;

    fixture = fixture.GetNext();
  }

  return false;
}

function viewPhysicsModel(model, pjs)
{
  debug.assert(model.type == 'PhysicsBody' && model.node, 'bad model');
  
  if (model.model)
  {
    return pjs.draw(model.model);
  }

  var viewer = pjs.sketchpad();
  var body = model.node.exec('getBody');
  var fixture = body.GetFixtureList();
  var b2Body = require('Box2dWeb-2.1.a.3').b2Body;
   
  viewer.pushStyle();
  viewer.colorMode(viewer.RGB, 1.0);

  while (fixture)
  {
    viewer.pushStyle();
    
    if (body.IsActive() == false) 
    {
      viewPhysicsShape(viewer, fixture.GetShape(), 0.5, 0.5, 0.3);
    }
    else if (body.GetType() == b2Body.b2_staticBody)
    {
      viewPhysicsShape(viewer, fixture.GetShape(), 0.5, 0.9, 0.5);
    }
    else if (body.GetType() == b2Body.b2_kinematicBody)
    {
      viewPhysicsShape(viewer, fixture.GetShape(), 0.5, 0.5, 0.9);
    }
    else if (body.IsAwake() == false) 
    {
      viewPhysicsShape(viewer, fixture.GetShape(), 0.6, 0.6, 0.6);
    }
    else 
    {
      viewPhysicsShape(viewer, fixture.GetShape(), 0.9, 0.7, 0.7);
    }

    viewer.popStyle();
    
    fixture = fixture.GetNext();
  }
  
  viewer.popStyle();
}

function viewPhysicsShape(viewer, shape, r, g, b)
{
  switch(shape.GetType())
  {
    /*
      Box2D.Collision.Shapes.b2Shape.e_circleShape = 0;
      Box2D.Collision.Shapes.b2Shape.e_polygonShape = 1;
      Box2D.Collision.Shapes.b2Shape.e_edgeShape = 2;
      Box2D.Collision.Shapes.b2Shape.e_shapeTypeCount = 3;
    */
    case 0:
      var radius = shape.GetRadius()
        , pos = shape.GetLocalPosition();
        
      viewer.fill(r, g, b);
      viewer.arc(pos.x, pos.y, radius*2, radius*2, 0, 2*Math.PI);
      break;
    case 1:
      viewer.fill(r, g, b);
      viewer.beginShape();
      util.each(shape.GetVertices(), function(vectex, i){
        viewer.vertex(vectex.x, vectex.y);
      });
      viewer.endShape(viewer.CLOSE);
      break;
    case 2:
      viewer.stroke(r, g ,b);
      
      var vectex1 = shape.GetVertex1()
        , vectex2 = shape.GetVertex2();
        
      viewer.line(vectex1.x, vectex1.y, vectex2.x, vectex2.y);
      break;
    case 3:
    default:
      debug.warning('cannot draw this shape:'+shape.GetType());
      break;
  }
}

require('view').ProcessingView.register('PhysicsBody', {bbox:getPhysicsModelBoundingBox, draw:viewPhysicsModel, inside:physicsModelTestInside,});
require('view').ProcessingView.register('clip', {bbox:getClipModelBoundingBox, draw:viewClipModel_gen(true), inside:clipModelInside,});
require('view').HonestView.register('clip', {bbox:getClipModelBoundingBox, draw:viewClipModel_gen(false), inside:clipModelInside,});

exports.Model = Model;
exports.CircleModel = CircleModel;
exports.RectModel = RectModel;
exports.ConvexModel = ConvexModel;
exports.TextModel = TextModel;
exports.ImageModel = ImageModel;
exports.MapModel = MapModel;
exports.PhysicsModel = PhysicsModel;
exports.ClipModel = ClipModel;
exports.ProcedureModel = ProcedureModel;

}};