/*

This file is part of Ext JS 4

Copyright (c) 2011 Sencha Inc

Contact:  http://www.sencha.com/contact

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please contact the sales department at http://www.sencha.com/contact.

*/
/**
 * Provides precise pixel measurements for blocks of text so that you can determine exactly how high and
 * wide, in pixels, a given block of text will be. Note that when measuring text, it should be plain text and
 * should not contain any HTML, otherwise it may not be measured correctly.
 *
 * The measurement works by copying the relevant CSS styles that can affect the font related display, 
 * then checking the size of an element that is auto-sized. Note that if the text is multi-lined, you must 
 * provide a **fixed width** when doing the measurement.
 *
 * If multiple measurements are being done on the same element, you create a new instance to initialize 
 * to avoid the overhead of copying the styles to the element repeatedly.
 */
Ext.define('Ext.util.TextMetrics', {
    statics: {
        shared: null,
        /**
         * Measures the size of the specified text
         * @param {String/HTMLElement} el The element, dom node or id from which to copy existing CSS styles
         * that can affect the size of the rendered text
         * @param {String} text The text to measure
         * @param {Number} fixedWidth (optional) If the text will be multiline, you have to set a fixed width
         * in order to accurately measure the text height
         * @return {Object} An object containing the text's size `{width: (width), height: (height)}`
         */
        measure: function(el, text, fixedWidth){
            var me = this,
                shared = me.shared;
            
            if(!shared){
                shared = me.shared = new me(el, fixedWidth);
            }
            shared.bind(el);
            shared.setFixedWidth(fixedWidth || 'auto');
            return shared.getSize(text);
        },
        
        /**
          * Destroy the TextMetrics instance created by {@link #measure}.
          */
         destroy: function(){
             var me = this;
             Ext.destroy(me.shared);
             me.shared = null;
         }
    },
    
    /**
     * Creates new TextMetrics.
     * @param {String/HTMLElement/Ext.Element} bindTo The element or its ID to bind to.
     * @param {Number} fixedWidth (optional) A fixed width to apply to the measuring element.
     */
    constructor: function(bindTo, fixedWidth){
        var measure = this.measure = Ext.getBody().createChild({
            cls: 'x-textmetrics'
        });
        this.el = Ext.get(bindTo);
        
        measure.position('absolute');
        measure.setLeftTop(-1000, -1000);
        measure.hide();

        if (fixedWidth) {
           measure.setWidth(fixedWidth);
        }
    },
    
    /**
     * Returns the size of the specified text based on the internal element's style and width properties
     * @param {String} text The text to measure
     * @return {Object} An object containing the text's size `{width: (width), height: (height)}`
     */
    getSize: function(text){
        var measure = this.measure,
            size;
        
        measure.update(text);
        size = measure.getSize();
        measure.update('');
        return size;
    },
    
    /**
     * Binds this TextMetrics instance to a new element
     * @param {String/HTMLElement/Ext.Element} el The element or its ID.
     */
    bind: function(el){
        var me = this;
        
        me.el = Ext.get(el);
        me.measure.setStyle(
            me.el.getStyles('font-size','font-style', 'font-weight', 'font-family','line-height', 'text-transform', 'letter-spacing')
        );
    },
    
    /**
     * Sets a fixed width on the internal measurement element.  If the text will be multiline, you have
     * to set a fixed width in order to accurately measure the text height.
     * @param {Number} width The width to set on the element
     */
     setFixedWidth : function(width){
         this.measure.setWidth(width);
     },
     
     /**
      * Returns the measured width of the specified text
      * @param {String} text The text to measure
      * @return {Number} width The width in pixels
      */
     getWidth : function(text){
         this.measure.dom.style.width = 'auto';
         return this.getSize(text).width;
     },
     
     /**
      * Returns the measured height of the specified text
      * @param {String} text The text to measure
      * @return {Number} height The height in pixels
      */
     getHeight : function(text){
         return this.getSize(text).height;
     },
     
     /**
      * Destroy this instance
      */
     destroy: function(){
         var me = this;
         me.measure.remove();
         delete me.el;
         delete me.measure;
     }
}, function(){
    Ext.Element.addMethods({
        /**
         * Returns the width in pixels of the passed text, or the width of the text in this Element.
         * @param {String} text The text to measure. Defaults to the innerHTML of the element.
         * @param {Number} min (optional) The minumum value to return.
         * @param {Number} max (optional) The maximum value to return.
         * @return {Number} The text width in pixels.
         * @member Ext.Element
         */
        getTextWidth : function(text, min, max){
            return Ext.Number.constrain(Ext.util.TextMetrics.measure(this.dom, Ext.value(text, this.dom.innerHTML, true)).width, min || 0, max || 1000000);
        }
    });
});

