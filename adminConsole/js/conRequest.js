Ext.require('Ext.chart.*');
Ext.onReady(function(){

	Ext.BLANK_IMAGE_URL ='../ext-4.0.7-gpl/resources/themes/images/default/tree/s.gif'; 
	
   var conStore = Ext.create('Ext.data.Store', {
	id:'reqStoreId',
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
var conGrid=Ext.create('Ext.grid.Panel', {
	id:'conGridId',
	region:'center',
    store: conStore,
    columns:[
		// {header:'source',dataIndex:'source',width:150},
		{xtype:'rownumberer',width:40,sortable:false},
		{text:'time',dataIndex:'time',width:130},
		{text:'serverId',width:130,dataIndex:'serverId'},
		{text:'request route',dataIndex:'route',width:220},
		{text:'timeUsed',dataIndex:'timeUsed',width:70},
		{text:'request params',dataIndex:'params',width:900}
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
		 {
		 	xtype:'button',
		 	text:'refresh',
		 	handler:refresh
		 }
		]
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
	    items:[
	    // {
	    //  region:'south',
     //     height:30,
     //     contentEl:countId
	    // },
	    conGrid,countGrid]
	});

conGrid.addListener('itemdblclick', function(conGrid, rowindex, e){
	var theGrid=Ext.getCmp('conGridId');
	var record=conGrid.getSelectionModel().getSelection();
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

});
	socket.on('connect',function(){
		var number=Ext.getCmp('numberfieldId').getValue() ;
		socket.emit('announce_web_client');
		socket.emit('webMessage',{method:'getConLog',number:number,logfile:'con-log'});	
		// socket.emit('con-log',{number:number,logfile:'con-log'});
		socket.on('con-log',function(msg){ 
	    Ext.getCmp('conGridId').getStore().loadData(msg.data);
        Ext.getCmp('countGridId').getStore().loadData(msg.countData);
       
	  });
	});

//refresh conGrid's data
function refresh(){
	var number=Ext.getCmp('numberfieldId').getValue() ;
	socket.emit('webMessage',{method:'getConLog',number:number,logfile:'con-log'});	
}

