Ext.require('Ext.chart.*');
Ext.onReady(function(){

	Ext.BLANK_IMAGE_URL ='../ext-4.0.7-gpl/resources/themes/images/default/tree/s.gif'; 
	
   var forStore = Ext.create('Ext.data.Store', {
	id:'forStoreId',
	autoLoad:false,
	pageSize:5,
    fields:['serverId','timeUsed','source','route','params','createTime','doneTime','cost(ms)','time'],
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
var forGrid=Ext.create('Ext.grid.Panel', {
	id:'forGridId',
	region:'center',
    store: forStore,
    columns:[
		// {header:'source',dataIndex:'source',width:150},
		{xtype:'rownumberer',width:40,sortable:false},
		{text:'time',dataIndex:'time',width:130},
		{text:'serverId',width:130,dataIndex:'serverId'},
		{text:'request route',dataIndex:'route',width:220},
		{text:'timeUsed',dataIndex:'timeUsed',width:70},
		{text:'request params',dataIndex:'params',width:900}
//		{header:'createTime',dataIndex:'createTime',width:200},
//		{header:'doneTime',dataIndex:'doneTime',width:200},
//		{header:'cost(ms)',dataIndex:'cost(ms)',width:800}
//		{header:'state',dataIndex:'state'}
		],
	tbar:[
		 'number: ',{
		 	xtype:'numberfield',
		 	name:'numberfield',
		 	id:'numberfieldId',
		 	anchor: '100%',
		 	value: 50,
        	maxValue: 1000,
        	minValue: 0,
		 	width:100
		 },' ',
		 // {
		 // 	xtype:'button',
		 // 	text:'latest 100logs',
		 // 	handler:getLatest
		 // },' ',
		 {
		 	xtype:'button',
		 	text:'refresh',
		 	handler:refresh
		 }
		]
});
forGrid.addListener('itemdblclick', function(forGrid, rowindex, e){
	var theGrid=Ext.getCmp('conGridId');
	var record=forGrid.getSelectionModel().getSelection();
	if(record.length>1){
		alert('only one data is required!');
		return;
	}
	if(record.length<1){
		alert('please choose one data!')
	}
	var data=record[0].data.params;
	gridDetailShow(data);
});
var countStore=Ext.create('Ext.data.Store',{
	id:'countStoreId',
	autoLoad:false,
	pageSize:5,
	fields:['route','totalCount','maxTime','minTime','avgTime'],
	proxy:{
		type:'memory',
		reader:{
			type:'json',
			root:'countData'
		}
	}
});
var countGrid=Ext.create('Ext.grid.Panel',{
	id:'countGridId',
	region:'south',
	store:countStore,
	height:150,
	columns:[
		{xtype:'rownumberer',width:40,sortable:false},
		{text:'request route',dataIndex:'route',width:200},
		{text:'totalCount',dataIndex:'totalCount',width:70},
		{text:'maxTime',dataIndex:'maxTime',width:70},
		{text:'minTime',dataIndex:'minTime',width:70},
		{text:'avgTime',dataIndex:'avgTime',width:200}
	]
});
var viewport=new Ext.Viewport({
	    layout:'border',
	    items:[forGrid,countGrid]
	});
});

	socket.on('connect',function(){
		var number=Ext.getCmp('numberfieldId').getValue() ;
		socket.emit('announce_web_client');
		socket.emit('webMessage',{method:'getForLog',number:number,logfile:'for-log'});	
		// socket.emit('announce_web_client');
		// socket.emit('for-log',{number:number,logfile:'for-log'});
		socket.on('for-log',function(msg){ 
		// alert('data length:'+data.length+';conLogData length:'+conLogData.length);
	   Ext.getCmp('forGridId').getStore().loadData(msg.data);
       Ext.getCmp('countGridId').getStore().loadData(msg.countData);
       
	  });
	});

//refresh conGrid's data
function refresh(){
	var number=Ext.getCmp('numberfieldId').getValue() ;
	socket.emit('webMessage',{method:'getForLog',number:number,logfile:'for-log'});	

}
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
