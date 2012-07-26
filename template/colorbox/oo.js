
__resources__["/__builtin__/oo.js"] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {

var slice = Array.prototype.slice;

var assert = require("debug").assert;

//----------------------------------
var TraitFuncs = {
  isTrait : function ()
  {
    return true;
  },
};

function checkTrait(t)
{
  assert(t.isTrait(), 
         "argument is not an valid trait!!! ");
}

var Trait = {
  _methods : {},
  _usedTraits : {},

  forbidden : {_ownerTrait: Trait},

  __proto__ : TraitFuncs
};

function compose(traits)
{
  var methods = {};
  var usedTraits = {};
  var nt = {
    _methods: methods,
    _usedTraits: usedTraits,
  };

  nt.__proto__ = TraitFuncs;

  for (var i = 0; i < traits.length; ++i)
  {
    checkTrait(traits[i]);

    var mtbl = traits[i]._methods;
    for(var mname in mtbl)
    {
      if (methods[mname] !== undefined 
          && methods[mname] !== mtbl[mname])
      {
        assert(false, "`" + mname + "' method conflicts!!!");
      }
      else
      {
        methods[mname] = mtbl[mname];
      }
    }
    usedTraits[traits[i].identifier] = traits[i];
  }

  return nt;
}

function extend (base, extendMethods)
{
  checkTrait(base);

  var methods = {};
  var usedTraits = {};
  var nt = {
    _methods: methods,
    _usedTraits: usedTraits,
  };

  nt.__proto__ = TraitFuncs;
  methods.__proto__ = base._methods;

  usedTraits[base.identifier] = base;

  for (var mname in extendMethods)
  {
    var f = extendMethods[mname];
    assert(typeof f === "function", 
           "expect function");

    methods[mname] = {
      _ownerTrait: nt,
      _func: f
    };
  }

  return nt;
}

function neg(trait)
{
  checkTrait(trait);

  if (trait._negtive)
  {
    return _negtive;
  }

  var methods = {};
  var usedTraits = {};
  var nt = {
    _methods: methods,
    _usedTraits: usedTraits,
  };

  nt.__proto__ = TraitFuncs;
  usedTraits[trait.identifier] = trait;

  var mtbl = trait._methods;
  for (var mname in mtbl)
  {
    methods[mname] = Trait.forbidden;
  }

  nt._negtive = trait;

  return nt;
}

function rename(trait, nameMap)
{
  checkTrait(trait);

  var methods = {};
  var usedTraits = {};
  var nt = {
    _methods: methods,
    _usedTraits: usedTraits,
  };

  nt.__proto__ = TraitFuncs;
  usedTraits[trait.identifier] = trait;

  var mtbl = trait._methods;
  for (var mname in mtbl)
  {
    var theName = nameMap[mname];
    theName = theName ? theName : mname;

    if (methods[theName] !== undefined 
        && methods[theName] !== mtbl[mname])
    {
      assert(false, "`" + theName + "' name conflicts!!!");
    }
    else
    {
      methods[theName] = mtbl[mname];
    }
  }

  return nt;
}

function exclude(trait, nameList)
{
  checkTrait(trait);

  var methods = {};
  var usedTraits = {};
  var nt = {
    _methods: methods,
    _usedTraits: usedTraits,
  };

  nt.__proto__ = TraitFuncs;
  usedTraits[trait.identifier] = trait;

  var mtbl = trait._methods;
  for (var mname in mtbl)
  {
    methods[mname] = mtbl[mname];
  }

  for (var i = 0; i < nameList.length; ++i)
  {
    delete methods[nameList[i]];
  }

  return nt;
}

function alias(trait, nameMap)
{
  checkTrait(trait);

  var methods = {};
  var usedTraits = {};
  var nt = {
    _methods: methods,
    _usedTraits: usedTraits,
  };

  nt.__proto__ = TraitFuncs;
  usedTraits[trait.identifier] = trait;

  var mtbl = trait._methods;
  for (var mname in mtbl)
  {
    methods[mname] = mtbl[mname];
  }
  
  for (var theName in nameMap)
  {
    var newName = nameMap[theName];
    if (methods[newName] !== undefined 
        && methods[newName] !== mtbl[theName])
    {
      assert(false, "`" + newName + "' name conflicts!!!");
    }
    else
    {
      methods[newName] = mtbl[theName];
    }
  }

  return nt;
}

function prefix(trait, prefixStr)
{
  checkTrait(trait);

  var methods = {};
  var usedTraits = {};
  var nt = {
    _methods: methods,
    _usedTraits: usedTraits,
  };

  nt.__proto__ = TraitFuncs;
  usedTraits[trait.identifier] = trait;

  var mtbl = trait._methods;
  for (var mname in mtbl)
  {
    methods[prefixStr + mname] = mtbl[mname];
  }

  return nt;
}

TraitFuncs.extend = function (extendMethods)
{
  return extend(this, extendMethods);
}

TraitFuncs.neg = function ()
{
  return neg(this);
}

TraitFuncs.rename = function (nameMap)
{
  return rename(this, nameMap);
}

TraitFuncs.exclude = function (nameList)
{
  return exclude(this, nameList);
}

TraitFuncs.alias = function (nameMap)
{
  return alias(this, nameMap);
}

TraitFuncs.prefix = function (prefixStr)
{
  return prefix(this, prefixStr);
}

//----------------------------------------------

function validMethod(m)
{
  return ((m !== undefined) && (m !== Trait.forbidden));
}

function useTraits(o, traits, extendMethods)
{
  var innerTrait = extend(compose(traits),
                          extendMethods);
  var newMtbl = {};
  var traitMethods = innerTrait._methods;
  for (var mname in traitMethods)
  {
    // 必须记住 ownerObject，是为了正确实现execProto
    var md = traitMethods[mname];
    newMtbl[mname] = {
      _func: md._func,
      _ownerTrait: md._ownerTrait,
      _ownerObject: o
    };
  }
  o._methods = newMtbl;

  for(var i = 0; i < traits.length; ++i)
  {
    o._usedTraits[traits[i].identifier] = traits[i];
  }

  o._usedTraits[innerTrait.identifier] = innerTrait;

  return o;
}

function callTraitMethod(o, md, args)
{
  // 为了实现execProto，必须要记住execProto是在哪个trait function中被调用
  var oldMd = o._currentTraitMethodDesc;
  o._currentTraitMethodDesc = md;
  //args.splice(0,0, md._ownerTrait);
  var ret = md._func.apply(o, args);
  o._currentTraitMethodDesc = oldMd;
  return ret;
}

function create(p, traits, extendMethods, custom)
{
  assert(p.isEntity(), "1st argument expect an Entity!");

  var shareStore = {};
  var usedTraits = {};

  var o = {
    _shareStore : shareStore,
    _usedTraits : usedTraits,
  };

  o.__proto__ = p;
  o._shareStore.__proto__ = p._shareStore;
  useTraits(o, traits, extendMethods);
  o._methods.__proto__ = p._methods;

  if (custom)
  {
    var customArgs = slice.call(arguments,4);
    custom.apply(o, customArgs);
  }

  return o;
}

var Entity = {
  _shareStore : {},
  _usedTraits : {},
  _methods : {},

  isEntity : function ()
  {
    return true;
  },

  proto : function()
  {
    return this.__proto__;
  },
  
  execProto: function (methodName)
  {
    var currentMd = this._currentTraitMethodDesc;
    assert(currentMd, "can't execProto outside of a trait function !!!");
    var m = currentMd._ownerObject.proto()._methods[methodName];
    assert(validMethod(m),"can not respond to `" + methodName + "' !!!");
    var args = slice.call(arguments, 1);
    return callTraitMethod(this, m, args);
  },

  exec: function (methodName)
  {
    var m = this._methods[methodName];
    assert(validMethod(m),"can not respond to `" + methodName + "' !!!");
    var args = slice.call(arguments, 1);
    return callTraitMethod(this, m, args);
  },
  
  tryExec: function (methodName)
  {
    var m = this._methods[methodName]
    if (validMethod(m))
    {
      var args = slice.call(arguments, 1)
      return callTraitMethod(this, m, args);
    }
  },

  respondsTo: function (methodName)
  {
    return validMethod(this._methods[methodName]);
  },

  create: function (traits, extendMethods, custom)
  {
    var args = slice.call(arguments, 0);
    args.splice(0,0, this);
    return create.apply(null, args);
  },
  
  slot: function(key,value)
  {
    if (undefined === value)
    {
      return this._shareStore[key];
    }
    else
    {
      this._shareStore[key] = value;
      return value;
    }
  },

  rmSlot: function (key)
  {
    delete this._shareStore[key];
  }
};

exports.Trait = Trait;
exports.compose = compose;
exports.Entity = Entity;

}};