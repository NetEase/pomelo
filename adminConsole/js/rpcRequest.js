Ext.onReady(function(){

	Ext.BLANK_IMAGE_URL ='../ext-4.0.7-gpl/resources/themes/images/default/tree/s.gif'; 
	
var rpcStore = Ext.create('Ext.data.Store', {
	id:'reqStoreId',
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
 * gridPanel,detail message
 */
var rpcGrid=Ext.create('Ext.grid.Panel', {
	id:'rpcGridId',
	region:'center',
    store: rpcStore,
    columns:[
		// {header:'source',dataIndex:'source',width:150},
		{xtype:'rownumberer',width:40,sortable:false},
		{text:'serverId',dataIndex:'serverId',width:150},
		{text:'request route',dataIndex:'route',width:150},
		{text:'time',dataIndex:'time',width:50},
		{text:'request params',dataIndex:'params',width:700}
//		{header:'createTime',dataIndex:'createTime',width:200},
//		{header:'doneTime',dataIndex:'doneTime',width:200},
//		{header:'cost(ms)',dataIndex:'cost(ms)',width:800}
//		{header:'state',dataIndex:'state'}
		]
});
var viewport=new Ext.Viewport({
	    layout:'border',
	    items:[rpcGrid]
	});
});
	socket.on('connect',function(){
		socket.emit('announce_web_client');
		socket.emit('rpc-log',{logfile:'rpc-log'});
		socket.on('rpc-log',function(msg){
	  	
	      
	   var store=Ext.getCmp('rpcGridId').getStore();
       store.loadData(msg);
	  });
	});
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
