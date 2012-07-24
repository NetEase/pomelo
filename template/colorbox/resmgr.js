
__resources__["/__builtin__/resmgr.js"] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {
var h = require("helper");
var BObject = require("base").BObject;
var createAudio = require("helper").createAudio;

var ResMgr = BObject.extend({
  init:function(param)
  {
    ResMgr.superClass.init.call(this, param);
    
    this._res = {};
    
    this._resNum = 0;
    this._loadedNum = 0;
  },

  _genResOnloadCB:function(mgr, name)
  {
    return function()
    {
      if (mgr._res[name])
        mgr._loadedNum ++;
    }
  },

  loadImage:function(img)
  {
    var res = this._res[img];

    if (res)
      return res;

    //FIXME:when img load failed??
    this._res[img] = h.loadImage(img, undefined, this._genResOnloadCB(this, img));
    this._resNum ++;

    return this._res[img];
  },

  removeRes:function(name)
  {
    if (this._res[name])
    {
      this._resNum --;
      if (this._res[name].loaded)
        this._loadedNum --;

      delete this._res[name];
      return true;
    }

    return false;
  },

  queryRes:function(name)
  {
    return this._res[name];
  },

  isCompelete:function()
  {
    return this._resNum <= this._loadedNum;
  },

  percent:function()
  {
    return this._loadedNum / this._resNum;
  },
});

exports.ResMgr = ResMgr;

}};