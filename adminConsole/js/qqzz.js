Ext.onReady(function(){

	Ext.BLANK_IMAGE_URL ='../ext-4.0.7-gpl/resources/themes/images/default/tree/s.gif'; 
	
   var reqStore = Ext.create('Ext.data.Store', {
	id:'reqStoreId',
	autoLoad:false,
	pageSize:5,
    fields:['source','route','params','createTime','doneTime','cost(ms)','timeout'],
//    groupField: 'department',
    proxy: {
        type: 'memory',
        reader: {
            type: 'json',
            root: 'requests'
        }
    }
});
/**
 * 详细信息gridPanel
 */
var reqGrid=Ext.create('Ext.grid.Panel', {
	id:'reqGridId',
//    title: '详细信息',
	region:'center',
    store: reqStore,
    columns:[
		// {header:'source',dataIndex:'source',width:150},
		{xtype:'rownumberer',width:50,sortable:false},
		{text:'request route',dataIndex:'route',width:200},
		{text:'timeout',dataIndex:'timeout',width:50},
		{text:'request params',dataIndex:'params',width:900}
//		{header:'createTime',dataIndex:'createTime',width:200},
//		{header:'doneTime',dataIndex:'doneTime',width:200},
//		{header:'cost(ms)',dataIndex:'cost(ms)',width:800}
//		{header:'state',dataIndex:'state'}
		]
});
var viewport=new Ext.Viewport({
	    layout:'border',
	    items:[reqGrid]
	});
});
	socket.on('connect',function(){
		socket.emit('announce_web_client');
		socket.emit('logMessage');
		socket.on('logMessage',function(msg){
	  	
	      
	   var store=Ext.getCmp('reqGridId').getStore();
       store.loadData(msg);
	  });
	});
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
