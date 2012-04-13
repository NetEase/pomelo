/*

This file is part of Ext JS 4

Copyright (c) 2011 Sencha Inc

Contact:  http://www.sencha.com/contact

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please contact the sales department at http://www.sencha.com/contact.

*/
/*
 * This is a derivative of the similarly named class in the YUI Library.
 * The original license:
 * Copyright (c) 2006, Yahoo! Inc. All rights reserved.
 * Code licensed under the BSD License:
 * http://developer.yahoo.net/yui/license.txt
 */


/**
 * @class Ext.dd.DDTarget
 * @extends Ext.dd.DragDrop
 * A DragDrop implementation that does not move, but can be a drop
 * target.  You would get the same result by simply omitting implementation
 * for the event callbacks, but this way we reduce the processing cost of the
 * event listener and the callbacks.
 */
Ext.define('Ext.dd.DDTarget', {
    extend: 'Ext.dd.DragDrop',

    /**
     * Creates new DDTarget.
     * @param {String} id the id of the element that is a drop target
     * @param {String} sGroup the group of related DragDrop objects
     * @param {Object} config an object containing configurable attributes.
     * Valid properties for DDTarget in addition to those in DragDrop: none.
     */
    constructor: function(id, sGroup, config) {
        if (id) {
            this.initTarget(id, sGroup, config);
        }
    },

    /**
     * @hide
     * Overridden and disabled. A DDTarget does not support being dragged.
     * @method
     */
    getDragEl: Ext.emptyFn,
    /**
     * @hide
     * Overridden and disabled. A DDTarget does not support being dragged.
     * @method
     */
    isValidHandleChild: Ext.emptyFn,
    /**
     * @hide
     * Overridden and disabled. A DDTarget does not support being dragged.
     * @method
     */
    startDrag: Ext.emptyFn,
    /**
     * @hide
     * Overridden and disabled. A DDTarget does not support being dragged.
     * @method
     */
    endDrag: Ext.emptyFn,
    /**
     * @hide
     * Overridden and disabled. A DDTarget does not support being dragged.
     * @method
     */
    onDrag: Ext.emptyFn,
    /**
     * @hide
     * Overridden and disabled. A DDTarget does not support being dragged.
     * @method
     */
    onDragDrop: Ext.emptyFn,
    /**
     * @hide
     * Overridden and disabled. A DDTarget does not support being dragged.
     * @method
     */
    onDragEnter: Ext.emptyFn,
    /**
     * @hide
     * Overridden and disabled. A DDTarget does not support being dragged.
     * @method
     */
    onDragOut: Ext.emptyFn,
    /**
     * @hide
     * Overridden and disabled. A DDTarget does not support being dragged.
     * @method
     */
    onDragOver: Ext.emptyFn,
    /**
     * @hide
     * Overridden and disabled. A DDTarget does not support being dragged.
     * @method
     */
    onInvalidDrop: Ext.emptyFn,
    /**
     * @hide
     * Overridden and disabled. A DDTarget does not support being dragged.
     * @method
     */
    onMouseDown: Ext.emptyFn,
    /**
     * @hide
     * Overridden and disabled. A DDTarget does not support being dragged.
     * @method
     */
    onMouseUp: Ext.emptyFn,
    /**
     * @hide
     * Overridden and disabled. A DDTarget does not support being dragged.
     * @method
     */
    setXConstraint: Ext.emptyFn,
    /**
     * @hide
     * Overridden and disabled. A DDTarget does not support being dragged.
     * @method
     */
    setYConstraint: Ext.emptyFn,
    /**
     * @hide
     * Overridden and disabled. A DDTarget does not support being dragged.
     * @method
     */
    resetConstraints: Ext.emptyFn,
    /**
     * @hide
     * Overridden and disabled. A DDTarget does not support being dragged.
     * @method
     */
    clearConstraints: Ext.emptyFn,
    /**
     * @hide
     * Overridden and disabled. A DDTarget does not support being dragged.
     * @method
     */
    clearTicks: Ext.emptyFn,
    /**
     * @hide
     * Overridden and disabled. A DDTarget does not support being dragged.
     * @method
     */
    setInitPosition: Ext.emptyFn,
    /**
     * @hide
     * Overridden and disabled. A DDTarget does not support being dragged.
     * @method
     */
    setDragElId: Ext.emptyFn,
    /**
     * @hide
     * Overridden and disabled. A DDTarget does not support being dragged.
     * @method
     */
    setHandleElId: Ext.emptyFn,
    /**
     * @hide
     * Overridden and disabled. A DDTarget does not support being dragged.
     * @method
     */
    setOuterHandleElId: Ext.emptyFn,
    /**
     * @hide
     * Overridden and disabled. A DDTarget does not support being dragged.
     * @method
     */
    addInvalidHandleClass: Ext.emptyFn,
    /**
     * @hide
     * Overridden and disabled. A DDTarget does not support being dragged.
     * @method
     */
    addInvalidHandleId: Ext.emptyFn,
    /**
     * @hide
     * Overridden and disabled. A DDTarget does not support being dragged.
     * @method
     */
    addInvalidHandleType: Ext.emptyFn,
    /**
     * @hide
     * Overridden and disabled. A DDTarget does not support being dragged.
     * @method
     */
    removeInvalidHandleClass: Ext.emptyFn,
    /**
     * @hide
     * Overridden and disabled. A DDTarget does not support being dragged.
     * @method
     */
    removeInvalidHandleId: Ext.emptyFn,
    /**
     * @hide
     * Overridden and disabled. A DDTarget does not support being dragged.
     * @method
     */
    removeInvalidHandleType: Ext.emptyFn,

    toString: function() {
        return ("DDTarget " + this.id);
    }
});
