/**
 * @author lwj
 * Admin Console 
 */
var centerPanel='';
Ext.onReady(function(){
	Ext.BLANK_IMAGE_URL ='../ext-4.0.7-gpl/resources/themes/images/default/tree/s.gif'; 
//  Ext.BLANK_IMAGE_URL = 'http://www.cnblogs.com/ext4/resources/images/default/s.gif';
	
	var treeStore=Ext.create('Ext.data.TreeStore',{
	    root:{
	      expanded:true,
	      children:[
	      {id:'systemInfo',text:'systemInfo',leaf:true},
	      {id:'nodeInfo',text:'nodeInfo',leaf:true},
	      {id:'romote',text:'romote',leaf:true},
	      {id:'qq',text:'request',expanded:true,children:[
	          {id:'conRequest',text:'conRequest',leaf:true},
	          {id:'rpcRequest',text:'rpcRequest',leaf:true}
	      ]},
	       {id:'onlineUser',text:'onlineUser',leaf:true},
	       {id:'sceneInfo',text:'sceneInfo',leaf:true},
	       {id:'runScript',text:'runScript',leaf:true},
	       {id:'requesting',text:'requesting',leaf:true},
	       {id:'Wizard',text:'Wizard',leaf:true},
	       {id:'autoTest',text:'autoTest',leaf:true}      
	      ]
	    }
	});
	//admin consle menu----------------------------------------------------
	var westpanel=Ext.create('Ext.tree.Panel',{
		title:'Menu',
		region:'west',
		width:150,
		store:treeStore,
		enableDD:true,
		rootVisible: false,
		listeners: {
		  'itemclick' : function( view,re ){
		    	
			       var title=re.data.text;
			       var id=re.data.id;
			       var url='./html/'+id+'.html';
			       addIframe(title, url, id);
		    	
	           }
		  }
	}) ;

	
	//center Panel----------------------------------------------------
	 centerPanel=new Ext.create('Ext.tab.Panel',{
		region:'center',
		deferredRender:false,
		border:false,
		activeTab:0
	});
var viewport=new Ext.Viewport({
                layout:'border',
                items:[{
                    region:'north',
                    height:40,
                    html:'<body bgcolor="yellow"><div style="font-size:18px;height:40px;line-height:'+
                     '40px;background:#808080;color:white">Admin Console</div></body>'
                },westpanel,centerPanel]
            });

	
});
  /**
   * auto addPanel
   */
  function   addIframe(title, url, id) {
  	    tabPanel=centerPanel;
		
		if(tabPanel.getComponent(id)!=null)
		{
			var arr = url.split('?');
			if(arr.length>=2){
				tabPanel.remove(tabPanel.getComponent(id));
				
				var iframe = Ext.DomHelper.append(document.body, {tag: 'iframe', frameBorder: 0, src: url, width: '100%', height: '100%'});
		
				var tab = new Ext.Panel({
				id: id,
				title:title,
				titleCollapse:true,
				iconCls:id,
				tabTip: title,
				closable:true,
				autoScroll:true,
				border:true,
				fitToFrame: true,
				contentEl : iframe
				});
				
				tabPanel.add(tab);
				tabPanel.setActiveTab(tab);
				return(tab);
			}
			tabPanel.setActiveTab(tabPanel.getComponent(id));
			return;
		}

		var iframe = Ext.DomHelper.append(document.body, {tag: 'iframe', frameBorder: 0, src: url, width: '100%', height: '100%'});
		
		var tab = new Ext.Panel({
			id: id,
			title:title,
			titleCollapse:true,
			iconCls:id,
			tabTip: title,
			closable:true,
			autoScroll:true,
			border:true,
			fitToFrame: true,
			contentEl : iframe
			});
			tabPanel.add(tab);
			tabPanel.setActiveTab(tab);
			return(tab);
		};

