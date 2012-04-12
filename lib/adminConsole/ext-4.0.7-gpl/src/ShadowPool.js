/*

This file is part of Ext JS 4

Copyright (c) 2011 Sencha Inc

Contact:  http://www.sencha.com/contact

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please contact the sales department at http://www.sencha.com/contact.

*/
/**
 * Private utility class that manages the internal Shadow cache
 * @private
 */
Ext.define('Ext.ShadowPool', {
    singleton: true,
    requires: ['Ext.DomHelper'],

    markup: function() {
        if (Ext.supports.CSS3BoxShadow) {
            return '<div class="' + Ext.baseCSSPrefix + 'css-shadow" role="presentation"></div>';
        } else if (Ext.isIE) {
            return '<div class="' + Ext.baseCSSPrefix + 'ie-shadow" role="presentation"></div>';
        } else {
            return '<div class="' + Ext.baseCSSPrefix + 'frame-shadow" role="presentation">' +
                '<div class="xst" role="presentation">' +
                    '<div class="xstl" role="presentation"></div>' +
                    '<div class="xstc" role="presentation"></div>' +
                    '<div class="xstr" role="presentation"></div>' +
                '</div>' +
                '<div class="xsc" role="presentation">' +
                    '<div class="xsml" role="presentation"></div>' +
                    '<div class="xsmc" role="presentation"></div>' +
                    '<div class="xsmr" role="presentation"></div>' +
                '</div>' +
                '<div class="xsb" role="presentation">' +
                    '<div class="xsbl" role="presentation"></div>' +
                    '<div class="xsbc" role="presentation"></div>' +
                    '<div class="xsbr" role="presentation"></div>' +
                '</div>' +
            '</div>';
        }
    }(),

    shadows: [],

    pull: function() {
        var sh = this.shadows.shift();
        if (!sh) {
            sh = Ext.get(Ext.DomHelper.insertHtml("beforeBegin", document.body.firstChild, this.markup));
            sh.autoBoxAdjust = false;
        }
        return sh;
    },

    push: function(sh) {
        this.shadows.push(sh);
    },
    
    reset: function() {
        Ext.Array.each(this.shadows, function(shadow) {
            shadow.remove();
        });
        this.shadows = [];
    }
});
