/*

This file is part of Ext JS 4

Copyright (c) 2011 Sencha Inc

Contact:  http://www.sencha.com/contact

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please contact the sales department at http://www.sencha.com/contact.

*/
Ext.require([
    'Ext.panel.*'
]);

Ext.onReady(function() {
    Ext.create('widget.button', {
        renderTo: 'button',
        
        text: 'Toggle UI: default-framed',
        handler: function() {
            var panel = Ext.getCmp('ui-panel'),
                uis = ['default-framed', 'bubble'],
                index = Ext.Array.indexOf(uis, panel.ui);
            
            if ((index + 1) >= uis.length) {
                panel.setUI(uis[0]);
            } else {
                panel.setUI(uis[index + 1]);
            }
            
            panel.doLayout();
            
            this.setText('Toggle UI: ' + panel.ui);
        }
    })
    
    // Normal panel
    Ext.create('widget.panel', {
        id: 'ui-panel',
        
        renderTo: 'panelCt',
        
        title: 'Plain Old Panel',
        width: 400,
        autoHeight: true,
        frame: true,
        
        contentEl: 'bubble-markup',
        
        html: 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Sed metus nibh, sodales a, porta at, vulputate eget, dui. Pellentesque ut nisl. Maecenas tortor turpis, interdum non, sodales non, iaculis ac, lacus. Vestibulum auctor, tortor quis iaculis malesuada, libero lectus bibendum purus, sit amet tincidunt quam turpis vel lacus. In pellentesque nisl non sem. Suspendisse nunc sem, pretium eget, cursus a, fringilla vel, urna.<br /><br />Aliquam commodo ullamcorper erat. Nullam vel justo in neque porttitor laoreet. Aenean lacus dui, consequat eu, adipiscing eget, nonummy non, nisi. Morbi nunc est, dignissim non, ornare sed, luctus eu, massa. Vivamus eget quam. Vivamus tincidunt diam nec urna. Curabitur velit.'
    });
});

