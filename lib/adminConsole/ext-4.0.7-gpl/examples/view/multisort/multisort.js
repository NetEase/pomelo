/*

This file is part of Ext JS 4

Copyright (c) 2011 Sencha Inc

Contact:  http://www.sencha.com/contact

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please contact the sales department at http://www.sencha.com/contact.

*/
Ext.Loader.setConfig({ enabled: true});
Ext.Loader.setPath('Ext.multisort', '.');
Ext.Loader.setPath('Ext.ux', '../../ux/');

Ext.require([
    'Ext.data.Store',
    'Ext.data.proxy.Ajax',
    'Ext.multisort.Panel',
    'Ext.multisort.SortButton',
    'Ext.ux.BoxReorderer',
    'Ext.ux.DataView.Animated'
]);

Ext.onReady(function() {
    Ext.create('Ext.multisort.Panel', {
        renderTo: Ext.getBody()
    });
});
