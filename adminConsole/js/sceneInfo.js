Ext.onReady(function(){

	Ext.BLANK_IMAGE_URL ='../ext-4.0.7-gpl/resources/themes/images/default/tree/s.gif'; 
	
   var sceneStore = Ext.create('Ext.data.Store', {
	id:'sceneStoreId',
	autoLoad:false,
	pageSize:5,
    fields:['sceneId','name','roleId','uid','position'],
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
		{text:'sceneId',width:50,dataIndex:'sceneId'},
		{text:'uid',dataIndex:'uid',width:200},
		{text:'name',dataIndex:'name',width:200},
		{text:'roleId',dataIndex:'roleId',width:200},
		{text:'position',dataIndex:'position',width:100}
		]
});
var viewport=new Ext.Viewport({
	    layout:'border',
	    items:[sceneGrid]
	});
});
	socket.on('connect',function(){
		socket.emit('announce_web_client');
		socket.emit('sceneInfo',{sceneId:'1'});
		socket.on('sceneInfo',function(msg){ 
		// alert('msg:'+msg); 
	   var store=Ext.getCmp('sceneGridId').getStore();
       store.loadData(msg);
	  });
	});
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
