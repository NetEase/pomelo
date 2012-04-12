/*

This file is part of Ext JS 4

Copyright (c) 2011 Sencha Inc

Contact:  http://www.sencha.com/contact

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please contact the sales department at http://www.sencha.com/contact.

*/
/**
 * @class Ext.layout.component.field.Field
 * @extends Ext.layout.component.Component
 * Layout class for components with {@link Ext.form.Labelable field labeling}, handling the sizing and alignment of
 * the form control, label, and error message treatment.
 * @private
 */
Ext.define('Ext.layout.component.field.Field', {

    /* Begin Definitions */

    alias: ['layout.field'],

    extend: 'Ext.layout.component.Component',

    uses: ['Ext.tip.QuickTip', 'Ext.util.TextMetrics'],

    /* End Definitions */

    type: 'field',

    beforeLayout: function(width, height) {
        var me = this;
        return me.callParent(arguments) || (!me.owner.preventMark && me.activeError !== me.owner.getActiveError());
    },

    onLayout: function(width, height) {
        var me = this,
            owner = me.owner,
            labelStrategy = me.getLabelStrategy(),
            errorStrategy = me.getErrorStrategy(),
            isDefined = Ext.isDefined,
            isNumber = Ext.isNumber,
            lastSize, autoWidth, autoHeight, info, undef;

        lastSize = me.lastComponentSize || {};
        if (!isDefined(width)) {
            width = lastSize.width;
            if (width < 0) { //first pass lastComponentSize.width is -Infinity
                width = undef;
            }
        }
        if (!isDefined(height)) {
            height = lastSize.height;
            if (height < 0) { //first pass lastComponentSize.height is -Infinity
                height = undef;
            }
        }
        autoWidth = !isNumber(width);
        autoHeight = !isNumber(height);

        info = {
            autoWidth: autoWidth,
            autoHeight: autoHeight,
            width: autoWidth ? owner.getBodyNaturalWidth() : width, //always give a pixel width
            height: height,
            setOuterWidth: false, //whether the outer el width should be set to the calculated width

            // insets for the bodyEl from each side of the component layout area
            insets: {
                top: 0,
                right: 0,
                bottom: 0,
                left: 0
            }
        };

        // NOTE the order of calculating insets and setting styles here is very important; we must first
        // calculate and set horizontal layout alone, as the horizontal sizing of elements can have an impact
        // on the vertical sizes due to wrapping, then calculate and set the vertical layout.

        // perform preparation on the label and error (setting css classes, qtips, etc.)
        labelStrategy.prepare(owner, info);
        errorStrategy.prepare(owner, info);

        // calculate the horizontal insets for the label and error
        labelStrategy.adjustHorizInsets(owner, info);
        errorStrategy.adjustHorizInsets(owner, info);

        // set horizontal styles for label and error based on the current insets
        labelStrategy.layoutHoriz(owner, info);
        errorStrategy.layoutHoriz(owner, info);

        // calculate the vertical insets for the label and error
        labelStrategy.adjustVertInsets(owner, info);
        errorStrategy.adjustVertInsets(owner, info);

        // set vertical styles for label and error based on the current insets
        labelStrategy.layoutVert(owner, info);
        errorStrategy.layoutVert(owner, info);

        // perform sizing of the elements based on the final dimensions and insets
        if (autoWidth && autoHeight) {
            // Don't use setTargetSize if auto-sized, so the calculated size is not reused next time
            me.setElementSize(owner.el, (info.setOuterWidth ? info.width : undef), info.height);
        } else {
            me.setTargetSize((!autoWidth || info.setOuterWidth ? info.width : undef), info.height);
        }
        me.sizeBody(info);

        me.activeError = owner.getActiveError();
    },
    
    onFocus: function(){
        this.getErrorStrategy().onFocus(this.owner);    
    },


    /**
     * Perform sizing and alignment of the bodyEl (and children) to match the calculated insets.
     */
    sizeBody: function(info) {
        var me = this,
            owner = me.owner,
            insets = info.insets,
            totalWidth = info.width,
            totalHeight = info.height,
            width = Ext.isNumber(totalWidth) ? totalWidth - insets.left - insets.right : totalWidth,
            height = Ext.isNumber(totalHeight) ? totalHeight - insets.top - insets.bottom : totalHeight;

        // size the bodyEl
        me.setElementSize(owner.bodyEl, width, height);

        // size the bodyEl's inner contents if necessary
        me.sizeBodyContents(width, height);
    },

    /**
     * Size the contents of the field body, given the full dimensions of the bodyEl. Does nothing by
     * default, subclasses can override to handle their specific contents.
     * @param {Number} width The bodyEl width
     * @param {Number} height The bodyEl height
     */
    sizeBodyContents: Ext.emptyFn,


    /**
     * Return the set of strategy functions from the {@link #labelStrategies labelStrategies collection}
     * that is appropriate for the field's {@link Ext.form.Labelable#labelAlign labelAlign} config.
     */
    getLabelStrategy: function() {
        var me = this,
            strategies = me.labelStrategies,
            labelAlign = me.owner.labelAlign;
        return strategies[labelAlign] || strategies.base;
    },

    /**
     * Return the set of strategy functions from the {@link #errorStrategies errorStrategies collection}
     * that is appropriate for the field's {@link Ext.form.Labelable#msgTarget msgTarget} config.
     */
    getErrorStrategy: function() {
        var me = this,
            owner = me.owner,
            strategies = me.errorStrategies,
            msgTarget = owner.msgTarget;
        return !owner.preventMark && Ext.isString(msgTarget) ?
                (strategies[msgTarget] || strategies.elementId) :
                strategies.none;
    },



    /**
     * Collection of named strategies for laying out and adjusting labels to accommodate error messages.
     * An appropriate one will be chosen based on the owner field's {@link Ext.form.Labelable#labelAlign} config.
     */
    labelStrategies: (function() {
        var applyIf = Ext.applyIf,
            emptyFn = Ext.emptyFn,
            base = {
                prepare: function(owner, info) {
                    var cls = owner.labelCls + '-' + owner.labelAlign,
                        labelEl = owner.labelEl;
                    if (labelEl && !labelEl.hasCls(cls)) {
                        labelEl.addCls(cls);
                    }
                },
                adjustHorizInsets: emptyFn,
                adjustVertInsets: emptyFn,
                layoutHoriz: emptyFn,
                layoutVert: emptyFn
            },
            left = applyIf({
                prepare: function(owner, info) {
                    base.prepare(owner, info);
                    // If auto width, add the label width to the body's natural width.
                    if (info.autoWidth) {
                        info.width += (!owner.labelEl ? 0 : owner.labelWidth + owner.labelPad);
                    }
                    // Must set outer width to prevent field from wrapping below floated label
                    info.setOuterWidth = true;
                },
                adjustHorizInsets: function(owner, info) {
                    if (owner.labelEl) {
                        info.insets.left += owner.labelWidth + owner.labelPad;
                    }
                },
                layoutHoriz: function(owner, info) {
                    // For content-box browsers we can't rely on Labelable.js#getLabelableRenderData
                    // setting the width style because it needs to account for the final calculated
                    // padding/border styles for the label. So we set the width programmatically here to
                    // normalize content-box sizing, while letting border-box browsers use the original
                    // width style.
                    var labelEl = owner.labelEl;
                    if (labelEl && !owner.isLabelSized && !Ext.isBorderBox) {
                        labelEl.setWidth(owner.labelWidth);
                        owner.isLabelSized = true;
                    }
                }
            }, base);


        return {
            base: base,

            /**
             * Label displayed above the bodyEl
             */
            top: applyIf({
                adjustVertInsets: function(owner, info) {
                    var labelEl = owner.labelEl;
                    if (labelEl) {
                        info.insets.top += Ext.util.TextMetrics.measure(labelEl, owner.fieldLabel, info.width).height +
                                           labelEl.getFrameWidth('tb') + owner.labelPad;
                    }
                }
            }, base),

            /**
             * Label displayed to the left of the bodyEl
             */
            left: left,

            /**
             * Same as left, only difference is text-align in CSS
             */
            right: left
        };
    })(),



    /**
     * Collection of named strategies for laying out and adjusting insets to accommodate error messages.
     * An appropriate one will be chosen based on the owner field's {@link Ext.form.Labelable#msgTarget} config.
     */
    errorStrategies: (function() {
        function setDisplayed(el, displayed) {
            var wasDisplayed = el.getStyle('display') !== 'none';
            if (displayed !== wasDisplayed) {
                el.setDisplayed(displayed);
            }
        }

        function setStyle(el, name, value) {
            if (el.getStyle(name) !== value) {
                el.setStyle(name, value);
            }
        }
        
        function showTip(owner) {
            var tip = Ext.layout.component.field.Field.tip,
                target;
                
            if (tip && tip.isVisible()) {
                target = tip.activeTarget;
                if (target && target.el === owner.getActionEl().dom) {
                    tip.toFront(true);
                }
            }
        }

        var applyIf = Ext.applyIf,
            emptyFn = Ext.emptyFn,
            base = {
                prepare: function(owner) {
                    setDisplayed(owner.errorEl, false);
                },
                adjustHorizInsets: emptyFn,
                adjustVertInsets: emptyFn,
                layoutHoriz: emptyFn,
                layoutVert: emptyFn,
                onFocus: emptyFn
            };

        return {
            none: base,

            /**
             * Error displayed as icon (with QuickTip on hover) to right of the bodyEl
             */
            side: applyIf({
                prepare: function(owner) {
                    var errorEl = owner.errorEl;
                    errorEl.addCls(Ext.baseCSSPrefix + 'form-invalid-icon');
                    Ext.layout.component.field.Field.initTip();
                    errorEl.dom.setAttribute('data-errorqtip', owner.getActiveError() || '');
                    setDisplayed(errorEl, owner.hasActiveError());
                },
                adjustHorizInsets: function(owner, info) {
                    if (owner.autoFitErrors && owner.hasActiveError()) {
                        info.insets.right += owner.errorEl.getWidth();
                    }
                },
                layoutHoriz: function(owner, info) {
                    if (owner.hasActiveError()) {
                        setStyle(owner.errorEl, 'left', info.width - info.insets.right + 'px');
                    }
                },
                layoutVert: function(owner, info) {
                    if (owner.hasActiveError()) {
                        setStyle(owner.errorEl, 'top', info.insets.top + 'px');
                    }
                },
                onFocus: showTip
            }, base),

            /**
             * Error message displayed underneath the bodyEl
             */
            under: applyIf({
                prepare: function(owner) {
                    var errorEl = owner.errorEl,
                        cls = Ext.baseCSSPrefix + 'form-invalid-under';
                    if (!errorEl.hasCls(cls)) {
                        errorEl.addCls(cls);
                    }
                    setDisplayed(errorEl, owner.hasActiveError());
                },
                adjustVertInsets: function(owner, info) {
                    if (owner.autoFitErrors) {
                        info.insets.bottom += owner.errorEl.getHeight();
                    }
                },
                layoutHoriz: function(owner, info) {
                    var errorEl = owner.errorEl,
                        insets = info.insets;

                    setStyle(errorEl, 'width', info.width - insets.right - insets.left + 'px');
                    setStyle(errorEl, 'marginLeft', insets.left + 'px');
                }
            }, base),

            /**
             * Error displayed as QuickTip on hover of the field container
             */
            qtip: applyIf({
                prepare: function(owner) {
                    setDisplayed(owner.errorEl, false);
                    Ext.layout.component.field.Field.initTip();
                    owner.getActionEl().dom.setAttribute('data-errorqtip', owner.getActiveError() || '');
                },
                onFocus: showTip
            }, base),

            /**
             * Error displayed as title tip on hover of the field container
             */
            title: applyIf({
                prepare: function(owner) {
                    setDisplayed(owner.errorEl, false);
                    owner.el.dom.title = owner.getActiveError() || '';
                }
            }, base),

            /**
             * Error message displayed as content of an element with a given id elsewhere in the app
             */
            elementId: applyIf({
                prepare: function(owner) {
                    setDisplayed(owner.errorEl, false);
                    var targetEl = Ext.fly(owner.msgTarget);
                    if (targetEl) {
                        targetEl.dom.innerHTML = owner.getActiveError() || '';
                        targetEl.setDisplayed(owner.hasActiveError());
                    }
                }
            }, base)
        };
    })(),

    statics: {
        /**
         * Use a custom QuickTip instance separate from the main QuickTips singleton, so that we
         * can give it a custom frame style. Responds to errorqtip rather than the qtip property.
         */
        initTip: function() {
            var tip = this.tip;
            if (!tip) {
                tip = this.tip = Ext.create('Ext.tip.QuickTip', {
                    baseCls: Ext.baseCSSPrefix + 'form-invalid-tip',
                    renderTo: Ext.getBody()
                });
                tip.tagConfig = Ext.apply({}, {attribute: 'errorqtip'}, tip.tagConfig);
            }
        },

        /**
         * Destroy the error tip instance.
         */
        destroyTip: function() {
            var tip = this.tip;
            if (tip) {
                tip.destroy();
                delete this.tip;
            }
        }
    }

});

