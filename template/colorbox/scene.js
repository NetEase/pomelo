
__resources__["/__builtin__/scene.js"] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {
var util = require("util")
  , debug = require("debug")
  , TreeNode = require("node").TreeNode
  , BObject = require("base").BObject
  , Model = require('model').Model
  , pipe = require('pipe')
  , TimeStamper = require('director').TimeStamper
  , geo = require('geometry')

var Scene = BObject.extend({
  init:function(param)
  {
    Scene.superClass.init.call(this, param);

    this._timeStamper = new TimeStamper();
    this._pipe = pipe.createEventTrigger(this._timeStamper);
    
    this._deciders = {};
  },

  addNode:function()
  {
    debug.error('cannot be here');
  },
  
  pipe:function()
  {
    return this._pipe;
  },
  
  active: function(logic)
  {
    pipe.triggerEvent(this._pipe, {eventType:'active'});
  },
  
  deactive: function()
  {
    pipe.triggerEvent(this._pipe, {eventType:'deactive'});
  },
  
  step: function(t, dt)
  {
    this.doStep(t,dt);
    
    this.decideEvents();
  },
  
  filt:function(filter)
  {
    debug.error('cannot be here');
  },

  decideEvents:function()
  {
    var type;

    for (type in this._deciders)
    {
      if (!this._deciders.hasOwnProperty(type))
        continue;

      this._deciders[type].decideEvent();
    }
  },

  registerDecider:function(type, decider)
  {
    this._deciders[type] = decider;
  },

  removeDecider:function(type)
  {
    delete this._deciders[type];
  },

  queryDecider:function(type)
  {
    return this._deciders[type];
  },
});

var TreeScene = Scene.extend({
  init:function(param)
  {
    TreeScene.superClass.init.call(this, param);
    
    this._root = new TreeNode({scene:this});
    this._filtChildren = [];
    this._filtChildrenDirty = true;
    this._filtPara = undefined;

    this.registerDecider('hoverDecider', new HoverEventDecider());
    this.registerDecider('mouseButtonDecider', new MouseButtonEventDecider());
    this.registerDecider('keyDecider', new KeyEventDecider());
    this.registerDecider('commonEventDecider', new CommonEventDecider());
  },

  doStep: function (t, dt)
  {
    this._timeStamper.stepForward(dt);
    
    this._root.traverse(function (node) 
                        { 
                          node.update(t,dt); 
                        });
  },
  
  addNode:function(node, path)
  {
    if (path === undefined)
    {
      this._root.appendChild(node);
    }
    else
    {
      path.appendChild(node);
    }
    
    this._filtChildrenDirty = true;
  },
  
  createNode:function(param)
  {
    return new TreeNode(param);
  },

  removeNode:function(node)
  {
    if (node.parent())
      return node.parent().removeChild(node);
    // else
    // {
    //   this._root.setScene(undefined);
    //   this._root = new TreeNode({scene:this});
    // }
  },
  
  // contianer must have push method
  filt:function(container, filter)
  {
    return this._root.serializeChildren(container, filter);
  },
});


var cmpZ = function (n1, n2)
{
  var m1 = n1.exec("matrix");
  var m2 = n2.exec("matrix");
  return m1.tz - m2.tz;
}

//resolve the events which nodes do not know how to dispatch
var Decider = BObject.extend({
  init:function(param)
  {
    Decider.superClass.init.call(this, param);

    //hashmap<id, {event, waiters}>
    //waiters--> [{node,pipe}...]
    this._waiters = {};
    this._cmpOrder = (param && param.cmpOrder) ? param.cmpOrder : cmpZ;
  },

  setCmpOrder: function (cmp)
  {
    var oldcmp = this._cmpOrder;
    
    this._cmpOrder = cmp;

    return oldcmp;
  },

  decide:function(node, event, destPipe)
  {
    //FIXME: how to distinguish events
    var evtId = event.identifier;
    if (!this._waiters[evtId])
      this._waiters[evtId] = {event:event, waiters:[]};

    this._waiters[evtId].waiters.push({node:node, pipe:destPipe});
  },

  decideEvent:function()
  {
    var evtId, waiter;

    for (evtId in this._waiters)
    {
      if (!this._waiters.hasOwnProperty(evtId))
        continue;

      waiter = this._waiters[evtId];
      this.doDecideEvent(waiter.event, waiter.waiters);

      delete this._waiters[evtId];
    }
  },

  doDecideEvent:function(evt, dests)
  {
    debug.assert('cannot be here:decideEvent is base');
  },

  view:function()
  {
    if (this._view)
      return this._view;

    this._view = require('director').director().defaultView();

    return this._view;
  },
});

var hitTest = function(view, pos, node)
{
  var matrix = geo.affineTransformInvert(node.exec('matrix'));
  var newpos = geo.pointApplyAffineTransform({x:pos.x, y:pos.y}, matrix);

  //FIXME:test node._model
  return view.inside(node.model(), newpos);
}

var calcHitNode = function(view, pos, waiters,cmp)
{
  var sortedWaiters = waiters.sort(function(q1,q2){
    return cmp(q1.node, q2.node);
  });

  var hitOne;

  for(var i = sortedWaiters.length - 1; i >= 0; --i)
  {
    if (hitTest(view, pos, sortedWaiters[i].node))
    {
      hitOne = sortedWaiters[i];
      break
    }
  }

  return hitOne;
}

var HoverEventDecider = Decider.extend({
  init:function(param)
  {
    HoverEventDecider.superClass.init.call(this, param);
    this._activeNode = undefined;
    this._activePipe = undefined;
  },

  doDecideEvent:function(evt, waiters)
  {
    debug.assert(evt.type == 'mouseMoved', 'hovereventDecider receive unknown evtType:'+evt.type);
    
    var waiter = calcHitNode(this.view(), {x:evt.mouseX, y:evt.mouseY}, waiters, this._cmpOrder);
    var targetNode = waiter ? waiter.node : undefined;

    //check mouseout
    if (this._activeNode && targetNode !== this._activeNode)
    {
      var newEvt = util.copy(evt);
      newEvt.type = 'mouseOut';

      pipe.triggerEvent(this._activePipe, newEvt);

      this._activeNode = undefined;
      this._activePipe = undefined;
    }

    //check mouseover
    if (targetNode && targetNode !== this._activeNode)
    {
      this._activeNode = waiter.node;
      this._activePipe = waiter.pipe;

      var newEvt = util.copy(evt);
      newEvt.type = 'mouseOver';

      pipe.triggerEvent(this._activePipe, newEvt);
    }
  },
});

var shakeSpan = 10;

var MouseButtonEventDecider = Decider.extend({
  init:function(param)
  {
    MouseButtonEventDecider.superClass.init.call(this, param);
    
    this._pressedWaiter = undefined;
    this._pressedEvent = undefined;
    this._hasPendDragEvt = false;
    this._dragTriggered = false;
  },

  doDecideEvent:function(evt, waiters)
  {
    debug.assert(evt.type == 'mouseClicked' || evt.type == 'mousePressed' ||
                 evt.type == 'mouseReleased' || evt.type == 'mouseDragged',
                 'I cannot decide event type:'+evt.type);

    switch (evt.type)
    {
    case 'mousePressed':
      if (this._pressedWaiter)
      {
        var evt1 = util.copy(this._pressedEvent);

        if (this._hasPendDragEvt)
        {
          evt1.type = 'mouseClicked';
          pipe.triggerEvent(this._pressedWaiter.pipe, evt1);

          debug.assert(!this._dragTriggered, 'mouseButtonDecider:logical error');
          this._hasPendDragEvt = false;
          this._dragTriggered = false;
        }

        evt1.type = 'mouseReleased';
        pipe.triggerEvent(this._pressedWaiter.pipe, evt1);
        this._pressedWaiter = undefined;
        this._pressedEvent = undefined;
      }

      var waiter = calcHitNode(this.view(), {x:evt.mouseX, y:evt.mouseY}, waiters, this._cmpOrder);

      if (waiter)
      {
        this._pressedWaiter = waiter;
        this._pressedEvent = evt;

        pipe.triggerEvent(this._pressedWaiter.pipe, evt);
      }
      break;

    case 'mouseReleased':
      if (this._pressedWaiter)
      {
        debug.assert(this._pressedEvent, 'logical error!');
        
        if (this._hasPendDragEvt)
        {
          var clickevt = util.copy(this._pressedEvent);
          clickevt.type = 'mouseClicked';

          pipe.triggerEvent(this._pressedWaiter.pipe, clickevt);
          this._hasPendDragEvt = false;
        }

        pipe.triggerEvent(this._pressedWaiter.pipe, evt);

        this._pressedWaiter = undefined;
        this._pressedEvent = undefined;
        this._dragTriggered = false;
      }
      break;

    case 'mouseClicked':
      if (this._pressedWaiter)
        pipe.triggerEvent(this._pressedWaiter.pipe, evt);
      break;

    case 'mouseDragged':
      if (this._pressedWaiter)
      {
        if (this._dragTriggered)
        {
          pipe.triggerEvent(this._pressedWaiter.pipe, evt);
          break;
        }

        this._hasPendDragEvt = true;

        if (!this.testShake(this._pressedEvent, evt))
        {
          this._hasPendDragEvt = false;
          this._dragTriggered = true;
          pipe.triggerEvent(this._pressedWaiter.pipe, evt);
        }
      }

      break;

    default:
      debug.assert(false, 'cannot be here!');
      break;
    }
  },

  testShake:function(evtPressed, evtDragged)
  {
    var distX = evtDragged.mouseX - evtPressed.mouseX;
    var distY = evtDragged.mouseY - evtPressed.mouseY;
    return (distX * distX + distY * distY) < shakeSpan * shakeSpan;
  },
});

var KeyEventDecider = Decider.extend({
  init:function(param)
  {
    KeyEventDecider.superClass.init.call(this, param);
  },

  doDecideEvent:function(evt, waiters)
  {
    debug.assert(evt.type == 'keyPressed' || evt.type == 'keyReleased', 
                 'I cannot decide event type:'+evt.type);

    var i, waiter;

    for (i=0; i<waiters.length; i++)
    {
      waiter = waiters[i];

      pipe.triggerEvent(waiter.pipe, evt);
    }
  },
});

var CommonEventDecider = Decider.extend({
  init:function(param)
  {
    CommonEventDecider.superClass.init.call(this, param);
  },

  doDecideEvent:function(evt, waiters)
  {
    var i, waiter;

    for (i=0; i<waiters.length; i++)
    {
      waiter = waiters[i];

      pipe.triggerEvent(waiter.pipe, evt);
    }
  },
});

exports.TreeScene = TreeScene;

}};