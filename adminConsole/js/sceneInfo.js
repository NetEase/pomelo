Ext.onReady(function(){

	Ext.BLANK_IMAGE_URL ='../ext-4.0.7-gpl/resources/themes/images/default/tree/s.gif'; 
	
   var sceneStore = Ext.create('Ext.data.Store', {
	id:'sceneStoreId',
	autoLoad:false,
	pageSize:5,
    fields:['sceneId','name','roleId','uid','position','serverId','username'],
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
var sceneGrid=Ext.create('Ext.grid.Panel', {
	id:'sceneGridId',
	region:'center',
    store: sceneStore,
    columns:[
		{xtype:'rownumberer',width:50,sortable:false},
		{text:'serverId',width:120,dataIndex:'serverId'},
		{text:'sceneId',width:100,dataIndex:'sceneId'},
		{text:'uid',dataIndex:'uid',width:100},
		{text:'username',dataIndex:'username',width:100},
		{text:'name',dataIndex:'name',width:100},
		{text:'roleId',dataIndex:'roleId',width:100},
		{text:'position',dataIndex:'position',width:400}
		],
	 tbar:[{
          xtype:'button',
          text:'refresh',
          handler:refresh
         }]
});
var viewport=new Ext.Viewport({
	    layout:'border',
	    items:[sceneGrid]
	});
});

var STATUS_INTERVAL = 60 * 1000; // 60 seconds
	socket.on('connect',function(){
		socket.emit('announce_web_client');
		socket.emit('webMessage',{method:'getSenceInfo'});
		socket.on('getSenceInfo',function(msg){ 
		if(msg==null){
			return;
		} 
	   var store=Ext.getCmp('sceneGridId').getStore();
       store.loadData(msg.data);
	  });
	});
function refresh(){
	socket.emit('webMessage',{method:'getSenceInfo'});
}
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
