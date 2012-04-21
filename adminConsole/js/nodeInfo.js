Ext.onReady(function(){

	Ext.BLANK_IMAGE_URL ='../ext-4.0.7-gpl/resources/themes/images/default/tree/s.gif'; 

	var nodeStore=Ext.create('Ext.data.Store',{
       id:'nodeStore',
       autoLoad:false,
       pageSize:5,
       fields:['time','serverId','serverType','pid','cpuAvg','memAvg','vsz','rss','usr','sys','gue'],
       proxy:{
       	type:'memory',
       	reader:{
       		type:'json',
       		root:'nodes'
       	}
       }
	});
	//nodes' detailed information
	var nodesPanel=Ext.create('Ext.grid.Panel',{
        id:'nodesPanel',
        title:'nodesInformation',
        region:'north',
        store:nodeStore,
        autoScroll:true,
        height:300,
        columns:[
           {text:'time',width:150,sortable:true,dataIndex:'time'},
           {text:'serverId',width:150,sortable:true,dataIndex:'serverId'},
           {text:'serverType',width:80,sortable:true,dataIndex:'serverType'},
           {text:'pid',width:60,sortable:true,dataIndex:'pid'},
           {text:'cpu%',width:60,sortable:true,dataIndex:'cpuAvg'},
           {text:'mem%',width:60,sortable:true,dataIndex:'memAvg'},
           {text:'vsz',width:80,sortable:true,dataIndex:'vsz'},
           {text:'rss',width:80,sortable:true,dataIndex:'rss'},
           {text:'cpu(i/o)',
             columns:[
               {text:'usr',width:60,sortable:true,dataIndex:'usr'},
               {text:'sys',width:60,sortable:true,dataIndex:'sys'},
               {text:'gue',width:60,sortable:true,dataIndex:'gue'}
             ]
           }
        ]
	});

	//chart of nodes' detailed
	var chartPanel=Ext.create('Ext.panel.Panel',{
		id:'chartPanel',
		title:'realtimeInfo',
		region:'center'

	})
	var viewport=new Ext.Viewport({
		layout:'border',
		items:[nodesPanel,chartPanel]
	});

});

socket.on('connect',function(){
     socket.emit('announce_web_client');
     socket.emit('webmessage');
     socket.emit('sysMessage',{method:'getProcess'});
     socket.on('sysMessage',function(msg){

      //update the data of nodesPanel
    var store=Ext.getCmp('nodesPanel').getStore();
    store.loadData(msg.nodeItems);

     });
});

