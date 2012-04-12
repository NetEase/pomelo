/**
 * @author lwj
 * Admin Console 主页面
 */
var centerPanel='';
Ext.onReady(function(){
	Ext.BLANK_IMAGE_URL ='../ext-4.0.7-gpl/resources/themes/images/default/tree/s.gif'; 
//  Ext.BLANK_IMAGE_URL = 'http://www.cnblogs.com/ext4/resources/images/default/s.gif';
	
	//一级目录Panel------------------------------------------------
//	var westpanel=new Ext.create('Ext.panel.Panel',{
//		title:'Home',
//		region:'west',
//		width:175,
//		contentEl:homeId,
//		bbar:[{xtype:'button',text:'Add home'},{xtype:'button',text:'Remove home'}]
//	});
	var treeStore=Ext.create('Ext.data.TreeStore',{
	    root:{
	      expanded:true,
	      children:[
	      {id:'gaishu',text:'概述',leaf:true},
	      {id:'romote',text:'romote',leaf:true},
	      {id:'qq',text:'请求',expanded:true,children:[
	          {id:'qqzz',text:'请求追踪',leaf:true},
	          {id:'qqtj',text:'请求统计',leaf:true}
	      ]},
	       {id:'zxyh',text:'在线用户',leaf:true},
	       {id:'cjsj',text:'场景数据',leaf:true},
	       {id:'yxjb',text:'运行脚本',leaf:true},
	       {id:'fsqq',text:'发送请求',leaf:true},
	       {id:'wizard',text:'Wizard',leaf:true},
	       {id:'zdcs',text:'自动测试',leaf:true}      
	      ]
	    }
	});
	//二级目录菜单----------------------------------------------------
	var westpanel=Ext.create('Ext.tree.Panel',{
		title:'菜单',
		region:'west',
		width:200,
		store:treeStore,
		enableDD:true,
		rootVisible: false,
//		listeners: {
//		  dblclick : {
//		    element:'el',
//		    fn:function( node, event ){
////		    	if(node.leaf){
////			       var title=node.text;
////			       var id=node.id;
//		    	   var node=node;
//		    	   var event=event;
//			       var url='./html/'+id+'.html';
//			       addIframe(title, url, id);
////		    	}
//	           }
//		  }
//		  
//		}
	}) ;
	westpanel.addListener('cellClick', enter, this);
	var text,id;
	function enter(view,record,item,index,e){
	  text=record.raw.text;
	  id=record.raw.id;
	  var url='./html/'+id+'.html';
	  addIframe(text, url, id);
	}
	
	//树形菜单单击事件
//	westpanel.on("dblclick",function(node,e){
//	  alert("你没得");
//	  var title=node.data.text;
//	  var id=node.data.id;
//	  var url='./html/'+id+'.html';
//	  addIframe(title, url, id);
//	});
//	westpanel.render();
	
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

