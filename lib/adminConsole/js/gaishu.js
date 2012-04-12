Ext.onReady(function(){

	Ext.BLANK_IMAGE_URL ='../ext-4.0.7-gpl/resources/themes/images/default/tree/s.gif'; 
	/**
	 * 详细信息store
	 */
var gridStore = Ext.create('Ext.data.Store', {
    fields:['nodeId','nodeType','hostName','Mem','loadAvg','CPU','state'],
    groupField: 'department',
    data:{'nodes':[
		{'nodeId':'1','nodeType':'airea','hostName':'local','Mem':100,'loadAvg':100,'CPU':'奔腾2000','state':'ok'},
		{'nodeId':'1','nodeType':'airea','hostName':'local','Mem':100,'loadAvg':100,'CPU':'奔腾2000','state':'ok'},
		{'nodeId':'1','nodeType':'airea','hostName':'local','Mem':100,'loadAvg':100,'CPU':'奔腾2000','state':'ok'},
		{'nodeId':'1','nodeType':'airea','hostName':'local','Mem':100,'loadAvg':100,'CPU':'奔腾2000','state':'ok'},
		{'nodeId':'1','nodeType':'airea','hostName':'local','Mem':100,'loadAvg':100,'CPU':'奔腾2000','state':'ok'},
		{'nodeId':'1','nodeType':'airea','hostName':'local','Mem':100,'loadAvg':100,'CPU':'奔腾2000','state':'ok'},
		{'nodeId':'1','nodeType':'airea','hostName':'local','Mem':100,'loadAvg':100,'CPU':'奔腾2000','state':'ok'}
		]},
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
    title: '详细信息',
	region:'center',
    store: gridStore,
    columns:[
		{header:'nodeId',dataIndex:'nodeId',width:100},
		{header:'nodeType',dataIndex:'nodeType',width:200},
		{header:'hostName',dataIndex:'hostName',width:200},
		{header:'Mem',dataIndex:'Mem',width:200},
		{header:'CPU',dataIndex:'CPU',width:200},
		{header:'state',dataIndex:'state'}
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