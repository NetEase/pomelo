# Layouts and Containers
______________________________________________

The layout system is one of the most powerful parts of Ext JS. It handles the sizing and positioning of every {@link Ext.Component Component} in your application. This guide covers the basics of how to get started with layouts.

## Containers

An Ext JS application UI is made up of {@link Ext.Component Component}s (See the [Components Guide](#/guide/components) for more on Components.  A {@link Ext.container.Container Container} is a special type of Component that can contain other Components. A typical Ext JS application is made up of several layers of nested Components

{@img component_architecture.png Component Architecture}

The most commonly used Container is {@link Ext.panel.Panel Panel}.  Let's take a look at how being a Container allows a Panel to contain other Components:

    @example
    Ext.create('Ext.panel.Panel', {
        renderTo: Ext.getBody(),
        width: 400,
        height: 300,
        title: 'Container Panel',
        items: [
            {
                xtype: 'panel',
                title: 'Child Panel 1',
                height: 100,
                width: '75%'
            },
            {
                xtype: 'panel',
                title: 'Child Panel 2',
                height: 100,
                width: '75%'
            }
        ]
    });

We just created a Panel that renders itself to the document body, and we used the {@link Ext.container.Container#items items} config to add two child Panels to our Container Panel.

## Layouts

Every {@link Ext.container.Container Container} has a {@link Ext.layout.container.Container Layout} that manages the sizing and positioning of its child {@link Ext.Component Component}s.  In this section we're going to discuss how to configure a Container to use a specific type of Layout, and how the layout system keeps everything in sync.

### Using Layouts

In the above example we did not specify a layout for the Container {@link Ext.panel.Panel Panel}. Notice how the child Panels are laid out one after the other, just as normal block elements would be in the DOM. This happens because the default layout for all Containers is {@link Ext.layout.container.Auto Auto Layout}. Auto Layout does not specify any special positioning or sizing rules for child elements.  Let's assume, for example, we want our two child Panels to be positioned side by side, and to each take up exactly 50% of the width of the Container - we can use a {@link Ext.layout.container.Column Column Layout} simply by providing a {@link Ext.container.Container#layout layout} config on the Container:

    @example
    Ext.create('Ext.panel.Panel', {
        renderTo: Ext.getBody(),
        width: 400,
        height: 200,
        title: 'Container Panel',
        layout: 'column',
        items: [
            {
                xtype: 'panel',
                title: 'Child Panel 1',
                height: 100,
                width: '50%'
            },
            {
                xtype: 'panel',
                title: 'Child Panel 2',
                height: 100,
                width: '50%'
            }
        ]
    });

Ext JS comes with a full set of layouts out of the box and can accomodate almost any type of layout you can imagine.  See the [Layout Examples](extjs/examples/#sample-7) to get an idea of what's possible.

### How the layout system works

A {@link Ext.container.Container Container}'s {@link Ext.layout.container.Container Layout} is responsible for the initial positioning and sizing of all of the Container's children.  Internally the framework calls the Container's {@link Ext.container.Container#doLayout doLayout} method which triggers the Layout to calculate the correct sizes and positions for all of the Container's children and update the DOM. The `doLayout` method is fully recursive, so any of the Container's children that are also  will have their `doLayout` method called as well. This continues until the bottom of the {@link Ext.Component Component} hierarchy is reached. You typically will not have to ever call `doLayout()` in your application code since the framework should handle it for you.

A re-layout is triggered when the Container is {@link Ext.container.Container#setSize resized}, or when child Component {@link Ext.container.Container#items items} are {@link Ext.container.Container#add added} or {@link Ext.container.Container#remove removed}. Normally we can just rely on the framework to handle updating the layout for us, but sometimes we want to prevent the framework from automatically laying out so we can batch multiple operations together and then manually trigger a layout when we're done.  To do this we use the {@link Ext.container.Container#suspendLayout suspendLayout} flag on the Container to prevent it from laying out while we perform our operations that would normally trigger a layout (adding or removing items for example).  When we're done all we have to do is turn the `suspendLayout` flag off and manually trigger a layout by calling the Container's `doLayout` method:

    @example
    var containerPanel = Ext.create('Ext.panel.Panel', {
        renderTo: Ext.getBody(),
        width: 400,
        height: 200,
        title: 'Container Panel',
        layout: 'column',
        suspendLayout: true // Suspend automatic layouts while we do several different things that could trigger a layout on their own
    });
    // Add a couple of child items.  We could add these both at the same time by passing an array to add(),
    // but lets pretend we needed to add them separately for some reason.
    containerPanel.add({
        xtype: 'panel',
        title: 'Child Panel 1',
        height: 100,
        width: '50%'
    });
    containerPanel.add({
        xtype: 'panel',
        title: 'Child Panel 2',
        height: 100,
        width: '50%'
    });
    // Turn the suspendLayout flag off.
    containerPanel.suspendLayout = false;
    // Trigger a layout.
    containerPanel.doLayout();

## Component Layout

Just like a {@link Ext.container.Container Container}'s {@link Ext.layout.container.Container Layout} defines how a Container sizes and positions its {@link Ext.Component Component} {@link Ext.container.Container#items items}, a Component also has a {@link Ext.layout.Layout Layout} which defines how it sizes and positions its internal child items.  Component layouts are configured using the {@link Ext.Component#componentLayout componentLayout} config option.  Generally, you will not need to use this configuration unless you are writing a custom Component since all of the provided Components which need their internal elements sized and positioned come with their own layout managers.  Most Components use {@link Ext.layout.container.Auto Auto Layout}, but more complex Components will require a custom component layout (for example a {@link Ext.panel.Panel Panel} that has a header, footer, and toolbars).
