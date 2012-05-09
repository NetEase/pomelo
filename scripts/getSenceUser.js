var areaServerId=app.serverId;
var areasMap=app.get('areasMap');
var areaIds=areasMap[areaServerId];
var result='';
for(var i=0;i<areaIds.length;i++){
  var users=areaService.getUsers(areaIds[i]);
 if(users!={}){
          for(var userId in users){
           result+=JSON.stringify(users[userId])
          }
        }
}
result;