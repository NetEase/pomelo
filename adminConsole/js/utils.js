function gridDetailShow(data){
	 var detailForm=Ext.create('Ext.form.Panel',{
		frame:true,
		anchor:'100%',
		items:[
			{
				xtype:'textareafield',
				id:'scriptNameId',
				name:'scriptName',
				allowBlank:false,
				height:400,
				value:data,
				anchor:'100%',
			}
		]	
	});
	  var win=Ext.create('Ext.window.Window',{
 	    id:'saveWinId',
  	    title:'saveScript',
  	    height:400,
  	    width:600,
  	    layout:'fit',
  	    anchor:'100%',
  	    // closeAction : 'hide',
  	    items:[detailForm]
  });
 win.show()
}