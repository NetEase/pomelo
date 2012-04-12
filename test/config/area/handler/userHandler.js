var handler = module.exports;


handler.removeUser = function(msg, session) {

};

/**
 * 用户加入uidList
 *  
 * @param uid
 * @param cb
 */
handler.addUser = function(msg, session) {
  return true;
};

  
/**
 * 用户移动
 * 日前可以算出时间推给事件服务器
 * 是否需要通过逻辑服务器验证
 * 
 * @param msg
 */
handler.move = function (msg, session){
  //console.log('move message: '+ JSON.stringify(msg));
  //console.log('session message: '+ JSON.stringify(session));
  return true;
};

handler.moveCalc = function(data){
 };

/**
 * 获取所有在线用户
 */
handler.getOnlineUsers = function(msg, session){
  
}
/**
 * 排名推送
 */
function updateRankList(uid){

}
