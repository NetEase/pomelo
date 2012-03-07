/**
 * 刷新宝物倒计时的东西
 */
__resources__["/tickViewManager.js"] = {
    meta: {
      mimetype: "application/javascript"
    },
    data: function(exports, require, module, __filename, __dirname){
      var sw = require('switchManager');
      var eleRoot = null;
      var _leftTime = 0;
      var refreshTimer = null;
      var e_min = 1000*60;
      var e_sec = 1000;
      function updateTime() {
      	if (!!eleRoot) {
       		var min = Math.floor(_leftTime/e_min);
      		var second = Math.floor((_leftTime-min*e_min)/e_sec);
      		if (min<0) {
      			document.getElementById('tick-label').innerHTML = '0分1秒';
      		} else {
      			document.getElementById('tick-label').innerHTML = ' ' +  min+ '分 ' + second + '秒';
      		}
      		_leftTime-=1000;
      		eleRoot.style.display = 'block';
      	}
      };
      function refresh(leftTime){
      	_leftTime = leftTime;
        if(sw.getCurrentView() == 'canvasPanel'){
          eleRoot = document.getElementById('tick-view');
          if (!!refreshTimer) {
          	clearInterval(refreshTimer);
          }
          refreshTimer = setInterval(updateTime,1000);
        }
      };

      exports.refresh = refresh;
    }
};