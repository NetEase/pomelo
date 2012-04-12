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