Ext
		.onReady(function() {

			Ext.BLANK_IMAGE_URL = '../ext-4.0.7-gpl/resources/themes/images/default/tree/s.gif';

			// server comboBox
			var serverStore = Ext.create('Ext.data.Store', {
				fields : [ 'name', 'serverId' ]
			});
			var serverCom = Ext.create('Ext.form.ComboBox', {
				id : 'serverComId',
				fieldLabel : 'on Server',
				labelWidth : 60,
				store : serverStore,
				queryMode : 'local',
				displayField : 'serverId',
				valueField : 'name'
			});

			// script comboBox
			var scriptStore = Ext.create('Ext.data.Store', {
				fields : [ 'type' ]
			});

			var scriptCom = Ext.create('Ext.form.ComboBox', {
				id : 'scriptComId',
				fieldLabel : '&nbsp;&nbsp;&nbsp;&nbsp;  Type',
				labelWidth : 80,
				store : scriptStore,
				queryMode : 'local',
				displayField : 'type',
				valueField : 'type',
			});

			var runScriptPanel = Ext.create('Ext.form.FormPanel', {
				bodyPadding : 10,
				autoScroll : true,
				autoShow : true,
				renderTo : Ext.getBody(),
				items : [ {
					layout : 'column',
					border : false,
					anchor : '95%',
					items : [ {
						xtype : 'label',
						text : 'Profiler:',
						columnWidth : .99
					}, serverCom, scriptCom ]
				},  {
					layout : 'column',
					anchor : '95%',
					border : false,
					items : [ {
						xtype : 'label',
						text : '.',
						columnWidth : 0.78
					}, {
						// colspan: 2
						xtype : 'button',
						text : 'start',
						handler : startProf,
						columnWidth : 0.08
					}, {
						xtype : 'label',
						text : '.',
						columnWidth : 0.06
					}, {
						// colspan: 2
						xtype : 'button',
						text : 'stop',
						handler : stopProf,
						columnWidth : 0.08
					} ]
				}, {
					xtype : 'label',
					text : 'result:'
				// height:20
				}, {
					xtype : 'textareafield',
					id : 'tesultTextId',
					height : 550,
					name : 'scriptId',
					anchor : '95%'
				} ]
			});

			var viewport = new Ext.Viewport({
				layout : 'border',
				items : [ runScriptPanel ]
			});
		});

	socket.on('connect', function() {
	socket.emit('announce_web_client');
	socket.emit('webMessage', {
		method : 'getSer_Scr'
	});
	socket.on('getSer_Scr', function(msg) {
		Ext.getCmp('serverComId').getStore().loadData(msg.serverArray);
		Ext.getCmp('scriptComId').getStore().loadData([ {
			"type" : 'cpu'
		}, {
			"type" : 'heap'
		} ]);
	});
});
// run the cript
function startProf() {
	var scriptJs = Ext.getCmp('scriptComId').getValue();
	var serverId = Ext.getCmp('serverComId').getValue();
	if (!serverId || serverId.length < 1) {
		alert('serverId is required!');
		return;
	}
	if (!scriptJs || scriptJs.length < 1) {
		alert('profiler type is required!');
		return;
	}
	socket.emit('webMessage', {
		method : 'profiler',
		type : scriptJs,
            action:'start',
		serverId : serverId
	});
	socket.on('profiler', function(msg) {
		Ext.getCmp('tesultTextId').setValue(msg);
	});
}

// run the cript
function stopProf() {
	var scriptJs = Ext.getCmp('scriptComId').getValue();
	var serverId = Ext.getCmp('serverComId').getValue();
	if (!serverId || serverId.length < 1) {
		alert('serverId is required!');
		return;
	}
	if (!scriptJs || scriptJs.length < 1) {
		alert('profiler type is required!');
		return;
	}
	socket.emit('webMessage', {
		method : 'profiler',
		type : scriptJs,
            action:'stop',
		serverId : serverId
	});
}

