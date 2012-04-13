/*

This file is part of Ext JS 4

Copyright (c) 2011 Sencha Inc

Contact:  http://www.sencha.com/contact

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please contact the sales department at http://www.sencha.com/contact.

*/
Ext.require(['Ext.resizer.Resizer']);

Ext.onReady(function() {

    var basic = Ext.create('Ext.resizer.Resizer', {
        target: 'basic',
        width: 200,
        height: 100,
        minWidth: 100,
        minHeight: 50
    });

    var wrapped = Ext.create('Ext.resizer.Resizer', {
        target: 'wrapped',
        pinned:true,
        minWidth:50,
        minHeight: 50,
        preserveRatio: true
    });

    var snapping = Ext.create('Ext.resizer.Resizer', {
        target: 'croix-de-fer',
        width: 160,
        height: 120,
        minWidth: 160,
        minHeight: 120,
        preserveRatio: true,
        heightIncrement: 20,
        widthIncrement: 20
    });

    var transparent = Ext.create('Ext.resizer.Resizer', {
        target: 'transparent',
        minWidth:50,
        minHeight: 50,
        preserveRatio: true,
        transparent:true
    });

    var custom = Ext.create('Ext.resizer.Resizer', {
        target: 'custom',
        pinned:true,
        minWidth:50,
        minHeight: 50,
        preserveRatio: true,
        handles: 'all',
        dynamic: true
    });

    var customEl = custom.getEl();
    // move to the body to prevent overlap on my blog
    document.body.insertBefore(customEl.dom, document.body.firstChild);

    customEl.on('dblclick', function(){
        customEl.hide(true);
    });
    customEl.hide();

    Ext.get('showMe').on('click', function(){
        customEl.center();
        customEl.show(true);
    });

    var dwrapped = Ext.create('Ext.resizer.Resizer', {
        target: 'dwrapped',
        pinned:true,
        width:450,
        height:200,
        minWidth:200,
        minHeight: 50,
        dynamic: true
    });
});
