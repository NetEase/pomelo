
__resources__["/__builtin__/logic.js"] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {
var util = require("util")
  , debug = require("debug")
  , pipe = require('pipe')
  , BObject = require("base").BObject
  , Scene = require('scene').TreeScene;

var Logic = BObject.extend({
  init:function(param)
  {
    Logic.superClass.init.call(this, param);
    
    this._scene = new Scene();
  },
  
  active: function(director)
  {
    if (this._scene)
      this._scene.active(director);
    this._director = director;
  },
  
  deactive: function()
  {
    if (this._scene)
      this._scene.deactive();
    delete this._director;
  },
  
  step: function(t, dt)
  {
    if (this._scene)
      this._scene.step(t, dt);
  },
  
  setScene:function(logic)
  {
    this._scene = _scene;
  },

  getScene: function (logic)
  {
    return this._scene;
  }
});

exports.Logic = Logic;

}};