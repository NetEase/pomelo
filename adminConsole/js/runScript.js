
Ext.onReady(function(){

	Ext.BLANK_IMAGE_URL ='../ext-4.0.7-gpl/resources/themes/images/default/tree/s.gif'; 
    
    //server comboBox
    var serverStore = Ext.create('Ext.data.Store', {
		    fields: ['name', 'serverId']
		});
    var serverCom=Ext.create('Ext.form.ComboBox', {
    	    id:'serverComId',
		    fieldLabel: 'on Server',
		    labelWidth: 60,
		    store: serverStore,
		    queryMode: 'local',
		    displayField: 'serverId',
		    valueField: 'name'
		});

    //script comboBox
    var scriptStore = Ext.create('Ext.data.Store', {
		    fields: ['name', 'script']
		});
    var scriptCom=Ext.create('Ext.form.ComboBox', {
    	    id:'scriptComId',
		    fieldLabel: 'script Library',
		    labelWidth: 80,
		    store: scriptStore,
		    queryMode: 'local',
		    displayField: 'script',
		    valueField: 'name',
		    listeners:{
		    	select:{
		    		fn:function(){
		    			var value=scriptCom.getValue();
		    			getFile(value);
		    		}
		    	}
		    }
		});


	var runScriptPanel=Ext.create('Ext.form.FormPanel', {
	    bodyPadding: 10,
	    autoScroll:true,
	    autoShow:true,
	    renderTo   : Ext.getBody(),
	    items:[{
	    	layout:'column',
	    	border:false,
	    	anchor:'95%',
	        items:[
	        	{xtype:'label',text:'runScript:',columnWidth:.99},serverCom,scriptCom]},
	        	{
			    	xtype : 'textareafield',
			    	height:150,
			    	id:'scriptAreaId',
			    	anchor : '95%'

			    },{
			    	layout:'column',
			    	anchor:'95%',
			    	border:false,
			    	items:[{
			    		xtype:'label',
			    		text:'.',
			    		columnWidth:0.78
			    	},{
			    		// colspan: 2
	    		        xtype:'button',
	    		        text:'run',
	    		        handler:runScript,
	    		        columnWidth:0.08
			    	},{
			    		xtype:'label',
			    		text:'.',
			    		columnWidth:0.06
			    	},{
			    		// colspan: 2
	    		        xtype:'button',
	    		        text:'save',
	    		        handler:save,
	    		        columnWidth:0.08
			    	}]
			    },{
			    	xtype:'label',
		    		text:'result:'
		    		// height:20
			    },{
			    	xtype : 'textareafield',
			    	id:'tesultTextId',
			    	height:150,
			    	name:'scriptId',
			    	anchor : '95%'
			    },{
			    	id:'runtimeId',
			    	html:'runtime:',
			    	border:false
			    }]
	});

	var viewport=new Ext.Viewport({
	    layout:'border',
	    items:[runScriptPanel]
	});
});
function save(){
	var saveForm=Ext.create('Ext.form.Panel',{
		frame:true,
		bodyStyle:'padding:2px 2px 0',
		width: 300,
		// defaultType: 'textfield',
		// renderTo: Ext.getBody(),
		anchor:'100%',
		fieldDefaults: {
            msgTarget: 'side',
            labelWidth: 50
        },
		items:[
			{
				xtype:'textfield',
				id:'scriptNameId',
				fieldLabel:'name',
				name:'scriptName',
				allowBlank:false,
				width:250,
				value:Ext.getCmp('scriptComId').getValue()
			}
		],
		buttons: [{
            text: 'Save',
            handler:saveFile
        },{
            text: 'Cancel',
            handler:cancel
        }]
	});
 var win=Ext.create('Ext.window.Window',{
 	    id:'saveWinId',
  	    title:'saveScript',
  	    height:100,
  	    width:320,
  	    layout:'fit',
  	    anchor:'100%',
  	    items:[saveForm]
  });
 win.show()
}
function cancel(){
    Ext.getCmp('saveWinId').close();
}
socket.on('connect',function(){
		socket.emit('announce_web_client');
		socket.emit('getSer_Scr',{});
		socket.on('getSer_Scr',function(msg){
	    Ext.getCmp('serverComId').getStore().loadData(msg.serverArray);
	    Ext.getCmp('scriptComId').getStore().loadData(msg.scriptArray);
	  });
	});
//run the cript
function runScript(){
	var scriptJs=Ext.getCmp('scriptAreaId').getValue();
	var serverId=Ext.getCmp('serverComId').getValue();
	if(!serverId||serverId.length<1){
		alert('serverId is required!');
		return;
	}
	socket.emit('runScript',{scriptJs:scriptJs,serverId:serverId});
	socket.on('runScript',function(msg){
	    Ext.getCmp('tesultTextId').setValue(msg);
	});
}
var getFile=function(filename){
	    socket.emit('getFile',{filename:filename});
	    socket.on('getFile',function(msg){
	    	Ext.getCmp('scriptAreaId').setValue(msg);
	    })
	}
var saveFile=function(){
	var filename=Ext.getCmp('scriptNameId').getValue();
	if(!filename.match(/\.js$/)){
		alert('the filename is required!');
		return;
	}
	var data=Ext.getCmp('scriptAreaId').getValue();
	socket.emit('saveFile',{filename:filename,data:data});
	socket.on('saveFile',function(msg){
		if(msg=='yes'){
			Ext.getCmp('saveWinId').close();
			alert('save success!');
			data=Ext.getCmp('scriptAreaId').setValue('');
		}else{
			alert('save failed!');
		}
	});
}
