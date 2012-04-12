/*

This file is part of Ext JS 4

Copyright (c) 2011 Sencha Inc

Contact:  http://www.sencha.com/contact

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please contact the sales department at http://www.sencha.com/contact.

*/
Ext.define('FV.store.Articles', {
	extend: 'Ext.data.Store',

    requires: ['Ext.data.reader.Xml'],

    model: 'FV.model.Article',

	proxy: {
		type: 'ajax',
		url: 'feed-proxy.php',
		reader: {
			type: 'xml',
			record: 'item'
		}
	},

	sortInfo: {
		property: 'pubDate',
		direction: 'DESC'
	}
});

