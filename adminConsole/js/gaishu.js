Ext.onReady(function(){

	Ext.BLANK_IMAGE_URL ='../ext-4.0.7-gpl/resources/themes/images/default/tree/s.gif'; 
	/**
	 * 详细信息store
	 */
var gridStore = Ext.create('Ext.data.Store', {
	id:'gridStore',
	autoLoad:false,
	pageSize:5,
    fields:['nodeId','nodeType','hostName','freeMen/totalMem','loadAvg','cpu','state'],
//    groupField: 'department',
    proxy: {
        type: 'memory',
        reader: {
            type: 'json',
            root: 'nodes'
        }
    }
});
/**
 * 详细信息gridPanel
 */
var gridPanel=Ext.create('Ext.grid.Panel', {
	id:'gridPanelId',
    title: '详细信息',
	region:'center',
    store: gridStore,
    columns:[
		{header:'nodeId',dataIndex:'nodeId',width:150},
		{header:'nodeType',dataIndex:'nodeType',width:100},
		{header:'hostName',dataIndex:'hostName',width:200},
		{header:'freeMen/totalMem',dataIndex:'freeMen/totalMem',width:200},
		{header:'loadAvg',dataIndex:'loadAvg',width:200},
		{header:'cpu',dataIndex:'cpu',width:800}
//		{header:'state',dataIndex:'state'}
		]
});
/**
 * 概况信息panel
 */

var gkPanel=Ext.create('Ext.panel.Panel',{
	id:'gkPanel',
    title:'概况信息',
    region:'north',
    height:170,
    contentEl:overview
});

/**
 * 页面整体布局
 */
	var viewport=new Ext.Viewport({
	    layout:'border',
	    items:[gkPanel,gridPanel]
	});
});
/**
 * WebSocket通道,获取数据
 */
socket.on('connect',function(){
	socket.emit('announce_web_client');
    socket.on('gkMessage',function(msg){//获取“概述gkPanel”信息
//    console.log(JSON.stringify(msg));
    var nodeSize=msg.nodeSize||0;
    var requestSize=msg.requestSize||0;
    var messageSize=msg.messageSize||0;
    var startTime=msg.startTime||0;
    contentUpdate(nodeSize,requestSize,messageSize,startTime);
});
   socket.on('gkGrid',function(msg){//获取“概述gkPanel”信息
   var store=Ext.getCmp('gridPanelId').getStore();
   store.loadData(msg.nodes);
   
});
});
/*
 * 当服务端推送新数据时，更新“概况信息”gkPanel的内容
 */
var contentUpdate=function(nodeSize,requestSize,messageSize,startTime){
    document.getElementById("nodeSize").innerHTML=nodeSize;
    document.getElementById("requestSize").innerHTML=requestSize;
    document.getElementById("messageSize").innerHTML=messageSize;
    document.getElementById("startTime").innerHTML=startTime;
}
