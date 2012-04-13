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

var Renderers = {};

(function() {
     var ColorManager = {
       rgbToHsv: function(rgb) {
           var r = rgb[0] / 255,
               g = rgb[1] / 255,
               b = rgb[2] / 255,
               rd = Math.round,
               minVal = Math.min(r, g, b),
               maxVal = Math.max(r, g, b),
               delta = maxVal - minVal,
               h = 0, s = 0, v = 0,
               deltaRgb;

           v = maxVal;

           if (delta == 0) {
             return [0, 0, v];
           } else {
             s = delta / maxVal;
             deltaRgb = {
                 r: (((maxVal - r) / 6) + (delta / 2)) / delta,
                 g: (((maxVal - g) / 6) + (delta / 2)) / delta,
                 b: (((maxVal - b) / 6) + (delta / 2)) / delta
             };
             if (r == maxVal) {
                 h = deltaRgb.b - deltaRgb.g;
             } else if (g == maxVal) {
                 h = (1 / 3) + deltaRgb.r - deltaRgb.b;
             } else if (b == maxVal) {
                 h = (2 / 3) + deltaRgb.g - deltaRgb.r;
             }
             //handle edge cases for hue
             if (h < 0) {
                 h += 1;
             }
             if (h > 1) {
                 h -= 1;
             }
           }

           h = rd(h * 360);
           s = rd(s * 100);
           v = rd(v * 100);

           return [h, s, v];
       },

       hsvToRgb : function(hsv) {
           var h = hsv[0] / 360,
               s = hsv[1] / 100,
               v = hsv[2] / 100,
               r, g, b, rd = Math.round;

           if (s == 0) {
             v *= 255;
             return [v, v, v];
           } else {
             var vh = h * 6,
                 vi = vh >> 0,
                 v1 = v * (1 - s),
                 v2 = v * (1 - s * (vh - vi)),
                 v3 = v * (1 - s * (1 - (vh - vi)));

             switch(vi) {
                 case 0:
                     r = v; g = v3; b = v1;
                     break;
                 case 1:
                     r = v2; g = v; b = v1;
                     break;
                 case 2:
                     r = v1; g = v; b = v3;
                     break;
                 case 3:
                     r = v1; g = v2; b = v;
                     break;
                 case 4:
                     r = v3; g = v1; b = v;
                     break;
                 default:
                     r = v; g = v1; b = v2;
             }
             return [rd(r * 255),
                     rd(g * 255),
                     rd(b * 255)];
           }
       }
    };
    //Generic number interpolator
    var delta = function(x, y, a, b, theta) {
            return a + (b - a) * (y - theta) / (y - x);
    };
    //Add renderer methods.
    Ext.apply(Renderers, {
        color: function(fieldName, minColor, maxColor, minValue, maxValue) {
            var re = /rgb\s*\(\s*([0-9]+)\s*,\s*([0-9]+)\s*,\s*([0-9]+)\s*\)\s*/,
                minColorMatch = minColor.match(re),
                maxColorMatch = maxColor.match(re),
                interpolate = function(theta) {
                    return [ delta(minValue, maxValue, minColor[0], maxColor[0], theta),
                             delta(minValue, maxValue, minColor[1], maxColor[1], theta),
                             delta(minValue, maxValue, minColor[2], maxColor[2], theta) ];
                };
            minColor = ColorManager.rgbToHsv([ +minColorMatch[1], +minColorMatch[2], +minColorMatch[3] ]);
            maxColor = ColorManager.rgbToHsv([ +maxColorMatch[1], +maxColorMatch[2], +maxColorMatch[3] ]);
            //Return the renderer
            return function(sprite, record, attr, index, store) {
                var value = +record.get(fieldName),
                    rgb = ColorManager.hsvToRgb(interpolate(value)),
                    rgbString = 'rgb(' + rgb[0] + ', ' + rgb[1] + ', ' + rgb[2] + ')';
                return Ext.apply(attr, {
                    fill: rgbString
                });
            };
        },

        grayscale: function(fieldName, minColor, maxColor, minValue, maxValue) {
            var re = /rgb\s*\(\s*([0-9]+)\s*,\s*([0-9]+)\s*,\s*([0-9]+)\s*\)\s*/,
            minColorMatch = minColor.match(re),
            maxColorMatch = maxColor.match(re),
            interpolate = function(theta) {
                var ans = delta(minValue, maxValue, +minColorMatch[1], +maxColorMatch[1], theta) >> 0;
                return [ ans, ans, ans ];
            };
            //Return the renderer
            return function(sprite, record, attr, index, store) {
                var value = +record.get(fieldName),
                    rgb = interpolate(value),
                    rgbString = 'rgb(' + rgb[0] + ', ' + rgb[1] + ', ' + rgb[2] + ')';

                return Ext.apply(attr, {
                    fill: rgbString,
                    strokeFill: 'rgb(0, 0, 0)'
                });
            };
        },

        radius: function(fieldName, minRadius, maxRadius, minValue, maxValue) {
            var interpolate = function(theta) {
                return delta(minValue, maxValue, minRadius, maxRadius, theta);
            };
            //Return the renderer
            return function(sprite, record, attr, index, store) {
                var value = +record.get(fieldName),
                    radius = interpolate(value);

                return Ext.apply(attr, {
                    radius: radius,
                    size: radius
                });
            };
        }
    });
})();

Ext.onReady(function () {
    //current renderer configuration
    var rendererConfiguration = {
        xField: 'data1',
        yField: 'data2',
        color: false,
        colorFrom: 'rgb(250, 20, 20)',
        colorTo: 'rgb(127, 0, 240)',
        scale: false,
        scaleFrom: 'rgb(20, 20, 20)',
        scaleTo: 'rgb(220, 220, 220)',
        radius: false,
        radiusSize: 50
    };
    //update the visualization with the new renderer configuration
    function refresh() {
        var chart = Ext.getCmp('chartCmp'),
            series = chart.series.items,
            len = series.length,
            rc = rendererConfiguration,
            color, grayscale, radius, s;

        for(var i = 0; i < len; i++) {
            s = series[i];
            s.xField = rc.xField;
            s.yField = rc.yField;
            color = rc.color? Renderers.color(rc.color, rc.colorFrom, rc.colorTo, 0, 100) : function(a, b, attr) { return attr; };
            grayscale = rc.grayscale? Renderers.grayscale(rc.grayscale, rc.scaleFrom, rc.scaleTo, 0, 100) : function(a, b, attr) { return attr; };
            radius = rc.radius? Renderers.radius(rc.radius, 10, rc.radiusSize, 0, 100) : function(a, b, attr) { return attr; };
            s.renderer = function(sprite, record, attr, index, store) {
                return radius(sprite, record, grayscale(sprite, record, color(sprite, record, attr, index, store), index, store), index, store);
            };
        }
        chart.redraw();
    }
    //form selection callbacks/handlers.
    var xAxisHandler = function(elem) {
        var xField = elem.text;
        rendererConfiguration.xField = xField;
        refresh();
    };

    var yAxisHandler = function(elem) {
        var yField = elem.text;
        rendererConfiguration.yField = yField;
        refresh();
    };

    var colorVariableHandler = function(elem) {
        var color = elem.text;
        rendererConfiguration.color = color;
        rendererConfiguration.grayscale = false;
        refresh();
    };

    var grayscaleVariableHandler = function(elem) {
        var color = elem.text;
        rendererConfiguration.grayscale = color;
        rendererConfiguration.color = false;
        refresh();
    };

    var scaleFromHandler = function(elem) {
        var from = elem.text;
        rendererConfiguration.scaleFrom = from;
        refresh();
    };

    var scaleToHandler = function(elem) {
        var to = elem.text;
        rendererConfiguration.scaleTo = to;
        refresh();
    };

    var colorFromHandler = function(elem) {
        var from = elem.text;
        rendererConfiguration.colorFrom = from;
        refresh();
    };

    var colorToHandler = function(elem) {
        var to = elem.text;
        rendererConfiguration.colorTo = to;
        refresh();
    };

    var radiusHandler = function(elem) {
        var radius = elem.text;
        rendererConfiguration.radius = radius;
        refresh();
    };

    var radiusSizeHandler = function(elem) {
        var radius = elem.text;
        rendererConfiguration.radiusSize = parseInt(radius, 10);
        refresh();
    };

    var xAxisMenu = Ext.create('Ext.menu.Menu', {
        id: 'xAxisMenu',
        items: [ {
             text: 'data1',
             handler: xAxisHandler,
             checked: true,
             group: 'x'
           },
           {
             text: 'data2',
             handler: xAxisHandler,
               checked: false,
               group: 'x'
           },
           {
             text: 'data3',
             handler: xAxisHandler,
             checked: false,
             group: 'x'
           } ]
    });

    var yAxisMenu = Ext.create('Ext.menu.Menu', {
        id: 'yAxisMenu',
        items: [ {
            text: 'data1',
            handler: yAxisHandler,
            checked: false,
            group: 'y'
          },
          {
        text: 'data2',
            handler: yAxisHandler,
            checked: true,
            group: 'y'
          },
          {
            text: 'data3',
            handler: yAxisHandler,
            checked: false,
            group: 'y'
          } ]
    });

    var colorMenu = Ext.create('Ext.menu.Menu', {
        id: 'colorMenu',
        items: [ { text: 'data1', handler: colorVariableHandler, checked: false, group: 'color' },
                 { text: 'data2', handler: colorVariableHandler, checked: false, group: 'color' },
                 { text: 'data3', handler: colorVariableHandler, checked: false, group: 'color' },
                 { text: 'Color From',
                   menu: {
                     items: [{ text: 'rgb(250, 20, 20)', handler: colorToHandler, checked: true, group: 'colorrange' },
                             { text: 'rgb(20, 250, 20)', handler: colorToHandler, checked: false, group: 'colorrange' },
                             { text: 'rgb(20, 20, 250)', handler: colorToHandler, checked: false, group: 'colorrange' },
                             { text: 'rgb(127, 0, 240)', handler: colorFromHandler, checked: false, group: 'colorrange' },
                             { text: 'rgb(213, 70, 121)', handler: colorToHandler, checked: false, group: 'colorrange' },
                             { text: 'rgb(44, 153, 201)', handler: colorFromHandler, checked: false, group: 'colorrange' },
                             { text: 'rgb(146, 6, 157)', handler: colorFromHandler, checked: false, group: 'colorrange' },
                             { text: 'rgb(49, 149, 0)', handler: colorFromHandler, checked: false, group: 'colorrange' },
                             { text: 'rgb(249, 153, 0)', handler: colorFromHandler, checked: false, group: 'colorrange' }]
                   }
                 },
                 { text: 'Color To',
                     menu: {
                       items: [{ text: 'rgb(250, 20, 20)', handler: colorToHandler, checked: false, group: 'tocolorrange' },
                               { text: 'rgb(20, 250, 20)', handler: colorToHandler, checked: false, group: 'tocolorrange' },
                               { text: 'rgb(20, 20, 250)', handler: colorToHandler, checked: false, group: 'tocolorrange' },
                               { text: 'rgb(127, 0, 220)', handler: colorFromHandler, checked: true, group: 'tocolorrange' },
                               { text: 'rgb(213, 70, 121)', handler: colorToHandler, checked: false, group: 'tocolorrange' },
                               { text: 'rgb(44, 153, 201)', handler: colorToHandler, checked: false, group: 'tocolorrange' },
                               { text: 'rgb(146, 6, 157)' , handler: colorToHandler, checked: false, group: 'tocolorrange' },
                               { text: 'rgb(49, 149, 0)', handler: colorToHandler, checked: false, group: 'tocolorrange' },
                               { text: 'rgb(249, 153, 0)', handler: colorToHandler, checked: false, group: 'tocolorrange' }]
                     }
                   }
               ]
    });

    var grayscaleMenu = Ext.create('Ext.menu.Menu', {
        id: 'grayscaleMenu',
        items: [ { text: 'data1', handler: grayscaleVariableHandler, checked: false, group: 'gs' },
                 { text: 'data2', handler: grayscaleVariableHandler, checked: false, group: 'gs' },
                 { text: 'data3', handler: grayscaleVariableHandler, checked: false, group: 'gs' },
                 { text: 'Scale From',
                   menu: {
                     items: [{ text: 'rgb(20, 20, 20)', handler: scaleFromHandler, checked: true, group: 'gsrange' },
                             { text: 'rgb(80, 80, 80)', handler: scaleFromHandler, checked: false, group: 'gsrange' },
                             { text: 'rgb(120, 120, 120)', handler: scaleFromHandler, checked: false, group: 'gsrange' },
                             { text: 'rgb(180, 180, 180)', handler: scaleFromHandler, checked: false, group: 'gsrange' },
                             { text: 'rgb(220, 220, 220)', handler: scaleFromHandler, checked: false, group: 'gsrange' },
                             { text: 'rgb(250, 250, 250)', handler: scaleFromHandler, checked: false, group: 'gsrange' }]
                   }
                 },
                 { text: 'Scale To',
                     menu: {
                     items: [{ text: 'rgb(20, 20, 20)', handler: scaleToHandler, checked: false, group: 'togsrange' },
                             { text: 'rgb(80, 80, 80)', handler: scaleToHandler, checked: false, group: 'togsrange' },
                             { text: 'rgb(120, 120, 120)', handler: scaleToHandler, checked: false, group: 'togsrange' },
                             { text: 'rgb(180, 180, 180)', handler: scaleToHandler, checked: false, group: 'togsrange' },
                             { text: 'rgb(220, 220, 220)', handler: scaleToHandler, checked: true, group: 'togsrange' },
                             { text: 'rgb(250, 250, 250)', handler: scaleToHandler, checked: false, group: 'togsrange' }]
                     }
                   }
               ]
    });

    var radiusMenu = Ext.create('Ext.menu.Menu', {
        id: 'radiusMenu',
        style: {
            overflow: 'visible'     // For the Combo popup
        },
        items: [ { text: 'data1', handler: radiusHandler, checked: false, group: 'radius' },
                 { text: 'data2', handler: radiusHandler, checked: false, group: 'radius' },
                 { text: 'data3', handler: radiusHandler, checked: false, group: 'radius' },
                 { text: 'Max Radius',
                   menu: {
                     items: [{ text: '20', handler: radiusSizeHandler, checked: false, group: 'sradius' },
                             { text: '30', handler: radiusSizeHandler, checked: false, group: 'sradius' },
                             { text: '40', handler: radiusSizeHandler, checked: false, group: 'sradius' },
                             { text: '50', handler: radiusSizeHandler, checked: true, group: 'sradius' },
                             { text: '60', handler: radiusSizeHandler, checked: false, group: 'sradius' }]
                   }
                 }
               ]
    });

     var win = Ext.create('Ext.Window', {
        width: 800,
        height: 600,
        minHeight: 400,
        minWidth: 550,
        hidden: false,
        maximizable: true,
        title: 'Scatter Chart Renderer',
        renderTo: Ext.getBody(),
        layout: 'fit',
        tbar: [
        {
            text: 'Reload Data',
            handler: function() {
                store1.loadData(generateData());
            }
        },
        {
            text: 'Select X Axis',
            menu: xAxisMenu
        },
        {
            text: 'Select Y Axis',
            menu: yAxisMenu
        },

        {
            text: 'Select Color',
            menu: colorMenu
        },
        {
            text: 'Select Grayscale',
            menu: grayscaleMenu
        },
        {
            text: 'Select Radius',
            menu: radiusMenu
        }
        ],
        items: {
            id: 'chartCmp',
            xtype: 'chart',
            style: 'background:#fff',
            animate: true,
            store: store1,
            axes: false,
            insetPadding: 50,
            series: [{
                type: 'scatter',
                axis: false,
                xField: 'data1',
                yField: 'data2',
                color: '#ccc',
                markerConfig: {
                    type: 'circle',
                    radius: 20,
                    size: 20
                }
            }]
        }
    });
});

