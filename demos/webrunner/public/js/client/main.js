define(function(require, exports, module) {   
        var client = require('/js/client/client.js');
        
        function main(){
            client.init();
            addEvents();
        }
        function addEvents(){
            console.log('addEvents, client: '+client);
            document.getElementById('submit').addEventListener('click', sendMessage, false);
        }
        
        
        function sendMessage(){
        	var route = document.getElementById('route').value;
        	var paramsStr = document.getElementById('params').value;
            
            console.log(' start send message, route:'+route+'  params:'+paramsStr);
            
            var params = JSON.parse(paramsStr);
        	client.pushMessage({"route":route, "params":params});
        }
        
        exports.main = main;
});
