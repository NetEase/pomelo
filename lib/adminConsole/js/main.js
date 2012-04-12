/**
 * @author lwj
 * Admin Console 主页面
 */
var centerPanel='';
Ext.onReady(function(){
//	Ext.BLANK_IMAGE_URL ='../ext-4.0.7-gpl/resources/themes/images/default/tree/s.gif'; 
  Ext.BLANK_IMAGE_URL = 'http://www.cnblogs.com/ext4/resources/images/default/s.gif';
	
	//一级目录Panel------------------------------------------------
	var westpanel=new Ext.create('Ext.panel.Panel',{
		title:'Home',
		region:'west',
		width:175,
		contentEl:homeId,
		bbar:[{xtype:'button',text:'Add home'},{xtype:'button',text:'Remove home'}]
	});
	//中间主Panel----------------------------------------------------
	 centerPanel=new Ext.create('Ext.tab.Panel',{
		region:'center',
		deferredRender:false,
		border:false,
		activeTab:0,
		items:[{title:'概况',autoShow:true}]
	});
var viewport=new Ext.Viewport({
                layout:'border',
                items:[{
                    region:'north',
                    height:40,
                    html:'<body bgcolor="yellow"><div style="font-size:18px;height:40px;line-height:40px;background:#808080;color:white">Admin Console</div></body>'
                },westpanel,centerPanel]
            });

	
});
  /**
   * 动态加载panel
   * @param {} title panle标题
   * @param {} url 要加载的内容
   * @param {} id tabPanel的id 
   * @return {}
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

