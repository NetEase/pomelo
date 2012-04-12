/*

This file is part of Ext JS 4

Copyright (c) 2011 Sencha Inc

Contact:  http://www.sencha.com/contact

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please contact the sales department at http://www.sencha.com/contact.

*/
Ext.require([
    'Ext.grid.*',
    'Ext.data.*',
    'Ext.panel.*',
    'Ext.layout.container.Border'
]);
Ext.Loader.onReady(function() {
    Ext.define('Book',{
        extend: 'Ext.data.Model',
        fields: [
            // set up the fields mapping into the xml doc
            // The first needs mapping, the others are very basic
            {name: 'Author', mapping: 'ItemAttributes > Author'},
            'Title',
            'Manufacturer',
            'ProductGroup',
            'DetailPageURL'
        ]
    });


    /**
     * App.BookStore
     * @extends Ext.data.Store
     * @cfg {String} url This will be a url of a location to load the BookStore
     * This is a specialized Store which maintains books.
     * It already knows about Amazon's XML definition and will expose the following
     * Record defintion:
     *  - Author
     *  - Manufacturer
     *  - ProductGroup
     *  - DetailPageURL
     */
    Ext.define('App.BookStore', {
        extend: 'Ext.data.Store',
        constructor: function(config) {
            config = config || {};

            config.model = 'Book';
            config.proxy = {
                type: 'ajax',
                url: 'sheldon.xml',
                reader: Ext.create('Ext.data.reader.Xml', {
                    // records will have an "Item" tag
                    record: 'Item',
                    id: 'ASIN',
                    totalRecords: '@total'
                })
            };

            // call the superclass's constructor
            this.callParent([config]);
        }
    });


    /**
     * App.BookGrid
     * @extends Ext.grid.Panel
     * This is a custom grid which will display book information. It is tied to
     * a specific record definition by the dataIndex properties.
     *
     * It follows a very custom pattern used only when extending Ext.Components
     * in which you can omit the constructor.
     *
     * It also registers the class with the Component Manager with an xtype of
     * bookgrid. This allows the application to take care of the lazy-instatiation
     * facilities provided in Ext's Component Model.
     */
    Ext.define('App.BookGrid', {
        extend: 'Ext.grid.Panel',
        // This will associate an string representation of a class
        // (called an xtype) with the Component Manager
        // It allows you to support lazy instantiation of your components
        alias: 'widget.bookgrid',

        // override
        initComponent : function() {
            // Pass in a column model definition
            // Note that the DetailPageURL was defined in the record definition but is not used
            // here. That is okay.
            this.columns = [
                {text: "Author", width: 120, dataIndex: 'Author', sortable: true},
                {text: "Title", flex: 1, dataIndex: 'Title', sortable: true},
                {text: "Manufacturer", width: 115, dataIndex: 'Manufacturer', sortable: true},
                {text: "Product Group", width: 100, dataIndex: 'ProductGroup', sortable: true}
            ];
            // Note the use of a storeId, this will register thisStore
            // with the StoreManager and allow us to retrieve it very easily.
            this.store = new App.BookStore({
                storeId: 'gridBookStore',
                url: 'sheldon.xml'
            });
            // finally call the superclasses implementation
            this.callParent();
        }
    });


    /**
     * App.BookDetail
     * @extends Ext.Panel
     * This is a specialized Panel which is used to show information about
     * a book.
     *
     * This demonstrates adding 2 custom properties (tplMarkup and
     * startingMarkup) to the class. It also overrides the initComponent
     * method and adds a new method called updateDetail.
     *
     * The class will be registered with an xtype of 'bookdetail'
     */
    Ext.define('App.BookDetail', {
        extend: 'Ext.Panel',
        // register the App.BookDetail class with an xtype of bookdetail
        alias: 'widget.bookdetail',
        // add tplMarkup as a new property
        tplMarkup: [
            'Title: <a href="{DetailPageURL}" target="_blank">{Title}</a><br/>',
            'Author: {Author}<br/>',
            'Manufacturer: {Manufacturer}<br/>',
            'Product Group: {ProductGroup}<br/>'
        ],
        // startingMarup as a new property
        startingMarkup: 'Please select a book to see additional details',

        bodyPadding: 7,
        // override initComponent to create and compile the template
        // apply styles to the body of the panel and initialize
        // html to startingMarkup
        initComponent: function() {
            this.tpl = Ext.create('Ext.Template', this.tplMarkup);
            this.html = this.startingMarkup;

            this.bodyStyle = {
                background: '#ffffff'
            };
            // call the superclass's initComponent implementation
            this.callParent();
        },
        // add a method which updates the details
        updateDetail: function(data) {
            this.tpl.overwrite(this.body, data);
        }
    });


    /**
     * App.BookMasterDetail
     * @extends Ext.Panel
     *
     * This is a specialized panel which is composed of both a bookgrid
     * and a bookdetail panel. It provides the glue between the two
     * components to allow them to communicate. You could consider this
     * the actual application.
     *
     */
    Ext.define('App.BookMasterDetail', {
        extend: 'Ext.Panel',
        alias: 'widget.bookmasterdetail',

        frame: true,
        title: 'Book List',
        width: 540,
        height: 400,
        layout: 'border',

        // override initComponent
        initComponent: function() {
            this.items = [{
                xtype: 'bookgrid',
                itemId: 'gridPanel',
                region: 'north',
                height: 210,
                split: true
            },{
                xtype: 'bookdetail',
                itemId: 'detailPanel',
                region: 'center'
            }];
            // call the superclass's initComponent implementation
            this.callParent();
        },
        // override initEvents
        initEvents: function() {
            // call the superclass's initEvents implementation
            this.callParent();

            // now add application specific events
            // notice we use the selectionmodel's rowselect event rather
            // than a click event from the grid to provide key navigation
            // as well as mouse navigation
            var bookGridSm = this.getComponent('gridPanel').getSelectionModel();
            ('selectionchange', function(sm, rs) {
            if (rs.length) {
                var detailPanel = Ext.getCmp('detailPanel');
                bookTpl.overwrite(detailPanel.body, rs[0].data);
            }
        })
            bookGridSm.on('selectionchange', this.onRowSelect, this);
        },
        // add a method called onRowSelect
        // This matches the method signature as defined by the 'rowselect'
        // event defined in Ext.selection.RowModel
        onRowSelect: function(sm, rs) {
            // getComponent will retrieve itemId's or id's. Note that itemId's
            // are scoped locally to this instance of a component to avoid
            // conflicts with the ComponentManager
            if (rs.length) {
                var detailPanel = this.getComponent('detailPanel');
                detailPanel.updateDetail(rs[0].data);
            }

        }
    });
// do NOT wait until the DOM is ready to run this
}, false);


// Finally now that we've defined all of our classes we can instantiate
// an instance of the app and renderTo an existing div called 'binding-example'
// Note now that classes have encapsulated this behavior we can easily create
// an instance of this app to be used in many different contexts, you could
// easily place this application in an Ext.Window for example
Ext.onReady(function() {
    // create an instance of the app
    var bookApp = new App.BookMasterDetail({
        renderTo: 'binding-example'
    });
    // We can retrieve a reference to the data store
    // via the StoreManager by its storeId
    Ext.data.StoreManager.get('gridBookStore').load();
});

