__resources__["/main.js"] = {
    meta: {
        mimetype: "application/javascript"
    },
    data: function(exports, require, module, __filename, __dirname){
        var clientManager = require('clientManager');
        
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
            
        }
        
        //主动调用main函数
        // main();
        exports.main = main;
    }
};
