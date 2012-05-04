__resources__["/sceneManager.js"] = {
    meta: {
        mimetype: "application/javascript"
    },
    data: function(exports, require, module, __filename, __dirname){
    
        var helper = require("helper");
        var view = require("view");
        var logic = require("logic");
        var director = require('director');
        var Level = require('level').Level;
        
        var MouseButtonEventComponent = require('component').MouseButtonEventComponent;
        
        var clientManager = require('clientManager');
        var switchManager = require('switchManager'); // 切换管理
        var mapView = require("mapView");
        var roleView = require("roleView");
        var treasureView = require("treasureView");
        
        //lwj,积分排名
        var rankView=require('rankManager');
        
        // 地图,主角,人物管理器,宝物数据
        var gameMap;
        var role;// 主角
        var rolesManager;// 场景中其他人物的管理类
        var treasureManager;
        var rankManager;//lwj 积分管理
        var speed = 150; //移动速度
        var skch = null;
        var sysInterval;
        
        /**
         * 进入场景
         *
         * @param {Object}
         *            mapData
         * @param {Object}
         *            roleData
         */
        function enterScene(mapData, roleData){
            // 跳转游戏界面
            switchManager.selectView("canvasPanel");
            if(!skch)
              skch = helper.createSketchpad(1000, 600, document.getElementById("canvasPanel"));
            
            var logicObj = new logic.Logic();
            var scene = logicObj.getScene();
            
            // 加载地图
            gameMap = new mapView.GameMap(mapData, scene);
            gameMap.loadMap({x:roleData.x-500, y:roleData.y-300});
            
            // 加载主角
            role = new roleView.Role(roleData, scene, gameMap, speed);
            role.loadRole("stand");
            // 生成场景中其他角色的管理类
            rolesManager = new roleView.RoleManager(scene, gameMap.curMapNode);
            // 加载宝物管理类
            treasureManager = new treasureView.TreasureManager(scene, gameMap.curMapNode);
            
            //lwj加载积分排名
//            rankManager=new rankView.refreshView(rankListData);
            
            
            // treasureManager.showTreasures({1001:{
            // id: 1001,
            // imgId: "001",
            // posX: 1000,
            // posY: 400
            // },44:{
            // id: 44,
            // imgId: "44",
            // posX: 1268,
            // posY: 477
            // },48:{
            // id: 48,
            // imgId: "48",
            // posX: 1830,
            // posY: 461
            // }});
            
            var gd = initColorBox(logicObj, scene, gameMap);
            
            var time = Date.now();
            function loop(){
                var next = Date.now();
                gd.step(Date.now(), next - time);
                time = next;
                // // 判断是否有角色移动完成，地图正在移动的情形，停止移动
                if (gameMap.isMove() && (!role.isMove())) {
                    //console.log("地图移动未完成!!");
                    gameMap.stopMove();
                }
            }
            setInterval(loop, 100);
        }
        
        /**
         * 控制地图和人物的移动
         */
        function move(evt){
            if (evt.type == "mouseClicked") {
                // 计算鼠标点击的相对点
                var relX = evt.mouseX - role.parentPosition().x;
                var relY = evt.mouseY - role.parentPosition().y;
                // 先检查鼠标是否点击到宝物上
                var pointsHits = treasureManager.checkHitPointTreasureIds({
                    x: relX,
                    y: relY
                });
                // 检测是否有宝物和人物相交,如果相交，则捡宝不走动，如果不相交，则走动
                var treasureHits = treasureManager.checkHitTreasureIds(role, pointsHits);
                
                if (pointsHits.length && treasureHits.length) {
                    for (var i = 0; i < treasureHits.length; i++) {
                        // 捡宝,发送到后台
                        clientManager.pickTreasure(treasureHits[i]);
                    }
                }else {
                    // 获取角色的移动距离
                    var xDist = relX - role.position().x;
                    var yDist = relY - role.position().y;
                    // 移动人物
                    var time = role.move(xDist, yDist);
					//调用后台的move接口
					clientManager.move(role.position().x,role.position().y,relX,relY,time);
                    // 计算地图的对称移动目标,地图反方向移动
                    gameMap.move(-xDist, -yDist, role.getSpeed());
                }
            }
        }
        
        /**
         * 角色管理类
         */
        function getRolesManager(){
            return rolesManager;
        }
        
        /**
         * 宝物管理类
         */
        function getTreasureManager(){
            return treasureManager;
        }
        /**
         * lwj 积分排名类
         */
        function getRankManager(){
        	return rankManager;
        }
        
        function changeArea(mapData){
          var roleData = pomelo.userData;
          roleData.x = 200;
          roleData.y = 200;
          
          var logicObj = new logic.Logic();
          var scene = logicObj.getScene();
            
          // 加载地图
          gameMap = new mapView.GameMap(mapData, scene);
          gameMap.loadMap({x:roleData.x - 500, y:roleData.y - 300});
          
          // 加载主角
          role = new roleView.Role(roleData, scene, gameMap, speed);
          role.loadRole("stand");
          // 生成场景中其他角色的管理类
          rolesManager = new roleView.RoleManager(scene, gameMap.curMapNode);
          // 加载宝物管理类
          treasureManager = new treasureView.TreasureManager(scene, gameMap.curMapNode);
          
          initColorBox(logicObj, scene, gameMap);
        }
        
        function initColorBox(logicObj, scene, gameMap){
            //clearInterval(sysInterval);
          // create a view instance
            var gv = new view.HonestView(skch);
            //未加载的图片不显示
            gv.showUnloadedImage(false);
            var gd = director.director({
                view: gv
            });
            var gLevel = new Level({
                logic: logicObj
            });
            gd.setLevel(gLevel);
            //sysInterval = setInterval(loop, 100);
            
            // 添加地图点击事件
            var clickComponent = new MouseButtonEventComponent({
                pipe: gLevel.sysPipe(),
                decider: scene.queryDecider('mouseButtonDecider'),
                callback: move
            });
            
            gameMap.curMapNode.addComponent('mouseButtonEventComponent', clickComponent);
            
            return gd;
        }
        
        exports.enterScene = enterScene;
        exports.getRolesManager = getRolesManager;
        exports.getTreasureManager = getTreasureManager;
        exports.changeArea = changeArea;
    }
};
