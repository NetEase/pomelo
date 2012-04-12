/*

This file is part of Ext JS 4

Copyright (c) 2011 Sencha Inc

Contact:  http://www.sencha.com/contact

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please contact the sales department at http://www.sencha.com/contact.

*/
Ext.require('Ext.slider.*');

Ext.onReady(function(){

    Ext.create('Ext.slider.Single', {
        renderTo: 'basic-slider',
        width: 214,
        minValue: 0,
        hideLabel: true,
        useTips: false,
        maxValue: 100
    });

    Ext.create('Ext.slider.Single', {
        renderTo: 'increment-slider',
        hideLabel: true,
        useTips: false,
        width: 214,
        value:50,
        increment: 10,
        minValue: 0,
        maxValue: 100
    });

    Ext.create('Ext.slider.Single', {
        renderTo: 'vertical-slider',
        hideLabel: true,
        useTips: false,
        height: 214,
        vertical: true,
        minValue: 0,
        maxValue: 100
    });

    Ext.create('Ext.slider.Single', {
        renderTo: 'tip-slider',
        hideLabel: true,
        width: 214,
        minValue: 0,
        maxValue: 100
    });



    Ext.create('Ext.slider.Single', {
        renderTo: 'custom-tip-slider',
        hideLabel: true,
        width: 214,
        increment: 10,
        minValue: 0,
        maxValue: 100,
        tipText: function(thumb){
            return Ext.String.format('<b>{0}% complete</b>', thumb.value);
        }
    });

    Ext.create('Ext.slider.Single', {
        renderTo: 'custom-slider',
        hideLabel: true,
        width: 214,
        increment: 10,
        minValue: 0,
        maxValue: 100
    });
    
    Ext.create('Ext.slider.Multi', {
        renderTo: 'multi-slider-horizontal',
        hideLabel: true,
        width: 214,
        minValue: 0,
        maxValue: 100,
        values: [10, 50, 90]
    });
    
    Ext.create('Ext.slider.Multi', {
        renderTo: 'multi-slider-vertical',
        hideLabel: true,
        vertical: true,
        height: 214,
        minValue: 0,
        maxValue: 100,
        values: [10, 50, 90]
    });
});

