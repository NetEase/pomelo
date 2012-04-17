__resources__["/voData.js"] = {
    meta: {
        mimetype: "application/javascript"
    },
    data: function(exports, require, module, __filename, __dirname){
    
        /**
         * 地图数据VO
         * @param {Object} data
         */
        function MapVO(data){
            this.id = data.sceneId;
            this.picId = 1001;
            this.name = "捡宝";
            this.startX = data.x > 100 ? Number(data.x) - 100 : 0;
            this.startY = data.y > 100 ? Number(data.y) - 100 : 0;
        }
        
        /**
         * 人物数据VO
         * @param {Object} data
         */
        function RoleVO(data){
            this.id = data.uid;
            this.picId = data.roleId;
            this.name = data.name;
            this.x = Number(data.x);
            this.y = Number(data.y);
        }
        
        /**
         * 宝物数据VO
         * @param {Object} data
         */
        function TreasureVO(data){
            this.id = data.id;
            this.picId = data.imgId;
            this.name = data.name;
            this.score = data.score;
            this.x = Number(data.posX);
            this.y = Number(data.posY);
        }
        
        /**
         * 推送的角色移动数据
         * @param {Object} data
         */
        function MoveVO(data){
            this.id = data.uid;
            this.time = data.time;
            this.startX = Number(data.path[0].x);
            this.startY = Number(data.path[0].y);
            this.endX = Number(data.path[1].x);
            this.endY = Number(data.path[1].y);
        }
        
        exports.MapVO = MapVO;
        exports.RoleVO = RoleVO;
        exports.TreasureVO = TreasureVO;
        exports.MoveVO = MoveVO;
    }
};
