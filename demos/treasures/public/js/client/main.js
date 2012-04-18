__resources__["/main.js"] = {
    meta: {
        mimetype: "application/javascript"
    },
    data: function(exports, require, module, __filename, __dirname){
        var clientManager = require('clientManager');
        var heroSelectView = require('heroSelectView');
        
        function main(){
            clientManager.init();
            
            setDefaultUser();
            
            addEvents();
        }
        
        function setDefaultUser(){
          if(localStorage){
            var username = document.getElementById('loginUser');
            var passwd = document.getElementById('loginPwd');
            var dusr = localStorage.getItem("username");
            if(dusr){
              username.value = dusr;
              passwd.value = '123';
            }
          }
        }
        
        function addEvents(){
            document.getElementById('login').addEventListener('click', clientManager.login, false);
            
            //添加角色选择事件
            var roleImgs = document.getElementsByName('m-roleImg');
            for(var i = 0; i < roleImgs.length; i++){
              var roleImg = roleImgs[i];
              roleImg.addEventListener('click', 
                function(e){
                  heroSelectView.onClickHero(this);
                }, false);
            }
            
            document.getElementById('heroSelectBtn').addEventListener('click', clientManager.register, false);
        }
        
        //主动调用main函数
//        main();
        exports.main = main;
    }
};
