/*

This file is part of Ext JS 4

Copyright (c) 2011 Sencha Inc

Contact:  http://www.sencha.com/contact

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please contact the sales department at http://www.sencha.com/contact.

*/
Ext4.onReady(function() {
    var memoryArray,
        processArray,
        colors,
        memoryStore,
        processesMemoryStore,
        cpuLoadStore,
        data,
        memoryPieChartConfig,
        barChartConfig,
        cpuLoadChartConfig,
        cpuLoadChartConfig2,
        win,
        cpuLoadTimer, pass;

    memoryArray = ['Wired', 'Active', 'Inactive', 'Free'];
    processArray = ['explorer', 'monitor', 'charts', 'desktop', 'Ext3', 'Ext4'];
    colors = ['rgb(244, 16, 0)',
              'rgb(248, 130, 1)',
              'rgb(0, 7, 255)',
              'rgb(84, 254, 0)'];

    Ext4.chart.theme.Memory = Ext4.extend(Ext4.chart.theme.Base, {
        constructor: function(config) {
            Ext4.chart.theme.Base.prototype.constructor.call(this, Ext4.apply({
                colors: colors
            }, config));
        }
    });

    function generateData(a) {
        var data = [],
            i,
            names = a,
            rest = a.length, total = rest, consume;
        for (i = 0; i < a.length; i++) {
            consume = Math.floor(Math.random() * rest * 100) / 100 + 2;
            rest = rest - (consume - 5);
            data.push({
                name: names[i],
                memory: consume
            });
        }

        return data;
    }

    memoryStore = Ext4.create('store.json', {
        fields: ['name', 'memory'],
        data: generateData(memoryArray)
    });

    processesMemoryStore = Ext4.create('store.json', {
        fields: ['name', 'memory'],
        data: generateData(processArray)
    });

    cpuLoadStore = Ext4.create('store.json', { fields: ['core1', 'core2'] });

    data = [];

    function generateCpuLoad() {
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

            cpuLoadStore.loadData(data);
        }
        else {
            cpuLoadStore.data.removeAt(0);
            cpuLoadStore.data.each(function(item, key) {
                item.data.time = key;
            });

            var lastData = cpuLoadStore.last().data;
            cpuLoadStore.loadData([{
                core1: generate(lastData.core1),
                core2: generate(lastData.core2),
                time: lastData.time + 1
            }], true);
        }

    }

    generateCpuLoad();

    memoryPieChartConfig = {
        flex: 1,
        xtype: 'chart',
        animate: {
            duration: 250
        },
        store: memoryStore,
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
                    memoryStore.each(function(rec) {
                        total += rec.get('memory');
                    });
                    this.setTitle(storeItem.get('name') + ': ' + Math.round(storeItem.get('memory') / total * 100) + '%');
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

    barChartConfig = {
        flex: 1,
        xtype: 'chart',
        theme: 'Category1',
        store: processesMemoryStore,
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
                var highColor = Ext4.draw.Color.fromString('#e84b67'),
                    lowColor = Ext4.draw.Color.fromString('#b1da5a'),
                    value = record.get('memory'),
                    color;

                if (value > 5) {
                    color = lowColor.getDarker((value - 5) / 15).toString();
                }
                else {
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

    cpuLoadChartConfig = {
        flex: 1,
        xtype: 'chart',
        theme: 'Category1',
        animate: false,
        store: cpuLoadStore,
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

    cpuLoadChartConfig2 = {
        flex: 1,
        xtype: 'chart',
        theme: 'Category2',
        animate: false,
        store: cpuLoadStore,
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

    win = Ext4.createWidget('window', {
        x: 90,
        y: 50,
        width: 800,
        height: 600,
        title: 'System Statistics',
        renderTo: Ext4.getBody(),
        closeAction: 'hide',
        layout: 'fit',
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
                    cpuLoadChartConfig,
                    cpuLoadChartConfig2
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
                    memoryPieChartConfig,
                    barChartConfig
                ]
            }]
        }]
    });

    pass = 0;
    function doGenerateCpuLoad() {
        clearTimeout(cpuLoadTimer);
        cpuLoadTimer = setTimeout(function() {
            if (pass % 3 === 0) {
                memoryStore.loadData(generateData(memoryArray));
            }

            if (pass % 5 === 0) {
                processesMemoryStore.loadData(generateData(processArray));
            }

            generateCpuLoad();
            doGenerateCpuLoad();
            pass++;
        }, 500);
    }

    Ext.get('chart-win-shortcut').on('click', function() {
        doGenerateCpuLoad();
        win.show();
    });
});

