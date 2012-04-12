/*

This file is part of Ext JS 4

Copyright (c) 2011 Sencha Inc

Contact:  http://www.sencha.com/contact

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please contact the sales department at http://www.sencha.com/contact.

*/
/*!
* Ext JS Library 4.0
* Copyright(c) 2006-2011 Sencha Inc.
* licensing@sencha.com
* http://www.sencha.com/license
*/

Ext.define('MyDesktop.SystemStatus', {
    extend: 'Ext.ux.desktop.Module',

    requires: [
        'Ext.chart.*'
    ],

    id: 'systemstatus',

    refreshRate: 500,

    init : function() {
        // No launcher means we don't appear on the Start Menu...
//        this.launcher = {
//            text: 'SystemStatus',
//            iconCls:'cpustats',
//            handler : this.createWindow,
//            scope: this
//        };

        Ext.chart.theme.Memory = Ext.extend(Ext.chart.theme.Base, {
            constructor: function(config) {
                Ext.chart.theme.Memory.superclass.constructor.call(this, Ext.apply({
                    colors: [ 'rgb(244, 16, 0)',
                              'rgb(248, 130, 1)',
                              'rgb(0, 7, 255)',
                              'rgb(84, 254, 0)']
                }, config));
            }
        });
    },

    createNewWindow: function () {
        var me = this,
            desktop = me.app.getDesktop();

        me.cpuLoadData = [];
        me.cpuLoadStore = Ext.create('store.json', {
            fields: ['core1', 'core2']
        });

        me.memoryArray = ['Wired', 'Active', 'Inactive', 'Free'];
        me.memoryStore = Ext.create('store.json', {
                fields: ['name', 'memory'],
                data: me.generateData(me.memoryArray)
            });

        me.pass = 0;
        me.processArray = ['explorer', 'monitor', 'charts', 'desktop', 'Ext3', 'Ext4'];
        me.processesMemoryStore = Ext.create('store.json', {
            fields: ['name', 'memory'],
            data: me.generateData(me.processArray)
        });

        me.generateCpuLoad();

        return desktop.createWindow({
            id: 'systemstatus',
            title: 'System Status',
            width: 800,
            height: 600,
            animCollapse:false,
            constrainHeader:true,
            border: false,
            layout: 'fit',
            listeners: {
                afterrender: {
                    fn: me.updateCharts,
                    delay: 100
                },
                destroy: function () {
                    clearTimeout(me.updateTimer);
                    me.updateTimer = null;
                },
                scope: me
            },
            items: [{
                xtype: 'panel',
                layout: {
                    type: 'hbox',
                    align: 'stretch'
                },
                items: [{
                    flex: 1,
                    height: 600,
                    width: 400,
                    xtype: 'container',
                    layout: {
                        type: 'vbox',
                        align: 'stretch'
                    },
                    items: [
                        me.createCpu1LoadChart(),
                        me.createCpu2LoadChart()
                    ]
                }, {
                    flex: 1,
                    width: 400,
                    height: 600,
                    xtype: 'container',
                    layout: {
                        type: 'vbox',
                        align: 'stretch'
                    },
                    items: [
                        me.createMemoryPieChart(),
                        me.createProcessChart()
                    ]
                }]
            }]
        });
    },

    createWindow : function() {
        var win = this.app.getDesktop().getWindow(this.id);
        if (!win) {
            win = this.createNewWindow();
        }
        win.show();
        return win;
    },

    createCpu1LoadChart: function () {
        return {
            flex: 1,
            xtype: 'chart',
            theme: 'Category1',
            animate: false,
            store: this.cpuLoadStore,
            legend: {
                position: 'bottom'
            },
            axes: [{
                type: 'Numeric',
                position: 'left',
                minimum: 0,
                maximum: 100,
                fields: ['core1'],
                title: 'CPU Load',
                grid: true,
                labelTitle: {
                    font: '13px Arial'
                },
                label: {
                    font: '11px Arial'
                }
            }],
            series: [{
                title: 'Core 1 (3.4GHz)',
                type: 'line',
                lineWidth: 4,
                showMarkers: false,
                fill: true,
                axis: 'right',
                xField: 'time',
                yField: 'core1',
                style: {
                    'stroke-width': 1
                }
            }]
        };
    },

    createCpu2LoadChart: function () {
        return {
            flex: 1,
            xtype: 'chart',
            theme: 'Category2',
            animate: false,
            store: this.cpuLoadStore,
            legend: {
                position: 'bottom'
            },
            axes: [{
                type: 'Numeric',
                position: 'left',
                minimum: 0,
                maximum: 100,
                grid: true,
                fields: ['core2'],
                title: 'CPU Load',
                labelTitle: {
                    font: '13px Arial'
                },
                label: {
                    font: '11px Arial'
                }
            }],
            series: [{
                title: 'Core 2 (3.4GHz)',
                type: 'line',
                lineWidth: 4,
                showMarkers: false,
                fill: true,
                axis: 'right',
                xField: 'time',
                yField: 'core2',
                style: {
                    'stroke-width': 1
                }
            }]
        };
    },

    createMemoryPieChart: function () {
        var me = this;

        return {
            flex: 1,
            xtype: 'chart',
            animate: {
                duration: 250
            },
            store: this.memoryStore,
            shadow: true,

            legend: {
                position: 'right'
            },
            insetPadding: 40,
            theme: 'Memory:gradients',
            series: [{
                donut: 30,
                type: 'pie',
                field: 'memory',
                showInLegend: true,
                tips: {
                    trackMouse: true,
                    width: 140,
                    height: 28,
                    renderer: function(storeItem, item) {
                        //calculate percentage.
                        var total = 0;
                        me.memoryStore.each(function(rec) {
                            total += rec.get('memory');
                        });
                        this.setTitle(storeItem.get('name') + ': ' +
                            Math.round(storeItem.get('memory') / total * 100) + '%');
                    }
                },
                highlight: {
                    segment: {
                        margin: 20
                    }
                },
                labelTitle: {
                    font: '13px Arial'
                },
                label: {
                    field: 'name',
                    display: 'rotate',
                    contrast: true,
                    font: '12px Arial'
                }
            }]
        };
    },

    createProcessChart: function () {
        return {
            flex: 1,
            xtype: 'chart',
            theme: 'Category1',
            store: this.processesMemoryStore,
            animate: {
                easing: 'ease-in-out',
                duration: 750
            },
            axes: [{
                type: 'Numeric',
                position: 'left',
                minimum: 0,
                maximum: 10,
                fields: ['memory'],
                title: 'Memory',
                labelTitle: {
                    font: '13px Arial'
                },
                label: {
                    font: '11px Arial'
                }
            },{
                type: 'Category',
                position: 'bottom',
                fields: ['name'],
                title: 'System Processes',
                labelTitle: {
                    font: 'bold 14px Arial'
                },
                label: {
                    rotation: {
                        degrees: 45
                    }
                }
            },{
                type: 'Numeric',
                position: 'top',
                fields: ['memory'],
                title: 'Memory Usage',
                labelTitle: {
                    font: 'bold 14px Arial'
                },
                label: {
                    fill: '#FFFFFF',
                    stroke: '#FFFFFF'
                },
                axisStyle: {
                    fill: '#FFFFFF',
                    stroke: '#FFFFFF'
                }
            }],
            series: [{
                title: 'Processes',
                type: 'column',
                xField: 'name',
                yField: 'memory',
                renderer: function(sprite, record, attr, index, store) {
                    var lowColor = Ext.draw.Color.fromString('#b1da5a'),
                        value = record.get('memory'),
                        color;

                    if (value > 5) {
                        color = lowColor.getDarker((value - 5) / 15).toString();
                    } else {
                        color = lowColor.getLighter(((5 - value) / 20)).toString();
                    }

                    if (value >= 8) {
                        color = '#CD0000';
                    }

                    return Ext.apply(attr, {
                        fill: color
                    });
                }
            }]
        };
    },

    generateCpuLoad: function () {
        var me = this,
            data = me.cpuLoadData;

        function generate(factor) {
            var value = factor + ((Math.floor(Math.random() * 2) % 2) ? -1 : 1) * Math.floor(Math.random() * 9);

            if (value < 0 || value > 100) {
                value = 50;
            }

            return value;
        }

        if (data.length === 0) {
            data.push({
                core1: 0,
                core2: 0,
                time: 0
            });

            for (var i = 1; i < 100; i++) {
                data.push({
                    core1: generate(data[i - 1].core1),
                    core2: generate(data[i - 1].core2),
                    time: i
                });
            }

            me.cpuLoadStore.loadData(data);
        } else {
            me.cpuLoadStore.data.removeAt(0);
            me.cpuLoadStore.data.each(function(item, key) {
                item.data.time = key;
            });

            var lastData = me.cpuLoadStore.last().data;
            me.cpuLoadStore.loadData([{
                core1: generate(lastData.core1),
                core2: generate(lastData.core2),
                time: lastData.time + 1
            }], true);
        }

    },

    generateData: function (names) {
        var data = [],
            i,
            rest = names.length, consume;

        for (i = 0; i < names.length; i++) {
            consume = Math.floor(Math.random() * rest * 100) / 100 + 2;
            rest = rest - (consume - 5);
            data.push({
                name: names[i],
                memory: consume
            });
        }

        return data;
    },

    updateCharts: function () {
        var me = this;
        clearTimeout(me.updateTimer);
        me.updateTimer = setTimeout(function() {
            var start = new Date().getTime();
            if (me.pass % 3 === 0) {
                me.memoryStore.loadData(me.generateData(me.memoryArray));
            }

            if (me.pass % 5 === 0) {
                me.processesMemoryStore.loadData(me.generateData(me.processArray));
            }

            me.generateCpuLoad();

            var end = new Date().getTime();

            // no more than 25% average CPU load
            me.refreshRate = Math.max(me.refreshRate, (end - start) * 4);

            me.updateCharts();
            me.pass++;
        }, me.refreshRate);
    }
});

