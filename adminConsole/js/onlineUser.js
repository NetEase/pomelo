Ext.onReady(function(){

	Ext.BLANK_IMAGE_URL ='../ext-4.0.7-gpl/resources/themes/images/default/tree/s.gif'; 
	
   var userStore = Ext.create('Ext.data.Store', {
	id:'userStoreId',
	autoLoad:false,
	pageSize:5,
    fields:['serverId','source','route','params','createTime','doneTime','cost(ms)','time'],
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
		{text:'request route',dataIndex:'route',width:200},
		{text:'time',dataIndex:'time',width:50},
		{text:'request params',dataIndex:'params',width:700}
		]
});
var viewport=new Ext.Viewport({
	    layout:'border',
	    items:[userGrid]
	});
});
	socket.on('connect',function(){
		socket.emit('announce_web_client');
		socket.emit('',{});
		socket.on('',function(msg){  
	   var store=Ext.getCmp('userGridId').getStore();
       store.loadData(msg);
	  });
	});
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
