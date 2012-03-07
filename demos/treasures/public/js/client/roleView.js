__resources__["/roleView.js"] = {
    meta: {
        mimetype: "application/javascript"
    },
    data: function(exports, require, module, __filename, __dirname){
    
        var helper = require("helper");
        var model = require("model");
        var animate = require("animate");
        var FrameSeqComponent = require('component').FrameSeqComponent;
        
        var RoleVO = require("voData").RoleVO;
        var MoveVO = require("voData").MoveVO;
        
        /**
         * 角色类
         *
         * @param {Object}
         *            roleData 人物数据
         * @param {Object}
         *            scene
         * @param {Object}
         *            mapParent
         * @param {Object}
         *            speed 角色走动速度，每一秒的距离
         */
        function Role(roleData, scene, mapParent, speed){
            // 保存形象数据
            this.roleVO = new RoleVO(roleData);
            this.scene = scene;
            this.mapParent = mapParent;
            this.speed = speed;
            this.isStand = true;
            this.roleImgs = null;
            this.curRoleNode = null;
            this.curMoveMotion = null;
            
            /**
             * 先把走动和站立图片载入
             */
            this.loadImgs = function(){
                this.roleImgs = {};
                // 走动图片
                this.roleImgs["walk"] = helper.loadImage("images/heros/animation/" + this.roleVO.picId + "/walk.png");
                // 站立图片
                this.roleImgs["stand"] = helper.loadImage("images/heros/animation/" + this.roleVO.picId + "/stand.png");
            }
            /**
             * * 加载人物数据:走动或者站立包含方向
             *
             * @param {Object}
             *            walkOrStand "walk","stand"
             * @param {Object}
             *            direction [standStartFrame,standEndFrame,walkStartFrame,walkEndFrame]
             */
            this.loadRole = function(walkOrStand, direction){
                // 加载人物图片
                if (this.roleImgs == null) {
                    this.loadImgs();
                }
                var img = null;
                var startFrame, endFrame;
                if (walkOrStand == "walk") {
                    img = this.roleImgs["walk"];
                    this.isStand = false;
                    if (direction && (direction.length == 4)) {
                        startFrame = direction[2];
                        endFrame = direction[3];
                    }
                    else {
                        //如果没传入方向数据，则直接使用右下走动图片
                        startFrame = 0;
                        endFrame = 7;
                    }
                }
                else {
                    img = this.roleImgs["stand"];
                    this.isStand = true;
                    if (direction && (direction.length == 4)) {
                        startFrame = direction[0];
                        endFrame = direction[1];
                    }
                    else {
                        //如果没传入方向数据，则直接使用右下站立图片
                        startFrame = 0;
                        endFrame = 0;
                    }
                }
                // 构建序列帧节点
                var clipAni = new FrameSeqComponent({
                    image: img,
                    interval: 200,
                    times: Infinity,
                    w: 57,
                    h: 86,
                    startFrame: startFrame,
                    endFrame: endFrame,
                });
                var clipM = clipAni.getModel();
                // 设置定位点
                clipM.set('ratioAnchorPoint', {
                    x: 0.5,
                    y: 0.5
                });
                var clipn = this.scene.createNode({
                    model: clipM
                });
                clipn.addComponent("frame", clipAni);
                
                // 判断如果有此节点，则进行替换
                var x = this.position().x, y = this.position().y, z = this.position().z;
                if (this.curRoleNode) {
                    this.mapParent.removeChild(this.curRoleNode);
                }
                else {
                    x = this.roleVO.x;
                    y = this.roleVO.y;
                }
                scene.addNode(clipn, this.mapParent);
                clipn.exec("translate", x, y, z);
                
                // 设置人物节点
                this.curRoleNode = clipn;
                
                //添加角色的名字显示
                var nameModel = new model.TextModel({
                    text: this.roleVO.name,
                    fill: {
                        r: 0xff,
                        g: 0x00,
                        b: 0x00
                    },
                    height: 14,
                });
                var nameNode = scene.createNode({
                    model: nameModel
                });
                this.scene.addNode(nameNode, clipn);
                nameNode.exec("translate", -15, -43, 0);
            }
            
            /**
             * 设置角色的位置
             * @param {Object} x
             * @param {Object} y
             */
            this.setPosXY = function(x, y){
                if (this.curRoleNode) {
                    var z = this.position.z;
                    this.curRoleNode.exec("translate", x, y, z);
                }
            }
            
            /**
             * 移动角色到指定位置
             */
            this.move = function(xDist, yDist, timeNum){
                // 如果角色存在
                if (!!this.curRoleNode) {
                    // 如果当前有motion，则需要先移出
                    this.stopMove();
                    
                    // 取得当前的节点坐标
                    var pos = this.position();
                    var endX = pos.x + xDist;
                    var endY = pos.y + yDist;
                    
                    // 加载对应方向的形象
                    var direction = this.walkDirection(pos.x, pos.y, endX, endY);
                    this.loadRole("walk", direction);
                    // 如果时间没有传入，则计算
                    if (timeNum == undefined) {
                        // 计算距离和移动时间
                        var dis = Math.sqrt(xDist * xDist + yDist * yDist);
                        timeNum = dis / speed * 1000;
                    }
                    // 重新添加move
                    this.curMoveMotion = new animate.MoveTo([0, {
                        x: pos.x,
                        y: pos.y
                    }, 'linear'], [timeNum, {
                        x: endX,
                        y: endY
                    }, 'linear']);
                    // 监听是否走完了路程
                    var closure = this;
                    this.curMoveMotion.onFrameEnd = function(t, dt){
                        // 如果走动完成，则移除move
                        if (closure.curMoveMotion.isDone()) {
                            closure.stopMove();
                            closure.loadRole("stand", direction);
                        }
                    }
                    this.curRoleNode.exec('addAnimation', this.curMoveMotion);
                    //返回时间
                    return timeNum;
                }
            }
            
            /**
             * 获取形象走动的方向对应的图片帧
             * 数字代表意思如下：
             * [standStartFrame,standEndFrame,walkStartFrame,walkEndFrame]
             */
            this.walkDirection = function(startX, startY, endX, endY){
                // 计算角度:在第一二象限计算出来的角度是从0-(-180度),第三,四象限计算出来是0-180度
                var angle = Math.atan2(endY - startY, endX - startX) * 180 / Math.PI;
                // 反向,并且对负数旋转一周,这样算出来的角度符合正常的逻辑
                angle = -angle;
                // 如果是负数的情况下,则旋转一周变为正数
                if (angle < 0) {
                    angle += 360;
                }
                if ((angle >= 0 && angle < 22.5) || (angle >= 337.5 && angle < 360)) {
                    // 正右
                    return [7, 7, 56, 63];
                }
                else 
                    if (angle >= 22.5 && angle < 67.5) {
                        // 右上
                        return [3, 3, 24, 31];
                    }
                    else 
                        if (angle >= 67.5 && angle < 112.5) {
                            // 正上
                            return [6, 6, 48, 55];
                        }
                        else 
                            if (angle >= 112.5 && angle < 157.5) {
                                // 左上
                                return [2, 2, 16, 23];
                            }
                            else 
                                if (angle >= 157.5 && angle < 202.5) {
                                    // 正左
                                    return [5, 5, 40, 47];
                                }
                                else 
                                    if (angle >= 202.5 && angle < 247.5) {
                                        // 左下
                                        return [1, 1, 8, 15];
                                    }
                                    else 
                                        if (angle >= 227.5 && angle < 292.5) {
                                            // 正下
                                            return [4, 4, 32, 39];
                                        }
                                        else {
                                            // 右下
                                            return [0, 0, 0, 7];
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
                    this.curRoleNode.exec("removeAnimation", this.curMoveMotion.identifier);
                }
            }
            
            /**
             * 移除角色
             */
            this.remove = function(){
                // 首先停止运动
                this.stopMove();
                // 删除角色节点
                if (this.curRoleNode) {
                    this.mapParent.removeChild(this.curRoleNode);
                }
            }
            
            /**
             * 获取速度
             */
            this.getSpeed = function(){
                return this.speed;
            }
            
            /**
             * 地图坐标
             */
            this.parentPosition = function(){
                if (this.curRoleNode && this.curRoleNode._parent) {
                    return this.curRoleNode._parent._component.matrix._matrix._position;
                }
                else {
                    return {
                        x: 0,
                        y: 0,
                        z: 0
                    };
                }
            }
            
            /**
             * 取得当前的pos坐标
             */
            this.position = function(){
                if (this.curRoleNode) {
                    return this.curRoleNode._component.matrix._matrix._position;
                }
                else {
                    return {
                        x: 0,
                        y: 0,
                        z: 0
                    };
                }
            }
            
            /**
             * 获取当前的角色图片，用于获取width和height来碰撞检测
             */
            this.getCurImg = function(){
                if (this.curRoleNode) {
                    return this.curRoleNode._model.model._image;
                }
                else {
                    return null;
                }
            }
        }
        
        /**
         * 角色管理类:用于场景中其他存在的人物管理
         */
        function RoleManager(scene, mapParent){
            // 管理角色数组:{id:role}
            this.rolesMap = {};
            this.scene = scene;
            this.mapParent = mapParent;
            
            /**
             * 显示所有的角色数据
             *
             * @param {Object}
             *            dataMap
             */
            this.showRoles = function(dataMap){
                // 添加角色数据
                for (var id in dataMap) {
                    if ((!!id) && (!!dataMap[id])) {
                        this.addRole(dataMap[id]);
                    }
                }
            }
            
            /**
             * 添加一个形象数据
             *
             * @param {Object}
             *            roleData
             */
            this.addRole = function(roleData){
                var role = new Role(roleData, this.scene, this.mapParent);
                if (!this.rolesMap[role.roleVO.id]) {
                    role.loadRole("stand");
                    this.rolesMap[role.roleVO.id] = role;
                }
            }
            
            /**
             * 推送移动单个角色数据
             */
            this.moveRole = function(moveData){
                var moveVO = new MoveVO(moveData);
                var role = this.rolesMap[moveVO.id];
                if (role) {
					role.setPosXY(moveVO.startX,moveVO.startY);
                    role.move(moveVO.endX - moveVO.startX, moveVO.endY - moveVO.startY, moveVO.time);
                }
            }
            
            /**
             * 清空所有的角色数据
             */
            this.deleteAllRoles = function(){
                for (var i in this.rolesMap) {
                    // 删除所有的角色数据
                    if (!!i) {
                        this.deleteRole(i);
                    }
                }
            }
            
            /**
             * 删除地图中显示的角色
             *
             * @param {Object}
             *            id
             */
            this.deleteRole = function(id){
                var value = this.rolesMap[id];
                if (value) {
                    // 移除role
                    value.remove();
                    this.rolesMap[id] = null;
                    delete this.rolesMap[id];
                }
            }
            
        }
        
        exports.Role = Role;
        exports.RoleManager = RoleManager;
    }
};
