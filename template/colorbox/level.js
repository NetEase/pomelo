
__resources__["/__builtin__/level.js"] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {
var util = require("util")
  , debug = require("debug")
  , pipe = require('pipe')
  , BObject = require("base").BObject
  , TimeStamper = require("director").TimeStamper;

var Level = BObject.extend({
  init:function(param)
  {
    Level.superClass.init.call(this, param);
  
    this._timeStamper = new TimeStamper();
    this._sysPipe = pipe.createSwitcher();;

    if (param && param.logic)
      this._logic = param.logic;
  },
  
  active: function(director)
  {
    this._sourcePipe = pipe.createEventTrigger(this._timeStamper);
    pipe.switchSource(this._sysPipe, this._sourcePipe);
    if (this._logic)
      this._logic.active(this);
  },
  
  deactive: function()
  {
    if (this._logic)
      this._logic.deactive();
  },
  
  step: function(t, dt)
  {
    this._timeStamper.stepForward(dt);
    if (this._logic)
      this._logic.step(t, dt);
  },
  
  setLogic:function(logic)
  {
    if (this._logic === logic)
      return;
    
    if (this._logic)
      this._logic.deactive();

    this._logic = logic;
    if (this._logic)
      this._logic.active(this);
  },

  logic: function()
  {
    return this._logic;
  },

  sysPipe:function()
  {
    return this._sysPipe;
  },
  
  sourcePipe:function()
  {
    return this._sourcePipe;    
  },
});

exports.Level = Level;

}};