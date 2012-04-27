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
		{text:'sceneId',width:100,dataIndex:'sceneId'},
		{text:'uid',dataIndex:'uid',width:100},
		{text:'name',dataIndex:'name',width:100},
		{text:'roleId',dataIndex:'roleId',width:100},
		{text:'position',dataIndex:'position',width:400}
		]
});
var viewport=new Ext.Viewport({
	    layout:'border',
	    items:[sceneGrid]
	});
});
var sceneInfo=[];
var STATUS_INTERVAL = 60 * 1000; // 60 seconds
	socket.on('connect',function(){
		socket.emit('announce_web_client');
		socket.emit('sceneInfo',{sceneId:'1'});
		setInterval(function(){
			sceneInfo=[];
			socket.emit('sceneInfo',{sceneId:'1'});
		},STATUS_INTERVAL)
		socket.on('sceneInfo',function(msg){ 
		if(msg==null){
			return;
		} 
		for(var i=0;i<msg.length;i++){
			sceneInfo.push(msg[i]);
		}
	   var store=Ext.getCmp('sceneGridId').getStore();
       store.loadData(sceneInfo);
	  });
	});
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
