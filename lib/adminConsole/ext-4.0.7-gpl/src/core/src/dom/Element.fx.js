/*

This file is part of Ext JS 4

Copyright (c) 2011 Sencha Inc

Contact:  http://www.sencha.com/contact

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please contact the sales department at http://www.sencha.com/contact.

*/
/**
 * @class Ext.Element
 */
/**
 * Visibility mode constant for use with {@link #setVisibilityMode}. Use visibility to hide element
 * @static
 * @type Number
 */
Ext.Element.VISIBILITY = 1;
/**
 * Visibility mode constant for use with {@link #setVisibilityMode}. Use display to hide element
 * @static
 * @type Number
 */
Ext.Element.DISPLAY = 2;

/**
 * Visibility mode constant for use with {@link #setVisibilityMode}. Use offsets (x and y positioning offscreen)
 * to hide element.
 * @static
 * @type Number
 */
Ext.Element.OFFSETS = 3;


Ext.Element.ASCLASS = 4;

/**
 * Defaults to 'x-hide-nosize'
 * @static
 * @type String
 */
Ext.Element.visibilityCls = Ext.baseCSSPrefix + 'hide-nosize';

Ext.Element.addMethods(function(){
    var El = Ext.Element,
        OPACITY = "opacity",
        VISIBILITY = "visibility",
        DISPLAY = "display",
        HIDDEN = "hidden",
        OFFSETS = "offsets",
        ASCLASS = "asclass",
        NONE = "none",
        NOSIZE = 'nosize',
        ORIGINALDISPLAY = 'originalDisplay',
        VISMODE = 'visibilityMode',
        ISVISIBLE = 'isVisible',
        data = El.data,
        getDisplay = function(dom){
            var d = data(dom, ORIGINALDISPLAY);
            if(d === undefined){
                data(dom, ORIGINALDISPLAY, d = '');
            }
            return d;
        },
        getVisMode = function(dom){
            var m = data(dom, VISMODE);
            if(m === undefined){
                data(dom, VISMODE, m = 1);
            }
            return m;
        };

    return {
        /**
         * @property {String} originalDisplay
         * The element's default display mode
         */
        originalDisplay : "",
        visibilityMode : 1,

        /**
         * Sets the element's visibility mode. When setVisible() is called it
         * will use this to determine whether to set the visibility or the display property.
         * @param {Number} visMode Ext.Element.VISIBILITY or Ext.Element.DISPLAY
         * @return {Ext.Element} this
         */
        setVisibilityMode : function(visMode){
            data(this.dom, VISMODE, visMode);
            return this;
        },

        /**
         * Checks whether the element is currently visible using both visibility and display properties.
         * @return {Boolean} True if the element is currently visible, else false
         */
        isVisible : function() {
            var me = this,
                dom = me.dom,
                visible = data(dom, ISVISIBLE);

            if(typeof visible == 'boolean'){ //return the cached value if registered
                return visible;
            }
            //Determine the current state based on display states
            visible = !me.isStyle(VISIBILITY, HIDDEN) &&
                      !me.isStyle(DISPLAY, NONE) &&
                      !((getVisMode(dom) == El.ASCLASS) && me.hasCls(me.visibilityCls || El.visibilityCls));

            data(dom, ISVISIBLE, visible);
            return visible;
        },

        /**
         * Sets the visibility of the element (see details). If the visibilityMode is set to Element.DISPLAY, it will use
         * the display property to hide the element, otherwise it uses visibility. The default is to hide and show using the visibility property.
         * @param {Boolean} visible Whether the element is visible
         * @param {Boolean/Object} animate (optional) True for the default animation, or a standard Element animation config object
         * @return {Ext.Element} this
         */
        setVisible : function(visible, animate){
            var me = this, isDisplay, isVisibility, isOffsets, isNosize,
                dom = me.dom,
                visMode = getVisMode(dom);


            // hideMode string override
            if (typeof animate == 'string'){
                switch (animate) {
                    case DISPLAY:
                        visMode = El.DISPLAY;
                        break;
                    case VISIBILITY:
                        visMode = El.VISIBILITY;
                        break;
                    case OFFSETS:
                        visMode = El.OFFSETS;
                        break;
                    case NOSIZE:
                    case ASCLASS:
                        visMode = El.ASCLASS;
                        break;
                }
                me.setVisibilityMode(visMode);
                animate = false;
            }

            if (!animate || !me.anim) {
                if(visMode == El.ASCLASS ){

                    me[visible?'removeCls':'addCls'](me.visibilityCls || El.visibilityCls);

                } else if (visMode == El.DISPLAY){

                    return me.setDisplayed(visible);

                } else if (visMode == El.OFFSETS){

                    if (!visible){
                        // Remember position for restoring, if we are not already hidden by offsets.
                        if (!me.hideModeStyles) {
                            me.hideModeStyles = {
                                position: me.getStyle('position'),
                                top: me.getStyle('top'),
                                left: me.getStyle('left')
                            };
                        }
                        me.applyStyles({position: 'absolute', top: '-10000px', left: '-10000px'});
                    }

                    // Only "restore" as position if we have actually been hidden using offsets.
                    // Calling setVisible(true) on a positioned element should not reposition it.
                    else if (me.hideModeStyles) {
                        me.applyStyles(me.hideModeStyles || {position: '', top: '', left: ''});
                        delete me.hideModeStyles;
                    }

                }else{
                    me.fixDisplay();
                    // Show by clearing visibility style. Explicitly setting to "visible" overrides parent visibility setting.
                    dom.style.visibility = visible ? '' : HIDDEN;
                }
            }else{
                // closure for composites
                if(visible){
                    me.setOpacity(0.01);
                    me.setVisible(true);
                }
                if (!Ext.isObject(animate)) {
                    animate = {
                        duration: 350,
                        easing: 'ease-in'
                    };
                }
                me.animate(Ext.applyIf({
                    callback: function() {
                        visible || me.setVisible(false).setOpacity(1);
                    },
                    to: {
                        opacity: (visible) ? 1 : 0
                    }
                }, animate));
            }
            data(dom, ISVISIBLE, visible);  //set logical visibility state
            return me;
        },


        /**
         * @private
         * Determine if the Element has a relevant height and width available based
         * upon current logical visibility state
         */
        hasMetrics  : function(){
            var dom = this.dom;
            return this.isVisible() || (getVisMode(dom) == El.OFFSETS) || (getVisMode(dom) == El.VISIBILITY);
        },

        /**
         * Toggles the element's visibility or display, depending on visibility mode.
         * @param {Boolean/Object} animate (optional) True for the default animation, or a standard Element animation config object
         * @return {Ext.Element} this
         */
        toggle : function(animate){
            var me = this;
            me.setVisible(!me.isVisible(), me.anim(animate));
            return me;
        },

        /**
         * Sets the CSS display property. Uses originalDisplay if the specified value is a boolean true.
         * @param {Boolean/String} value Boolean value to display the element using its default display, or a string to set the display directly.
         * @return {Ext.Element} this
         */
        setDisplayed : function(value) {
            if(typeof value == "boolean"){
               value = value ? getDisplay(this.dom) : NONE;
            }
            this.setStyle(DISPLAY, value);
            return this;
        },

        // private
        fixDisplay : function(){
            var me = this;
            if (me.isStyle(DISPLAY, NONE)) {
                me.setStyle(VISIBILITY, HIDDEN);
                me.setStyle(DISPLAY, getDisplay(this.dom)); // first try reverting to default
                if (me.isStyle(DISPLAY, NONE)) { // if that fails, default to block
                    me.setStyle(DISPLAY, "block");
                }
            }
        },

        /**
         * Hide this element - Uses display mode to determine whether to use "display" or "visibility". See {@link #setVisible}.
         * @param {Boolean/Object} animate (optional) true for the default animation or a standard Element animation config object
         * @return {Ext.Element} this
         */
        hide : function(animate){
            // hideMode override
            if (typeof animate == 'string'){
                this.setVisible(false, animate);
                return this;
            }
            this.setVisible(false, this.anim(animate));
            return this;
        },

        /**
        * Show this element - Uses display mode to determine whether to use "display" or "visibility". See {@link #setVisible}.
        * @param {Boolean/Object} animate (optional) true for the default animation or a standard Element animation config object
         * @return {Ext.Element} this
         */
        show : function(animate){
            // hideMode override
            if (typeof animate == 'string'){
                this.setVisible(true, animate);
                return this;
            }
            this.setVisible(true, this.anim(animate));
            return this;
        }
    };
}());
