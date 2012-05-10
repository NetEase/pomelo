Ext.onReady(function(){

	Ext.BLANK_IMAGE_URL ='../ext-4.0.7-gpl/resources/themes/images/default/tree/s.gif'; 
	
var rpcStore = Ext.create('Ext.data.Store', {
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
var rpcGrid=Ext.create('Ext.grid.Panel', {
	id:'rpcGridId',
	region:'center',
    store: rpcStore,
    columns:[
		// {header:'source',dataIndex:'source',width:150},
		{xtype:'rownumberer',width:40,sortable:false},
		{text:'time',dataIndex:'time',width:130},
		{text:'serverId',dataIndex:'serverId',width:130},
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
	 	value: 100,
    	maxValue: 1000,
    	minValue: 0,
	 	width:100
	 },{
	 	xtype:'button',
	 	text:'refresh',
	 	handler:refresh
	 },{
	 	xtype:'button',
	 	text:'count',
	 	handler:count
	 }
	]
});
rpcGrid.addListener('itemdblclick', function(rpcGrid, rowindex, e){
	var theGrid=Ext.getCmp('conGridId');
	var record=rpcGrid.getSelectionModel().getSelection();
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
var viewport=new Ext.Viewport({
	    layout:'border',
	    items:[{
	     region:'south',
         height:30,
         contentEl:countId
	    },rpcGrid]
	});
});
   var flag=true;
   var conLogData=[];
   var n=0;
	socket.on('connect',function(){
		var number=Ext.getCmp('numberfieldId').getValue() ;
		socket.emit('announce_web_client');
		// socket.emit('webmessage');	
		socket.emit('rpc-log',{number:number,logfile:'rpc-log'});
		socket.on('rpc-log',function(msg){ 
		var data=msg.dataArray;
		for(var i=0;i<data.length;i++){
			conLogData[n]=data[i];
			n++;
		}
	   var store=Ext.getCmp('rpcGridId').getStore();
       store.loadData(conLogData);
	  });
	});
//refresh conGrid's data
function refresh(){
    conLogData=[];
	n=0;
	var number=Ext.getCmp('numberfieldId').getValue() ;
	socket.emit('rpc-log',{number:number,logfile:'rpc-log'});
}

function count(){
	if(conLogData.length<1){
		return;
	}
	var maxTime=conLogData[0].timeUsed;
	var minTime=conLogData[0].timeUsed;
	var totalTime=0;
    for(var i=1;i<conLogData.length;i++){
    	var data=conLogData[i].timeUsed;
    	if(data<=minTime){minTime=data};
    	if(data>=maxTime){maxTime=data};
    	totalTime+=data;
    }
	document.getElementById("totalCountId").innerHTML=conLogData.length;
	document.getElementById("maxTimeId").innerHTML=maxTime;
	document.getElementById("minTimeId").innerHTML=minTime;
	document.getElementById("avgTimeId").innerHTML=totalTime/conLogData.length;
}
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
