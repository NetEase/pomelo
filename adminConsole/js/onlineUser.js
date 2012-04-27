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
		{text:'serverId',width:150,dataIndex:'serverid'},
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
	socket.on('connect',function(){
		socket.emit('announce_web_client');
		socket.emit('onlineUser',{});
		socket.on('onlineUser',function(msg){  
       var body=msg.body;
       var totalConnCount=body.totalConnCount;
       var loginedCount=body.loginedCount;
	   var store=Ext.getCmp('userGridId').getStore();
	   contentUpdate(totalConnCount,loginedCount)
       store.loadData(body.loginedList);
	  });
	});
	function contentUpdate(totalConnCount,loginedCount){
		document.getElementById("totalConnCount").innerHTML=totalConnCount;
		document.getElementById("loginedCount").innerHTML=loginedCount;
	}
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
