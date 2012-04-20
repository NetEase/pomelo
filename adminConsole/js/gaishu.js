Ext.onReady(function(){

	Ext.BLANK_IMAGE_URL ='../ext-4.0.7-gpl/resources/themes/images/default/tree/s.gif'; 
	/**
	 * system monitor data store
	 * without the data 'networkInterfaces' 
	 */
var sysStore = Ext.create('Ext.data.Store', {
	id:'sysStore',
	autoLoad:false,
	pageSize:5,
    fields:['Time','hostname',
            'cpu_user','cpu_nice','cpu_system','cpu_iowait','cpu_steal','cpu_idle',
            'tps','kb_read','kb_wrtn','kb_read_per','kb_wrtn_per',
            'totalmem','freemem','free/total',
            'm_1','m_5','m_15',
            ],
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
 * system's detailed  information
 */
var sysPanel=Ext.create('Ext.grid.Panel', {
	id:'gridPanelId',
    title: 'more information',
	region:'center',
    store: sysStore,
    autoScroll:true,
    columns:[
		    {text:'Time',width:120,sortable:false,dataIndex:'Time'},
		    {text:'cpu',
		     columns:[
		       {text:'user',width:60,sortable:true,dataIndex:'cpu_user'},
		       {text:'nice',width:60,sortable:true,dataIndex:'cpu_nice'},
		       {text:'system',width:60,sortable:true,dataIndex:'cpu_system'},
		       {text:'iowait',width:60,sortable:true,dataIndex:'cpu_iowait'},
		       {text:'steal',width:60,sortable:true,dataIndex:'cpu_steal'},
		       {text:'idle',width:60,sortable:true,dataIndex:'cpu_idle'}
		     ]},
		    {text:'disk',
		     columns:[
		       {text:'tps',width:70,sortable:true,dataIndex:'tps'},
		       {text:'kb_read',width:70,sortable:true,dataIndex:'kb_read'},
		       {text:'kb_wrtn',width:70,sortable:true,dataIndex:'kb_wrtn'},
		       {text:'kb_read/s',width:70,sortable:true,dataIndex:'kb_read_per'},
		       {text:'kb_wrtn/s',width:70,sortable:true,dataIndex:'kb_wrtn_per'}
		     ]},
		    {text:'mem',
		     columns:[
		       {text:'totalmem',width:70,sortable:true,dataIndex:'totalmem'},
		       {text:'freemem',width:70,sortable:true,dataIndex:'freemem'},
		       {text:'free/total',width:70,sortable:true,dataIndex:'free/total'}
		     ]},
		    {text:'loadavg',
		     columns:[
		       {text:'1m',width:60,sortable:true,dataIndex:'m_1'},
		       {text:'5m',width:60,sortable:true,dataIndex:'m_5'},
		       {text:'15m',width:60,sortable:true,dataIndex:'m_15'}
		     ]}
		]
});
/**
 *the whole information of system
 */

var gkPanel=Ext.create('Ext.panel.Panel',{
	id:'gkPanel',
    title:'whole information',
    region:'north',
    height:170,
    contentEl:overview
});

/**
 * 页面整体布局
 */
	var viewport=new Ext.Viewport({
	    layout:'border',
	    items:[gkPanel,sysPanel]
	});
});
/**
 * WebSocket通道,获取数据
 */
socket.on('connect',function(){
	socket.emit('announce_web_client');
	socket.emit('webmessage');
    socket.emit('sysMessage',{method:'getSystem'});
    socket.on('sysMessage',function(msg){
    	
    var system=msg.wholeMsg.system;
    var cpu=msg.wholeMsg.cpu;
    var start_time=msg.wholeMsg.start_time;
    contentUpdate(system,cpu,start_time);
    
   	var store=Ext.getCmp('gridPanelId').getStore();
    store.loadData(msg.nodes);
   });
   
});
/*
 * 当服务端推送新数据时，更新“概况信息”gkPanel的内容
 */
var contentUpdate=function(system,cpu,start_time){
    document.getElementById("system").innerHTML=system;
    document.getElementById("cpu").innerHTML=cpu;
//    document.getElementById("io").innerHTML=io;
    document.getElementById("start_time").innerHTML=start_time;
}
