/*

This file is part of Ext JS 4

Copyright (c) 2011 Sencha Inc

Contact:  http://www.sencha.com/contact

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please contact the sales department at http://www.sencha.com/contact.

*/
/**
 * An abstract base class which provides shared methods for Components across the Sencha product line.
 *
 * Please refer to sub class's documentation
 * @private
 */
Ext.define('Ext.AbstractComponent', {

    /* Begin Definitions */
    requires: [
        'Ext.ComponentQuery',
        'Ext.ComponentManager'
    ],

    mixins: {
        observable: 'Ext.util.Observable',
        animate: 'Ext.util.Animate',
        state: 'Ext.state.Stateful'
    },

    // The "uses" property specifies class which are used in an instantiated AbstractComponent.
    // They do *not* have to be loaded before this class may be defined - that is what "requires" is for.
    uses: [
        'Ext.PluginManager',
        'Ext.ComponentManager',
        'Ext.Element',
        'Ext.DomHelper',
        'Ext.XTemplate',
        'Ext.ComponentQuery',
        'Ext.ComponentLoader',
        'Ext.EventManager',
        'Ext.layout.Layout',
        'Ext.layout.component.Auto',
        'Ext.LoadMask',
        'Ext.ZIndexManager'
    ],

    statics: {
        AUTO_ID: 1000
    },

    /* End Definitions */

    isComponent: true,

    getAutoId: function() {
        return ++Ext.AbstractComponent.AUTO_ID;
    },


    /**
     * @cfg {String} id
     * The **unique id of this component instance.**
     *
     * It should not be necessary to use this configuration except for singleton objects in your application. Components
     * created with an id may be accessed globally using {@link Ext#getCmp Ext.getCmp}.
     *
     * Instead of using assigned ids, use the {@link #itemId} config, and {@link Ext.ComponentQuery ComponentQuery}
     * which provides selector-based searching for Sencha Components analogous to DOM querying. The {@link
     * Ext.container.Container Container} class contains {@link Ext.container.Container#down shortcut methods} to query
     * its descendant Components by selector.
     *
     * Note that this id will also be used as the element id for the containing HTML element that is rendered to the
     * page for this component. This allows you to write id-based CSS rules to style the specific instance of this
     * component uniquely, and also to select sub-elements using this component's id as the parent.
     *
     * **Note**: to avoid complications imposed by a unique id also see `{@link #itemId}`.
     *
     * **Note**: to access the container of a Component see `{@link #ownerCt}`.
     *
     * Defaults to an {@link #getId auto-assigned id}.
     */

    /**
     * @cfg {String} itemId
     * An itemId can be used as an alternative way to get a reference to a component when no object reference is
     * available. Instead of using an `{@link #id}` with {@link Ext}.{@link Ext#getCmp getCmp}, use `itemId` with
     * {@link Ext.container.Container}.{@link Ext.container.Container#getComponent getComponent} which will retrieve
     * `itemId`'s or {@link #id}'s. Since `itemId`'s are an index to the container's internal MixedCollection, the
     * `itemId` is scoped locally to the container -- avoiding potential conflicts with {@link Ext.ComponentManager}
     * which requires a **unique** `{@link #id}`.
     *
     *     var c = new Ext.panel.Panel({ //
     *         {@link Ext.Component#height height}: 300,
     *         {@link #renderTo}: document.body,
     *         {@link Ext.container.Container#layout layout}: 'auto',
     *         {@link Ext.container.Container#items items}: [
     *             {
     *                 itemId: 'p1',
     *                 {@link Ext.panel.Panel#title title}: 'Panel 1',
     *                 {@link Ext.Component#height height}: 150
     *             },
     *             {
     *                 itemId: 'p2',
     *                 {@link Ext.panel.Panel#title title}: 'Panel 2',
     *                 {@link Ext.Component#height height}: 150
     *             }
     *         ]
     *     })
     *     p1 = c.{@link Ext.container.Container#getComponent getComponent}('p1'); // not the same as {@link Ext#getCmp Ext.getCmp()}
     *     p2 = p1.{@link #ownerCt}.{@link Ext.container.Container#getComponent getComponent}('p2'); // reference via a sibling
     *
     * Also see {@link #id}, `{@link Ext.container.Container#query}`, `{@link Ext.container.Container#down}` and
     * `{@link Ext.container.Container#child}`.
     *
     * **Note**: to access the container of an item see {@link #ownerCt}.
     */

    /**
     * @property {Ext.Container} ownerCt
     * This Component's owner {@link Ext.container.Container Container} (is set automatically
     * when this Component is added to a Container). Read-only.
     *
     * **Note**: to access items within the Container see {@link #itemId}.
     */

    /**
     * @property {Boolean} layoutManagedWidth
     * @private
     * Flag set by the container layout to which this Component is added.
     * If the layout manages this Component's width, it sets the value to 1.
     * If it does NOT manage the width, it sets it to 2.
     * If the layout MAY affect the width, but only if the owning Container has a fixed width, this is set to 0.
     */

    /**
     * @property {Boolean} layoutManagedHeight
     * @private
     * Flag set by the container layout to which this Component is added.
     * If the layout manages this Component's height, it sets the value to 1.
     * If it does NOT manage the height, it sets it to 2.
     * If the layout MAY affect the height, but only if the owning Container has a fixed height, this is set to 0.
     */

    /**
     * @cfg {String/Object} autoEl
     * A tag name or {@link Ext.DomHelper DomHelper} spec used to create the {@link #getEl Element} which will
     * encapsulate this Component.
     *
     * You do not normally need to specify this. For the base classes {@link Ext.Component} and
     * {@link Ext.container.Container}, this defaults to **'div'**. The more complex Sencha classes use a more
     * complex DOM structure specified by their own {@link #renderTpl}s.
     *
     * This is intended to allow the developer to create application-specific utility Components encapsulated by
     * different DOM elements. Example usage:
     *
     *     {
     *         xtype: 'component',
     *         autoEl: {
     *             tag: 'img',
     *             src: 'http://www.example.com/example.jpg'
     *         }
     *     }, {
     *         xtype: 'component',
     *         autoEl: {
     *             tag: 'blockquote',
     *             html: 'autoEl is cool!'
     *         }
     *     }, {
     *         xtype: 'container',
     *         autoEl: 'ul',
     *         cls: 'ux-unordered-list',
     *         items: {
     *             xtype: 'component',
     *             autoEl: 'li',
     *             html: 'First list item'
     *         }
     *     }
     */

    /**
     * @cfg {Ext.XTemplate/String/String[]} renderTpl
     * An {@link Ext.XTemplate XTemplate} used to create the internal structure inside this Component's encapsulating
     * {@link #getEl Element}.
     *
     * You do not normally need to specify this. For the base classes {@link Ext.Component} and
     * {@link Ext.container.Container}, this defaults to **`null`** which means that they will be initially rendered
     * with no internal structure; they render their {@link #getEl Element} empty. The more specialized ExtJS and Touch
     * classes which use a more complex DOM structure, provide their own template definitions.
     *
     * This is intended to allow the developer to create application-specific utility Components with customized
     * internal structure.
     *
     * Upon rendering, any created child elements may be automatically imported into object properties using the
     * {@link #renderSelectors} and {@link #childEls} options.
     */
    renderTpl: null,

    /**
     * @cfg {Object} renderData
     *
     * The data used by {@link #renderTpl} in addition to the following property values of the component:
     *
     * - id
     * - ui
     * - uiCls
     * - baseCls
     * - componentCls
     * - frame
     *
     * See {@link #renderSelectors} and {@link #childEls} for usage examples.
     */

    /**
     * @cfg {Object} renderSelectors
     * An object containing properties specifying {@link Ext.DomQuery DomQuery} selectors which identify child elements
     * created by the render process.
     *
     * After the Component's internal structure is rendered according to the {@link #renderTpl}, this object is iterated through,
     * and the found Elements are added as properties to the Component using the `renderSelector` property name.
     *
     * For example, a Component which renderes a title and description into its element:
     *
     *     Ext.create('Ext.Component', {
     *         renderTo: Ext.getBody(),
     *         renderTpl: [
     *             '<h1 class="title">{title}</h1>',
     *             '<p>{desc}</p>'
     *         ],
     *         renderData: {
     *             title: "Error",
     *             desc: "Something went wrong"
     *         },
     *         renderSelectors: {
     *             titleEl: 'h1.title',
     *             descEl: 'p'
     *         },
     *         listeners: {
     *             afterrender: function(cmp){
     *                 // After rendering the component will have a titleEl and descEl properties
     *                 cmp.titleEl.setStyle({color: "red"});
     *             }
     *         }
     *     });
     *
     * For a faster, but less flexible, alternative that achieves the same end result (properties for child elements on the
     * Component after render), see {@link #childEls} and {@link #addChildEls}.
     */

    /**
     * @cfg {Object[]} childEls
     * An array describing the child elements of the Component. Each member of the array
     * is an object with these properties:
     *
     * - `name` - The property name on the Component for the child element.
     * - `itemId` - The id to combine with the Component's id that is the id of the child element.
     * - `id` - The id of the child element.
     *
     * If the array member is a string, it is equivalent to `{ name: m, itemId: m }`.
     *
     * For example, a Component which renders a title and body text:
     *
     *     Ext.create('Ext.Component', {
     *         renderTo: Ext.getBody(),
     *         renderTpl: [
     *             '<h1 id="{id}-title">{title}</h1>',
     *             '<p>{msg}</p>',
     *         ],
     *         renderData: {
     *             title: "Error",
     *             msg: "Something went wrong"
     *         },
     *         childEls: ["title"],
     *         listeners: {
     *             afterrender: function(cmp){
     *                 // After rendering the component will have a title property
     *                 cmp.title.setStyle({color: "red"});
     *             }
     *         }
     *     });
     *
     * A more flexible, but somewhat slower, approach is {@link #renderSelectors}.
     */

    /**
     * @cfg {String/HTMLElement/Ext.Element} renderTo
     * Specify the id of the element, a DOM element or an existing Element that this component will be rendered into.
     *
     * **Notes:**
     *
     * Do *not* use this option if the Component is to be a child item of a {@link Ext.container.Container Container}.
     * It is the responsibility of the {@link Ext.container.Container Container}'s
     * {@link Ext.container.Container#layout layout manager} to render and manage its child items.
     *
     * When using this config, a call to render() is not required.
     *
     * See `{@link #render}` also.
     */

    /**
     * @cfg {Boolean} frame
     * Specify as `true` to have the Component inject framing elements within the Component at render time to provide a
     * graphical rounded frame around the Component content.
     *
     * This is only necessary when running on outdated, or non standard-compliant browsers such as Microsoft's Internet
     * Explorer prior to version 9 which do not support rounded corners natively.
     *
     * The extra space taken up by this framing is available from the read only property {@link #frameSize}.
     */

    /**
     * @property {Object} frameSize
     * Read-only property indicating the width of any framing elements which were added within the encapsulating element
     * to provide graphical, rounded borders. See the {@link #frame} config.
     *
     * This is an object containing the frame width in pixels for all four sides of the Component containing the
     * following properties:
     *
     * @property {Number} frameSize.top The width of the top framing element in pixels.
     * @property {Number} frameSize.right The width of the right framing element in pixels.
     * @property {Number} frameSize.bottom The width of the bottom framing element in pixels.
     * @property {Number} frameSize.left The width of the left framing element in pixels.
     */

    /**
     * @cfg {String/Object} componentLayout
     * The sizing and positioning of a Component's internal Elements is the responsibility of the Component's layout
     * manager which sizes a Component's internal structure in response to the Component being sized.
     *
     * Generally, developers will not use this configuration as all provided Components which need their internal
     * elements sizing (Such as {@link Ext.form.field.Base input fields}) come with their own componentLayout managers.
     *
     * The {@link Ext.layout.container.Auto default layout manager} will be used on instances of the base Ext.Component
     * class which simply sizes the Component's encapsulating element to the height and width specified in the
     * {@link #setSize} method.
     */

    /**
     * @cfg {Ext.XTemplate/Ext.Template/String/String[]} tpl
     * An {@link Ext.Template}, {@link Ext.XTemplate} or an array of strings to form an Ext.XTemplate. Used in
     * conjunction with the `{@link #data}` and `{@link #tplWriteMode}` configurations.
     */

    /**
     * @cfg {Object} data
     * The initial set of data to apply to the `{@link #tpl}` to update the content area of the Component.
     */

    /**
     * @cfg {String} xtype
     * The `xtype` configuration option can be used to optimize Component creation and rendering. It serves as a
     * shortcut to the full componet name. For example, the component `Ext.button.Button` has an xtype of `button`.
     *
     * You can define your own xtype on a custom {@link Ext.Component component} by specifying the
     * {@link Ext.Class#alias alias} config option with a prefix of `widget`. For example:
     *
     *     Ext.define('PressMeButton', {
     *         extend: 'Ext.button.Button',
     *         alias: 'widget.pressmebutton',
     *         text: 'Press Me'
     *     })
     *
     * Any Component can be created implicitly as an object config with an xtype specified, allowing it to be
     * declared and passed into the rendering pipeline without actually being instantiated as an object. Not only is
     * rendering deferred, but the actual creation of the object itself is also deferred, saving memory and resources
     * until they are actually needed. In complex, nested layouts containing many Components, this can make a
     * noticeable improvement in performance.
     *
     *     // Explicit creation of contained Components:
     *     var panel = new Ext.Panel({
     *        ...
     *        items: [
     *           Ext.create('Ext.button.Button', {
     *              text: 'OK'
     *           })
     *        ]
     *     };
     *
     *     // Implicit creation using xtype:
     *     var panel = new Ext.Panel({
     *        ...
     *        items: [{
     *           xtype: 'button',
     *           text: 'OK'
     *        }]
     *     };
     *
     * In the first example, the button will always be created immediately during the panel's initialization. With
     * many added Components, this approach could potentially slow the rendering of the page. In the second example,
     * the button will not be created or rendered until the panel is actually displayed in the browser. If the panel
     * is never displayed (for example, if it is a tab that remains hidden) then the button will never be created and
     * will never consume any resources whatsoever.
     */

    /**
     * @cfg {String} tplWriteMode
     * The Ext.(X)Template method to use when updating the content area of the Component.
     * See `{@link Ext.XTemplate#overwrite}` for information on default mode.
     */
    tplWriteMode: 'overwrite',

    /**
     * @cfg {String} [baseCls='x-component']
     * The base CSS class to apply to this components's element. This will also be prepended to elements within this
     * component like Panel's body will get a class x-panel-body. This means that if you create a subclass of Panel, and
     * you want it to get all the Panels styling for the element and the body, you leave the baseCls x-panel and use
     * componentCls to add specific styling for this component.
     */
    baseCls: Ext.baseCSSPrefix + 'component',

    /**
     * @cfg {String} componentCls
     * CSS Class to be added to a components root level element to give distinction to it via styling.
     */

    /**
     * @cfg {String} [cls='']
     * An optional extra CSS class that will be added to this component's Element. This can be useful
     * for adding customized styles to the component or any of its children using standard CSS rules.
     */

    /**
     * @cfg {String} [overCls='']
     * An optional extra CSS class that will be added to this component's Element when the mouse moves over the Element,
     * and removed when the mouse moves out. This can be useful for adding customized 'active' or 'hover' styles to the
     * component or any of its children using standard CSS rules.
     */

    /**
     * @cfg {String} [disabledCls='x-item-disabled']
     * CSS class to add when the Component is disabled. Defaults to 'x-item-disabled'.
     */
    disabledCls: Ext.baseCSSPrefix + 'item-disabled',

    /**
     * @cfg {String/String[]} ui
     * A set style for a component. Can be a string or an Array of multiple strings (UIs)
     */
    ui: 'default',

    /**
     * @cfg {String[]} uiCls
     * An array of of classNames which are currently applied to this component
     * @private
     */
    uiCls: [],

    /**
     * @cfg {String} style
     * A custom style specification to be applied to this component's Element. Should be a valid argument to
     * {@link Ext.Element#applyStyles}.
     *
     *     new Ext.panel.Panel({
     *         title: 'Some Title',
     *         renderTo: Ext.getBody(),
     *         width: 400, height: 300,
     *         layout: 'form',
     *         items: [{
     *             xtype: 'textarea',
     *             style: {
     *                 width: '95%',
     *                 marginBottom: '10px'
     *             }
     *         },
     *         new Ext.button.Button({
     *             text: 'Send',
     *             minWidth: '100',
     *             style: {
     *                 marginBottom: '10px'
     *             }
     *         })
     *         ]
     *     });
     */

    /**
     * @cfg {Number} width
     * The width of this component in pixels.
     */

    /**
     * @cfg {Number} height
     * The height of this component in pixels.
     */

    /**
     * @cfg {Number/String} border
     * Specifies the border for this component. The border can be a single numeric value to apply to all sides or it can
     * be a CSS style specification for each style, for example: '10 5 3 10'.
     */

    /**
     * @cfg {Number/String} padding
     * Specifies the padding for this component. The padding can be a single numeric value to apply to all sides or it
     * can be a CSS style specification for each style, for example: '10 5 3 10'.
     */

    /**
     * @cfg {Number/String} margin
     * Specifies the margin for this component. The margin can be a single numeric value to apply to all sides or it can
     * be a CSS style specification for each style, for example: '10 5 3 10'.
     */

    /**
     * @cfg {Boolean} hidden
     * True to hide the component.
     */
    hidden: false,

    /**
     * @cfg {Boolean} disabled
     * True to disable the component.
     */
    disabled: false,

    /**
     * @cfg {Boolean} [draggable=false]
     * Allows the component to be dragged.
     */

    /**
     * @property {Boolean} draggable
     * Read-only property indicating whether or not the component can be dragged
     */
    draggable: false,

    /**
     * @cfg {Boolean} floating
     * Create the Component as a floating and use absolute positioning.
     *
     * The z-index of floating Components is handled by a ZIndexManager. If you simply render a floating Component into the DOM, it will be managed
     * by the global {@link Ext.WindowManager WindowManager}.
     *
     * If you include a floating Component as a child item of a Container, then upon render, ExtJS will seek an ancestor floating Component to house a new
     * ZIndexManager instance to manage its descendant floaters. If no floating ancestor can be found, the global WindowManager will be used.
     *
     * When a floating Component which has a ZindexManager managing descendant floaters is destroyed, those descendant floaters will also be destroyed.
     */
    floating: false,

    /**
     * @cfg {String} hideMode
     * A String which specifies how this Component's encapsulating DOM element will be hidden. Values may be:
     *
     *   - `'display'` : The Component will be hidden using the `display: none` style.
     *   - `'visibility'` : The Component will be hidden using the `visibility: hidden` style.
     *   - `'offsets'` : The Component will be hidden by absolutely positioning it out of the visible area of the document.
     *     This is useful when a hidden Component must maintain measurable dimensions. Hiding using `display` results in a
     *     Component having zero dimensions.
     */
    hideMode: 'display',

    /**
     * @cfg {String} contentEl
     * Specify an existing HTML element, or the `id` of an existing HTML element to use as the content for this component.
     *
     * This config option is used to take an existing HTML element and place it in the layout element of a new component
     * (it simply moves the specified DOM element _after the Component is rendered_ to use as the content.
     *
     * **Notes:**
     *
     * The specified HTML element is appended to the layout element of the component _after any configured
     * {@link #html HTML} has been inserted_, and so the document will not contain this element at the time
     * the {@link #render} event is fired.
     *
     * The specified HTML element used will not participate in any **`{@link Ext.container.Container#layout layout}`**
     * scheme that the Component may use. It is just HTML. Layouts operate on child
     * **`{@link Ext.container.Container#items items}`**.
     *
     * Add either the `x-hidden` or the `x-hide-display` CSS class to prevent a brief flicker of the content before it
     * is rendered to the panel.
     */

    /**
     * @cfg {String/Object} [html='']
     * An HTML fragment, or a {@link Ext.DomHelper DomHelper} specification to use as the layout element content.
     * The HTML content is added after the component is rendered, so the document will not contain this HTML at the time
     * the {@link #render} event is fired. This content is inserted into the body _before_ any configured {@link #contentEl}
     * is appended.
     */

    /**
     * @cfg {Boolean} styleHtmlContent
     * True to automatically style the html inside the content target of this component (body for panels).
     */
    styleHtmlContent: false,

    /**
     * @cfg {String} [styleHtmlCls='x-html']
     * The class that is added to the content target when you set styleHtmlContent to true.
     */
    styleHtmlCls: Ext.baseCSSPrefix + 'html',

    /**
     * @cfg {Number} minHeight
     * The minimum value in pixels which this Component will set its height to.
     *
     * **Warning:** This will override any size management applied by layout managers.
     */
    /**
     * @cfg {Number} minWidth
     * The minimum value in pixels which this Component will set its width to.
     *
     * **Warning:** This will override any size management applied by layout managers.
     */
    /**
     * @cfg {Number} maxHeight
     * The maximum value in pixels which this Component will set its height to.
     *
     * **Warning:** This will override any size management applied by layout managers.
     */
    /**
     * @cfg {Number} maxWidth
     * The maximum value in pixels which this Component will set its width to.
     *
     * **Warning:** This will override any size management applied by layout managers.
     */

    /**
     * @cfg {Ext.ComponentLoader/Object} loader
     * A configuration object or an instance of a {@link Ext.ComponentLoader} to load remote content for this Component.
     */

    /**
     * @cfg {Boolean} autoShow
     * True to automatically show the component upon creation. This config option may only be used for
     * {@link #floating} components or components that use {@link #autoRender}. Defaults to false.
     */
    autoShow: false,

    /**
     * @cfg {Boolean/String/HTMLElement/Ext.Element} autoRender
     * This config is intended mainly for non-{@link #floating} Components which may or may not be shown. Instead of using
     * {@link #renderTo} in the configuration, and rendering upon construction, this allows a Component to render itself
     * upon first _{@link #show}_. If {@link #floating} is true, the value of this config is omited as if it is `true`.
     *
     * Specify as `true` to have this Component render to the document body upon first show.
     *
     * Specify as an element, or the ID of an element to have this Component render to a specific element upon first
     * show.
     *
     * **This defaults to `true` for the {@link Ext.window.Window Window} class.**
     */
    autoRender: false,

    needsLayout: false,

    // @private
    allowDomMove: true,

    /**
     * @cfg {Object/Object[]} plugins
     * An object or array of objects that will provide custom functionality for this component. The only requirement for
     * a valid plugin is that it contain an init method that accepts a reference of type Ext.Component. When a component
     * is created, if any plugins are available, the component will call the init method on each plugin, passing a
     * reference to itself. Each plugin can then call methods or respond to events on the component as needed to provide
     * its functionality.
     */

    /**
     * @property {Boolean} rendered
     * Read-only property indicating whether or not the component has been rendered.
     */
    rendered: false,

    /**
     * @property {Number} componentLayoutCounter
     * @private
     * The number of component layout calls made on this object.
     */
    componentLayoutCounter: 0,

    weight: 0,

    trimRe: /^\s+|\s+$/g,
    spacesRe: /\s+/,


    /**
     * @property {Boolean} maskOnDisable
     * This is an internal flag that you use when creating custom components. By default this is set to true which means
     * that every component gets a mask when its disabled. Components like FieldContainer, FieldSet, Field, Button, Tab
     * override this property to false since they want to implement custom disable logic.
     */
    maskOnDisable: true,

    /**
     * Creates new Component.
     * @param {Object} config  (optional) Config object.
     */
    constructor : function(config) {
        var me = this,
            i, len;

        config = config || {};
        me.initialConfig = config;
        Ext.apply(me, config);

        me.addEvents(
            /**
             * @event beforeactivate
             * Fires before a Component has been visually activated. Returning false from an event listener can prevent
             * the activate from occurring.
             * @param {Ext.Component} this
             */
            'beforeactivate',
            /**
             * @event activate
             * Fires after a Component has been visually activated.
             * @param {Ext.Component} this
             */
            'activate',
            /**
             * @event beforedeactivate
             * Fires before a Component has been visually deactivated. Returning false from an event listener can
             * prevent the deactivate from occurring.
             * @param {Ext.Component} this
             */
            'beforedeactivate',
            /**
             * @event deactivate
             * Fires after a Component has been visually deactivated.
             * @param {Ext.Component} this
             */
            'deactivate',
            /**
             * @event added
             * Fires after a Component had been added to a Container.
             * @param {Ext.Component} this
             * @param {Ext.container.Container} container Parent Container
             * @param {Number} pos position of Component
             */
            'added',
            /**
             * @event disable
             * Fires after the component is disabled.
             * @param {Ext.Component} this
             */
            'disable',
            /**
             * @event enable
             * Fires after the component is enabled.
             * @param {Ext.Component} this
             */
            'enable',
            /**
             * @event beforeshow
             * Fires before the component is shown when calling the {@link #show} method. Return false from an event
             * handler to stop the show.
             * @param {Ext.Component} this
             */
            'beforeshow',
            /**
             * @event show
             * Fires after the component is shown when calling the {@link #show} method.
             * @param {Ext.Component} this
             */
            'show',
            /**
             * @event beforehide
             * Fires before the component is hidden when calling the {@link #hide} method. Return false from an event
             * handler to stop the hide.
             * @param {Ext.Component} this
             */
            'beforehide',
            /**
             * @event hide
             * Fires after the component is hidden. Fires after the component is hidden when calling the {@link #hide}
             * method.
             * @param {Ext.Component} this
             */
            'hide',
            /**
             * @event removed
             * Fires when a component is removed from an Ext.container.Container
             * @param {Ext.Component} this
             * @param {Ext.container.Container} ownerCt Container which holds the component
             */
            'removed',
            /**
             * @event beforerender
             * Fires before the component is {@link #rendered}. Return false from an event handler to stop the
             * {@link #render}.
             * @param {Ext.Component} this
             */
            'beforerender',
            /**
             * @event render
             * Fires after the component markup is {@link #rendered}.
             * @param {Ext.Component} this
             */
            'render',
            /**
             * @event afterrender
             * Fires after the component rendering is finished.
             *
             * The afterrender event is fired after this Component has been {@link #rendered}, been postprocesed by any
             * afterRender method defined for the Component.
             * @param {Ext.Component} this
             */
            'afterrender',
            /**
             * @event beforedestroy
             * Fires before the component is {@link #destroy}ed. Return false from an event handler to stop the
             * {@link #destroy}.
             * @param {Ext.Component} this
             */
            'beforedestroy',
            /**
             * @event destroy
             * Fires after the component is {@link #destroy}ed.
             * @param {Ext.Component} this
             */
            'destroy',
            /**
             * @event resize
             * Fires after the component is resized.
             * @param {Ext.Component} this
             * @param {Number} adjWidth The box-adjusted width that was set
             * @param {Number} adjHeight The box-adjusted height that was set
             */
            'resize',
            /**
             * @event move
             * Fires after the component is moved.
             * @param {Ext.Component} this
             * @param {Number} x The new x position
             * @param {Number} y The new y position
             */
            'move'
        );

        me.getId();

        me.mons = [];
        me.additionalCls = [];
        me.renderData = me.renderData || {};
        me.renderSelectors = me.renderSelectors || {};

        if (me.plugins) {
            me.plugins = [].concat(me.plugins);
            me.constructPlugins();
        }

        me.initComponent();

        // ititComponent gets a chance to change the id property before registering
        Ext.ComponentManager.register(me);

        // Dont pass the config so that it is not applied to 'this' again
        me.mixins.observable.constructor.call(me);
        me.mixins.state.constructor.call(me, config);

        // Save state on resize.
        this.addStateEvents('resize');

        // Move this into Observable?
        if (me.plugins) {
            me.plugins = [].concat(me.plugins);
            for (i = 0, len = me.plugins.length; i < len; i++) {
                me.plugins[i] = me.initPlugin(me.plugins[i]);
            }
        }

        me.loader = me.getLoader();

        if (me.renderTo) {
            me.render(me.renderTo);
            // EXTJSIV-1935 - should be a way to do afterShow or something, but that
            // won't work. Likewise, rendering hidden and then showing (w/autoShow) has
            // implications to afterRender so we cannot do that.
        }

        if (me.autoShow) {
            me.show();
        }

        //<debug>
        if (Ext.isDefined(me.disabledClass)) {
            if (Ext.isDefined(Ext.global.console)) {
                Ext.global.console.warn('Ext.Component: disabledClass has been deprecated. Please use disabledCls.');
            }
            me.disabledCls = me.disabledClass;
            delete me.disabledClass;
        }
        //</debug>
    },

    initComponent: function () {
        // This is called again here to allow derived classes to add plugin configs to the
        // plugins array before calling down to this, the base initComponent.
        this.constructPlugins();
    },

    /**
     * The supplied default state gathering method for the AbstractComponent class.
     *
     * This method returns dimension settings such as `flex`, `anchor`, `width` and `height` along with `collapsed`
     * state.
     *
     * Subclasses which implement more complex state should call the superclass's implementation, and apply their state
     * to the result if this basic state is to be saved.
     *
     * Note that Component state will only be saved if the Component has a {@link #stateId} and there as a StateProvider
     * configured for the document.
     *
     * @return {Object}
     */
    getState: function() {
        var me = this,
            layout = me.ownerCt ? (me.shadowOwnerCt || me.ownerCt).getLayout() : null,
            state = {
                collapsed: me.collapsed
            },
            width = me.width,
            height = me.height,
            cm = me.collapseMemento,
            anchors;

        // If a Panel-local collapse has taken place, use remembered values as the dimensions.
        // TODO: remove this coupling with Panel's privates! All collapse/expand logic should be refactored into one place.
        if (me.collapsed && cm) {
            if (Ext.isDefined(cm.data.width)) {
                width = cm.width;
            }
            if (Ext.isDefined(cm.data.height)) {
                height = cm.height;
            }
        }

        // If we have flex, only store the perpendicular dimension.
        if (layout && me.flex) {
            state.flex = me.flex;
            if (layout.perpendicularPrefix) {
                state[layout.perpendicularPrefix] = me['get' + layout.perpendicularPrefixCap]();
            } else {
                //<debug>
                if (Ext.isDefined(Ext.global.console)) {
                    Ext.global.console.warn('Ext.Component: Specified a flex value on a component not inside a Box layout');
                }
                //</debug>
            }
        }
        // If we have anchor, only store dimensions which are *not* being anchored
        else if (layout && me.anchor) {
            state.anchor = me.anchor;
            anchors = me.anchor.split(' ').concat(null);
            if (!anchors[0]) {
                if (me.width) {
                    state.width = width;
                }
            }
            if (!anchors[1]) {
                if (me.height) {
                    state.height = height;
                }
            }
        }
        // Store dimensions.
        else {
            if (me.width) {
                state.width = width;
            }
            if (me.height) {
                state.height = height;
            }
        }

        // Don't save dimensions if they are unchanged from the original configuration.
        if (state.width == me.initialConfig.width) {
            delete state.width;
        }
        if (state.height == me.initialConfig.height) {
            delete state.height;
        }

        // If a Box layout was managing the perpendicular dimension, don't save that dimension
        if (layout && layout.align && (layout.align.indexOf('stretch') !== -1)) {
            delete state[layout.perpendicularPrefix];
        }
        return state;
    },

    show: Ext.emptyFn,

    animate: function(animObj) {
        var me = this,
            to;

        animObj = animObj || {};
        to = animObj.to || {};

        if (Ext.fx.Manager.hasFxBlock(me.id)) {
            return me;
        }
        // Special processing for animating Component dimensions.
        if (!animObj.dynamic && (to.height || to.width)) {
            var curWidth = me.getWidth(),
                w = curWidth,
                curHeight = me.getHeight(),
                h = curHeight,
                needsResize = false;

            if (to.height && to.height > curHeight) {
                h = to.height;
                needsResize = true;
            }
            if (to.width && to.width > curWidth) {
                w = to.width;
                needsResize = true;
            }

            // If any dimensions are being increased, we must resize the internal structure
            // of the Component, but then clip it by sizing its encapsulating element back to original dimensions.
            // The animation will then progressively reveal the larger content.
            if (needsResize) {
                var clearWidth = !Ext.isNumber(me.width),
                    clearHeight = !Ext.isNumber(me.height);

                me.componentLayout.childrenChanged = true;
                me.setSize(w, h, me.ownerCt);
                me.el.setSize(curWidth, curHeight);
                if (clearWidth) {
                    delete me.width;
                }
                if (clearHeight) {
                    delete me.height;
                }
            }
        }
        return me.mixins.animate.animate.apply(me, arguments);
    },

    /**
     * This method finds the topmost active layout who's processing will eventually determine the size and position of
     * this Component.
     *
     * This method is useful when dynamically adding Components into Containers, and some processing must take place
     * after the final sizing and positioning of the Component has been performed.
     *
     * @return {Ext.Component}
     */
    findLayoutController: function() {
        return this.findParentBy(function(c) {
            // Return true if we are at the root of the Container tree
            // or this Container's layout is busy but the next one up is not.
            return !c.ownerCt || (c.layout.layoutBusy && !c.ownerCt.layout.layoutBusy);
        });
    },

    onShow : function() {
        // Layout if needed
        var needsLayout = this.needsLayout;
        if (Ext.isObject(needsLayout)) {
            this.doComponentLayout(needsLayout.width, needsLayout.height, needsLayout.isSetSize, needsLayout.ownerCt);
        }
    },

    constructPlugin: function(plugin) {
        if (plugin.ptype && typeof plugin.init != 'function') {
            plugin.cmp = this;
            plugin = Ext.PluginManager.create(plugin);
        }
        else if (typeof plugin == 'string') {
            plugin = Ext.PluginManager.create({
                ptype: plugin,
                cmp: this
            });
        }
        return plugin;
    },

    /**
     * Ensures that the plugins array contains fully constructed plugin instances. This converts any configs into their
     * appropriate instances.
     */
    constructPlugins: function() {
        var me = this,
            plugins = me.plugins,
            i, len;

        if (plugins) {
            for (i = 0, len = plugins.length; i < len; i++) {
                // this just returns already-constructed plugin instances...
                plugins[i] = me.constructPlugin(plugins[i]);
            }
        }
    },

    // @private
    initPlugin : function(plugin) {
        plugin.init(this);

        return plugin;
    },

    /**
     * Handles autoRender. Floating Components may have an ownerCt. If they are asking to be constrained, constrain them
     * within that ownerCt, and have their z-index managed locally. Floating Components are always rendered to
     * document.body
     */
    doAutoRender: function() {
        var me = this;
        if (me.floating) {
            me.render(document.body);
        } else {
            me.render(Ext.isBoolean(me.autoRender) ? Ext.getBody() : me.autoRender);
        }
    },

    // @private
    render : function(container, position) {
        var me = this;

        if (!me.rendered && me.fireEvent('beforerender', me) !== false) {

            // Flag set during the render process.
            // It can be used to inhibit event-driven layout calls during the render phase
            me.rendering = true;

            // If this.el is defined, we want to make sure we are dealing with
            // an Ext Element.
            if (me.el) {
                me.el = Ext.get(me.el);
            }

            // Perform render-time processing for floating Components
            if (me.floating) {
                me.onFloatRender();
            }

            container = me.initContainer(container);

            me.onRender(container, position);

            // Tell the encapsulating element to hide itself in the way the Component is configured to hide
            // This means DISPLAY, VISIBILITY or OFFSETS.
            me.el.setVisibilityMode(Ext.Element[me.hideMode.toUpperCase()]);

            if (me.overCls) {
                me.el.hover(me.addOverCls, me.removeOverCls, me);
            }

            me.fireEvent('render', me);

            me.initContent();

            me.afterRender(container);
            me.fireEvent('afterrender', me);

            me.initEvents();

            if (me.hidden) {
                // Hiding during the render process should not perform any ancillary
                // actions that the full hide process does; It is not hiding, it begins in a hidden state.'
                // So just make the element hidden according to the configured hideMode
                me.el.hide();
            }

            if (me.disabled) {
                // pass silent so the event doesn't fire the first time.
                me.disable(true);
            }

            // Delete the flag once the rendering is done.
            delete me.rendering;
        }
        return me;
    },

    // @private
    onRender : function(container, position) {
        var me = this,
            el = me.el,
            styles = me.initStyles(),
            renderTpl, renderData, i;

        position = me.getInsertPosition(position);

        if (!el) {
            if (position) {
                el = Ext.DomHelper.insertBefore(position, me.getElConfig(), true);
            }
            else {
                el = Ext.DomHelper.append(container, me.getElConfig(), true);
            }
        }
        else if (me.allowDomMove !== false) {
            if (position) {
                container.dom.insertBefore(el.dom, position);
            } else {
                container.dom.appendChild(el.dom);
            }
        }

        if (Ext.scopeResetCSS && !me.ownerCt) {
            // If this component's el is the body element, we add the reset class to the html tag
            if (el.dom == Ext.getBody().dom) {
                el.parent().addCls(Ext.baseCSSPrefix + 'reset');
            }
            else {
                // Else we wrap this element in an element that adds the reset class.
                me.resetEl = el.wrap({
                    cls: Ext.baseCSSPrefix + 'reset'
                });
            }
        }

        me.setUI(me.ui);

        el.addCls(me.initCls());
        el.setStyle(styles);

        // Here we check if the component has a height set through style or css.
        // If it does then we set the this.height to that value and it won't be
        // considered an auto height component
        // if (this.height === undefined) {
        //     var height = el.getHeight();
        //     // This hopefully means that the panel has an explicit height set in style or css
        //     if (height - el.getPadding('tb') - el.getBorderWidth('tb') > 0) {
        //         this.height = height;
        //     }
        // }

        me.el = el;

        me.initFrame();

        renderTpl = me.initRenderTpl();
        if (renderTpl) {
            renderData = me.initRenderData();
            renderTpl.append(me.getTargetEl(), renderData);
        }

        me.applyRenderSelectors();

        me.rendered = true;
    },

    // @private
    afterRender : function() {
        var me = this,
            pos,
            xy;

        me.getComponentLayout();

        // Set the size if a size is configured, or if this is the outermost Container.
        // Also, if this is a collapsed Panel, it needs an initial component layout
        // to lay out its header so that it can have a height determined.
        if (me.collapsed || (!me.ownerCt || (me.height || me.width))) {
            me.setSize(me.width, me.height);
        } else {
            // It is expected that child items be rendered before this method returns and
            // the afterrender event fires. Since we aren't going to do the layout now, we
            // must render the child items. This is handled implicitly above in the layout
            // caused by setSize.
            me.renderChildren();
        }

        // For floaters, calculate x and y if they aren't defined by aligning
        // the sized element to the center of either the container or the ownerCt
        if (me.floating && (me.x === undefined || me.y === undefined)) {
            if (me.floatParent) {
                xy = me.el.getAlignToXY(me.floatParent.getTargetEl(), 'c-c');
                pos = me.floatParent.getTargetEl().translatePoints(xy[0], xy[1]);
            } else {
                xy = me.el.getAlignToXY(me.container, 'c-c');
                pos = me.container.translatePoints(xy[0], xy[1]);
            }
            me.x = me.x === undefined ? pos.left: me.x;
            me.y = me.y === undefined ? pos.top: me.y;
        }

        if (Ext.isDefined(me.x) || Ext.isDefined(me.y)) {
            me.setPosition(me.x, me.y);
        }

        if (me.styleHtmlContent) {
            me.getTargetEl().addCls(me.styleHtmlCls);
        }
    },

    /**
     * @private
     * Called by Component#doAutoRender
     *
     * Register a Container configured `floating: true` with this Component's {@link Ext.ZIndexManager ZIndexManager}.
     *
     * Components added in ths way will not participate in any layout, but will be rendered
     * upon first show in the way that {@link Ext.window.Window Window}s are.
     */
    registerFloatingItem: function(cmp) {
        var me = this;
        if (!me.floatingItems) {
            me.floatingItems = Ext.create('Ext.ZIndexManager', me);
        }
        me.floatingItems.register(cmp);
    },

    renderChildren: function () {
        var me = this,
            layout = me.getComponentLayout();

        me.suspendLayout = true;
        layout.renderChildren();
        delete me.suspendLayout;
    },

    frameCls: Ext.baseCSSPrefix + 'frame',

    frameIdRegex: /[-]frame\d+[TMB][LCR]$/,

    frameElementCls: {
        tl: [],
        tc: [],
        tr: [],
        ml: [],
        mc: [],
        mr: [],
        bl: [],
        bc: [],
        br: []
    },

    frameTpl: [
        '<tpl if="top">',
            '<tpl if="left"><div id="{fgid}TL" class="{frameCls}-tl {baseCls}-tl {baseCls}-{ui}-tl<tpl if="uiCls"><tpl for="uiCls"> {parent.baseCls}-{parent.ui}-{.}-tl</tpl></tpl>" style="background-position: {tl}; padding-left: {frameWidth}px" role="presentation"></tpl>',
                '<tpl if="right"><div id="{fgid}TR" class="{frameCls}-tr {baseCls}-tr {baseCls}-{ui}-tr<tpl if="uiCls"><tpl for="uiCls"> {parent.baseCls}-{parent.ui}-{.}-tr</tpl></tpl>" style="background-position: {tr}; padding-right: {frameWidth}px" role="presentation"></tpl>',
                    '<div id="{fgid}TC" class="{frameCls}-tc {baseCls}-tc {baseCls}-{ui}-tc<tpl if="uiCls"><tpl for="uiCls"> {parent.baseCls}-{parent.ui}-{.}-tc</tpl></tpl>" style="background-position: {tc}; height: {frameWidth}px" role="presentation"></div>',
                '<tpl if="right"></div></tpl>',
            '<tpl if="left"></div></tpl>',
        '</tpl>',
        '<tpl if="left"><div id="{fgid}ML" class="{frameCls}-ml {baseCls}-ml {baseCls}-{ui}-ml<tpl if="uiCls"><tpl for="uiCls"> {parent.baseCls}-{parent.ui}-{.}-ml</tpl></tpl>" style="background-position: {ml}; padding-left: {frameWidth}px" role="presentation"></tpl>',
            '<tpl if="right"><div id="{fgid}MR" class="{frameCls}-mr {baseCls}-mr {baseCls}-{ui}-mr<tpl if="uiCls"><tpl for="uiCls"> {parent.baseCls}-{parent.ui}-{.}-mr</tpl></tpl>" style="background-position: {mr}; padding-right: {frameWidth}px" role="presentation"></tpl>',
                '<div id="{fgid}MC" class="{frameCls}-mc {baseCls}-mc {baseCls}-{ui}-mc<tpl if="uiCls"><tpl for="uiCls"> {parent.baseCls}-{parent.ui}-{.}-mc</tpl></tpl>" role="presentation"></div>',
            '<tpl if="right"></div></tpl>',
        '<tpl if="left"></div></tpl>',
        '<tpl if="bottom">',
            '<tpl if="left"><div id="{fgid}BL" class="{frameCls}-bl {baseCls}-bl {baseCls}-{ui}-bl<tpl if="uiCls"><tpl for="uiCls"> {parent.baseCls}-{parent.ui}-{.}-bl</tpl></tpl>" style="background-position: {bl}; padding-left: {frameWidth}px" role="presentation"></tpl>',
                '<tpl if="right"><div id="{fgid}BR" class="{frameCls}-br {baseCls}-br {baseCls}-{ui}-br<tpl if="uiCls"><tpl for="uiCls"> {parent.baseCls}-{parent.ui}-{.}-br</tpl></tpl>" style="background-position: {br}; padding-right: {frameWidth}px" role="presentation"></tpl>',
                    '<div id="{fgid}BC" class="{frameCls}-bc {baseCls}-bc {baseCls}-{ui}-bc<tpl if="uiCls"><tpl for="uiCls"> {parent.baseCls}-{parent.ui}-{.}-bc</tpl></tpl>" style="background-position: {bc}; height: {frameWidth}px" role="presentation"></div>',
                '<tpl if="right"></div></tpl>',
            '<tpl if="left"></div></tpl>',
        '</tpl>'
    ],

    frameTableTpl: [
        '<table><tbody>',
            '<tpl if="top">',
                '<tr>',
                    '<tpl if="left"><td id="{fgid}TL" class="{frameCls}-tl {baseCls}-tl {baseCls}-{ui}-tl<tpl if="uiCls"><tpl for="uiCls"> {parent.baseCls}-{parent.ui}-{.}-tl</tpl></tpl>" style="background-position: {tl}; padding-left:{frameWidth}px" role="presentation"></td></tpl>',
                    '<td id="{fgid}TC" class="{frameCls}-tc {baseCls}-tc {baseCls}-{ui}-tc<tpl if="uiCls"><tpl for="uiCls"> {parent.baseCls}-{parent.ui}-{.}-tc</tpl></tpl>" style="background-position: {tc}; height: {frameWidth}px" role="presentation"></td>',
                    '<tpl if="right"><td id="{fgid}TR" class="{frameCls}-tr {baseCls}-tr {baseCls}-{ui}-tr<tpl if="uiCls"><tpl for="uiCls"> {parent.baseCls}-{parent.ui}-{.}-tr</tpl></tpl>" style="background-position: {tr}; padding-left: {frameWidth}px" role="presentation"></td></tpl>',
                '</tr>',
            '</tpl>',
            '<tr>',
                '<tpl if="left"><td id="{fgid}ML" class="{frameCls}-ml {baseCls}-ml {baseCls}-{ui}-ml<tpl if="uiCls"><tpl for="uiCls"> {parent.baseCls}-{parent.ui}-{.}-ml</tpl></tpl>" style="background-position: {ml}; padding-left: {frameWidth}px" role="presentation"></td></tpl>',
                '<td id="{fgid}MC" class="{frameCls}-mc {baseCls}-mc {baseCls}-{ui}-mc<tpl if="uiCls"><tpl for="uiCls"> {parent.baseCls}-{parent.ui}-{.}-mc</tpl></tpl>" style="background-position: 0 0;" role="presentation"></td>',
                '<tpl if="right"><td id="{fgid}MR" class="{frameCls}-mr {baseCls}-mr {baseCls}-{ui}-mr<tpl if="uiCls"><tpl for="uiCls"> {parent.baseCls}-{parent.ui}-{.}-mr</tpl></tpl>" style="background-position: {mr}; padding-left: {frameWidth}px" role="presentation"></td></tpl>',
            '</tr>',
            '<tpl if="bottom">',
                '<tr>',
                    '<tpl if="left"><td id="{fgid}BL" class="{frameCls}-bl {baseCls}-bl {baseCls}-{ui}-bl<tpl if="uiCls"><tpl for="uiCls"> {parent.baseCls}-{parent.ui}-{.}-bl</tpl></tpl>" style="background-position: {bl}; padding-left: {frameWidth}px" role="presentation"></td></tpl>',
                    '<td id="{fgid}BC" class="{frameCls}-bc {baseCls}-bc {baseCls}-{ui}-bc<tpl if="uiCls"><tpl for="uiCls"> {parent.baseCls}-{parent.ui}-{.}-bc</tpl></tpl>" style="background-position: {bc}; height: {frameWidth}px" role="presentation"></td>',
                    '<tpl if="right"><td id="{fgid}BR" class="{frameCls}-br {baseCls}-br {baseCls}-{ui}-br<tpl if="uiCls"><tpl for="uiCls"> {parent.baseCls}-{parent.ui}-{.}-br</tpl></tpl>" style="background-position: {br}; padding-left: {frameWidth}px" role="presentation"></td></tpl>',
                '</tr>',
            '</tpl>',
        '</tbody></table>'
    ],

    /**
     * @private
     */
    initFrame : function() {
        if (Ext.supports.CSS3BorderRadius) {
            return false;
        }

        var me = this,
            frameInfo = me.getFrameInfo(),
            frameWidth = frameInfo.width,
            frameTpl = me.getFrameTpl(frameInfo.table),
            frameGenId;

        if (me.frame) {
            // since we render id's into the markup and id's NEED to be unique, we have a
            // simple strategy for numbering their generations.
            me.frameGenId = frameGenId = (me.frameGenId || 0) + 1;
            frameGenId = me.id + '-frame' + frameGenId;

            // Here we render the frameTpl to this component. This inserts the 9point div or the table framing.
            frameTpl.insertFirst(me.el, Ext.apply({}, {
                fgid:       frameGenId,
                ui:         me.ui,
                uiCls:      me.uiCls,
                frameCls:   me.frameCls,
                baseCls:    me.baseCls,
                frameWidth: frameWidth,
                top:        !!frameInfo.top,
                left:       !!frameInfo.left,
                right:      !!frameInfo.right,
                bottom:     !!frameInfo.bottom
            }, me.getFramePositions(frameInfo)));

            // The frameBody is returned in getTargetEl, so that layouts render items to the correct target.=
            me.frameBody = me.el.down('.' + me.frameCls + '-mc');

            // Clean out the childEls for the old frame elements (the majority of the els)
            me.removeChildEls(function (c) {
                return c.id && me.frameIdRegex.test(c.id);
            });

            // Add the childEls for each of the new frame elements
            Ext.each(['TL','TC','TR','ML','MC','MR','BL','BC','BR'], function (suffix) {
                me.childEls.push({ name: 'frame' + suffix, id: frameGenId + suffix });
            });
        }
    },

    updateFrame: function() {
        if (Ext.supports.CSS3BorderRadius) {
            return false;
        }

        var me = this,
            wasTable = this.frameSize && this.frameSize.table,
            oldFrameTL = this.frameTL,
            oldFrameBL = this.frameBL,
            oldFrameML = this.frameML,
            oldFrameMC = this.frameMC,
            newMCClassName;

        this.initFrame();

        if (oldFrameMC) {
            if (me.frame) {
                // Reapply render selectors
                delete me.frameTL;
                delete me.frameTC;
                delete me.frameTR;
                delete me.frameML;
                delete me.frameMC;
                delete me.frameMR;
                delete me.frameBL;
                delete me.frameBC;
                delete me.frameBR;
                this.applyRenderSelectors();

                // Store the class names set on the new mc
                newMCClassName = this.frameMC.dom.className;

                // Replace the new mc with the old mc
                oldFrameMC.insertAfter(this.frameMC);
                this.frameMC.remove();

                // Restore the reference to the old frame mc as the framebody
                this.frameBody = this.frameMC = oldFrameMC;

                // Apply the new mc classes to the old mc element
                oldFrameMC.dom.className = newMCClassName;

                // Remove the old framing
                if (wasTable) {
                    me.el.query('> table')[1].remove();
                }
                else {
                    if (oldFrameTL) {
                        oldFrameTL.remove();
                    }
                    if (oldFrameBL) {
                        oldFrameBL.remove();
                    }
                    oldFrameML.remove();
                }
            }
            else {
                // We were framed but not anymore. Move all content from the old frame to the body

            }
        }
        else if (me.frame) {
            this.applyRenderSelectors();
        }
    },

    getFrameInfo: function() {
        if (Ext.supports.CSS3BorderRadius) {
            return false;
        }

        var me = this,
            left = me.el.getStyle('background-position-x'),
            top = me.el.getStyle('background-position-y'),
            info, frameInfo = false, max;

        // Some browsers dont support background-position-x and y, so for those
        // browsers let's split background-position into two parts.
        if (!left && !top) {
            info = me.el.getStyle('background-position').split(' ');
            left = info[0];
            top = info[1];
        }

        // We actually pass a string in the form of '[type][tl][tr]px [type][br][bl]px' as
        // the background position of this.el from the css to indicate to IE that this component needs
        // framing. We parse it here and change the markup accordingly.
        if (parseInt(left, 10) >= 1000000 && parseInt(top, 10) >= 1000000) {
            max = Math.max;

            frameInfo = {
                // Table markup starts with 110, div markup with 100.
                table: left.substr(0, 3) == '110',

                // Determine if we are dealing with a horizontal or vertical component
                vertical: top.substr(0, 3) == '110',

                // Get and parse the different border radius sizes
                top:    max(left.substr(3, 2), left.substr(5, 2)),
                right:  max(left.substr(5, 2), top.substr(3, 2)),
                bottom: max(top.substr(3, 2), top.substr(5, 2)),
                left:   max(top.substr(5, 2), left.substr(3, 2))
            };

            frameInfo.width = max(frameInfo.top, frameInfo.right, frameInfo.bottom, frameInfo.left);

            // Just to be sure we set the background image of the el to none.
            me.el.setStyle('background-image', 'none');
        }

        // This happens when you set frame: true explicitly without using the x-frame mixin in sass.
        // This way IE can't figure out what sizes to use and thus framing can't work.
        if (me.frame === true && !frameInfo) {
            //<debug error>
            Ext.Error.raise("You have set frame: true explicity on this component while it doesn't have any " +
                            "framing defined in the CSS template. In this case IE can't figure out what sizes " +
                            "to use and thus framing on this component will be disabled.");
            //</debug>
        }

        me.frame = me.frame || !!frameInfo;
        me.frameSize = frameInfo || false;

        return frameInfo;
    },

    getFramePositions: function(frameInfo) {
        var me = this,
            frameWidth = frameInfo.width,
            dock = me.dock,
            positions, tc, bc, ml, mr;

        if (frameInfo.vertical) {
            tc = '0 -' + (frameWidth * 0) + 'px';
            bc = '0 -' + (frameWidth * 1) + 'px';

            if (dock && dock == "right") {
                tc = 'right -' + (frameWidth * 0) + 'px';
                bc = 'right -' + (frameWidth * 1) + 'px';
            }

            positions = {
                tl: '0 -' + (frameWidth * 0) + 'px',
                tr: '0 -' + (frameWidth * 1) + 'px',
                bl: '0 -' + (frameWidth * 2) + 'px',
                br: '0 -' + (frameWidth * 3) + 'px',

                ml: '-' + (frameWidth * 1) + 'px 0',
                mr: 'right 0',

                tc: tc,
                bc: bc
            };
        } else {
            ml = '-' + (frameWidth * 0) + 'px 0';
            mr = 'right 0';

            if (dock && dock == "bottom") {
                ml = 'left bottom';
                mr = 'right bottom';
            }

            positions = {
                tl: '0 -' + (frameWidth * 2) + 'px',
                tr: 'right -' + (frameWidth * 3) + 'px',
                bl: '0 -' + (frameWidth * 4) + 'px',
                br: 'right -' + (frameWidth * 5) + 'px',

                ml: ml,
                mr: mr,

                tc: '0 -' + (frameWidth * 0) + 'px',
                bc: '0 -' + (frameWidth * 1) + 'px'
            };
        }

        return positions;
    },

    /**
     * @private
     */
    getFrameTpl : function(table) {
        return table ? this.getTpl('frameTableTpl') : this.getTpl('frameTpl');
    },

    /**
     * Creates an array of class names from the configurations to add to this Component's `el` on render.
     *
     * Private, but (possibly) used by ComponentQuery for selection by class name if Component is not rendered.
     *
     * @return {String[]} An array of class names with which the Component's element will be rendered.
     * @private
     */
    initCls: function() {
        var me = this,
            cls = [];

        cls.push(me.baseCls);

        //<deprecated since=0.99>
        if (Ext.isDefined(me.cmpCls)) {
            if (Ext.isDefined(Ext.global.console)) {
                Ext.global.console.warn('Ext.Component: cmpCls has been deprecated. Please use componentCls.');
            }
            me.componentCls = me.cmpCls;
            delete me.cmpCls;
        }
        //</deprecated>

        if (me.componentCls) {
            cls.push(me.componentCls);
        } else {
            me.componentCls = me.baseCls;
        }
        if (me.cls) {
            cls.push(me.cls);
            delete me.cls;
        }

        return cls.concat(me.additionalCls);
    },

    /**
     * Sets the UI for the component. This will remove any existing UIs on the component. It will also loop through any
     * uiCls set on the component and rename them so they include the new UI
     * @param {String} ui The new UI for the component
     */
    setUI: function(ui) {
        var me = this,
            oldUICls = Ext.Array.clone(me.uiCls),
            newUICls = [],
            classes = [],
            cls,
            i;

        //loop through all exisiting uiCls and update the ui in them
        for (i = 0; i < oldUICls.length; i++) {
            cls = oldUICls[i];

            classes = classes.concat(me.removeClsWithUI(cls, true));
            newUICls.push(cls);
        }

        if (classes.length) {
            me.removeCls(classes);
        }

        //remove the UI from the element
        me.removeUIFromElement();

        //set the UI
        me.ui = ui;

        //add the new UI to the elemend
        me.addUIToElement();

        //loop through all exisiting uiCls and update the ui in them
        classes = [];
        for (i = 0; i < newUICls.length; i++) {
            cls = newUICls[i];
            classes = classes.concat(me.addClsWithUI(cls, true));
        }

        if (classes.length) {
            me.addCls(classes);
        }
    },

    /**
     * Adds a cls to the uiCls array, which will also call {@link #addUIClsToElement} and adds to all elements of this
     * component.
     * @param {String/String[]} cls A string or an array of strings to add to the uiCls
     * @param {Object} skip (Boolean) skip True to skip adding it to the class and do it later (via the return)
     */
    addClsWithUI: function(cls, skip) {
        var me = this,
            classes = [],
            i;

        if (!Ext.isArray(cls)) {
            cls = [cls];
        }

        for (i = 0; i < cls.length; i++) {
            if (cls[i] && !me.hasUICls(cls[i])) {
                me.uiCls = Ext.Array.clone(me.uiCls);
                me.uiCls.push(cls[i]);

                classes = classes.concat(me.addUIClsToElement(cls[i]));
            }
        }

        if (skip !== true) {
            me.addCls(classes);
        }

        return classes;
    },

    /**
     * Removes a cls to the uiCls array, which will also call {@link #removeUIClsFromElement} and removes it from all
     * elements of this component.
     * @param {String/String[]} cls A string or an array of strings to remove to the uiCls
     */
    removeClsWithUI: function(cls, skip) {
        var me = this,
            classes = [],
            i;

        if (!Ext.isArray(cls)) {
            cls = [cls];
        }

        for (i = 0; i < cls.length; i++) {
            if (cls[i] && me.hasUICls(cls[i])) {
                me.uiCls = Ext.Array.remove(me.uiCls, cls[i]);

                classes = classes.concat(me.removeUIClsFromElement(cls[i]));
            }
        }

        if (skip !== true) {
            me.removeCls(classes);
        }

        return classes;
    },

    /**
     * Checks if there is currently a specified uiCls
     * @param {String} cls The cls to check
     */
    hasUICls: function(cls) {
        var me = this,
            uiCls = me.uiCls || [];

        return Ext.Array.contains(uiCls, cls);
    },

    /**
     * Method which adds a specified UI + uiCls to the components element. Can be overridden to remove the UI from more
     * than just the components element.
     * @param {String} ui The UI to remove from the element
     */
    addUIClsToElement: function(cls, force) {
        var me = this,
            result = [],
            frameElementCls = me.frameElementCls;

        result.push(Ext.baseCSSPrefix + cls);
        result.push(me.baseCls + '-' + cls);
        result.push(me.baseCls + '-' + me.ui + '-' + cls);

        if (!force && me.frame && !Ext.supports.CSS3BorderRadius) {
            // define each element of the frame
            var els = ['tl', 'tc', 'tr', 'ml', 'mc', 'mr', 'bl', 'bc', 'br'],
                classes, i, j, el;

            // loop through each of them, and if they are defined add the ui
            for (i = 0; i < els.length; i++) {
                el = me['frame' + els[i].toUpperCase()];
                classes = [me.baseCls + '-' + me.ui + '-' + els[i], me.baseCls + '-' + me.ui + '-' + cls + '-' + els[i]];
                if (el && el.dom) {
                    el.addCls(classes);
                } else {
                    for (j = 0; j < classes.length; j++) {
                        if (Ext.Array.indexOf(frameElementCls[els[i]], classes[j]) == -1) {
                            frameElementCls[els[i]].push(classes[j]);
                        }
                    }
                }
            }
        }

        me.frameElementCls = frameElementCls;

        return result;
    },

    /**
     * Method which removes a specified UI + uiCls from the components element. The cls which is added to the element
     * will be: `this.baseCls + '-' + ui`
     * @param {String} ui The UI to add to the element
     */
    removeUIClsFromElement: function(cls, force) {
        var me = this,
            result = [],
            frameElementCls = me.frameElementCls;

        result.push(Ext.baseCSSPrefix + cls);
        result.push(me.baseCls + '-' + cls);
        result.push(me.baseCls + '-' + me.ui + '-' + cls);

        if (!force && me.frame && !Ext.supports.CSS3BorderRadius) {
            // define each element of the frame
            var els = ['tl', 'tc', 'tr', 'ml', 'mc', 'mr', 'bl', 'bc', 'br'],
                i, el;
            cls = me.baseCls + '-' + me.ui + '-' + cls + '-' + els[i];
            // loop through each of them, and if they are defined add the ui
            for (i = 0; i < els.length; i++) {
                el = me['frame' + els[i].toUpperCase()];
                if (el && el.dom) {
                    el.removeCls(cls);
                } else {
                    Ext.Array.remove(frameElementCls[els[i]], cls);
                }
            }
        }

        me.frameElementCls = frameElementCls;

        return result;
    },

    /**
     * Method which adds a specified UI to the components element.
     * @private
     */
    addUIToElement: function(force) {
        var me = this,
            frameElementCls = me.frameElementCls;

        me.addCls(me.baseCls + '-' + me.ui);

        if (me.frame && !Ext.supports.CSS3BorderRadius) {
            // define each element of the frame
            var els = ['tl', 'tc', 'tr', 'ml', 'mc', 'mr', 'bl', 'bc', 'br'],
                i, el, cls;

            // loop through each of them, and if they are defined add the ui
            for (i = 0; i < els.length; i++) {
                el = me['frame' + els[i].toUpperCase()];
                cls = me.baseCls + '-' + me.ui + '-' + els[i];
                if (el) {
                    el.addCls(cls);
                } else {
                    if (!Ext.Array.contains(frameElementCls[els[i]], cls)) {
                        frameElementCls[els[i]].push(cls);
                    }
                }
            }
        }
    },

    /**
     * Method which removes a specified UI from the components element.
     * @private
     */
    removeUIFromElement: function() {
        var me = this,
            frameElementCls = me.frameElementCls;

        me.removeCls(me.baseCls + '-' + me.ui);

        if (me.frame && !Ext.supports.CSS3BorderRadius) {
            // define each element of the frame
            var els = ['tl', 'tc', 'tr', 'ml', 'mc', 'mr', 'bl', 'bc', 'br'],
                i, j, el, cls;

            // loop through each of them, and if they are defined add the ui
            for (i = 0; i < els.length; i++) {
                el = me['frame' + els[i].toUpperCase()];
                cls = me.baseCls + '-' + me.ui + '-' + els[i];

                if (el) {
                    el.removeCls(cls);
                } else {
                    Ext.Array.remove(frameElementCls[els[i]], cls);
                }
            }
        }
    },

    getElConfig : function() {
        if (Ext.isString(this.autoEl)) {
            this.autoEl = {
                tag: this.autoEl
            };
        }

        var result = this.autoEl || {tag: 'div'};
        result.id = this.id;
        return result;
    },

    /**
     * This function takes the position argument passed to onRender and returns a DOM element that you can use in the
     * insertBefore.
     * @param {String/Number/Ext.Element/HTMLElement} position Index, element id or element you want to put this
     * component before.
     * @return {HTMLElement} DOM element that you can use in the insertBefore
     */
    getInsertPosition: function(position) {
        // Convert the position to an element to insert before
        if (position !== undefined) {
            if (Ext.isNumber(position)) {
                position = this.container.dom.childNodes[position];
            }
            else {
                position = Ext.getDom(position);
            }
        }

        return position;
    },

    /**
     * Adds ctCls to container.
     * @return {Ext.Element} The initialized container
     * @private
     */
    initContainer: function(container) {
        var me = this;

        // If you render a component specifying the el, we get the container
        // of the el, and make sure we dont move the el around in the dom
        // during the render
        if (!container && me.el) {
            container = me.el.dom.parentNode;
            me.allowDomMove = false;
        }

        me.container = Ext.get(container);

        if (me.ctCls) {
            me.container.addCls(me.ctCls);
        }

        return me.container;
    },

    /**
     * Initialized the renderData to be used when rendering the renderTpl.
     * @return {Object} Object with keys and values that are going to be applied to the renderTpl
     * @private
     */
    initRenderData: function() {
        var me = this;

        return Ext.applyIf(me.renderData, {
            id: me.id,
            ui: me.ui,
            uiCls: me.uiCls,
            baseCls: me.baseCls,
            componentCls: me.componentCls,
            frame: me.frame
        });
    },

    /**
     * @private
     */
    getTpl: function(name) {
        var me = this,
            prototype = me.self.prototype,
            ownerPrototype,
            tpl;

        if (me.hasOwnProperty(name)) {
            tpl = me[name];
            if (tpl && !(tpl instanceof Ext.XTemplate)) {
                me[name] = Ext.ClassManager.dynInstantiate('Ext.XTemplate', tpl);
            }

            return me[name];
        }

        if (!(prototype[name] instanceof Ext.XTemplate)) {
            ownerPrototype = prototype;

            do {
                if (ownerPrototype.hasOwnProperty(name)) {
                    tpl = ownerPrototype[name];
                    if (tpl && !(tpl instanceof Ext.XTemplate)) {
                        ownerPrototype[name] = Ext.ClassManager.dynInstantiate('Ext.XTemplate', tpl);
                        break;
                    }
                }

                ownerPrototype = ownerPrototype.superclass;
            } while (ownerPrototype);
        }

        return prototype[name];
    },

    /**
     * Initializes the renderTpl.
     * @return {Ext.XTemplate} The renderTpl XTemplate instance.
     * @private
     */
    initRenderTpl: function() {
        return this.getTpl('renderTpl');
    },

    /**
     * Converts style definitions to String.
     * @return {String} A CSS style string with style, padding, margin and border.
     * @private
     */
    initStyles: function() {
        var style = {},
            me = this,
            Element = Ext.Element;

        if (Ext.isString(me.style)) {
            style = Element.parseStyles(me.style);
        } else {
            style = Ext.apply({}, me.style);
        }

        // Convert the padding, margin and border properties from a space seperated string
        // into a proper style string
        if (me.padding !== undefined) {
            style.padding = Element.unitizeBox((me.padding === true) ? 5 : me.padding);
        }

        if (me.margin !== undefined) {
            style.margin = Element.unitizeBox((me.margin === true) ? 5 : me.margin);
        }

        delete me.style;
        return style;
    },

    /**
     * Initializes this components contents. It checks for the properties html, contentEl and tpl/data.
     * @private
     */
    initContent: function() {
        var me = this,
            target = me.getTargetEl(),
            contentEl,
            pre;

        if (me.html) {
            target.update(Ext.DomHelper.markup(me.html));
            delete me.html;
        }

        if (me.contentEl) {
            contentEl = Ext.get(me.contentEl);
            pre = Ext.baseCSSPrefix;
            contentEl.removeCls([pre + 'hidden', pre + 'hide-display', pre + 'hide-offsets', pre + 'hide-nosize']);
            target.appendChild(contentEl.dom);
        }

        if (me.tpl) {
            // Make sure this.tpl is an instantiated XTemplate
            if (!me.tpl.isTemplate) {
                me.tpl = Ext.create('Ext.XTemplate', me.tpl);
            }

            if (me.data) {
                me.tpl[me.tplWriteMode](target, me.data);
                delete me.data;
            }
        }
    },

    // @private
    initEvents : function() {
        var me = this,
            afterRenderEvents = me.afterRenderEvents,
            el,
            property,
            fn = function(listeners){
                me.mon(el, listeners);
            };
        if (afterRenderEvents) {
            for (property in afterRenderEvents) {
                if (afterRenderEvents.hasOwnProperty(property)) {
                    el = me[property];
                    if (el && el.on) {
                        Ext.each(afterRenderEvents[property], fn);
                    }
                }
            }
        }
    },

    /**
     * Adds each argument passed to this method to the {@link #childEls} array.
     */
    addChildEls: function () {
        var me = this,
            childEls = me.childEls || (me.childEls = []);

        childEls.push.apply(childEls, arguments);
    },

    /**
     * Removes items in the childEls array based on the return value of a supplied test function. The function is called
     * with a entry in childEls and if the test function return true, that entry is removed. If false, that entry is
     * kept.
     * @param {Function} testFn The test function.
     */
    removeChildEls: function (testFn) {
        var me = this,
            old = me.childEls,
            keepers = (me.childEls = []),
            n, i, cel;

        for (i = 0, n = old.length; i < n; ++i) {
            cel = old[i];
            if (!testFn(cel)) {
                keepers.push(cel);
            }
        }
    },

    /**
     * Sets references to elements inside the component. This applies {@link #renderSelectors}
     * as well as {@link #childEls}.
     * @private
     */
    applyRenderSelectors: function() {
        var me = this,
            childEls = me.childEls,
            selectors = me.renderSelectors,
            el = me.el,
            dom = el.dom,
            baseId, childName, childId, i, selector;

        if (childEls) {
            baseId = me.id + '-';
            for (i = childEls.length; i--; ) {
                childName = childId = childEls[i];
                if (typeof(childName) != 'string') {
                    childId = childName.id || (baseId + childName.itemId);
                    childName = childName.name;
                } else {
                    childId = baseId + childId;
                }

                // We don't use Ext.get because that is 3x (or more) slower on IE6-8. Since
                // we know the el's are children of our el we use getById instead:
                me[childName] = el.getById(childId);
            }
        }

        // We still support renderSelectors. There are a few places in the framework that
        // need them and they are a documented part of the API. In fact, we support mixing
        // childEls and renderSelectors (no reason not to).
        if (selectors) {
            for (selector in selectors) {
                if (selectors.hasOwnProperty(selector) && selectors[selector]) {
                    me[selector] = Ext.get(Ext.DomQuery.selectNode(selectors[selector], dom));
                }
            }
        }
    },

    /**
     * Tests whether this Component matches the selector string.
     * @param {String} selector The selector string to test against.
     * @return {Boolean} True if this Component matches the selector.
     */
    is: function(selector) {
        return Ext.ComponentQuery.is(this, selector);
    },

    /**
     * Walks up the `ownerCt` axis looking for an ancestor Container which matches the passed simple selector.
     *
     * Example:
     *
     *     var owningTabPanel = grid.up('tabpanel');
     *
     * @param {String} [selector] The simple selector to test.
     * @return {Ext.container.Container} The matching ancestor Container (or `undefined` if no match was found).
     */
    up: function(selector) {
        var result = this.ownerCt;
        if (selector) {
            for (; result; result = result.ownerCt) {
                if (Ext.ComponentQuery.is(result, selector)) {
                    return result;
                }
            }
        }
        return result;
    },

    /**
     * Returns the next sibling of this Component.
     *
     * Optionally selects the next sibling which matches the passed {@link Ext.ComponentQuery ComponentQuery} selector.
     *
     * May also be refered to as **`next()`**
     *
     * Note that this is limited to siblings, and if no siblings of the item match, `null` is returned. Contrast with
     * {@link #nextNode}
     * @param {String} [selector] A {@link Ext.ComponentQuery ComponentQuery} selector to filter the following items.
     * @return {Ext.Component} The next sibling (or the next sibling which matches the selector).
     * Returns null if there is no matching sibling.
     */
    nextSibling: function(selector) {
        var o = this.ownerCt, it, last, idx, c;
        if (o) {
            it = o.items;
            idx = it.indexOf(this) + 1;
            if (idx) {
                if (selector) {
                    for (last = it.getCount(); idx < last; idx++) {
                        if ((c = it.getAt(idx)).is(selector)) {
                            return c;
                        }
                    }
                } else {
                    if (idx < it.getCount()) {
                        return it.getAt(idx);
                    }
                }
            }
        }
        return null;
    },

    /**
     * Returns the previous sibling of this Component.
     *
     * Optionally selects the previous sibling which matches the passed {@link Ext.ComponentQuery ComponentQuery}
     * selector.
     *
     * May also be refered to as **`prev()`**
     *
     * Note that this is limited to siblings, and if no siblings of the item match, `null` is returned. Contrast with
     * {@link #previousNode}
     * @param {String} [selector] A {@link Ext.ComponentQuery ComponentQuery} selector to filter the preceding items.
     * @return {Ext.Component} The previous sibling (or the previous sibling which matches the selector).
     * Returns null if there is no matching sibling.
     */
    previousSibling: function(selector) {
        var o = this.ownerCt, it, idx, c;
        if (o) {
            it = o.items;
            idx = it.indexOf(this);
            if (idx != -1) {
                if (selector) {
                    for (--idx; idx >= 0; idx--) {
                        if ((c = it.getAt(idx)).is(selector)) {
                            return c;
                        }
                    }
                } else {
                    if (idx) {
                        return it.getAt(--idx);
                    }
                }
            }
        }
        return null;
    },

    /**
     * Returns the previous node in the Component tree in tree traversal order.
     *
     * Note that this is not limited to siblings, and if invoked upon a node with no matching siblings, will walk the
     * tree in reverse order to attempt to find a match. Contrast with {@link #previousSibling}.
     * @param {String} [selector] A {@link Ext.ComponentQuery ComponentQuery} selector to filter the preceding nodes.
     * @return {Ext.Component} The previous node (or the previous node which matches the selector).
     * Returns null if there is no matching node.
     */
    previousNode: function(selector, includeSelf) {
        var node = this,
            result,
            it, len, i;

        // If asked to include self, test me
        if (includeSelf && node.is(selector)) {
            return node;
        }

        result = this.prev(selector);
        if (result) {
            return result;
        }

        if (node.ownerCt) {
            for (it = node.ownerCt.items.items, i = Ext.Array.indexOf(it, node) - 1; i > -1; i--) {
                if (it[i].query) {
                    result = it[i].query(selector);
                    result = result[result.length - 1];
                    if (result) {
                        return result;
                    }
                }
            }
            return node.ownerCt.previousNode(selector, true);
        }
    },

    /**
     * Returns the next node in the Component tree in tree traversal order.
     *
     * Note that this is not limited to siblings, and if invoked upon a node with no matching siblings, will walk the
     * tree to attempt to find a match. Contrast with {@link #nextSibling}.
     * @param {String} [selector] A {@link Ext.ComponentQuery ComponentQuery} selector to filter the following nodes.
     * @return {Ext.Component} The next node (or the next node which matches the selector).
     * Returns null if there is no matching node.
     */
    nextNode: function(selector, includeSelf) {
        var node = this,
            result,
            it, len, i;

        // If asked to include self, test me
        if (includeSelf && node.is(selector)) {
            return node;
        }

        result = this.next(selector);
        if (result) {
            return result;
        }

        if (node.ownerCt) {
            for (it = node.ownerCt.items, i = it.indexOf(node) + 1, it = it.items, len = it.length; i < len; i++) {
                if (it[i].down) {
                    result = it[i].down(selector);
                    if (result) {
                        return result;
                    }
                }
            }
            return node.ownerCt.nextNode(selector);
        }
    },

    /**
     * Retrieves the id of this component. Will autogenerate an id if one has not already been set.
     * @return {String}
     */
    getId : function() {
        return this.id || (this.id = 'ext-comp-' + (this.getAutoId()));
    },

    getItemId : function() {
        return this.itemId || this.id;
    },

    /**
     * Retrieves the top level element representing this component.
     * @return {Ext.core.Element}
     */
    getEl : function() {
        return this.el;
    },

    /**
     * This is used to determine where to insert the 'html', 'contentEl' and 'items' in this component.
     * @private
     */
    getTargetEl: function() {
        return this.frameBody || this.el;
    },

    /**
     * Tests whether or not this Component is of a specific xtype. This can test whether this Component is descended
     * from the xtype (default) or whether it is directly of the xtype specified (shallow = true).
     *
     * **If using your own subclasses, be aware that a Component must register its own xtype to participate in
     * determination of inherited xtypes.**
     *
     * For a list of all available xtypes, see the {@link Ext.Component} header.
     *
     * Example usage:
     *
     *     var t = new Ext.form.field.Text();
     *     var isText = t.isXType('textfield');        // true
     *     var isBoxSubclass = t.isXType('field');       // true, descended from Ext.form.field.Base
     *     var isBoxInstance = t.isXType('field', true); // false, not a direct Ext.form.field.Base instance
     *
     * @param {String} xtype The xtype to check for this Component
     * @param {Boolean} [shallow=false] True to check whether this Component is directly of the specified xtype, false to
     * check whether this Component is descended from the xtype.
     * @return {Boolean} True if this component descends from the specified xtype, false otherwise.
     */
    isXType: function(xtype, shallow) {
        //assume a string by default
        if (Ext.isFunction(xtype)) {
            xtype = xtype.xtype;
            //handle being passed the class, e.g. Ext.Component
        } else if (Ext.isObject(xtype)) {
            xtype = xtype.statics().xtype;
            //handle being passed an instance
        }

        return !shallow ? ('/' + this.getXTypes() + '/').indexOf('/' + xtype + '/') != -1: this.self.xtype == xtype;
    },

    /**
     * Returns this Component's xtype hierarchy as a slash-delimited string. For a list of all available xtypes, see the
     * {@link Ext.Component} header.
     *
     * **If using your own subclasses, be aware that a Component must register its own xtype to participate in
     * determination of inherited xtypes.**
     *
     * Example usage:
     *
     *     var t = new Ext.form.field.Text();
     *     alert(t.getXTypes());  // alerts 'component/field/textfield'
     *
     * @return {String} The xtype hierarchy string
     */
    getXTypes: function() {
        var self = this.self,
            xtypes, parentPrototype, parentXtypes;

        if (!self.xtypes) {
            xtypes = [];
            parentPrototype = this;

            while (parentPrototype) {
                parentXtypes = parentPrototype.xtypes;

                if (parentXtypes !== undefined) {
                    xtypes.unshift.apply(xtypes, parentXtypes);
                }

                parentPrototype = parentPrototype.superclass;
            }

            self.xtypeChain = xtypes;
            self.xtypes = xtypes.join('/');
        }

        return self.xtypes;
    },

    /**
     * Update the content area of a component.
     * @param {String/Object} htmlOrData If this component has been configured with a template via the tpl config then
     * it will use this argument as data to populate the template. If this component was not configured with a template,
     * the components content area will be updated via Ext.Element update
     * @param {Boolean} [loadScripts=false] Only legitimate when using the html configuration.
     * @param {Function} [callback] Only legitimate when using the html configuration. Callback to execute when
     * scripts have finished loading
     */
    update : function(htmlOrData, loadScripts, cb) {
        var me = this;

        if (me.tpl && !Ext.isString(htmlOrData)) {
            me.data = htmlOrData;
            if (me.rendered) {
                me.tpl[me.tplWriteMode](me.getTargetEl(), htmlOrData || {});
            }
        } else {
            me.html = Ext.isObject(htmlOrData) ? Ext.DomHelper.markup(htmlOrData) : htmlOrData;
            if (me.rendered) {
                me.getTargetEl().update(me.html, loadScripts, cb);
            }
        }

        if (me.rendered) {
            me.doComponentLayout();
        }
    },

    /**
     * Convenience function to hide or show this component by boolean.
     * @param {Boolean} visible True to show, false to hide
     * @return {Ext.Component} this
     */
    setVisible : function(visible) {
        return this[visible ? 'show': 'hide']();
    },

    /**
     * Returns true if this component is visible.
     *
     * @param {Boolean} [deep=false] Pass `true` to interrogate the visibility status of all parent Containers to
     * determine whether this Component is truly visible to the user.
     *
     * Generally, to determine whether a Component is hidden, the no argument form is needed. For example when creating
     * dynamically laid out UIs in a hidden Container before showing them.
     *
     * @return {Boolean} True if this component is visible, false otherwise.
     */
    isVisible: function(deep) {
        var me = this,
            child = me,
            visible = !me.hidden,
            ancestor = me.ownerCt;

        // Clear hiddenOwnerCt property
        me.hiddenAncestor = false;
        if (me.destroyed) {
            return false;
        }

        if (deep && visible && me.rendered && ancestor) {
            while (ancestor) {
                // If any ancestor is hidden, then this is hidden.
                // If an ancestor Panel (only Panels have a collapse method) is collapsed,
                // then its layoutTarget (body) is hidden, so this is hidden unless its within a
                // docked item; they are still visible when collapsed (Unless they themseves are hidden)
                if (ancestor.hidden || (ancestor.collapsed &&
                        !(ancestor.getDockedItems && Ext.Array.contains(ancestor.getDockedItems(), child)))) {
                    // Store hiddenOwnerCt property if needed
                    me.hiddenAncestor = ancestor;
                    visible = false;
                    break;
                }
                child = ancestor;
                ancestor = ancestor.ownerCt;
            }
        }
        return visible;
    },

    /**
     * Enable the component
     * @param {Boolean} [silent=false] Passing true will supress the 'enable' event from being fired.
     */
    enable: function(silent) {
        var me = this;

        if (me.rendered) {
            me.el.removeCls(me.disabledCls);
            me.el.dom.disabled = false;
            me.onEnable();
        }

        me.disabled = false;

        if (silent !== true) {
            me.fireEvent('enable', me);
        }

        return me;
    },

    /**
     * Disable the component.
     * @param {Boolean} [silent=false] Passing true will supress the 'disable' event from being fired.
     */
    disable: function(silent) {
        var me = this;

        if (me.rendered) {
            me.el.addCls(me.disabledCls);
            me.el.dom.disabled = true;
            me.onDisable();
        }

        me.disabled = true;

        if (silent !== true) {
            me.fireEvent('disable', me);
        }

        return me;
    },

    // @private
    onEnable: function() {
        if (this.maskOnDisable) {
            this.el.unmask();
        }
    },

    // @private
    onDisable : function() {
        if (this.maskOnDisable) {
            this.el.mask();
        }
    },

    /**
     * Method to determine whether this Component is currently disabled.
     * @return {Boolean} the disabled state of this Component.
     */
    isDisabled : function() {
        return this.disabled;
    },

    /**
     * Enable or disable the component.
     * @param {Boolean} disabled True to disable.
     */
    setDisabled : function(disabled) {
        return this[disabled ? 'disable': 'enable']();
    },

    /**
     * Method to determine whether this Component is currently set to hidden.
     * @return {Boolean} the hidden state of this Component.
     */
    isHidden : function() {
        return this.hidden;
    },

    /**
     * Adds a CSS class to the top level element representing this component.
     * @param {String} cls The CSS class name to add
     * @return {Ext.Component} Returns the Component to allow method chaining.
     */
    addCls : function(className) {
        var me = this;
        if (!className) {
            return me;
        }
        if (!Ext.isArray(className)){
            className = className.replace(me.trimRe, '').split(me.spacesRe);
        }
        if (me.rendered) {
            me.el.addCls(className);
        }
        else {
            me.additionalCls = Ext.Array.unique(me.additionalCls.concat(className));
        }
        return me;
    },

    /**
     * Adds a CSS class to the top level element representing this component.
     * @param {String} cls The CSS class name to add
     * @return {Ext.Component} Returns the Component to allow method chaining.
     */
    addClass : function() {
        return this.addCls.apply(this, arguments);
    },

    /**
     * Removes a CSS class from the top level element representing this component.
     * @param {Object} className
     * @return {Ext.Component} Returns the Component to allow method chaining.
     */
    removeCls : function(className) {
        var me = this;

        if (!className) {
            return me;
        }
        if (!Ext.isArray(className)){
            className = className.replace(me.trimRe, '').split(me.spacesRe);
        }
        if (me.rendered) {
            me.el.removeCls(className);
        }
        else if (me.additionalCls.length) {
            Ext.each(className, function(cls) {
                Ext.Array.remove(me.additionalCls, cls);
            });
        }
        return me;
    },

    //<debug>
    removeClass : function() {
        if (Ext.isDefined(Ext.global.console)) {
            Ext.global.console.warn('Ext.Component: removeClass has been deprecated. Please use removeCls.');
        }
        return this.removeCls.apply(this, arguments);
    },
    //</debug>

    addOverCls: function() {
        var me = this;
        if (!me.disabled) {
            me.el.addCls(me.overCls);
        }
    },

    removeOverCls: function() {
        this.el.removeCls(this.overCls);
    },

    addListener : function(element, listeners, scope, options) {
        var me = this,
            fn,
            option;

        if (Ext.isString(element) && (Ext.isObject(listeners) || options && options.element)) {
            if (options.element) {
                fn = listeners;

                listeners = {};
                listeners[element] = fn;
                element = options.element;
                if (scope) {
                    listeners.scope = scope;
                }

                for (option in options) {
                    if (options.hasOwnProperty(option)) {
                        if (me.eventOptionsRe.test(option)) {
                            listeners[option] = options[option];
                        }
                    }
                }
            }

            // At this point we have a variable called element,
            // and a listeners object that can be passed to on
            if (me[element] && me[element].on) {
                me.mon(me[element], listeners);
            } else {
                me.afterRenderEvents = me.afterRenderEvents || {};
                if (!me.afterRenderEvents[element]) {
                    me.afterRenderEvents[element] = [];
                }
                me.afterRenderEvents[element].push(listeners);
            }
        }

        return me.mixins.observable.addListener.apply(me, arguments);
    },

    // inherit docs
    removeManagedListenerItem: function(isClear, managedListener, item, ename, fn, scope){
        var me = this,
            element = managedListener.options ? managedListener.options.element : null;

        if (element) {
            element = me[element];
            if (element && element.un) {
                if (isClear || (managedListener.item === item && managedListener.ename === ename && (!fn || managedListener.fn === fn) && (!scope || managedListener.scope === scope))) {
                    element.un(managedListener.ename, managedListener.fn, managedListener.scope);
                    if (!isClear) {
                        Ext.Array.remove(me.managedListeners, managedListener);
                    }
                }
            }
        } else {
            return me.mixins.observable.removeManagedListenerItem.apply(me, arguments);
        }
    },

    /**
     * Provides the link for Observable's fireEvent method to bubble up the ownership hierarchy.
     * @return {Ext.container.Container} the Container which owns this Component.
     */
    getBubbleTarget : function() {
        return this.ownerCt;
    },

    /**
     * Method to determine whether this Component is floating.
     * @return {Boolean} the floating state of this component.
     */
    isFloating : function() {
        return this.floating;
    },

    /**
     * Method to determine whether this Component is draggable.
     * @return {Boolean} the draggable state of this component.
     */
    isDraggable : function() {
        return !!this.draggable;
    },

    /**
     * Method to determine whether this Component is droppable.
     * @return {Boolean} the droppable state of this component.
     */
    isDroppable : function() {
        return !!this.droppable;
    },

    /**
     * @private
     * Method to manage awareness of when components are added to their
     * respective Container, firing an added event.
     * References are established at add time rather than at render time.
     * @param {Ext.container.Container} container Container which holds the component
     * @param {Number} pos Position at which the component was added
     */
    onAdded : function(container, pos) {
        this.ownerCt = container;
        this.fireEvent('added', this, container, pos);
    },

    /**
     * @private
     * Method to manage awareness of when components are removed from their
     * respective Container, firing an removed event. References are properly
     * cleaned up after removing a component from its owning container.
     */
    onRemoved : function() {
        var me = this;

        me.fireEvent('removed', me, me.ownerCt);
        delete me.ownerCt;
    },

    // @private
    beforeDestroy : Ext.emptyFn,
    // @private
    // @private
    onResize : Ext.emptyFn,

    /**
     * Sets the width and height of this Component. This method fires the {@link #resize} event. This method can accept
     * either width and height as separate arguments, or you can pass a size object like `{width:10, height:20}`.
     *
     * @param {Number/String/Object} width The new width to set. This may be one of:
     *
     *   - A Number specifying the new width in the {@link #getEl Element}'s {@link Ext.Element#defaultUnit}s (by default, pixels).
     *   - A String used to set the CSS width style.
     *   - A size object in the format `{width: widthValue, height: heightValue}`.
     *   - `undefined` to leave the width unchanged.
     *
     * @param {Number/String} height The new height to set (not required if a size object is passed as the first arg).
     * This may be one of:
     *
     *   - A Number specifying the new height in the {@link #getEl Element}'s {@link Ext.Element#defaultUnit}s (by default, pixels).
     *   - A String used to set the CSS height style. Animation may **not** be used.
     *   - `undefined` to leave the height unchanged.
     *
     * @return {Ext.Component} this
     */
    setSize : function(width, height) {
        var me = this,
            layoutCollection;

        // support for standard size objects
        if (Ext.isObject(width)) {
            height = width.height;
            width  = width.width;
        }

        // Constrain within configured maxima
        if (Ext.isNumber(width)) {
            width = Ext.Number.constrain(width, me.minWidth, me.maxWidth);
        }
        if (Ext.isNumber(height)) {
            height = Ext.Number.constrain(height, me.minHeight, me.maxHeight);
        }

        if (!me.rendered || !me.isVisible()) {
            // If an ownerCt is hidden, add my reference onto the layoutOnShow stack.  Set the needsLayout flag.
            if (me.hiddenAncestor) {
                layoutCollection = me.hiddenAncestor.layoutOnShow;
                layoutCollection.remove(me);
                layoutCollection.add(me);
            }
            me.needsLayout = {
                width: width,
                height: height,
                isSetSize: true
            };
            if (!me.rendered) {
                me.width  = (width !== undefined) ? width : me.width;
                me.height = (height !== undefined) ? height : me.height;
            }
            return me;
        }
        me.doComponentLayout(width, height, true);

        return me;
    },

    isFixedWidth: function() {
        var me = this,
            layoutManagedWidth = me.layoutManagedWidth;

        if (Ext.isDefined(me.width) || layoutManagedWidth == 1) {
            return true;
        }
        if (layoutManagedWidth == 2) {
            return false;
        }
        return (me.ownerCt && me.ownerCt.isFixedWidth());
    },

    isFixedHeight: function() {
        var me = this,
            layoutManagedHeight = me.layoutManagedHeight;

        if (Ext.isDefined(me.height) || layoutManagedHeight == 1) {
            return true;
        }
        if (layoutManagedHeight == 2) {
            return false;
        }
        return (me.ownerCt && me.ownerCt.isFixedHeight());
    },

    setCalculatedSize : function(width, height, callingContainer) {
        var me = this,
            layoutCollection;

        // support for standard size objects
        if (Ext.isObject(width)) {
            callingContainer = width.ownerCt;
            height = width.height;
            width  = width.width;
        }

        // Constrain within configured maxima
        if (Ext.isNumber(width)) {
            width = Ext.Number.constrain(width, me.minWidth, me.maxWidth);
        }
        if (Ext.isNumber(height)) {
            height = Ext.Number.constrain(height, me.minHeight, me.maxHeight);
        }

        if (!me.rendered || !me.isVisible()) {
            // If an ownerCt is hidden, add my reference onto the layoutOnShow stack.  Set the needsLayout flag.
            if (me.hiddenAncestor) {
                layoutCollection = me.hiddenAncestor.layoutOnShow;
                layoutCollection.remove(me);
                layoutCollection.add(me);
            }
            me.needsLayout = {
                width: width,
                height: height,
                isSetSize: false,
                ownerCt: callingContainer
            };
            return me;
        }
        me.doComponentLayout(width, height, false, callingContainer);

        return me;
    },

    /**
     * This method needs to be called whenever you change something on this component that requires the Component's
     * layout to be recalculated.
     * @param {Object} width
     * @param {Object} height
     * @param {Object} isSetSize
     * @param {Object} callingContainer
     * @return {Ext.container.Container} this
     */
    doComponentLayout : function(width, height, isSetSize, callingContainer) {
        var me = this,
            componentLayout = me.getComponentLayout(),
            lastComponentSize = componentLayout.lastComponentSize || {
                width: undefined,
                height: undefined
            };

        // collapsed state is not relevant here, so no testing done.
        // Only Panels have a collapse method, and that just sets the width/height such that only
        // a single docked Header parallel to the collapseTo side are visible, and the Panel body is hidden.
        if (me.rendered && componentLayout) {
            // If no width passed, then only insert a value if the Component is NOT ALLOWED to autowidth itself.
            if (!Ext.isDefined(width)) {
                if (me.isFixedWidth()) {
                    width = Ext.isDefined(me.width) ? me.width : lastComponentSize.width;
                }
            }
            // If no height passed, then only insert a value if the Component is NOT ALLOWED to autoheight itself.
            if (!Ext.isDefined(height)) {
                if (me.isFixedHeight()) {
                    height = Ext.isDefined(me.height) ? me.height : lastComponentSize.height;
                }
            }

            if (isSetSize) {
                me.width = width;
                me.height = height;
            }

            componentLayout.layout(width, height, isSetSize, callingContainer);
        }

        return me;
    },

    /**
     * Forces this component to redo its componentLayout.
     */
    forceComponentLayout: function () {
        this.doComponentLayout();
    },

    // @private
    setComponentLayout : function(layout) {
        var currentLayout = this.componentLayout;
        if (currentLayout && currentLayout.isLayout && currentLayout != layout) {
            currentLayout.setOwner(null);
        }
        this.componentLayout = layout;
        layout.setOwner(this);
    },

    getComponentLayout : function() {
        var me = this;

        if (!me.componentLayout || !me.componentLayout.isLayout) {
            me.setComponentLayout(Ext.layout.Layout.create(me.componentLayout, 'autocomponent'));
        }
        return me.componentLayout;
    },

    /**
     * Occurs after componentLayout is run.
     * @param {Number} adjWidth The box-adjusted width that was set
     * @param {Number} adjHeight The box-adjusted height that was set
     * @param {Boolean} isSetSize Whether or not the height/width are stored on the component permanently
     * @param {Ext.Component} callingContainer Container requesting the layout. Only used when isSetSize is false.
     */
    afterComponentLayout: function(width, height, isSetSize, callingContainer) {
        var me = this,
            layout = me.componentLayout,
            oldSize = me.preLayoutSize;

        ++me.componentLayoutCounter;
        if (!oldSize || ((width !== oldSize.width) || (height !== oldSize.height))) {
            me.fireEvent('resize', me, width, height);
        }
    },

    /**
     * Occurs before componentLayout is run. Returning false from this method will prevent the componentLayout from
     * being executed.
     * @param {Number} adjWidth The box-adjusted width that was set
     * @param {Number} adjHeight The box-adjusted height that was set
     * @param {Boolean} isSetSize Whether or not the height/width are stored on the component permanently
     * @param {Ext.Component} callingContainer Container requesting sent the layout. Only used when isSetSize is false.
     */
    beforeComponentLayout: function(width, height, isSetSize, callingContainer) {
        this.preLayoutSize = this.componentLayout.lastComponentSize;
        return true;
    },

    /**
     * Sets the left and top of the component. To set the page XY position instead, use
     * {@link Ext.Component#setPagePosition setPagePosition}. This method fires the {@link #move} event.
     * @param {Number} left The new left
     * @param {Number} top The new top
     * @return {Ext.Component} this
     */
    setPosition : function(x, y) {
        var me = this;

        if (Ext.isObject(x)) {
            y = x.y;
            x = x.x;
        }

        if (!me.rendered) {
            return me;
        }

        if (x !== undefined || y !== undefined) {
            me.el.setBox(x, y);
            me.onPosition(x, y);
            me.fireEvent('move', me, x, y);
        }
        return me;
    },

    /**
     * @private
     * Called after the component is moved, this method is empty by default but can be implemented by any
     * subclass that needs to perform custom logic after a move occurs.
     * @param {Number} x The new x position
     * @param {Number} y The new y position
     */
    onPosition: Ext.emptyFn,

    /**
     * Sets the width of the component. This method fires the {@link #resize} event.
     *
     * @param {Number} width The new width to setThis may be one of:
     *
     *   - A Number specifying the new width in the {@link #getEl Element}'s {@link Ext.Element#defaultUnit}s (by default, pixels).
     *   - A String used to set the CSS width style.
     *
     * @return {Ext.Component} this
     */
    setWidth : function(width) {
        return this.setSize(width);
    },

    /**
     * Sets the height of the component. This method fires the {@link #resize} event.
     *
     * @param {Number} height The new height to set. This may be one of:
     *
     *   - A Number specifying the new height in the {@link #getEl Element}'s {@link Ext.Element#defaultUnit}s (by default, pixels).
     *   - A String used to set the CSS height style.
     *   - _undefined_ to leave the height unchanged.
     *
     * @return {Ext.Component} this
     */
    setHeight : function(height) {
        return this.setSize(undefined, height);
    },

    /**
     * Gets the current size of the component's underlying element.
     * @return {Object} An object containing the element's size {width: (element width), height: (element height)}
     */
    getSize : function() {
        return this.el.getSize();
    },

    /**
     * Gets the current width of the component's underlying element.
     * @return {Number}
     */
    getWidth : function() {
        return this.el.getWidth();
    },

    /**
     * Gets the current height of the component's underlying element.
     * @return {Number}
     */
    getHeight : function() {
        return this.el.getHeight();
    },

    /**
     * Gets the {@link Ext.ComponentLoader} for this Component.
     * @return {Ext.ComponentLoader} The loader instance, null if it doesn't exist.
     */
    getLoader: function(){
        var me = this,
            autoLoad = me.autoLoad ? (Ext.isObject(me.autoLoad) ? me.autoLoad : {url: me.autoLoad}) : null,
            loader = me.loader || autoLoad;

        if (loader) {
            if (!loader.isLoader) {
                me.loader = Ext.create('Ext.ComponentLoader', Ext.apply({
                    target: me,
                    autoLoad: autoLoad
                }, loader));
            } else {
                loader.setTarget(me);
            }
            return me.loader;

        }
        return null;
    },

    /**
     * This method allows you to show or hide a LoadMask on top of this component.
     *
     * @param {Boolean/Object/String} load True to show the default LoadMask, a config object that will be passed to the
     * LoadMask constructor, or a message String to show. False to hide the current LoadMask.
     * @param {Boolean} [targetEl=false] True to mask the targetEl of this Component instead of the `this.el`. For example,
     * setting this to true on a Panel will cause only the body to be masked.
     * @return {Ext.LoadMask} The LoadMask instance that has just been shown.
     */
    setLoading : function(load, targetEl) {
        var me = this,
            config;

        if (me.rendered) {
            if (load !== false && !me.collapsed) {
                if (Ext.isObject(load)) {
                    config = load;
                }
                else if (Ext.isString(load)) {
                    config = {msg: load};
                }
                else {
                    config = {};
                }
                me.loadMask = me.loadMask || Ext.create('Ext.LoadMask', targetEl ? me.getTargetEl() : me.el, config);
                me.loadMask.show();
            } else if (me.loadMask) {
                Ext.destroy(me.loadMask);
                me.loadMask = null;
            }
        }

        return me.loadMask;
    },

    /**
     * Sets the dock position of this component in its parent panel. Note that this only has effect if this item is part
     * of the dockedItems collection of a parent that has a DockLayout (note that any Panel has a DockLayout by default)
     * @param {Object} dock The dock position.
     * @param {Boolean} [layoutParent=false] True to re-layout parent.
     * @return {Ext.Component} this
     */
    setDocked : function(dock, layoutParent) {
        var me = this;

        me.dock = dock;
        if (layoutParent && me.ownerCt && me.rendered) {
            me.ownerCt.doComponentLayout();
        }
        return me;
    },

    onDestroy : function() {
        var me = this;

        if (me.monitorResize && Ext.EventManager.resizeEvent) {
            Ext.EventManager.resizeEvent.removeListener(me.setSize, me);
        }
        // Destroying the floatingItems ZIndexManager will also destroy descendant floating Components
        Ext.destroy(
            me.componentLayout,
            me.loadMask,
            me.floatingItems
        );
    },

    /**
     * Remove any references to elements added via renderSelectors/childEls
     * @private
     */
    cleanElementRefs: function(){
        var me = this,
            i = 0,
            childEls = me.childEls,
            selectors = me.renderSelectors,
            selector,
            name,
            len;

        if (me.rendered) {
            if (childEls) {
                for (len = childEls.length; i < len; ++i) {
                    name = childEls[i];
                    if (typeof(name) != 'string') {
                        name = name.name;
                    }
                    delete me[name];
                }
            }

            if (selectors) {
                for (selector in selectors) {
                    if (selectors.hasOwnProperty(selector)) {
                        delete me[selector];
                    }
                }
            }
        }
        delete me.rendered;
        delete me.el;
        delete me.frameBody;
    },

    /**
     * Destroys the Component.
     */
    destroy : function() {
        var me = this;

        if (!me.isDestroyed) {
            if (me.fireEvent('beforedestroy', me) !== false) {
                me.destroying = true;
                me.beforeDestroy();

                if (me.floating) {
                    delete me.floatParent;
                    // A zIndexManager is stamped into a *floating* Component when it is added to a Container.
                    // If it has no zIndexManager at render time, it is assigned to the global Ext.WindowManager instance.
                    if (me.zIndexManager) {
                        me.zIndexManager.unregister(me);
                    }
                } else if (me.ownerCt && me.ownerCt.remove) {
                    me.ownerCt.remove(me, false);
                }

                me.onDestroy();

                // Attempt to destroy all plugins
                Ext.destroy(me.plugins);

                if (me.rendered) {
                    me.el.remove();
                }

                me.fireEvent('destroy', me);
                Ext.ComponentManager.unregister(me);

                me.mixins.state.destroy.call(me);

                me.clearListeners();
                // make sure we clean up the element references after removing all events
                me.cleanElementRefs();
                me.destroying = false;
                me.isDestroyed = true;
            }
        }
    },

    /**
     * Retrieves a plugin by its pluginId which has been bound to this component.
     * @param {Object} pluginId
     * @return {Ext.AbstractPlugin} plugin instance.
     */
    getPlugin: function(pluginId) {
        var i = 0,
            plugins = this.plugins,
            ln = plugins.length;
        for (; i < ln; i++) {
            if (plugins[i].pluginId === pluginId) {
                return plugins[i];
            }
        }
    },

    /**
     * Determines whether this component is the descendant of a particular container.
     * @param {Ext.Container} container
     * @return {Boolean} True if it is.
     */
    isDescendantOf: function(container) {
        return !!this.findParentBy(function(p){
            return p === container;
        });
    }
}, function() {
    this.createAlias({
        on: 'addListener',
        prev: 'previousSibling',
        next: 'nextSibling'
    });
});

