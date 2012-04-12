/*

This file is part of Ext JS 4

Copyright (c) 2011 Sencha Inc

Contact:  http://www.sencha.com/contact

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please contact the sales department at http://www.sencha.com/contact.

*/
Ext.Loader.setConfig({enabled: true});

Ext.Loader.setPath('Ext.ux', '../ux/');

Ext.require([
    'Ext.data.*',
    'Ext.grid.*',
    'Ext.util.*',
    'Ext.toolbar.*',
    'Ext.ux.ToolbarDroppable',
    'Ext.ux.BoxReorderer'
]);

Ext.onReady(function() {
   //The following functions are used to get the sorting data from the toolbar and apply it to the store
    /**
     * Tells the store to sort itself according to our sort data
     */
    function doSort() {
        store.sort(getSorters());
    }

    /**
     * Callback handler used when a sorter button is clicked or reordered
     * @param {Ext.Button} button The button that was clicked
     * @param {Boolean} changeDirection True to change direction (default). Set to false for reorder
     * operations as we wish to preserve ordering there
     */
    function changeSortDirection(button, changeDirection) {
        var sortData = button.sortData,
            iconCls  = button.iconCls;
        
        if (sortData) {
            if (changeDirection !== false) {
                button.sortData.direction = Ext.String.toggle(button.sortData.direction, "ASC", "DESC");
                button.setIconCls(Ext.String.toggle(iconCls, "sort-asc", "sort-desc"));
            }
            store.clearFilter();
            doSort();
        }
    }

    /**
     * Returns an array of sortData from the sorter buttons
     * @return {Array} Ordered sort data from each of the sorter buttons
     */
    function getSorters() {
        var sorters = [];
 
        Ext.each(tbar.query('button'), function(button) {
            sorters.push(button.sortData);
        }, this);

        return sorters;
    }

    /**
     * Convenience function for creating Toolbar Buttons that are tied to sorters
     * @param {Object} config Optional config object
     * @return {Object} The new Button configuration
     */
    function createSorterButtonConfig(config) {
        config = config || {};
        Ext.applyIf(config, {
            listeners: {
                click: function(button, e) {
                    changeSortDirection(button, true);
                }
            },
            iconCls: 'sort-' + config.sortData.direction.toLowerCase(),
            reorderable: true,
            xtype: 'button'
        });
        return config;
    }

    /**
     * Returns an array of fake data
     * @param {Number} count The number of fake rows to create data for
     * @return {Array} The fake record data, suitable for usage with an ArrayReader
     */
    function createFakeData(count) {
        var firstNames   = ['Ed', 'Tommy', 'Aaron', 'Abe', 'Jamie', 'Adam', 'Dave', 'David', 'Jay', 'Nicolas', 'Nige'],
            lastNames    = ['Spencer', 'Maintz', 'Conran', 'Elias', 'Avins', 'Mishcon', 'Kaneda', 'Davis', 'Robinson', 'Ferrero', 'White'],
            ratings      = [1, 2, 3, 4, 5],
            salaries     = [100, 400, 900, 1500, 1000000];

        var data = [];
        for (var i = 0; i < (count || 25); i++) {
            var ratingId    = Math.floor(Math.random() * ratings.length),
                salaryId    = Math.floor(Math.random() * salaries.length),
                firstNameId = Math.floor(Math.random() * firstNames.length),
                lastNameId  = Math.floor(Math.random() * lastNames.length),

                rating      = ratings[ratingId],
                salary      = salaries[salaryId],
                name        = Ext.String.format("{0} {1}", firstNames[firstNameId], lastNames[lastNameId]);

            data.push([rating, salary, name]);
        }
        return data;
    }

    // create the data store
    Ext.define('Employee', {
        extend: 'Ext.data.Model',
        fields: [
           {name: 'rating', type: 'int'},
           {name: 'salary', type: 'float'},
           {name: 'name'}
        ]
    });

    var store = Ext.create('Ext.data.Store', {
        model: 'Employee',
        proxy: {
            type: 'memory',
            data: createFakeData(25),
            reader: {
                type: 'array'
            }
        },
        autoLoad: true
    });

    var reorderer = Ext.create('Ext.ux.BoxReorderer', {
        listeners: {
            scope: this,
            Drop: function(r, c, button) { //update sort direction when button is dropped
                changeSortDirection(button, false);
            }
        }
    });

    var droppable = Ext.create('Ext.ux.ToolbarDroppable', {
        /**
         * Creates the new toolbar item from the drop event
         */
        createItem: function(data) {
            var header = data.header,
                headerCt = header.ownerCt,
                reorderer = headerCt.reorderer;
            
            // Hide the drop indicators of the standard HeaderDropZone
            // in case user had a pending valid drop in 
            if (reorderer) {
                reorderer.dropZone.invalidateDrop();
            }

            return createSorterButtonConfig({
                text: header.text,
                sortData: {
                    property: header.dataIndex,
                    direction: "ASC"
                }
            });
        },

        /**
         * Custom canDrop implementation which returns true if a column can be added to the toolbar
         * @param {Object} data Arbitrary data from the drag source. For a HeaderContainer, it will
         * contain a header property which is the Header being dragged.
         * @return {Boolean} True if the drop is allowed
         */
        canDrop: function(dragSource, event, data) {
            var sorters = getSorters(),
                header  = data.header,
                length = sorters.length,
                entryIndex = this.calculateEntryIndex(event),
                targetItem = this.toolbar.getComponent(entryIndex),
                i;

            // Group columns have no dataIndex and therefore cannot be sorted
            // If target isn't reorderable it could not be replaced
            if (!header.dataIndex || (targetItem && targetItem.reorderable === false)) {
                return false;
            }

            for (i = 0; i < length; i++) {
                if (sorters[i].property == header.dataIndex) {
                    return false;
                }
            }
            return true;
        },

        afterLayout: doSort
    });

    //create the toolbar with the 2 plugins
    var tbar = Ext.create('Ext.toolbar.Toolbar', {
        items  : [{
            xtype: 'tbtext',
            text: 'Sorting order:',
            reorderable: false
        }, '-'],
        plugins: [reorderer, droppable]
    });

    tbar.add(createSorterButtonConfig({
        text: 'Rating',
        sortData: {
            property: 'rating',
            direction: 'DESC'
        }
    }));

    tbar.add(createSorterButtonConfig({
        text: 'Salary',
        sortData: {
            property: 'salary',
            direction: 'ASC'
        }
    }));

    // create the Grid
    var grid = Ext.create('Ext.grid.Panel', {
        tbar : tbar,
        store: store,
        columns: [
            {
                text: 'Name',
                flex:1 ,
                sortable: false,
                dataIndex: 'name'
            },{
                text: 'Rating',
                width: 125,
                sortable: false,
                dataIndex: 'rating'
            },{
                text: 'Salary',
                width: 125,
                sortable: false,
                dataIndex: 'salary',
                align: 'right',
                renderer: Ext.util.Format.usMoney
            }
        ],
        stripeRows: true,
        height: 350,
        width : 600,
        title : 'Array Grid',
        renderTo: 'grid-example',
        listeners: {
            scope: this,
            // wait for the first layout to access the headerCt (we only want this once):
            single: true,
            // tell the toolbar's droppable plugin that it accepts items from the columns' dragdrop group
            afterlayout: function(grid) {
                var headerCt = grid.child("headercontainer");
                droppable.addDDGroup(headerCt.reorderer.dragZone.ddGroup);
                doSort();
            }
        }
    });
});
