
__resources__["/main.js"] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {

var h = require("helper");
var v = require("view");
var l = require("logic");
var m = require("model");
var ani = require("animate");
var director = require('director');
var Level = require('level').Level;
var HoverEventComponent = require('component').HoverEventComponent;
var FrameSeqComponent = require('component').FrameSeqComponent;

function main()
{
  var skch = h.createSketchpad(480,360);

  var gl = new l.Logic();
  var gs = gl.getScene();

  var cm = new m.CircleModel({
    radius:50, 
    fill: {r:255, g:0, b:0, a: 255},
    ratioAnchorPoint: {x: 0, y:0}
  });

  var n = gs.createNode({
    model:cm
  });

  var img = h.loadImage("images/bird.png");

  var clipAni = new FrameSeqComponent({
    image:img,
    interval:100,
    times:Infinity,
    w:40,
    h:40,
    startX:0,
    startY:0,
    HSpan:40,
    VSpan:40,
  });
  
  var clipM = clipAni.getModel();

  var clipn = gs.createNode({
    model:clipM
  });

  clipn.addComponent("frame", clipAni);


  var ma = new ani.MoveTo(
    [0, {x:200, y:200}, 'linear'],
    [2 * 30 * 10, {x:400, y:400}, 'sine'],
    [5 * 30 * 10, {x:200, y:200}]);

  var sa = new ani.ScaleTo(
    [0, {x:1, y:1}, 'linear'],
    [3000, {x:2, y:2}, 'sine'],
    [4000, {x:1, y:1}, 'sine']);

  var pa = new ani.ParallelAnimation({
    animations:[ma,sa]
  });
  var motion = new ani.LoopAnimation({
    animation:pa
  });
  
  //n.translate(400,400);
  n.exec('addAnimation', motion);

  //------------------------------------
  var bm = new m.ConvexModel({
    vertexes: [{x:0, y: 0}, {x:0,y:200}, {x: 200, y:200}, {x:300, y:100}, {x:200, y:0} ],
    fill: {r:0, g:0, b:255, a: 70},
    ratioAnchorPoint:{x:0, y:0}
  });
  var n2 = gs.createNode({model:bm});

  var ra = new ani.RotateTo(
    [0, 0, 'linear'],
    [2000, 3* Math.PI, 'sine'],
    [3000, -8*Math.PI]);
  var raloop = new ani.LoopAnimation({
    animation:ra
  });
  n2.exec('addAnimation', raloop);

  var tm = new m.TextModel({
    text: "游戏颜料盒",
    fill: {r:255, g:0, b:0},
    height: 64,
    ratioAnchorPoint: {x:0.5, y:0.5}
  });
  var n3 = gs.createNode({
    model: tm
  });
  //n3.translate(350,250, 15);
  var tra = new ani.RotateTo(
    [0, 0, 'linear'],
    [10000, 2 * Math.PI, 'linear']);

  var traloop3 = new ani.LoopAnimation({
    animation:tra
  });

  n3.exec("addAnimation", traloop3);

  //---------------------------------
  var mm = new m.MapModel({
    resource: "map/largebarrier.xml"
  });
  var map = mm.get("map");

  var mnode = gs.createNode({model:mm});

  var mapMove = new ani.LoopAnimation({
    animation: new ani.MoveTo(
      [0, {x:-500, y:0}, 'linear'],
      [2000, {x:500, y:0}, 'sine'],
      [4000, {x:-500, y:0}]),
  });
  mnode.exec("addAnimation", mapMove);

  var img = h.loadImage("images/colorbox.jpg");
  var imgM = new m.ImageModel({
    image:img
  });
  
  var imgNode= gs.createNode({model:imgM});
  imgNode.exec('translate', 0,0,1000);
  
  gs.addNode(n);
  gs.addNode(n2,n);
  gs.addNode(mnode);
  gs.addNode(n3,n);
  //gs.addNode(imgNode);
  gs.addNode(clipn);
  
  n.exec('applyTranslate', 0,0,15);
  n2.exec('applyTranslate', 0,0,0);
  n3.exec('applyTranslate', 0,0,-2);

  // create a view instance
  var gv = new v.HonestView(skch);

  var gd = director.director({view: gv});
  var gLevel = new Level({logic:gl});
  gd.setLevel(gLevel); 

  //----------------------
  var callbackf1 = function(evt,node)
  {
    if (evt.type == 'mouseOver')
    {
      node.model().fill = {r:255, g:0, b:0, a:100};
    }
    else if (evt.type == 'mouseOut')
    {
      node.model().fill = {r:0, g:255, b:0, a:100};
    }
    else
    {
      debugger;
    }
  }

  var callbackf2 = function(evt,node)
  {
    if (evt.type == 'mouseOver')
    {
      node.model().fill = {r:255, g:255, b:255, a:100};
    }
    else if (evt.type == 'mouseOut')
    {
      node.model().fill = {r:255, g:255, b:0, a:100};
    }
    else
    {
      debugger;
    }
  }

  var hoverComponent1 = 
    new HoverEventComponent({
      view: gv,
      host:n, 
      pipe: gLevel.sysPipe(), 
      decider: gs.queryDecider('hoverDecider'), 
      callback:callbackf1
    });

  var hoverComponent2 = 
    new HoverEventComponent({
      view: gv,
      host:n2,
      pipe: gLevel.sysPipe(), 
      decider: gs.queryDecider('hoverDecider'), 
      callback:callbackf2
    });

  n.addComponent('hoverEventComponent', hoverComponent1);
  n2.addComponent('hoverEventComponent', hoverComponent2);
  

  //---------------------------

  function prepare()
  {
    return map.isReady();
  }
  
  var gclock = 0;
  function loop()
  {
    ++gclock;
    gd.step(gclock, 10);
    //console.log("loop:" + gclock);
  }

  startLoop(prepare, loop, 33);
}

function startLoop(prepare, loop, cycle)
{
  var ready = function ()
  {
    if (prepare())
    {
      setInterval(loop, cycle);
    }
    else
    {
      setTimeout(ready, 1000);
    }
  }
  
  setTimeout(ready, 1000);
}

exports.main = main;

}};