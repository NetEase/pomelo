/*

This file is part of Ext JS 4

Copyright (c) 2011 Sencha Inc

Contact:  http://www.sencha.com/contact

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please contact the sales department at http://www.sencha.com/contact.

*/
Ext.define('FV.view.feed.Show', {
	extend: 'Ext.panel.Panel',
	alias: 'widget.feedshow',

    requires: [
        'FV.view.article.Grid',
        'FV.view.article.Preview'
    ],

	closable: false,
	layout: {
		type: 'vbox',
		align: 'stretch'
	},

	initComponent: function() {
		Ext.apply(this, {
			items: [{
				xtype: 'articlegrid',
				flex: 1
			},{
				xtype: 'articlepreview',
				cls: 'articlepreview',
				height: 300
			}]
		});

		this.callParent(arguments);
	}
});

