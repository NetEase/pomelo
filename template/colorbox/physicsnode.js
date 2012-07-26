
__resources__["/__builtin__/physicsnode.js"] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {
var TreeNode = require('node').TreeNode
  , Node = require('node').Node
  , Component = require('node').Component
  , b2World = require('Box2dWeb-2.1.a.3').b2World
  , b2Vec2 = require('Box2dWeb-2.1.a.3').b2Vec2
  , geo = require('geometry')
  , debug = require('debug')


var PhysicsWorldComponent = Component.extend({
  init:function(param)
  {
    PhysicsWorldComponent.superClass.init.call(this, param);
    
    debug.assert(param.world, 'param error');
    
    this._world = param.world;
    this._velocityIterations = param.velocityIterations == undefined ? 5 : param.velocityIterations;
    this._positionIterations = param.positionIterations == undefined ? 5 : param.positionIterations;
  },
  
  update:function(t, dt)
  {
    this._world.Step(dt/1000, this._velocityIterations, this._positionIterations);
    this._world.ClearForces();
  },
  
  abilities:function()
  {
    return ['getWorld'];
  },
  
  getWorld:function()
  {
    return this._world;
  },
});

//FIXME: physicsmodel's node should set by itself
var PhysicsBodyComponent = Component.extend({
  init:function(param)
  {
    PhysicsBodyComponent.superClass.init.call(this, param);
    this._body = param.body;
  },
  
  update:function(t, dt)
  {
    //nothing to do
  },
  
  abilities:function()
  {
    return ['getBody', 'matrix']
  },
  
  getBody:function()
  {
    return this._body;
  },
  
  matrix:function(node)
  {
    var matrix = node.matrix();
    var position = this._body.GetPosition();
    //var center = this._body.GetLocalCenter();
    var angle = this._body.GetAngle();
    
    matrix = geo.affineTransformTranslate(matrix, position.x, position.y, position.z);
    
    matrix = geo.affineTransformRotate(matrix, angle);

    /*
    if (!geo.pointEqualToPoint(center, geo.ccp(0, 0)))
      matrix = geo.affineTransformTranslate(matrix, -center.x, -center.y);
   */
    return matrix;
  },
});

exports.PhysicsWorldComponent = PhysicsWorldComponent;
exports.PhysicsBodyComponent = PhysicsBodyComponent;

}};