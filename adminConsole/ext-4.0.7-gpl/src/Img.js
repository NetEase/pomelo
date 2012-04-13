/*

This file is part of Ext JS 4

Copyright (c) 2011 Sencha Inc

Contact:  http://www.sencha.com/contact

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please contact the sales department at http://www.sencha.com/contact.

*/
/**
 * @class Ext.Img
 * @extends Ext.Component
 *
 * Simple helper class for easily creating image components. This simply renders an image tag to the DOM
 * with the configured src.
 *
 * {@img Ext.Img/Ext.Img.png Ext.Img component}
 *
 * ## Example usage: 
 *
 *     var changingImage = Ext.create('Ext.Img', {
 *         src: 'http://www.sencha.com/img/20110215-feat-html5.png',
 *         renderTo: Ext.getBody()
 *     });
 *      
 *     // change the src of the image programmatically
 *     changingImage.setSrc('http://www.sencha.com/img/20110215-feat-perf.png');
*/
Ext.define('Ext.Img', {
    extend: 'Ext.Component',
    alias: ['widget.image', 'widget.imagecomponent'],
    /** @cfg {String} src The image src */
    src: '',

    getElConfig: function() {
        return {
            tag: 'img',
            src: this.src
        };
    },
    
    // null out this function, we can't set any html inside the image
    initRenderTpl: Ext.emptyFn,
    
    /**
     * Updates the {@link #src} of the image
     */
    setSrc: function(src) {
        var me = this,
            img = me.el;
        me.src = src;
        if (img) {
            img.dom.src = src;
        }
    }
});

