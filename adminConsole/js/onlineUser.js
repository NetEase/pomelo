Ext.onReady(function(){

	Ext.BLANK_IMAGE_URL ='../ext-4.0.7-gpl/resources/themes/images/default/tree/s.gif'; 
	
   var userStore = Ext.create('Ext.data.Store', {
	id:'userStoreId',
	autoLoad:false,
	pageSize:5,
    fields:['serverId','username','loginTime','uid','address'],
    proxy: {
        type: 'memory',
        reader: {
            type: 'json',
            root: 'requests'
        }
    }
});
/**
 * userGrid,detail users' message
 */
var userGrid=Ext.create('Ext.grid.Panel', {
	id:'userGridId',
	region:'center',
    store: userStore,
    columns:[
		{xtype:'rownumberer',width:50,sortable:false},
		{text:'serverId',width:150,dataIndex:'serverId'},
		{text:'userName',dataIndex:'username',width:200},
		{text:'uid',dataIndex:'uid',width:50},
		{text:'address',dataIndex:'address',width:200},
		{text:'loginTime',dataIndex:'loginTime',width:200}
		]
});
var viewport=new Ext.Viewport({
	    layout:'border',
	    items:[{
        	region:'north',
        	height:30,
        	contentEl:onlineUsersInfo
	    },userGrid]
	});
});
var onlineUserList=[];
var totalConnCount=0;
var loginedCount=0;
var STATUS_INTERVAL = 60 * 1000; // 60 seconds
	socket.on('connect',function(){
		socket.emit('announce_web_client');
		socket.emit('onlineUser',{});
		setInterval(function(){
			onlineUserList=[];
			totalConnCount=0;
			loginedCount=0;
			socket.emit('onlineUser',{});
		},STATUS_INTERVAL);
		socket.on('onlineUser',function(msg){  
       var body=msg.body;
       totalConnCount+=body.totalConnCount;
       loginedCount+=body.loginedCount;
       var loginedList=body.loginedList

       for(var i=0;i<loginedList.length;i++){
       	loginedList[i].serverId=body.serverId;
       	onlineUserList.push(loginedList[i]);
       }
	   var store=Ext.getCmp('userGridId').getStore();
	   contentUpdate(totalConnCount,loginedCount)
       store.loadData(onlineUserList);
	  });
	});
	function contentUpdate(totalConnCount,loginedCount){
		document.getElementById("totalConnCount").innerHTML=totalConnCount;
		document.getElementById("loginedCount").innerHTML=loginedCount;
	}
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
