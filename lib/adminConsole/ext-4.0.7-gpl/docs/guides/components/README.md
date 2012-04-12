# Components
______________________________________________

An Ext JS application's UI is made up of one or many widgets called {@link Ext.Component Component}s. All Components are subclasses of the {@link Ext.Component} class
which allows them to participate in automated lifecycle management including instantiation, rendering, sizing and positioning, and destruction.
Ext JS provides a wide range of useful Components out of the box, and any Component can easily be extended to create a customized Component.

## The Component Hierarchy

A {@link Ext.container.Container Container} is a special type of Component that can contain other Components. A typical application is made up of many nested Components in a tree-like
structure that is referred to as the Component hierarchy.  Containers are responsible for managing the Component lifecycle of their children, which includes creation, rendering,
sizing and positioning, and destruction. A typical application's Component hierarchy starts with a {@link Ext.container.Viewport Viewport} at the top,
which has other Containers and/or Components nested within it:

{@img component_hierarchy.png Component Hierarchy}

Child Components are added to a Container using the Container's {@link Ext.container.Container#cfg-items items} configuration property.  This example uses {@link Ext#create Ext.create}
to instantiate two {@link Ext.panel.Panel Panel}s, then adds those Panels as child Components of a Viewport:

    @example
    var childPanel1 = Ext.create('Ext.panel.Panel', {
        title: 'Child Panel 1',
        html: 'A Panel'
    });

    var childPanel2 = Ext.create('Ext.panel.Panel', {
        title: 'Child Panel 2',
        html: 'Another Panel'
    });

    Ext.create('Ext.container.Viewport', {
        items: [ childPanel1, childPanel2 ]
    });

Containers use {@link Ext.layout.container.Container Layout Manager}s to size and position their child Components.
For more information on Layouts and Containers please refer to the [Layouts and Containers Guide](guide/layouts_and_containers).

See the [Container Example](guides/components/examples/container/index.html) for a working demo showing how to add Components to a Container using the items configuration.

## XTypes and Lazy Instantiation

Every Component has a symbolic name called an `{@link Ext.Component#cfg-xtype xtype}`. For example {@link Ext.panel.Panel} has an `xtype` of 'panel'.
The `xtype`s for all Components are listed in the {@link Ext.Component API Docs for Component}.
The above example showed how to add already instantiated {@link Ext.Component Component}s to a {@link Ext.container.Container Container}.
In a large application, however, this is not ideal since not all of the Components need to be instantiated right away,
and some Components might never be instantiated depending on how the application is used. For example an application that uses a {@link Ext.tab.Panel Tab Panel}
will only need the contents of each tab to be rendered if and when each tab is clicked on by the user. This is where `xtype`s come in handy
by allowing a Container's children to be configured up front, but not instantiated until the Container determines it is necessary.

The following example code demonstrates lazy instantiation and rendering of a Container's Child components using a Tab Panel.
Each tab has an event listener that displays an alert when the tab is rendered.

    Ext.create('Ext.tab.Panel', {
        renderTo: Ext.getBody(),
        height: 100,
        width: 200,
        items: [
            {
                // Explicitly define the xtype of this Component configuration.
                // This tells the Container (the tab panel in this case)
                // to instantiate a Ext.panel.Panel when it deems necessary
                xtype: 'panel',
                title: 'Tab One',
                html: 'The first tab',
                listeners: {
                    render: function() {
                        Ext.MessageBox.alert('Rendered One', 'Tab One was rendered.');
                    }
                }
            },
            {
                // this component configuration does not have an xtype since 'panel' is the default
                // xtype for all Component configurations in a Container
                title: 'Tab Two',
                html: 'The second tab',
                listeners: {
                    render: function() {
                        Ext.MessageBox.alert('Rendered One', 'Tab Two was rendered.');
                    }
                }
            }
        ]
    });

Running this code results in an immediate alert for the first tab. This happens because it is the default active tab,
and so its Container Tab Panel instantiates and renders it immediately.

{@img lazy_render1.png Lazy Render 1}

The alert for the second tab does not get displayed until the tab is clicked on. This shows that the tab was not rendered until
needed, since the `{@link Ext.Component#render render}` event did not fire until the tab was activated.

{@img lazy_render2.png Lazy Render 2}

For a working demo see the [Lazy Instantiation Example](guides/components/examples/lazy_instantiation/index.html)

## Showing and Hiding

All {@link Ext.Component Component}s have built in {@link Ext.Component#method-show show} and {@link Ext.Component#method-hide hide} methods.
The default CSS method used to hide the Component is "display: none", but this can be changed using the {@link Ext.Component#cfg-hideMode hideMode} configuration:

    var panel = Ext.create('Ext.panel.Panel', {
        renderTo: Ext.getBody(),
        title: 'Test',
        html: 'Test Panel',
        hideMode: 'visibility' // use the CSS visibility property to show and hide this component
    });

    panel.hide(); // hide the component

    panel.show(); // show the component

## Floating Components

Floating {@link Ext.Component Component} are positioned outside of the document flow using CSS absolute positioning, and do not participate in their Containers' layout.
Some Components such as {@link Ext.window.Window Window}s are floating by default, but any Component can be made floating using the {@link Ext.Component#cfg-floating floating} configuration.

    var panel = Ext.create('Ext.panel.Panel', {
        width: 200,
        height: 100,
        floating: true, // make this panel an absolutely-positioned floating component
        title: 'Test',
        html: 'Test Panel'
    });

The above code instantiates a {@link Ext.panel.Panel Panel} but does not render it. Normally a Component either has a `{@link Ext.Component#cfg-renderTo renderTo}`
configuration specified, or is added as a child Component of a {@link Ext.container.Container Container}, but in the case of floating Components neither of these is needed.
Floating Components are automatically rendered to the document body the first time their {@link Ext.Component#method-show show} method is called:

    panel.show(); // render and show the floating panel

Here are a few other configurations and methods to make note of related to floating components:

- `{@link Ext.Component#cfg-draggable draggable}` - enables dragging of a floating Component around the screen.
- `{@link Ext.Component#cfg-shadow shadow}` - customizes the look of a floating Component's shadow.
- `{@link Ext.Component#method-alignTo alignTo()}` - aligns a floating Component to a specific element.
- `{@link Ext.Component#method-center center()}` - centers a floating Component in its Container.

For a working demo of floating Component features see the [Floating Panel Example](guides/components/examples/floating_panel).

## Creating Custom Components

### Composition or Extension

When creating a new UI class, the decision must be made whether that class should own an instance of a {@link Ext.Component Component}, or to extend that Component.

It is recommended to extend the nearest base class to the functionality required. This is because of the automated lifecycle management Ext JS provides which
includes automated rendering when needed, automatic sizing and positioning of Components when managed by an appropriate layout manager,
and automated destruction on removal from a {@link Ext.Container Container}.

It is easier to write a new class which is a Component and can take its place in the Component hierarchy rather than a new class which has an Ext JS Component,
and then has to render and manage it from outside.

### Subclassing

The {@link Ext.Class Class System} makes it easy to extend existing Components.  The following example creates a subclass of {@link Ext.Component} without
adding any additional functionality:

    Ext.define('My.custom.Component', {
        extend: 'Ext.Component'
    });

### Template Methods

Ext JS uses the [Template method pattern](http://en.wikipedia.org/wiki/Template_method_design_pattern) to delegate to subclasses, behavior which is specific only to that subclass.

The meaning of this is that each class in the inheritance chain may "contribute" an extra piece of logic to certain phases in the Component's lifecycle.
Each class implements its own special behavior while allowing the other classes in the inheritance chain to continue to contribute their own logic.

An example is the render function. `render` is a private method defined in {@link Ext.Component Component}'s superclass,
{@link Ext.AbstractComponent AbstractComponent} that is responsible for initiating the rendering phase of the Component lifecycle.
`render` must not be overridden, but it calls `onRender` during processing to allow the subclass implementor to add an `onRender`
method to perform class-specific processing. Every `onRender` method must call its superclass' `onRender` method before "contributing" its extra logic.

The diagram below illustrates the functioning of the `onRender` template method.

The `render` method is called (This is done by a Container’s layout manager). This method may not be overridden and is implemented by the Ext base class.
It calls `this.onRender` which is the implementation within the current subclass (if implemented).
This calls the superclass version which calls its superclass version etc. Eventually, each class has contributed its functionality, and control returns to the `render` function.

{@img template_pattern.png Template Pattern}

Here is an example of a Component subclass that implements the `onRender` method:

    Ext.define('My.custom.Component', {
        extend: 'Ext.Component',
        onRender: function() {
            this.callParent(arguments); // call the superclass onRender method

            // perform additional rendering tasks here.
        }
    });

It is important to note that many of the template methods also have a corresponding event. For example the {@link Ext.Component#event-render render}
event is fired after the Component is rendered.  When subclassing, however, it is it is essential to use template methods to perform class logic at
important phases in the lifecycle and *not* events. Events may be programmatically suspended, or may be stopped by a handler.

Below are the template methods that can be implemented by subclasses of Component:

- `initComponent`
This method is invoked by the constructor. It is used to initialize data, set up configurations, and attach event handlers.
- `beforeShow`
This method is invoked before the Component is shown.
- `onShow`
Allows addition of behavior to the show operation. After calling the superclass’s onShow, the Component will be visible.
- `afterShow`
This method is invoked after the Component is shown.
- `onShowComplete`
This method is invoked after the `afterShow` method is complete
- `onHide`
Allows addition of behavior to the hide operation. After calling the superclass’s onHide, the Component will be hidden.
- `afterHide`
This method is invoked after the Component has been hidden
- `onRender`
Allows addition of behavior to the rendering phase. After calling the superclass’s onRender,
the Component's Element will exist. Extra DOM processing may be performed at this stage to complete the desired structure of the Component.
- `afterRender`
Allows addition of behavior after rendering is complete. At this stage the Component’s Element will have been styled according to the configuration,
will have had any configured CSS class names added, and will be in the configured visibility and the configured enable state.
- `onEnable`
Allows addition of behavior to the enable operation. After calling the superclass’s onEnable, the Component will be enabled.
- `onDisable`
Allows addition of behavior to the disable operation. After calling the superclass’s onDisable, the Component will be disabled.
- `onAdded`
Allows addition of behavior when a Component is added to a Container. At this stage, the Component is in the parent Container's collection of child items.
After calling the superclass's onAdded, the ownerCt reference will be present, and if configured with a ref, the refOwner will be set.
- `onRemoved`
Allows addition of behavior when a Component is removed from its parent Container. At this stage, the Component has been removed from its parent Container's
collection of child items, but has not been destroyed (It will be destroyed if the parent Container's autoDestroy is true, or if the remove call was passed a truthy second parameter).
After calling the superclass's onRemoved, the ownerCt and the refOwner will not be present.
- `onResize`
Allows addition of behavior to the resize operation.
- `onPosition`
Allows addition of behavior to the position operation.
- `onDestroy`
Allows addition of behavior to the destroy operation. After calling the superclass’s onDestroy, the Component will be destroyed.
- `beforeDestroy`
This method is invoked before the Component is destroyed.
- `afterSetPosition`
This method is invoked after the Components position has been set.
- `afterComponentLayout`
This method is invoked after the Component is laid out.
- `beforeComponentLayout`
This method is invoked before the Component is laid out.

### Which Class To Extend

Choosing the best class to extend is mainly a matter of efficiency, and which capabilities the base class must provide.
There has been a tendency to always extend {@link Ext.Panel} whenever any set of UI Components needs to be rendered and managed.

The Panel class has many capabilities:

- Border
- Header
- Header tools
- Footer
- Footer buttons
- Top toolbar
- Bottom toolbar
- Containing and managing child Components

If these are not needed, then using a Panel is a waste of resources.

#### Component

If the required UI Component does not need to contain any other Components, that is, if it just to encapsulate some form of HTML which performs the requirements,
then extending {@link Ext.Component} is appropriate. For example, the following class is a Component that wraps an HTML image element, and allows setting
and getting of the image's `src` attribute. It also fires a `load` event when the image is loaded:

    Ext.define('Ext.ux.Image', {
        extend: 'Ext.Component', // subclass Ext.Component
        alias: 'widget.managedimage', // this component will have an xtype of 'managedimage'
        autoEl: {
            tag: 'img',
            src: Ext.BLANK_IMAGE_URL,
            cls: 'my-managed-image'
        },

        // Add custom processing to the onRender phase.
        // Add a ‘load’ listener to the element.
        onRender: function() {
            this.autoEl = Ext.apply({}, this.initialConfig, this.autoEl);
            this.callParent(arguments);
            this.el.on('load', this.onLoad, this);
        },

        onLoad: function() {
            this.fireEvent('load', this);
        },

        setSrc: function(src) {
            if (this.rendered) {
                this.el.dom.src = src;
            } else {
                this.src = src;
            }
        },

        getSrc: function(src) {
            return this.el.dom.src || this.src;
        }
    });

Usage:

    var image = Ext.create('Ext.ux.Image');

    Ext.create('Ext.panel.Panel', {
        title: 'Image Panel',
        height: 200,
        renderTo: Ext.getBody(),
        items: [ image ]
    })

    image.on('load', function() {
        console.log('image loaded: ', image.getSrc());
    });

    image.setSrc('http://www.sencha.com/img/sencha-large.png');

See the [Managed Image Example](guides/components/examples/managed_image/index.html) for a working demo. This example is for demonstration purposes only -
the {@link Ext.Img} class should be used for managing images in a real world application.

#### Container

If the required UI Component is to contain other Components, but does not need any of the previously mentioned additional capabilities of a {@link Ext.Panel Panel},
then {@link Ext.container.Container} is the appropriate class to extend. At the Container level, it is important to remember which {@link Ext.layout.container.Container Layout}
is to be used to render and manage child Components.

Containers have the following additional template methods:

- `onBeforeAdd`
This method is invoked before adding a new child Component. It is passed the new Component, and may be used to modify the Component, or prepare the Container in some way. Returning false aborts the add operation.
- `onAdd`
This method is invoked after a new Component has been added. It is passed the Component which has been added. This method may be used to update any internal structure which may depend upon the state of the child items.
- `onRemove`
This method is invoked after a new Component has been removed. It is passed the Component which has been removed. This method may be used to update any internal structure which may depend upon the state of the child items.
- `beforeLayout`
This method is invoked before the Container has laid out (and rendered if necessary) its child Components.
- `afterLayout`
This method is invoked after the Container has laid out (and rendered if necessary) its child Components.

#### Panel

If the required UI Component must have a header, footer, or toolbars, then Ext.Panel is the appropriate class to extend.

*Important*: A Panel is a Container. It is important to remember which {@link Ext.layout.container.Container Layout} is to be used to render and manage child Components.

Classes which extend Ext.Panel are usually highly application-specific and are generally used to aggregate other UI Components
(Usually Containers, or form Fields) in a configured layout, and provide means to operate on the contained Components by means
of controls in the {@link Ext.panel.Panel#cfg-tbar tbar} and the {@link Ext.panel.Panel#cfg-bbar bbar}.

Panels have the following additional template methods:

- `afterCollapse`
This method is invoked after the Panel is Collapsed.
- `afterExpand`
This method is invoked after the Panel is expanded
- `onDockedAdd`
This method is invoked after a docked item is added to the Panel
- `onDockedRemove`
This method is invoked after a docked item is removed from the Panel
