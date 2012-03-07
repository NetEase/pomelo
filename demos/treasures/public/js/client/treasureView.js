__resources__["/treasureView.js"] = {
    meta: {
        mimetype: "application/javascript"
    },
    data: function(exports, require, module, __filename, __dirname){
    
        var helper = require("helper");
        var model = require("model");
        
        var TreasureVO = require("voData").TreasureVO;
        
        /**
         * 宝物管理类
         */
        function TreasureManager(scene, mapParent){
        
            this.scene = scene;
            // 宝物显示的parent节点
            this.mapParent = mapParent;
            // 宝物显示节点: {id:ImageNode}
            this.treasureNodeMap = {};
            // 宝物数据: {id:TreasureVO}
            this.treasureVOs = {};
            /**
             * 地图中显示宝物
             *
             * @param {Object}
             *            dataMap
             */
            this.showTreasures = function(dataMap){
                // 先删除所有宝物数据
                this.removeAllTreasures();
                
                // 显示新宝物列表
                for (var id in dataMap) {
                    if (!!id) {
                        var vo = new TreasureVO(dataMap[id]);
                        // 保存数据
                        this.treasureVOs[vo.id] = vo;
                        // 显示数据
                        var img = helper.loadImage("images/treasures/" + vo.picId +
                        ".png");
                        var imgModel = new model.ImageModel({
                            image: img
                        });
                        var imgNode = scene.createNode({
                            model: imgModel
                        });
                        // 控制宝物的位置
                        imgNode.exec('translate', vo.x, vo.y, 0);
                        this.scene.addNode(imgNode, this.mapParent);
                        // 保存节点，用于删除
                        this.treasureNodeMap[vo.id] = imgNode;
                        
                        //添加宝物的名字显示
                        var nameModel = new model.TextModel({
                            text: vo.name + "(" + vo.score + ")",
                            fill: {
                                r: 0xff,
                                g: 0xc0,
                                b: 0xc0
                            },
                            height: 12,
                        });
                        var nameNode = scene.createNode({
                            model: nameModel
                        });
                        this.scene.addNode(nameNode, imgNode);
                        //nameNode.exec('translate', 0, -6, 0);
                    }
                }
            }
            
            /**
             * 删除所有宝物
             */
            this.removeAllTreasures = function(){
                for (id in this.treasureNodeMap) {
                    this.removeTreasure(id);
                }
            }
            
            /**
             * 删除地图中显示的宝物
             *
             * @param {Object}
             *            id
             */
            this.removeTreasure = function(id){
                var value = this.treasureNodeMap[id];
                if (value) {
                    this.mapParent.removeChild(value);
                    this.treasureNodeMap[id] = null;
                    delete this.treasureNodeMap[id];
                    this.treasureVOs[id] = null;
                    delete this.treasureVOs[id];
                }
            }
            
            /**
             * 检查所有宝物是否和点相交
             *
             * @param {Object}
             *            point
             */
            this.checkHitPointTreasureIds = function(point){
                var hitTreasuresIds = [];
                for (var i in this.treasureNodeMap) {
                    // 如果碰撞，则表明点在宝物上
                    if ((!!i) && this.checkHitPoint(this.treasureNodeMap[i], point)) {
                        hitTreasuresIds.push(i);
                    }
                }
                return hitTreasuresIds;
            }
            
            /**
             * 检查点是否在宝物上
             */
            this.checkHitPoint = function(treasureNode, point){
                var isHit = false;
                if ((!!point) && (!!treasureNode)) {
                    // 获取宝物数据
                    var imgPos = treasureNode._component.matrix._matrix._position;
                    var img = treasureNode._model._image;
                    if (img.loaded) {
                        // 先计算图片的正确起点
                        this.calRealPos(imgPos, treasureNode._model, img);
                        // 点是否在其中
                        if ((point.x >= imgPos.x) && (point.x <= imgPos.x + img.width) &&
                        (point.y >= imgPos.y) &&
                        (point.y <= imgPos.y + img.height)) {
                            isHit = true;
                        }
                    }
                }
                return isHit;
            }
            
            /**
             * 检查所传入的宝物是否和角色相交，用于判断是否捡起宝物
             *
             * @param {Object}
             *            roleNode
             * @param {Object}
             *            treasureIds
             */
            this.checkHitTreasureIds = function(roleNode, treasureIds){
                var hitTreasuresIds = [];
                for (var i in treasureIds) {
                    // 如果碰撞，则表明已经走到宝物上面
                    if ((!!i) && this.checkHit(this.treasureNodeMap[treasureIds[i]], roleNode)) {
                        hitTreasuresIds.push(treasureIds[i]);
                    }
                }
                return hitTreasuresIds;
            }
            
            /**
             * 检测宝物是否和角色碰撞:简单的判断矩形是否相交
             *
             * @param {Object}
             *            imageNode
             * @param {Object}
             *            roleNode
             */
            this.checkHit = function(imageNode, roleNode){
                var isHit = false;
                if ((!!roleNode) && (!!imageNode)) {
                    // 获取两个节点数据
                    var imgPos = imageNode._component.matrix._matrix._position;
                    var img = imageNode._model._image;
                    var rolePos = roleNode.position();
                    var roleImg = roleNode.getCurImg();
                    if (img.loaded && roleImg.loaded) {
                        // 先计算图片的正确起点
                        imgPos = this.calRealPos(imgPos, imageNode._model, img);
                        rolePos = this.calRealPos(rolePos, roleNode.curRoleNode._model, roleImg);
                        // 判断矩形是否相交
                        var distLeftX = Math.abs(rolePos.x - imgPos.x);
                        var distLeftY = Math.abs(rolePos.y - imgPos.y);
                        var distRightX = Math.abs(rolePos.x + roleImg.width -
                        (imgPos.x + img.width));
                        var distRightY = Math.abs(rolePos.y + roleImg.height -
                        (imgPos.y + img.height));
                        // 相交则碰撞
                        if ((distLeftX + distRightX <= roleImg.width + img.width) &&
                        (distLeftY + distRightY <=
                        roleImg.height +
                        img.height)) {
                            isHit = true;
                        }
                    }
                }
                return isHit;
            }
            
            /**
             * 根据定位点来计算图片真实的起点
             */
            this.calRealPos = function(relativePos, model, img){
                var realPos = {};
                if (model._anchorPointIsRatio) {
                    realPos.x = relativePos.x - model._ratioAnchorPoint.x * img.width;
                    realPos.y = relativePos.y - model._ratioAnchorPoint.y * img.height;
                }
                else {
                    realPos.x = relativePos.x - model._anchorPoint.x;
                    realPos.y = relativePos.y - model._anchorPoint.y;
                }
                return realPos;
            }
        }
        
        exports.TreasureManager = TreasureManager;
    }
};
