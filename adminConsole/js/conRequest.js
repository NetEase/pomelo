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
		 'number: ',{
		 	xtype:'numberfield',
		 	name:'numberField',
		 	id:'numberFieldId',
		 	anchor: '100%',
		 	value: 100,
        	maxValue: 500,
        	minValue: 0,
		 	width:100
		 },' ',{
		 	xtype:'button',
		 	text:'refresh',
		 	handler:refresh
		 }
		]
});
var viewport=new Ext.Viewport({
	    layout:'border',
	    items:[conGrid]
	});
});
   
	socket.on('connect',function(){
		socket.emit('announce_web_client');
		socket.emit('con-log',{number:'100',logfile:'con-log'});
		socket.on('con-log',function(msg){  
	   var store=Ext.getCmp('conGridId').getStore();
       store.loadData(msg);
	  });
	});

//refresh conGrid's data
function refresh(){
	var number=Ext.getCmp('numberFieldId').getValue() ;
	socket.emit('announce_web_client');
	socket.emit('con-log',{number:number,logfile:'con-log'});
	socket.on('con-log',function(msg){  
	var store=Ext.getCmp('conGridId').getStore();
    store.loadData(msg);
	 });

}
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
