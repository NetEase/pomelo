__resources__["/rankManager.js"] = {
    meta: {
      mimetype: "application/javascript"
    },
    data: function(exports, require, module, __filename, __dirname){
      var sw = require('switchManager');
      function refreshView(data){
        if(sw.getCurrentView() == 'canvasPanel'){
          var eleRoot = document.getElementById('rank-view');
          while(eleRoot.hasChildNodes()){
            eleRoot.removeChild(eleRoot.firstChild);
          }
          var fragElem = document.createElement('ul');
          var plenth = data.length;
          for (var i = 0; i < plenth; i++){
             var pinfo = document.createElement('li');
             var pname = document.createElement('span');
             pname.className = 'rank-player-name';
             pname.innerHTML = data[i].name;
             pinfo.appendChild(pname);
             
             var pscore = document.createElement('span');
             pscore.className = 'rank-player-score';
             pscore.innerHTML = data[i].score;
             pinfo.appendChild(pscore);
             
             fragElem.appendChild(pinfo);
          }
          if(plenth > 0){
            eleRoot.appendChild(fragElem);
            eleRoot.style.display = 'block';
          }
        }
      }
      
      exports.refreshView = refreshView;
    }
};