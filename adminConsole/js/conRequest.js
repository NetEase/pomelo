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
//		{header:'createTime',dataIndex:'createTime',width:200},
//		{header:'doneTime',dataIndex:'doneTime',width:200},
//		{header:'cost(ms)',dataIndex:'cost(ms)',width:800}
//		{header:'state',dataIndex:'state'}
		],
	tbar:[
		 'time: ',{
		 	xtype:'numberfield',
		 	name:'timeField',
		 	id:'timeFieldId',
		 	anchor: '100%',
		 	value: 2,
        	maxValue: 10,
        	minValue: 0,
		 	width:100
		 },'minutes ',{
		 	xtype:'button',
		 	text:'refresh',
		 	handler:refresh
		 },{
		 	xtype:'button',
		 	text:'count',
		 }
		]
});
var viewport=new Ext.Viewport({
	    layout:'border',
	    items:[conGrid]
	});
});
   var flag=true;
   var conLogData=[];
   var n=0;
	socket.on('connect',function(){
		var time=Ext.getCmp('timeFieldId').getValue() ;
		socket.emit('announce_web_client');
		socket.emit('con-log',{time:time,logfile:'con-log'});
		socket.on('con-log',function(msg){ 
		var data=msg.dataArray;
		var isNew=msg.isNew;
		if(isNew=='no'&&flag){
			flag=false;
			alert('近'+time+'分钟内无日志，显示最近的50条日志！');
		} 
		for(var i=0;i<data.length;i++){
			conLogData[n]=data[i];
			n++;
		}
	   var store=Ext.getCmp('conGridId').getStore();
       store.loadData(conLogData);
	  });
	});

//refresh conGrid's data
function refresh(){
	var time=Ext.getCmp('timeFieldId').getValue() ;
	socket.emit('announce_web_client');
	socket.emit('con-log',{time:time,logfile:'con-log'});
	socket.on('con-log',function(msg){  
	var store=Ext.getCmp('conGridId').getStore();
    store.loadData(msg);
	 });

}
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
