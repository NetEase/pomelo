/**
 * @example Image
 *
 * A Component subclass that adds a value to an image
 */
Ext.require('Ext.panel.Panel');

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

Ext.onReady(function() {

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
    
});