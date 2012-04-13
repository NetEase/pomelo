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
 * Defines the interface and base operation of items that that can be
 * dragged or can be drop targets.  It was designed to be extended, overriding
 * the event handlers for startDrag, onDrag, onDragOver and onDragOut.
 * Up to three html elements can be associated with a DragDrop instance:
 *
 * - linked element: the element that is passed into the constructor.
 *   This is the element which defines the boundaries for interaction with
 *   other DragDrop objects.
 *
 * - handle element(s): The drag operation only occurs if the element that
 *   was clicked matches a handle element.  By default this is the linked
 *   element, but there are times that you will want only a portion of the
 *   linked element to initiate the drag operation, and the setHandleElId()
 *   method provides a way to define this.
 *
 * - drag element: this represents the element that would be moved along
 *   with the cursor during a drag operation.  By default, this is the linked
 *   element itself as in {@link Ext.dd.DD}.  setDragElId() lets you define
 *   a separate element that would be moved, as in {@link Ext.dd.DDProxy}.
 *
 * This class should not be instantiated until the onload event to ensure that
 * the associated elements are available.
 * The following would define a DragDrop obj that would interact with any
 * other DragDrop obj in the "group1" group:
 *
 *     dd = new Ext.dd.DragDrop("div1", "group1");
 *
 * Since none of the event handlers have been implemented, nothing would
 * actually happen if you were to run the code above.  Normally you would
 * override this class or one of the default implementations, but you can
 * also override the methods you want on an instance of the class...
 *
 *     dd.onDragDrop = function(e, id) {
 *         alert("dd was dropped on " + id);
 *     }
 *
 */
Ext.define('Ext.dd.DragDrop', {
    requires: ['Ext.dd.DragDropManager'],

    /**
     * Creates new DragDrop.
     * @param {String} id of the element that is linked to this instance
     * @param {String} sGroup the group of related DragDrop objects
     * @param {Object} config an object containing configurable attributes.
     * Valid properties for DragDrop:
     *
     * - padding
     * - isTarget
     * - maintainOffset
     * - primaryButtonOnly
     */
    constructor: function(id, sGroup, config) {
        if(id) {
            this.init(id, sGroup, config);
        }
    },

    /**
     * Set to false to enable a DragDrop object to fire drag events while dragging
     * over its own Element. Defaults to true - DragDrop objects do not by default
     * fire drag events to themselves.
     * @property ignoreSelf
     * @type Boolean
     */

    /**
     * The id of the element associated with this object.  This is what we
     * refer to as the "linked element" because the size and position of
     * this element is used to determine when the drag and drop objects have
     * interacted.
     * @property id
     * @type String
     */
    id: null,

    /**
     * Configuration attributes passed into the constructor
     * @property config
     * @type Object
     */
    config: null,

    /**
     * The id of the element that will be dragged.  By default this is same
     * as the linked element, but could be changed to another element. Ex:
     * Ext.dd.DDProxy
     * @property dragElId
     * @type String
     * @private
     */
    dragElId: null,

    /**
     * The ID of the element that initiates the drag operation.  By default
     * this is the linked element, but could be changed to be a child of this
     * element.  This lets us do things like only starting the drag when the
     * header element within the linked html element is clicked.
     * @property handleElId
     * @type String
     * @private
     */
    handleElId: null,

    /**
     * An object who's property names identify HTML tags to be considered invalid as drag handles.
     * A non-null property value identifies the tag as invalid. Defaults to the
     * following value which prevents drag operations from being initiated by &lt;a> elements:<pre><code>
{
    A: "A"
}</code></pre>
     * @property invalidHandleTypes
     * @type Object
     */
    invalidHandleTypes: null,

    /**
     * An object who's property names identify the IDs of elements to be considered invalid as drag handles.
     * A non-null property value identifies the ID as invalid. For example, to prevent
     * dragging from being initiated on element ID "foo", use:<pre><code>
{
    foo: true
}</code></pre>
     * @property invalidHandleIds
     * @type Object
     */
    invalidHandleIds: null,

    /**
     * An Array of CSS class names for elements to be considered in valid as drag handles.
     * @property {String[]} invalidHandleClasses
     */
    invalidHandleClasses: null,

    /**
     * The linked element's absolute X position at the time the drag was
     * started
     * @property startPageX
     * @type Number
     * @private
     */
    startPageX: 0,

    /**
     * The linked element's absolute X position at the time the drag was
     * started
     * @property startPageY
     * @type Number
     * @private
     */
    startPageY: 0,

    /**
     * The group defines a logical collection of DragDrop objects that are
     * related.  Instances only get events when interacting with other
     * DragDrop object in the same group.  This lets us define multiple
     * groups using a single DragDrop subclass if we want.
     * @property groups
     * @type Object An object in the format {'group1':true, 'group2':true}
     */
    groups: null,

    /**
     * Individual drag/drop instances can be locked.  This will prevent
     * onmousedown start drag.
     * @property locked
     * @type Boolean
     * @private
     */
    locked: false,

    /**
     * Locks this instance
     */
    lock: function() {
        this.locked = true;
    },

    /**
     * When set to true, other DD objects in cooperating DDGroups do not receive
     * notification events when this DD object is dragged over them. Defaults to false.
     * @property moveOnly
     * @type Boolean
     */
    moveOnly: false,

    /**
     * Unlocks this instace
     */
    unlock: function() {
        this.locked = false;
    },

    /**
     * By default, all instances can be a drop target.  This can be disabled by
     * setting isTarget to false.
     * @property isTarget
     * @type Boolean
     */
    isTarget: true,

    /**
     * The padding configured for this drag and drop object for calculating
     * the drop zone intersection with this object.
     * An array containing the 4 padding values: [top, right, bottom, left]
     * @property {Number[]} padding
     */
    padding: null,

    /**
     * Cached reference to the linked element
     * @property _domRef
     * @private
     */
    _domRef: null,

    /**
     * Internal typeof flag
     * @property __ygDragDrop
     * @private
     */
    __ygDragDrop: true,

    /**
     * Set to true when horizontal contraints are applied
     * @property constrainX
     * @type Boolean
     * @private
     */
    constrainX: false,

    /**
     * Set to true when vertical contraints are applied
     * @property constrainY
     * @type Boolean
     * @private
     */
    constrainY: false,

    /**
     * The left constraint
     * @property minX
     * @type Number
     * @private
     */
    minX: 0,

    /**
     * The right constraint
     * @property maxX
     * @type Number
     * @private
     */
    maxX: 0,

    /**
     * The up constraint
     * @property minY
     * @type Number
     * @private
     */
    minY: 0,

    /**
     * The down constraint
     * @property maxY
     * @type Number
     * @private
     */
    maxY: 0,

    /**
     * Maintain offsets when we resetconstraints.  Set to true when you want
     * the position of the element relative to its parent to stay the same
     * when the page changes
     *
     * @property maintainOffset
     * @type Boolean
     */
    maintainOffset: false,

    /**
     * Array of pixel locations the element will snap to if we specified a
     * horizontal graduation/interval.  This array is generated automatically
     * when you define a tick interval.
     * @property {Number[]} xTicks
     */
    xTicks: null,

    /**
     * Array of pixel locations the element will snap to if we specified a
     * vertical graduation/interval.  This array is generated automatically
     * when you define a tick interval.
     * @property {Number[]} yTicks
     */
    yTicks: null,

    /**
     * By default the drag and drop instance will only respond to the primary
     * button click (left button for a right-handed mouse).  Set to true to
     * allow drag and drop to start with any mouse click that is propogated
     * by the browser
     * @property primaryButtonOnly
     * @type Boolean
     */
    primaryButtonOnly: true,

    /**
     * The available property is false until the linked dom element is accessible.
     * @property available
     * @type Boolean
     */
    available: false,

    /**
     * By default, drags can only be initiated if the mousedown occurs in the
     * region the linked element is.  This is done in part to work around a
     * bug in some browsers that mis-report the mousedown if the previous
     * mouseup happened outside of the window.  This property is set to true
     * if outer handles are defined. Defaults to false.
     *
     * @property hasOuterHandles
     * @type Boolean
     */
    hasOuterHandles: false,

    /**
     * Code that executes immediately before the startDrag event
     * @private
     */
    b4StartDrag: function(x, y) { },

    /**
     * Abstract method called after a drag/drop object is clicked
     * and the drag or mousedown time thresholds have beeen met.
     * @param {Number} X click location
     * @param {Number} Y click location
     */
    startDrag: function(x, y) { /* override this */ },

    /**
     * Code that executes immediately before the onDrag event
     * @private
     */
    b4Drag: function(e) { },

    /**
     * Abstract method called during the onMouseMove event while dragging an
     * object.
     * @param {Event} e the mousemove event
     */
    onDrag: function(e) { /* override this */ },

    /**
     * Abstract method called when this element fist begins hovering over
     * another DragDrop obj
     * @param {Event} e the mousemove event
     * @param {String/Ext.dd.DragDrop[]} id In POINT mode, the element
     * id this is hovering over.  In INTERSECT mode, an array of one or more
     * dragdrop items being hovered over.
     */
    onDragEnter: function(e, id) { /* override this */ },

    /**
     * Code that executes immediately before the onDragOver event
     * @private
     */
    b4DragOver: function(e) { },

    /**
     * Abstract method called when this element is hovering over another
     * DragDrop obj
     * @param {Event} e the mousemove event
     * @param {String/Ext.dd.DragDrop[]} id In POINT mode, the element
     * id this is hovering over.  In INTERSECT mode, an array of dd items
     * being hovered over.
     */
    onDragOver: function(e, id) { /* override this */ },

    /**
     * Code that executes immediately before the onDragOut event
     * @private
     */
    b4DragOut: function(e) { },

    /**
     * Abstract method called when we are no longer hovering over an element
     * @param {Event} e the mousemove event
     * @param {String/Ext.dd.DragDrop[]} id In POINT mode, the element
     * id this was hovering over.  In INTERSECT mode, an array of dd items
     * that the mouse is no longer over.
     */
    onDragOut: function(e, id) { /* override this */ },

    /**
     * Code that executes immediately before the onDragDrop event
     * @private
     */
    b4DragDrop: function(e) { },

    /**
     * Abstract method called when this item is dropped on another DragDrop
     * obj
     * @param {Event} e the mouseup event
     * @param {String/Ext.dd.DragDrop[]} id In POINT mode, the element
     * id this was dropped on.  In INTERSECT mode, an array of dd items this
     * was dropped on.
     */
    onDragDrop: function(e, id) { /* override this */ },

    /**
     * Abstract method called when this item is dropped on an area with no
     * drop target
     * @param {Event} e the mouseup event
     */
    onInvalidDrop: function(e) { /* override this */ },

    /**
     * Code that executes immediately before the endDrag event
     * @private
     */
    b4EndDrag: function(e) { },

    /**
     * Called when we are done dragging the object
     * @param {Event} e the mouseup event
     */
    endDrag: function(e) { /* override this */ },

    /**
     * Code executed immediately before the onMouseDown event
     * @param {Event} e the mousedown event
     * @private
     */
    b4MouseDown: function(e) {  },

    /**
     * Called when a drag/drop obj gets a mousedown
     * @param {Event} e the mousedown event
     */
    onMouseDown: function(e) { /* override this */ },

    /**
     * Called when a drag/drop obj gets a mouseup
     * @param {Event} e the mouseup event
     */
    onMouseUp: function(e) { /* override this */ },

    /**
     * Override the onAvailable method to do what is needed after the initial
     * position was determined.
     */
    onAvailable: function () {
    },

    /**
     * @property {Object} defaultPadding
     * Provides default constraint padding to "constrainTo" elements.
     */
    defaultPadding: {
        left: 0,
        right: 0,
        top: 0,
        bottom: 0
    },

    /**
     * Initializes the drag drop object's constraints to restrict movement to a certain element.
     *
     * Usage:
     *
     *     var dd = new Ext.dd.DDProxy("dragDiv1", "proxytest",
     *                    { dragElId: "existingProxyDiv" });
     *     dd.startDrag = function(){
     *         this.constrainTo("parent-id");
     *     };
     *
     * Or you can initalize it using the {@link Ext.Element} object:
     *
     *     Ext.get("dragDiv1").initDDProxy("proxytest", {dragElId: "existingProxyDiv"}, {
     *         startDrag : function(){
     *             this.constrainTo("parent-id");
     *         }
     *     });
     *
     * @param {String/HTMLElement/Ext.Element} constrainTo The element or element ID to constrain to.
     * @param {Object/Number} pad (optional) Pad provides a way to specify "padding" of the constraints,
     * and can be either a number for symmetrical padding (4 would be equal to `{left:4, right:4, top:4, bottom:4}`) or
     * an object containing the sides to pad. For example: `{right:10, bottom:10}`
     * @param {Boolean} inContent (optional) Constrain the draggable in the content box of the element (inside padding and borders)
     */
    constrainTo : function(constrainTo, pad, inContent){
        if(Ext.isNumber(pad)){
            pad = {left: pad, right:pad, top:pad, bottom:pad};
        }
        pad = pad || this.defaultPadding;
        var b = Ext.get(this.getEl()).getBox(),
            ce = Ext.get(constrainTo),
            s = ce.getScroll(),
            c,
            cd = ce.dom;
        if(cd == document.body){
            c = { x: s.left, y: s.top, width: Ext.Element.getViewWidth(), height: Ext.Element.getViewHeight()};
        }else{
            var xy = ce.getXY();
            c = {x : xy[0], y: xy[1], width: cd.clientWidth, height: cd.clientHeight};
        }


        var topSpace = b.y - c.y,
            leftSpace = b.x - c.x;

        this.resetConstraints();
        this.setXConstraint(leftSpace - (pad.left||0), // left
                c.width - leftSpace - b.width - (pad.right||0), //right
				this.xTickSize
        );
        this.setYConstraint(topSpace - (pad.top||0), //top
                c.height - topSpace - b.height - (pad.bottom||0), //bottom
				this.yTickSize
        );
    },

    /**
     * Returns a reference to the linked element
     * @return {HTMLElement} the html element
     */
    getEl: function() {
        if (!this._domRef) {
            this._domRef = Ext.getDom(this.id);
        }

        return this._domRef;
    },

    /**
     * Returns a reference to the actual element to drag.  By default this is
     * the same as the html element, but it can be assigned to another
     * element. An example of this can be found in Ext.dd.DDProxy
     * @return {HTMLElement} the html element
     */
    getDragEl: function() {
        return Ext.getDom(this.dragElId);
    },

    /**
     * Sets up the DragDrop object.  Must be called in the constructor of any
     * Ext.dd.DragDrop subclass
     * @param {String} id the id of the linked element
     * @param {String} sGroup the group of related items
     * @param {Object} config configuration attributes
     */
    init: function(id, sGroup, config) {
        this.initTarget(id, sGroup, config);
        Ext.EventManager.on(this.id, "mousedown", this.handleMouseDown, this);
        // Ext.EventManager.on(this.id, "selectstart", Event.preventDefault);
    },

    /**
     * Initializes Targeting functionality only... the object does not
     * get a mousedown handler.
     * @param {String} id the id of the linked element
     * @param {String} sGroup the group of related items
     * @param {Object} config configuration attributes
     */
    initTarget: function(id, sGroup, config) {
        // configuration attributes
        this.config = config || {};

        // create a local reference to the drag and drop manager
        this.DDMInstance = Ext.dd.DragDropManager;
        // initialize the groups array
        this.groups = {};

        // assume that we have an element reference instead of an id if the
        // parameter is not a string
        if (typeof id !== "string") {
            id = Ext.id(id);
        }

        // set the id
        this.id = id;

        // add to an interaction group
        this.addToGroup((sGroup) ? sGroup : "default");

        // We don't want to register this as the handle with the manager
        // so we just set the id rather than calling the setter.
        this.handleElId = id;

        // the linked element is the element that gets dragged by default
        this.setDragElId(id);

        // by default, clicked anchors will not start drag operations.
        this.invalidHandleTypes = { A: "A" };
        this.invalidHandleIds = {};
        this.invalidHandleClasses = [];

        this.applyConfig();

        this.handleOnAvailable();
    },

    /**
     * Applies the configuration parameters that were passed into the constructor.
     * This is supposed to happen at each level through the inheritance chain.  So
     * a DDProxy implentation will execute apply config on DDProxy, DD, and
     * DragDrop in order to get all of the parameters that are available in
     * each object.
     */
    applyConfig: function() {

        // configurable properties:
        //    padding, isTarget, maintainOffset, primaryButtonOnly
        this.padding           = this.config.padding || [0, 0, 0, 0];
        this.isTarget          = (this.config.isTarget !== false);
        this.maintainOffset    = (this.config.maintainOffset);
        this.primaryButtonOnly = (this.config.primaryButtonOnly !== false);

    },

    /**
     * Executed when the linked element is available
     * @private
     */
    handleOnAvailable: function() {
        this.available = true;
        this.resetConstraints();
        this.onAvailable();
    },

    /**
     * Configures the padding for the target zone in px.  Effectively expands
     * (or reduces) the virtual object size for targeting calculations.
     * Supports css-style shorthand; if only one parameter is passed, all sides
     * will have that padding, and if only two are passed, the top and bottom
     * will have the first param, the left and right the second.
     * @param {Number} iTop    Top pad
     * @param {Number} iRight  Right pad
     * @param {Number} iBot    Bot pad
     * @param {Number} iLeft   Left pad
     */
    setPadding: function(iTop, iRight, iBot, iLeft) {
        // this.padding = [iLeft, iRight, iTop, iBot];
        if (!iRight && 0 !== iRight) {
            this.padding = [iTop, iTop, iTop, iTop];
        } else if (!iBot && 0 !== iBot) {
            this.padding = [iTop, iRight, iTop, iRight];
        } else {
            this.padding = [iTop, iRight, iBot, iLeft];
        }
    },

    /**
     * Stores the initial placement of the linked element.
     * @param {Number} diffX   the X offset, default 0
     * @param {Number} diffY   the Y offset, default 0
     */
    setInitPosition: function(diffX, diffY) {
        var el = this.getEl();

        if (!this.DDMInstance.verifyEl(el)) {
            return;
        }

        var dx = diffX || 0;
        var dy = diffY || 0;

        var p = Ext.Element.getXY( el );

        this.initPageX = p[0] - dx;
        this.initPageY = p[1] - dy;

        this.lastPageX = p[0];
        this.lastPageY = p[1];

        this.setStartPosition(p);
    },

    /**
     * Sets the start position of the element.  This is set when the obj
     * is initialized, the reset when a drag is started.
     * @param pos current position (from previous lookup)
     * @private
     */
    setStartPosition: function(pos) {
        var p = pos || Ext.Element.getXY( this.getEl() );
        this.deltaSetXY = null;

        this.startPageX = p[0];
        this.startPageY = p[1];
    },

    /**
     * Adds this instance to a group of related drag/drop objects.  All
     * instances belong to at least one group, and can belong to as many
     * groups as needed.
     * @param {String} sGroup the name of the group
     */
    addToGroup: function(sGroup) {
        this.groups[sGroup] = true;
        this.DDMInstance.regDragDrop(this, sGroup);
    },

    /**
     * Removes this instance from the supplied interaction group
     * @param {String} sGroup  The group to drop
     */
    removeFromGroup: function(sGroup) {
        if (this.groups[sGroup]) {
            delete this.groups[sGroup];
        }

        this.DDMInstance.removeDDFromGroup(this, sGroup);
    },

    /**
     * Allows you to specify that an element other than the linked element
     * will be moved with the cursor during a drag
     * @param {String} id the id of the element that will be used to initiate the drag
     */
    setDragElId: function(id) {
        this.dragElId = id;
    },

    /**
     * Allows you to specify a child of the linked element that should be
     * used to initiate the drag operation.  An example of this would be if
     * you have a content div with text and links.  Clicking anywhere in the
     * content area would normally start the drag operation.  Use this method
     * to specify that an element inside of the content div is the element
     * that starts the drag operation.
     * @param {String} id the id of the element that will be used to
     * initiate the drag.
     */
    setHandleElId: function(id) {
        if (typeof id !== "string") {
            id = Ext.id(id);
        }
        this.handleElId = id;
        this.DDMInstance.regHandle(this.id, id);
    },

    /**
     * Allows you to set an element outside of the linked element as a drag
     * handle
     * @param {String} id the id of the element that will be used to initiate the drag
     */
    setOuterHandleElId: function(id) {
        if (typeof id !== "string") {
            id = Ext.id(id);
        }
        Ext.EventManager.on(id, "mousedown", this.handleMouseDown, this);
        this.setHandleElId(id);

        this.hasOuterHandles = true;
    },

    /**
     * Removes all drag and drop hooks for this element
     */
    unreg: function() {
        Ext.EventManager.un(this.id, "mousedown", this.handleMouseDown, this);
        this._domRef = null;
        this.DDMInstance._remove(this);
    },

    destroy : function(){
        this.unreg();
    },

    /**
     * Returns true if this instance is locked, or the drag drop mgr is locked
     * (meaning that all drag/drop is disabled on the page.)
     * @return {Boolean} true if this obj or all drag/drop is locked, else
     * false
     */
    isLocked: function() {
        return (this.DDMInstance.isLocked() || this.locked);
    },

    /**
     * Called when this object is clicked
     * @param {Event} e
     * @param {Ext.dd.DragDrop} oDD the clicked dd object (this dd obj)
     * @private
     */
    handleMouseDown: function(e, oDD){
        if (this.primaryButtonOnly && e.button != 0) {
            return;
        }

        if (this.isLocked()) {
            return;
        }

        this.DDMInstance.refreshCache(this.groups);

        var pt = e.getPoint();
        if (!this.hasOuterHandles && !this.DDMInstance.isOverTarget(pt, this) )  {
        } else {
            if (this.clickValidator(e)) {
                // set the initial element position
                this.setStartPosition();
                this.b4MouseDown(e);
                this.onMouseDown(e);

                this.DDMInstance.handleMouseDown(e, this);

                this.DDMInstance.stopEvent(e);
            } else {


            }
        }
    },

    clickValidator: function(e) {
        var target = e.getTarget();
        return ( this.isValidHandleChild(target) &&
                    (this.id == this.handleElId ||
                        this.DDMInstance.handleWasClicked(target, this.id)) );
    },

    /**
     * Allows you to specify a tag name that should not start a drag operation
     * when clicked.  This is designed to facilitate embedding links within a
     * drag handle that do something other than start the drag.
     * @method addInvalidHandleType
     * @param {String} tagName the type of element to exclude
     */
    addInvalidHandleType: function(tagName) {
        var type = tagName.toUpperCase();
        this.invalidHandleTypes[type] = type;
    },

    /**
     * Lets you to specify an element id for a child of a drag handle
     * that should not initiate a drag
     * @method addInvalidHandleId
     * @param {String} id the element id of the element you wish to ignore
     */
    addInvalidHandleId: function(id) {
        if (typeof id !== "string") {
            id = Ext.id(id);
        }
        this.invalidHandleIds[id] = id;
    },

    /**
     * Lets you specify a css class of elements that will not initiate a drag
     * @param {String} cssClass the class of the elements you wish to ignore
     */
    addInvalidHandleClass: function(cssClass) {
        this.invalidHandleClasses.push(cssClass);
    },

    /**
     * Unsets an excluded tag name set by addInvalidHandleType
     * @param {String} tagName the type of element to unexclude
     */
    removeInvalidHandleType: function(tagName) {
        var type = tagName.toUpperCase();
        // this.invalidHandleTypes[type] = null;
        delete this.invalidHandleTypes[type];
    },

    /**
     * Unsets an invalid handle id
     * @param {String} id the id of the element to re-enable
     */
    removeInvalidHandleId: function(id) {
        if (typeof id !== "string") {
            id = Ext.id(id);
        }
        delete this.invalidHandleIds[id];
    },

    /**
     * Unsets an invalid css class
     * @param {String} cssClass the class of the element(s) you wish to
     * re-enable
     */
    removeInvalidHandleClass: function(cssClass) {
        for (var i=0, len=this.invalidHandleClasses.length; i<len; ++i) {
            if (this.invalidHandleClasses[i] == cssClass) {
                delete this.invalidHandleClasses[i];
            }
        }
    },

    /**
     * Checks the tag exclusion list to see if this click should be ignored
     * @param {HTMLElement} node the HTMLElement to evaluate
     * @return {Boolean} true if this is a valid tag type, false if not
     */
    isValidHandleChild: function(node) {

        var valid = true;
        // var n = (node.nodeName == "#text") ? node.parentNode : node;
        var nodeName;
        try {
            nodeName = node.nodeName.toUpperCase();
        } catch(e) {
            nodeName = node.nodeName;
        }
        valid = valid && !this.invalidHandleTypes[nodeName];
        valid = valid && !this.invalidHandleIds[node.id];

        for (var i=0, len=this.invalidHandleClasses.length; valid && i<len; ++i) {
            valid = !Ext.fly(node).hasCls(this.invalidHandleClasses[i]);
        }


        return valid;

    },

    /**
     * Creates the array of horizontal tick marks if an interval was specified
     * in setXConstraint().
     * @private
     */
    setXTicks: function(iStartX, iTickSize) {
        this.xTicks = [];
        this.xTickSize = iTickSize;

        var tickMap = {};

        for (var i = this.initPageX; i >= this.minX; i = i - iTickSize) {
            if (!tickMap[i]) {
                this.xTicks[this.xTicks.length] = i;
                tickMap[i] = true;
            }
        }

        for (i = this.initPageX; i <= this.maxX; i = i + iTickSize) {
            if (!tickMap[i]) {
                this.xTicks[this.xTicks.length] = i;
                tickMap[i] = true;
            }
        }

        Ext.Array.sort(this.xTicks, this.DDMInstance.numericSort);
    },

    /**
     * Creates the array of vertical tick marks if an interval was specified in
     * setYConstraint().
     * @private
     */
    setYTicks: function(iStartY, iTickSize) {
        this.yTicks = [];
        this.yTickSize = iTickSize;

        var tickMap = {};

        for (var i = this.initPageY; i >= this.minY; i = i - iTickSize) {
            if (!tickMap[i]) {
                this.yTicks[this.yTicks.length] = i;
                tickMap[i] = true;
            }
        }

        for (i = this.initPageY; i <= this.maxY; i = i + iTickSize) {
            if (!tickMap[i]) {
                this.yTicks[this.yTicks.length] = i;
                tickMap[i] = true;
            }
        }

        Ext.Array.sort(this.yTicks, this.DDMInstance.numericSort);
    },

    /**
     * By default, the element can be dragged any place on the screen.  Use
     * this method to limit the horizontal travel of the element.  Pass in
     * 0,0 for the parameters if you want to lock the drag to the y axis.
     * @param {Number} iLeft the number of pixels the element can move to the left
     * @param {Number} iRight the number of pixels the element can move to the
     * right
     * @param {Number} iTickSize (optional) parameter for specifying that the
     * element should move iTickSize pixels at a time.
     */
    setXConstraint: function(iLeft, iRight, iTickSize) {
        this.leftConstraint = iLeft;
        this.rightConstraint = iRight;

        this.minX = this.initPageX - iLeft;
        this.maxX = this.initPageX + iRight;
        if (iTickSize) { this.setXTicks(this.initPageX, iTickSize); }

        this.constrainX = true;
    },

    /**
     * Clears any constraints applied to this instance.  Also clears ticks
     * since they can't exist independent of a constraint at this time.
     */
    clearConstraints: function() {
        this.constrainX = false;
        this.constrainY = false;
        this.clearTicks();
    },

    /**
     * Clears any tick interval defined for this instance
     */
    clearTicks: function() {
        this.xTicks = null;
        this.yTicks = null;
        this.xTickSize = 0;
        this.yTickSize = 0;
    },

    /**
     * By default, the element can be dragged any place on the screen.  Set
     * this to limit the vertical travel of the element.  Pass in 0,0 for the
     * parameters if you want to lock the drag to the x axis.
     * @param {Number} iUp the number of pixels the element can move up
     * @param {Number} iDown the number of pixels the element can move down
     * @param {Number} iTickSize (optional) parameter for specifying that the
     * element should move iTickSize pixels at a time.
     */
    setYConstraint: function(iUp, iDown, iTickSize) {
        this.topConstraint = iUp;
        this.bottomConstraint = iDown;

        this.minY = this.initPageY - iUp;
        this.maxY = this.initPageY + iDown;
        if (iTickSize) { this.setYTicks(this.initPageY, iTickSize); }

        this.constrainY = true;

    },

    /**
     * Must be called if you manually reposition a dd element.
     * @param {Boolean} maintainOffset
     */
    resetConstraints: function() {
        // Maintain offsets if necessary
        if (this.initPageX || this.initPageX === 0) {
            // figure out how much this thing has moved
            var dx = (this.maintainOffset) ? this.lastPageX - this.initPageX : 0;
            var dy = (this.maintainOffset) ? this.lastPageY - this.initPageY : 0;

            this.setInitPosition(dx, dy);

        // This is the first time we have detected the element's position
        } else {
            this.setInitPosition();
        }

        if (this.constrainX) {
            this.setXConstraint( this.leftConstraint,
                                 this.rightConstraint,
                                 this.xTickSize        );
        }

        if (this.constrainY) {
            this.setYConstraint( this.topConstraint,
                                 this.bottomConstraint,
                                 this.yTickSize         );
        }
    },

    /**
     * Normally the drag element is moved pixel by pixel, but we can specify
     * that it move a number of pixels at a time.  This method resolves the
     * location when we have it set up like this.
     * @param {Number} val where we want to place the object
     * @param {Number[]} tickArray sorted array of valid points
     * @return {Number} the closest tick
     * @private
     */
    getTick: function(val, tickArray) {
        if (!tickArray) {
            // If tick interval is not defined, it is effectively 1 pixel,
            // so we return the value passed to us.
            return val;
        } else if (tickArray[0] >= val) {
            // The value is lower than the first tick, so we return the first
            // tick.
            return tickArray[0];
        } else {
            for (var i=0, len=tickArray.length; i<len; ++i) {
                var next = i + 1;
                if (tickArray[next] && tickArray[next] >= val) {
                    var diff1 = val - tickArray[i];
                    var diff2 = tickArray[next] - val;
                    return (diff2 > diff1) ? tickArray[i] : tickArray[next];
                }
            }

            // The value is larger than the last tick, so we return the last
            // tick.
            return tickArray[tickArray.length - 1];
        }
    },

    /**
     * toString method
     * @return {String} string representation of the dd obj
     */
    toString: function() {
        return ("DragDrop " + this.id);
    }

});

