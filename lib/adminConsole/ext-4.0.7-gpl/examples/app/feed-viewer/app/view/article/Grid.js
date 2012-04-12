/*

This file is part of Ext JS 4

Copyright (c) 2011 Sencha Inc

Contact:  http://www.sencha.com/contact

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please contact the sales department at http://www.sencha.com/contact.

*/
Ext.define('FV.view.article.Grid', {
	extend: 'Ext.grid.Panel',
	alias: 'widget.articlegrid',

	cls: 'feed-grid',
	disabled: true,

    requires: ['Ext.ux.PreviewPlugin', 'Ext.toolbar.Toolbar'],
    
    border: false,
    
	initComponent: function() {
		Ext.apply(this, {
		    store: 'Articles',

			viewConfig: {
				plugins: [{
					pluginId: 'preview',
					ptype: 'preview',
					bodyField: 'description',
					previewExpanded: true
				}]
			},

			columns: [{
				text: 'Title',
				dataIndex: 'title',
				flex: 1,
				renderer: this.formatTitle
			}, {
				text: 'Author',
				dataIndex: 'author',
				hidden: true,
				width: 200
			}, {
				text: 'Date',
				dataIndex: 'pubDate',
				renderer: this.formatDate,
				width: 200
			}],
			dockedItems:[{
				xtype: 'toolbar',
				dock: 'top',
				items: [{
					text: 'Open All',
					action: 'openall'
				}]
			}]
		});

		this.callParent(arguments);
	},

	/**
	 * Title renderer
	 * @private
	 */
	formatTitle: function(value, p, record) {
		return Ext.String.format('<div class="topic"><b>{0}</b><span class="author">{1}</span></div>', value, record.get('author') || "Unknown");
	},

	/**
	 * Date renderer
	 * @private
	 */
	formatDate: function(date) {
		if (!date) {
			return '';
		}

		var now = new Date(),
			d = Ext.Date.clearTime(now, true),
			notime = Ext.Date.clearTime(date, true).getTime();

		if (notime === d.getTime()) {
			return 'Today ' + Ext.Date.format(date, 'g:i a');
		}

		d = Ext.Date.add(d, 'd', -6);
		if (d.getTime() <= notime) {
			return Ext.Date.format(date, 'D g:i a');
		}
		return Ext.Date.format(date, 'Y/m/d g:i a');
	}
});

