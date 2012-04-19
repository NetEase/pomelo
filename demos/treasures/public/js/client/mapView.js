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
            
            /**
             * 加载地图数据
             *
             * @param {Object}
             *            scene 显示容器
             */
            this.loadMap = function(){
                this.mapImage = helper.loadImage("images/background" + this.mapVO.picId + ".png");
                var imgModel = new model.ImageModel({
                    image: this.mapImage
                });
                var imgNode = scene.createNode({
                    model: imgModel
                });
                // 控制地图的位置和层级，放在最下面
                imgNode.exec('translate', -this.mapVO.startX, -this.mapVO.startY, -1);
                this.scene.addNode(imgNode);
                
                // 返回地图节点
                this.curMapNode = imgNode;
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
                    var targetX = pos.x + xDist;
                    var targetY = pos.y + yDist;
                    
                    // 判断是否移出了地图边界
                    if (targetX > 0) {
                        targetX = 0;
                    }
                    else 
                        if (1000 - targetX > this.mapImage.width) {
                            targetX = 1000 - this.mapImage.width;
                        }
                    if (targetY > 0) {
                        targetY = 0;
                    }
                    else 
                        if (600 - targetY > this.mapImage.height) {
                            targetY = 600 - this.mapImage.height;
                        }
                    
                    // 移动地图
                    var dis = Math.sqrt((targetX - pos.x) * (targetX - pos.x) +
                    (targetY - pos.y) * (targetY - pos.y));
                    var timeNum = dis / curRoleSpeed * 1000;
                    // 重新添加move
                    this.curMoveMotion = new animate.MoveTo([0, {
                        x: pos.x,
                        y: pos.y
                    }, 'linear'], [timeNum, {
                        x: targetX,
                        y: targetY
                    }, 'linear']);
                    this.curMapNode.exec('addAnimation', this.curMoveMotion);
                }
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
        }
        
        exports.GameMap = GameMap;
    }
};
