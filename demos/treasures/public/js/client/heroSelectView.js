/**
 * 英雄选择界面管理
 */
__resources__["/heroSelectView.js"] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {


//暴露的接口
//exports.onSelectSubmit = onSelectSubmit;
exports.onClickHero = onClickHero;
exports.roleId = getRoleId;

/**
 * 默认选择第一个英雄
 */
var roleId = "0001";

function getRoleId(){
  return roleId;
}
///**
// * 选英雄函数
// */
//function onSelectSubmit(){
//    var gameName = document.getElementById('gameUserName').value;
//    if (!gameName) {
//        alert("角色名不能为空");
//        return;
//    }
//    socket.emit('message', {
//    	type: 2004,
//    	body: [gameName,roleId]
//    });
//}

function onRegister(data){
	alert("getHeror"+data);	
}

/**
 * 用户选择英雄
 */
function onClickHero(e){
    if (!e) {
        return;
    }
    var id = e.id;
    if (id == roleId) {
        return;
    }
    //处理用户点击
    var curSelected = document.getElementById(roleId);
    curSelected.className = "";
    e.className = "m-hero-selected";
    roleId = id;
}

}};