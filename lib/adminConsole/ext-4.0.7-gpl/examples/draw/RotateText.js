/*

This file is part of Ext JS 4

Copyright (c) 2011 Sencha Inc

Contact:  http://www.sencha.com/contact

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please contact the sales department at http://www.sencha.com/contact.

*/
Ext.onReady(function() {
    Ext.create('Ext.draw.Component', {
        renderTo: Ext.get('text-ph'),
        viewBox: false,
        autoSize: true,
        height: 350,
        padding: 20,
        items: [{
            type: 'text',
            text: 'With Ext JS 4.0 Drawing',
            fill: '#000',
            font: '18px Arial',
            rotate: {
                degrees: 45
            }
        }]
    });
    
    Ext.create('Ext.draw.Component', {
        renderTo: Ext.get('text-ph'),
        viewBox: false,
        autoSize: true,
        height: 350,
        padding: 20,
        items: [{
            type: 'text',
            text: 'Creating a rotated Text component',
            fill: '#000',
            font: '18px Arial',
            rotate: {
                degrees: 90
            }
        }]
    });
    
    Ext.create('Ext.draw.Component', {
        renderTo: Ext.get('text-ph'),
        id: 'snappy',
        viewBox: false,
        height: 350,
        width: 200,
        padding: 20,
        items: [{
            type: 'text',
            text: 'Is a snap!',
            fill: '#000',
            font: '18px Arial',
            y: 50,
            rotate: {
                degrees: 315
            }
        }]
    });
    
    Ext.create('Ext.slider.Single', {
        renderTo: Ext.get('slider-ph'),
        hideLabel: true,
        width: 400,
        minValue: 0,
        maxValue: 360,
        value: 315,
        listeners: {
            change: function(slider, value) {
                var sprite = Ext.getCmp('snappy').surface.items.first();
                sprite.setAttributes({
                    rotation: {
                        degrees: value
                    }
                }, true);
            }
        }
    });
});
