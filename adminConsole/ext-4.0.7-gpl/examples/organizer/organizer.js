/*

This file is part of Ext JS 4

Copyright (c) 2011 Sencha Inc

Contact:  http://www.sencha.com/contact

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please contact the sales department at http://www.sencha.com/contact.

*/
Ext.Loader.setConfig({enabled: true});
Ext.Loader.setPath('Ext.org', '.');
Ext.Loader.setPath('Ext.ux.DataView', '../ux/DataView');

Ext.require([
    'Ext.org.ImageView',
    'Ext.org.AlbumTree',
    'Ext.org.OrgPanel'
]);

Ext.require([
    'Ext.data.TreeStore',
    'Ext.data.proxy.Ajax',
    'Ext.tree.Column',
    'Ext.tree.View',
    'Ext.selection.TreeModel',
    'Ext.tree.plugin.TreeViewDragDrop'
]);

Ext.onReady(function() {
    Ext.create('Ext.org.OrgPanel', {
        renderTo: Ext.getBody(),
        height: 490,
        width : 700
    });
});
