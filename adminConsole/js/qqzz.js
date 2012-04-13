Ext.onReady(function(){

	Ext.BLANK_IMAGE_URL ='../ext-4.0.7-gpl/resources/themes/images/default/tree/s.gif'; 
	
   var reqStore = Ext.create('Ext.data.Store', {
	id:'reqStoreId',
	autoLoad:false,
	pageSize:5,
    fields:['source','request route','request params','createTime','doneTime','cost(ms)'],
//    groupField: 'department',
    proxy: {
        type: 'memory',
        reader: {
            type: 'json',
            root: 'requests'
        }
    }
});
/**
 * 详细信息gridPanel
 */
var reqGrid=Ext.create('Ext.grid.Panel', {
	id:'reqGridId',
//    title: '详细信息',
	region:'center',
    store: reqStore,
    columns:[
		{header:'source',dataIndex:'source',width:150},
		{header:'request route',dataIndex:'request route',width:100},
		{header:'request params',dataIndex:'request params',width:200},
		{header:'createTime',dataIndex:'createTime',width:200},
		{header:'doneTime',dataIndex:'doneTime',width:200},
		{header:'cost(ms)',dataIndex:'cost(ms)',width:800}
//		{header:'state',dataIndex:'state'}
		]
});
var viewport=new Ext.Viewport({
	    layout:'border',
	    items:[reqGrid]
	});
});
socket.on('connect',function(){
	socket.emit('announce_web_client');
	 socket.on('history_response',function(msg){
  	  var req=msg;
//      alert('msg'+msg);
  });
});
