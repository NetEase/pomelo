
__resources__["/__builtin__/node.js"] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {
var BObject = require("base").BObject
  , util = require("util")
  , debug = require("debug")
  , geo = require('geometry')
  , Model = require('model').Model
  , MessageComponent = require('component').MessageComponent
  , EventHandleComponent = require('component').EventHandleComponent
  , HoverEventComponent = require('component').HoverEventComponent
  , MouseButtonEventComponent = require('component').MouseButtonEventComponent
  , KeyEventComponent = require('component').KeyEventComponent
  , MatrixComponent = require('component').MatrixComponent
  , AnimatorComponent = require('component').AnimatorComponent

var Node = BObject.extend({
  init: function(param)
  {
    Node.superClass.init.call(this, param);
    
    param = param || {};
    
    if (param.scene)
      this._scene = param.scene;
    
    this._timeStamp = require('director').timeStamp;

    this._model = param.model;
    
    this._type = param.type;
    this._component = {};
    this._componentsAbilities = {};
    
    this.addComponent('matrix', new MatrixComponent());
    this.addComponent('animator', new AnimatorComponent());
   
    if (param.components)
      param.components.forEach(function(component)
                               {
                                 this.addComponent(component.type, component.component);
                               },
                               this);
  },

  type:function()
  {
    return this._type;
  },
  
  queryNodes: function(type, ret)
  {
    if (type == this.type)
      ret.push(this);
  
    this.children().forEach(function(child)
                            {
                              child.queryNodes(type, ret);
                            });
    return ret;
  },
  
  update: function(t, dt)
  {
    this.evalComponent(t, dt);
  },
  
  addComponent: function(type, component)
  {
    var componentAbilities
      , bExistedAbility = false
      , self = this
    
    if (this._component[type])
    {
      debug.error("add same type component again");
      return;
    }
    
    this._component[type] = component;
    componentAbilities = component.abilities();
    
    util.each(componentAbilities, function(ability, i){
      if (self._componentsAbilities[ability])
      {
        //FIXME: ability conflict
        debug.error("ability conflict");
      }

      self._componentsAbilities[ability] = component;
    });
  },
  
  removeComponent: function(type)
  {
    var component = this._component[type]
    , componentAbilities = component.abilities()
    , self = this
    
    util.each(componentAbilities, function(ability, i){
      delete self._componentsAbilities[ability];
    });
    
    delete this._component[type];
  },
  
  hasComponent:function(type)
  {
    return !!this._component[type];
  },
  
  evalComponent: function(t, dt)
  {
    var key,component;
    
    for (key in this._component)
    {
      this._component[key].update(this, t, dt);
    }
  },
  
  exec:function(command, i, j , k ,l, m, o)
  {
    // var args = [], i;
    // for (i=1; i<arguments.length; i++)
    // {
    //   args.push(arguments[i]); 
    // }
    
    if (this._componentsAbilities[command])
    {
      return this._componentsAbilities[command][command](this, i, j, k, l, m, o);
    }
    else if (this[command] && typeof(this[command]) === 'function')
    {
      return this[command].apply(this, args);
    }
    else
    {
      debug.warning('cannot exec command:'+command);
    }
  },
  
  model:function()
  {
    return this._model;
  },

  setModel:function(model)
  {
    var oldOne = this._model;
    this._model = model;
    return oldOne;
  },
  
  getScene:function()
  {
    if (this._scene)
      return this._scene;
  },

  setScene:function(scene)
  {
    this._scene = scene;
  },

  onEntered:function()
  {
  },
  
  onExit:function()
  {
  },
});

/*
** maintain tree data structure
*/
var TreeNode = Node.extend({
  init:function(param)
  {
    TreeNode.superClass.init.call(this, param);
    
    //tree
    this._parent = null;
    this._children = [];
  },
  
  parent:function()
  {
    return this._parent;
  },
  
  children:function()
  {
    return this._children;
  },

  getScene:function()
  {
    var scene = TreeNode.superClass.getScene.call(this);
    if (scene)
      return scene;

    if (this._parent)
      return this._parent.getScene();
  },

  //call after inserted into tree
  onEntered:function()
  {
  },
  
  //call before removed from tree
  onExit:function()
  {
  },
  
  appendChild: function(child)
  {
    if (child._parent)
    {
      child._parent.removeChild(child);  
    }
    
    this._children.push(child);
    child._parent = this;
    
    child.exec("setMatrixDep", this);
    
    child.onEntered();
  },
  
  removeChild: function(child)
  {
    var idx = -1;
    this._children.some(function(node, index, arr)
                        {
                          if (idx == -1 && node == child)
                          {
                            idx = index;
                            return true;
                          }
                          else
                            return false;
                        });
    if (idx == -1 || idx == this._children.length)
    {
      debug.log("this cannot remove the child, the child'a parent is not parent");
      return;
    }
    
    this.onExit();
    
    child._parent = null;
    this._children.splice(idx, 1);
    
    child.exec("setMatrixDep", null);
  },
  
  traverse: function(f)
  {
    var children = this.children();
    f(this);
    
    util.each(children,
              function(child, i)
              {
                child.traverse(f);
              });
  },

  serializeChildren:function(arr, filter)
  {
    if (!filter)
    {
      this.traverse(function (n)
                    {
                      arr.push(n);
                    });
    }
    else
    {
      this.traverse(function (n)
                    {
                      if (filter(n))
                        arr.push(n);
                    });
      
    }
    return arr;
  },
  
  // update:function(t, dt)
  // {
  //   TreeNode.superClass.update.call(this, t, dt);

  //   this._children.forEach(function(child)
  //                          {
  //                            child.update(t, dt);
  //                          });
  // },
});

exports.Node = Node;
exports.TreeNode = TreeNode;

}};