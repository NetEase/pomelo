/**
 * @example Container
 *
 * A basic example demonstrating how a Container contains other items using the items config.
 */
Ext.require('Ext.panel.Panel');

Ext.onReady(function() {

    var childPanel1 = Ext.create('Ext.panel.Panel', {
        title: 'Child Panel 1',
        html: 'A Panel',
        width: 300,
        height: 70
    });

    var childPanel2 = Ext.create('Ext.panel.Panel', {
        title: 'Child Panel 2',
        html: 'Another Panel',
        width: 300,
        height: 70
    });

    Ext.create('Ext.container.Viewport', {
        items: [ childPanel1, childPanel2 ]
    });
});
