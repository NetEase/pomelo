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
		 },' ',{
		 	xtype:'button',
		 	text:'count',
		 	handler:count
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
var viewport=new Ext.Viewport({
	    layout:'border',
	    items:[{
	     region:'south',
         height:30,
         contentEl:countId
	    },forGrid]
	});
});
   var forLogData=[];
   var n=0;
	socket.on('connect',function(){
		var number=Ext.getCmp('numberfieldId').getValue() ;
		socket.emit('announce_web_client');
		// socket.emit('webmessage');	
		// socket.emit('announce_web_client');
		socket.emit('for-log',{number:number,logfile:'for-log'});
		socket.on('for-log',function(msg){ 
		var data=msg.dataArray; 
		for(var i=0;i<data.length;i++){
			forLogData[n]=data[i];
			n++;
		}
		// alert('data length:'+data.length+';conLogData length:'+conLogData.length);
	   var store=Ext.getCmp('forGridId').getStore();
       store.loadData(forLogData);
       
	  });
	});

//refresh conGrid's data
function refresh(){
	forLogData=[];
	n=0;
	var number=Ext.getCmp('numberfieldId').getValue() ;
	socket.emit('for-log',{number:number,logfile:'for-log'});

}
function count(){
	if(forLogData.length<1){
		return;
	}
	var maxTime=forLogData[0].timeUsed;
	var minTime=forLogData[0].timeUsed;
	var totalTime=0;
    for(var i=1;i<forLogData.length;i++){
    	var data=forLogData[i].timeUsed;
    	if(data<=minTime){minTime=data};
    	if(data>=maxTime){maxTime=data};
    	totalTime+=data;
    }
	document.getElementById("totalCountId").innerHTML=forLogData.length;
	document.getElementById("maxTimeId").innerHTML=maxTime;
	document.getElementById("minTimeId").innerHTML=minTime;
	document.getElementById("avgTimeId").innerHTML=totalTime/forLogData.length;
}
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
