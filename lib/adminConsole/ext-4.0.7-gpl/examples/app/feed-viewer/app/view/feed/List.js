/*

This file is part of Ext JS 4

Copyright (c) 2011 Sencha Inc

Contact:  http://www.sencha.com/contact

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please contact the sales department at http://www.sencha.com/contact.

*/
Ext.define('FV.view.feed.List', {
	extend: 'Ext.panel.Panel',
	alias: 'widget.feedlist',

    requires: ['Ext.toolbar.Toolbar'],

	title: 'Feeds',
	collapsible: true,
	animCollapse: true,
	margins: '5 0 5 5',
	layout: 'fit',

	initComponent: function() {
		Ext.apply(this, {
			items: [{
				xtype: 'dataview',
				trackOver: true,
				store: this.store,
				cls: 'feed-list',
				itemSelector: '.feed-list-item',
				overItemCls: 'feed-list-item-hover',
				tpl: '<tpl for="."><div class="feed-list-item">{name}</div></tpl>',
				listeners: {
				    selectionchange: this.onSelectionChange,
				    scope: this
				}
			}],

			dockedItems: [{
				xtype: 'toolbar',
				items: [{
					text: 'Add Feed',
					action: 'add'
				}, {
					text: 'Remove Feed',
					disabled: true,
					action: 'remove'
				}]
			}]
		});

		this.callParent(arguments);
	},
	
	onSelectionChange: function(selmodel, selection) {
        var selected = selection[0],
            button = this.down('button[action=remove]');
        if (selected) {
            button.enable();
        }
        else {
            button.disable();
        }
	}
});

