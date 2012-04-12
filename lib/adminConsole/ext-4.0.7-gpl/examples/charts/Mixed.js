/*

This file is part of Ext JS 4

Copyright (c) 2011 Sencha Inc

Contact:  http://www.sencha.com/contact

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please contact the sales department at http://www.sencha.com/contact.

*/
Ext.require('Ext.chart.*');
Ext.require(['Ext.Window', 'Ext.fx.target.Sprite', 'Ext.layout.container.Fit']);

Ext.onReady(function () {
    store1.loadData(generateData(8));
    var win = Ext.create('Ext.Window', {
        width: 800,
        height: 600,
        minHeight: 400,
        minWidth: 550,
        hidden: false,
        maximizable: true,
        title: 'Mixed Charts',
        renderTo: Ext.getBody(),
        layout: 'fit',
        tbar: [{
            text: 'Reload Data',
            handler: function() {
                store1.loadData(generateData(8));
            }
        }, {
            enableToggle: true,
            pressed: true,
            text: 'Animate',
            toggleHandler: function(btn, pressed) {
                var chart = Ext.getCmp('chartCmp');
                chart.animate = pressed ? { easing: 'ease', duration: 500 } : false;
            }
        }],
        items: {
            id: 'chartCmp',
            xtype: 'chart',
            style: 'background:#fff',
            animate: true,
            theme: 'Category1',
            store: store1,
            axes: [{
                type: 'Numeric',
                position: 'left',
                fields: ['data1', 'data2', 'data3'],
                title: 'Number of Hits',
                grid: true
            }, {
                type: 'Category',
                position: 'bottom',
                fields: ['name'],
                title: 'Month of the Year'
            }],
            series: [{
                type: 'column',
                axis: 'left',
                xField: 'name',
                yField: 'data1',
                markerConfig: {
                    type: 'cross',
                    size: 3
                }
            }, {
                type: 'scatter',
                axis: 'left',
                xField: 'name',
                yField: 'data2',
                markerConfig: {
                    type: 'circle',
                    size: 5
                }
            }, {
                type: 'line',
                axis: 'left',
                smooth: true,
                fill: true,
                fillOpacity: 0.5,
                xField: 'name',
                yField: 'data3'
            }]
        }
    });
});

