__resources__["/mapView.js"] = {
    meta: {
        mimetype: "application/javascript"
    },
    data: function(exports, require, module, __filename, __dirname){
    
        var helper = require("helper");
        var model = require("model");
        var animate = require("animate");
        var HoverEventComponent = require('component').HoverEventComponent;
        
        var MapVO = require("voData").MapVO;
        
        /**
         * 地图类
         *
         * @param {Object}
         *            mapData 地图数据
         * @param {Object} scene
         */
        function GameMap(mapData, scene){
        
            //保存地图数据
            this.mapVO = new MapVO(mapData);
            this.scene = scene;
            this.mapImage = null;
            this.curMapNode = null;
            this.curMoveMotion = null;
            this.teleporters = {};
            
            /**
             * 加载地图数据
             *
             * @param {Object}
             *            scene 显示容器
             */
            this.loadMap = function(mapPos){
                this.mapImage = helper.loadImage("images/background/" + this.mapVO.picId + ".png");
                var imgModel = new model.ImageModel({
                    image: this.mapImage
                });
                var imgNode = scene.createNode({
                    model: imgModel
                });
                
                //计算得到地图位置
                console.log(mapPos);
                mapPos.x *= -1;
                mapPos.y *= -1;
            //    mapPos = this.transPos(mapPos);
                
                console.log(mapPos);
                // 控制地图的位置和层级，放在最下面
                imgNode.exec('translate', mapPos.x, mapPos.y, -1);
                this.scene.addNode(imgNode);
                
                // 返回地图节点
                this.curMapNode = imgNode;
                
                //加载地图上的物体
                this.loadStructures();
            }
            
            /**
             * 装载地图上的建筑物
             */
            this.loadStructures = function(){
              //转载传送点
              var teleporters = this.mapVO.teleporters;
              var telImage = helper.loadImage("images/map/teleporter.png");
              var imgModel = new model.ImageModel({
                    image: telImage
              });
                
              for(var key in teleporters){
                var tel = teleporters[key];
                var imgNode = scene.createNode({
                  model: imgModel
                });  
                imgNode.exec('translate', tel.x, tel.y, 0);
                
                tel.node = imgNode;
                this.teleporters[tel.id] = tel;
                
                this.scene.addNode(imgNode, this.curMapNode);
                
                //添加传送点的名字显示
                var nameModel = new model.TextModel({
                    text: tel.name,
                    fill: {
                        r: 0x2f,
                        g: 0x20,
                        b: 0x2f
                    },
                    height: 24,
                });
                var nameNode = scene.createNode({
                    model: nameModel
                });
                nameNode.exec('translate', 20, 0, 0);
                this.scene.addNode(nameNode, imgNode);
              }
              
              //装载其他建筑物
            }
            /**
             * 移动地图到指定位置
             *
             * @param {Object}
             *            xDist
             * @param {Object}
             *            yDist
             * @param {Object}
             *            curRoleSpeed 地图移动依赖于人物的移动速度
             */
            this.move = function(xDist, yDist, curRoleSpeed){
                // 如果地图存在
                if (!!this.curMapNode) {
                    //如果当前有motion，则需要先移出
                    this.stopMove();
                    
                    // 取得当前的节点坐标
                    var pos = this.position();
                    var target = {};
                    target.x = pos.x + xDist;
                    target.y = pos.y + yDist;
                    
                    // 判断是否移出了地图边界
            //        target = this.transPos(target);
           //         start = this.transStart(pos);
                    
                    // 移动地图
                    var dis = Math.sqrt((target.x - pos.x) * (target.x - pos.x) +
                    (target.y - pos.y) * (target.y - pos.y));
                    var timeNum = dis / curRoleSpeed * 1000;
                    // 重新添加move
                    this.curMoveMotion = new animate.MoveTo([0, {
                        x: pos.x,
                        y: pos.y
                    }, 'linear'], [timeNum, {
                        x: target.x,
                        y: target.y
                    }, 'linear']);
                    var closure = this;
                    this.curMoveMotion.onFrameEnd = function(t, dt){
                        // 如果走动完成，则移除move
                        if (closure.curMoveMotion.isDone()) {
                            console.log("timeNum : " + timeNum + ", t : " + t + ", map move stop");
                        }
                    }
                    
                    this.curMapNode.exec('addAnimation', this.curMoveMotion);
                }
            }
            
            this.checkHitTeleporter = function(point){
              var x = point.x;
              var y = point.y;
              
              for(var key in this.teleporters){
                var tel = this.teleporters[key];
                var image = this.teleporters[key].node.model().get('image');
                var p1 = {
                  x: tel.x,
                  y: tel.y + 100
                }
                
                var p2 = {
                  x: tel.x + image.width,
                  y: tel.y + image.height
                }
                
                //console.log(key +  "   " + JSON.stringify(p1) + " ," + JSON.stringify(p2) + " , {" + x + " , " + y + " }");
                if(x >= p1.x && x <= p2.x && y >= p1.y && y <= p2.y){
                  return tel.target;
                }
              }
              
              return -1;
            }
            
            /**
             * 是否正在移动
             */
            this.isMove = function(){
                return (!!this.curMoveMotion) && (!this.curMoveMotion.isDone());
            }
            
            /**
             * 停止当前的移动
             */
            this.stopMove = function(){
                if (this.isMove()) {
                    this.curMapNode.exec("removeAnimation", this.curMoveMotion.identifier);
                }
            }
            
            /**
             * 取得当前的pos坐标
             */
            this.position = function(){
                if (this.curMapNode) {
                    return this.curMapNode._component.matrix._matrix._position;
                }
                else {
                    return {
                        x: 0,
                        y: 0,
                        z: 0
                    };
                }
            }
            
            this.transPos = function(pos){
              if(pos.x > 0) {
                pos.x = 0;
              }else if(1000 - pos.x > this.mapVO.width) {
                pos.x = 1000 - this.mapVO.width;
              }
              if(pos.y > 0) {
                pos.y = 0;
              }else if (600 - pos.y > this.mapVO.height) {
                pos.y = 600 - this.mapVO.height;
              }
              
              return pos;
            }
            
        }
        
        exports.GameMap = GameMap;
    }
};
