/*

This file is part of Ext JS 4

Copyright (c) 2011 Sencha Inc

Contact:  http://www.sencha.com/contact

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please contact the sales department at http://www.sencha.com/contact.

*/
/**
 * @class Ext.chart.theme.Theme
 * 
 * Provides chart theming.
 * 
 * Used as mixins by Ext.chart.Chart.
 */
Ext.define('Ext.chart.theme.Theme', {

    /* Begin Definitions */

    requires: ['Ext.draw.Color'],

    /* End Definitions */

    theme: 'Base',
    themeAttrs: false,
    
    initTheme: function(theme) {
        var me = this,
            themes = Ext.chart.theme,
            key, gradients;
        if (theme) {
            theme = theme.split(':');
            for (key in themes) {
                if (key == theme[0]) {
                    gradients = theme[1] == 'gradients';
                    me.themeAttrs = new themes[key]({
                        useGradients: gradients
                    });
                    if (gradients) {
                        me.gradients = me.themeAttrs.gradients;
                    }
                    if (me.themeAttrs.background) {
                        me.background = me.themeAttrs.background;
                    }
                    return;
                }
            }
            //<debug>
            Ext.Error.raise('No theme found named "' + theme + '"');
            //</debug>
        }
    }
}, 
// This callback is executed right after when the class is created. This scope refers to the newly created class itself
function() {
   /* Theme constructor: takes either a complex object with styles like:
  
   {
        axis: {
            fill: '#000',
            'stroke-width': 1
        },
        axisLabelTop: {
            fill: '#000',
            font: '11px Arial'
        },
        axisLabelLeft: {
            fill: '#000',
            font: '11px Arial'
        },
        axisLabelRight: {
            fill: '#000',
            font: '11px Arial'
        },
        axisLabelBottom: {
            fill: '#000',
            font: '11px Arial'
        },
        axisTitleTop: {
            fill: '#000',
            font: '11px Arial'
        },
        axisTitleLeft: {
            fill: '#000',
            font: '11px Arial'
        },
        axisTitleRight: {
            fill: '#000',
            font: '11px Arial'
        },
        axisTitleBottom: {
            fill: '#000',
            font: '11px Arial'
        },
        series: {
            'stroke-width': 1
        },
        seriesLabel: {
            font: '12px Arial',
            fill: '#333'
        },
        marker: {
            stroke: '#555',
            fill: '#000',
            radius: 3,
            size: 3
        },
        seriesThemes: [{
            fill: '#C6DBEF'
        }, {
            fill: '#9ECAE1'
        }, {
            fill: '#6BAED6'
        }, {
            fill: '#4292C6'
        }, {
            fill: '#2171B5'
        }, {
            fill: '#084594'
        }],
        markerThemes: [{
            fill: '#084594',
            type: 'circle' 
        }, {
            fill: '#2171B5',
            type: 'cross'
        }, {
            fill: '#4292C6',
            type: 'plus'
        }]
    }
  
  ...or also takes just an array of colors and creates the complex object:
  
  {
      colors: ['#aaa', '#bcd', '#eee']
  }
  
  ...or takes just a base color and makes a theme from it
  
  {
      baseColor: '#bce'
  }
  
  To create a new theme you may add it to the Themes object:
  
  Ext.chart.theme.MyNewTheme = Ext.extend(Object, {
      constructor: function(config) {
          Ext.chart.theme.call(this, config, {
              baseColor: '#mybasecolor'
          });
      }
  });
  
  //Proposal:
  Ext.chart.theme.MyNewTheme = Ext.chart.createTheme('#basecolor');
  
  ...and then to use it provide the name of the theme (as a lower case string) in the chart config.
  
  {
      theme: 'mynewtheme'
  }
 */

(function() {
    Ext.chart.theme = function(config, base) {
        config = config || {};
        var i = 0, l, colors, color,
            seriesThemes, markerThemes,
            seriesTheme, markerTheme, 
            key, gradients = [],
            midColor, midL;
        
        if (config.baseColor) {
            midColor = Ext.draw.Color.fromString(config.baseColor);
            midL = midColor.getHSL()[2];
            if (midL < 0.15) {
                midColor = midColor.getLighter(0.3);
            } else if (midL < 0.3) {
                midColor = midColor.getLighter(0.15);
            } else if (midL > 0.85) {
                midColor = midColor.getDarker(0.3);
            } else if (midL > 0.7) {
                midColor = midColor.getDarker(0.15);
            }
            config.colors = [ midColor.getDarker(0.3).toString(),
                              midColor.getDarker(0.15).toString(),
                              midColor.toString(),
                              midColor.getLighter(0.15).toString(),
                              midColor.getLighter(0.3).toString()];

            delete config.baseColor;
        }
        if (config.colors) {
            colors = config.colors.slice();
            markerThemes = base.markerThemes;
            seriesThemes = base.seriesThemes;
            l = colors.length;
            base.colors = colors;
            for (; i < l; i++) {
                color = colors[i];
                markerTheme = markerThemes[i] || {};
                seriesTheme = seriesThemes[i] || {};
                markerTheme.fill = seriesTheme.fill = markerTheme.stroke = seriesTheme.stroke = color;
                markerThemes[i] = markerTheme;
                seriesThemes[i] = seriesTheme;
            }
            base.markerThemes = markerThemes.slice(0, l);
            base.seriesThemes = seriesThemes.slice(0, l);
        //the user is configuring something in particular (either markers, series or pie slices)
        }
        for (key in base) {
            if (key in config) {
                if (Ext.isObject(config[key]) && Ext.isObject(base[key])) {
                    Ext.apply(base[key], config[key]);
                } else {
                    base[key] = config[key];
                }
            }
        }
        if (config.useGradients) {
            colors = base.colors || (function () {
                var ans = [];
                for (i = 0, seriesThemes = base.seriesThemes, l = seriesThemes.length; i < l; i++) {
                    ans.push(seriesThemes[i].fill || seriesThemes[i].stroke);
                }
                return ans;
            })();
            for (i = 0, l = colors.length; i < l; i++) {
                midColor = Ext.draw.Color.fromString(colors[i]);
                if (midColor) {
                    color = midColor.getDarker(0.1).toString();
                    midColor = midColor.toString();
                    key = 'theme-' + midColor.substr(1) + '-' + color.substr(1);
                    gradients.push({
                        id: key,
                        angle: 45,
                        stops: {
                            0: {
                                color: midColor.toString()
                            },
                            100: {
                                color: color.toString()
                            }
                        }
                    });
                    colors[i] = 'url(#' + key + ')'; 
                }
            }
            base.gradients = gradients;
            base.colors = colors;
        }
        /*
        base.axis = Ext.apply(base.axis || {}, config.axis || {});
        base.axisLabel = Ext.apply(base.axisLabel || {}, config.axisLabel || {});
        base.axisTitle = Ext.apply(base.axisTitle || {}, config.axisTitle || {});
        */
        Ext.apply(this, base);
    };
})();
});

