var map={};
map=log_server.nodes;
var string;
for(var serverId in map){
   string+serverId;
}
return string;