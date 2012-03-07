/**
 * 英雄选择界面管理
 */
__resources__["/switchManager.js"] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {
    
/**
 * 默认显示登陆界面
 */
var curViewNameId = "loginPanel";

exports.selectView = selectView;

/**
 * 切换游戏界面
 * @param {Object} viewName
 */
function selectView(viewNameId){
    if (!viewNameId) {
        return;
    }
    if (curViewNameId == viewNameId) {
        return;
    }
    //切换游戏界面
    var oldView = document.getElementById(curViewNameId);
    var newView = document.getElementById(viewNameId);
    //切换界面逻辑
    var oldClassName = oldView.className || '';
    var newClassName = newView.className || '';
    oldView.className = oldClassName + " m-switch-model-hiden";
    newView.className = newClassName.replace(' m-switch-model-hiden', '');
	//保留新界面
	curViewNameId = viewNameId;
}

function getCurrentView(){
  return curViewNameId;
}

exports.getCurrentView = getCurrentView;

}};