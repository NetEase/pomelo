/*

This file is part of Ext JS 4

Copyright (c) 2011 Sencha Inc

Contact:  http://www.sencha.com/contact

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please contact the sales department at http://www.sencha.com/contact.

*/
Ext.require([
    'Ext.data.*',
    'Ext.panel.Panel',
    'Ext.layout.container.Card',
    'Ext.tip.QuickTipManager'
]);

Ext.define('Customer', {
    extend: 'Ext.data.Model',
    fields: [{
        name: 'id',
        type: 'int'
    }, 'name', 'phone'],
    associations: [{
        model: 'Order',
        type: 'hasMany',
        autoLoad: true
    }],
    proxy: {
        type: 'ajax',
        url: 'customer.php'
    }
});

Ext.define('Order', {
    extend: 'Ext.data.Model',
    fields: [{
        name: 'id',
        type: 'int'
    },{
        name: 'customer_id',
        type: 'int'
    },{
        name: 'date',
        type: 'date',
        dateFormat: 'Y-m-d'
    }],
    belongsTo: 'Customer',
    associations: [{
        model: 'OrderItem',
        type: 'hasMany',
        autoLoad: true
    }],
    proxy: {
        type: 'ajax',
        url: 'order.php'
    }
});

Ext.define('OrderItem', {
    extend: 'Ext.data.Model',
    fields: [{
        name: 'id',
        type: 'int'
    }, {
        name: 'order_id',
        type: 'int'
    },'product', {
        name: 'quantity',
        type: 'int'
    }, {
        name: 'price',
        type: 'float'
    }],
    belongsTo: 'Order',
    proxy: {
        type: 'ajax',
        url: 'orderitem.php'
    }
});

Ext.define('CustomerGrid', {
    extend: 'Ext.grid.Panel',
    alias: 'widget.customergrid',
    
    title: 'Customers',
    
    initComponent: function(){
        Ext.apply(this, {
            store: {
                autoLoad: true,
                model: 'Customer',
                listeners: {
                    load: function() {
                        Logger.log('Customer store loaded', false);
                    }
                }
            },
            columns: [{
                text: 'Id',
                dataIndex: 'id'
            },{
                text: 'Name',
                dataIndex: 'name',
                flex: 1
            }, {
                text: 'Phone',
                dataIndex: 'phone'
            }],
            dockedItems: [{
                xtype: 'toolbar',
                items: {
                    itemId: 'load',
                    text: 'Load Orders',
                    scope: this,
                    handler: this.loadOrders,
                    disabled: true
                }
            }]
        });
        this.callParent();
        this.getSelectionModel().on('selectionchange', this.onSelectChange, this);
    },
    
    onSelectChange: function(selModel, selections) {
        this.active = selections[0];
        this.down('#load').setDisabled(!this.active);
    },
    
    loadOrders: function(){
        var rec = this.active,
            name = rec.get('name'),
            owner = this.ownerCt,
            orders;
         
        
        orders = rec.orders();
        if (orders.isLoading()) {
            Logger.log('Begin loading orders: ' + rec.getId(), true);
        }
        orders.on('load', function(){
            Logger.log('Order store loaded - ' + rec.getId(), false);
        });
        owner.add({
            title: 'Orders - ' + rec.getId(),
            customer: rec,
            xtype: 'ordergrid',
            store: orders
        });
        owner.getLayout().next();
    }    
});

Ext.define('OrderGrid', {
    extend: 'Ext.grid.Panel',
    alias: 'widget.ordergrid',
    
    initComponent: function(){
        Ext.apply(this, {
            columns: [{
                text: 'Id',
                dataIndex: 'id'
            },{
                flex: 1,
                text: 'Date',
                dataIndex: 'date',
                renderer: Ext.util.Format.dateRenderer('Y-m-d')
            }],
            dockedItems: [{
                xtype: 'toolbar',
                items: [{
                    text: 'Back',
                    scope: this,
                    handler: this.onBackClick
                },{
                    itemId: 'load',
                    text: 'Load Order Items',
                    scope: this,
                    handler: this.loadItems,
                    disabled: true
                }]
            }]
        });
        this.callParent();
        this.getSelectionModel().on('selectionchange', this.onSelectChange, this);
    },
    
    onBackClick: function(){
        this.ownerCt.getLayout().prev();
        this.destroy();    
    },
    
    onSelectChange: function(selModel, selections) {
        this.active = selections[0];
        this.down('#load').setDisabled(!this.active);
    },
    
    loadItems: function(){
        var customerName = this.customer.get('name'),
            rec = this.active,
            date = Ext.Date.format(rec.get('date'), 'Y-m-d'),
            owner = this.ownerCt,
            orderitems;
        
        orderitems = rec.orderitems();
        if (orderitems.isLoading()) {
            Logger.log('Begin loading order items - ' + rec.getId(), true);
        }
        orderitems.on('load', function(){
            Logger.log('Order items loaded - ' + rec.getId(), false);
        });
        owner.add({
            title: 'Order Items - ' + rec.getId(),
            xtype: 'orderitemgrid',
            store: orderitems
        });
        owner.getLayout().next();
    }    
});

Ext.define('OrderItemGrid', {
    extend: 'Ext.grid.Panel',
    alias: 'widget.orderitemgrid',
    
    initComponent: function(){
        Ext.apply(this, {
            columns: [{
                text: 'Id',
                dataIndex: 'id'
            },{
                flex: 1,
                text: 'Product',
                dataIndex: 'product'
            }, {
                text: 'Quantity',
                dataIndex: 'quantity'
            }, {
                text: 'Price',
                dataIndex: 'price',
                renderer: Ext.util.Format.usMoney
            }],
            dockedItems: [{
                xtype: 'toolbar',
                items: [{
                    text: 'Back',
                    scope: this,
                    handler: this.onBackClick
                }, {
                    itemId: 'load',
                    text: 'Parent association loader',
                    tooltip: 'Demonstrate loading parent relationships - A new record will be created so we ignore any previous associations setup',
                    scope: this,
                    handler: this.onLoadClick,
                    disabled: true
                }]
            }]
        });
        this.callParent();
        this.getSelectionModel().on('selectionchange', this.onSelectChange, this);
    },
    
    onSelectChange: function(selModel, selections) {
        this.active = selections[0];
        this.down('#load').setDisabled(!this.active);
    },
    
    onBackClick: function(){
        this.ownerCt.getLayout().prev();
        this.destroy();    
    },
    
    onLoadClick: function(){
        var rec = this.active,
            id = rec.getId();
        
        new ItemLoader({
            width: 400,
            height: 400,
            modal: true,
            title: this.title.replace('Order Items', 'Order Item ' + id),
            orderItemData: rec.data,
            orderItemId: id
        }).show();
    }
});

Ext.define('ItemLoader', {
    extend: 'Ext.window.Window',
    
    initComponent: function(){
        Ext.apply(this, {
            border: false,
            dockedItems: [{
                xtype: 'toolbar',
                items: [{
                    text: 'Print order detail',
                    scope: this,
                    handler: this.onOrderClick
                }, {
                    itemId: 'company',
                    text: 'Print company detail',
                    disabled: true,
                    scope: this,
                    handler: this.onCompanyClick
                }]
            }],
            bodyPadding: 5,
            tpl: '<div>{type} {id} - {value}</div>',
            tplWriteMode: 'append'
        });
        this.callParent();
        this.orderItem = new OrderItem(this.orderItemData, this.orderItemId);
    },
    
    onOrderClick: function(){
        var id = this.orderItem.get('order_id'),
            hasOrder = !!this.order;
            
        if (!hasOrder) {
            Logger.log('Begin loading order - ' + id, true);
        }
        this.orderItem.getOrder({
            scope: this,
            success: function(order){
                this.order = order;
                this.down('#company').enable();
                if (!hasOrder) {
                    Logger.log('Order loaded - ' + id, false);
                }
                this.update({
                    type: 'Order',
                    id: order.getId(),
                    value: Ext.Date.format(order.get('date'), 'Y-m-d')
                });
            }
        });
    },
    
    onCompanyClick: function(){
        var id = this.order.get('customer_id'),
            hasCustomer = !!this.customer;
            
        if (!hasCustomer) {
            Logger.log('Begin loading customer - ' + id, true);
        }
        this.order.getCustomer({
            scope: this,
            success: function(customer){
                this.customer = customer;
                if (!hasCustomer) {
                    Logger.log('Customer loaded - ' + id, false);
                }
                this.update({
                    type: 'Customer',
                    id: customer.getId(),
                    value: customer.get('name')
                });
            }
        });
    }    
});

Logger = (function(){
    var panel;
    
    return {
        init: function(log){
            panel = log;
        },
        
        log: function(msg, isStart){
            panel.update({
                now: new Date(),
                cls: isStart ? 'beforeload' : 'afterload',
                msg: msg
            });
            panel.body.scroll('b', 100000, true);
        }    
    };
})();

Ext.onReady(function(){
    
    var main = Ext.create('Ext.panel.Panel', {
        renderTo: document.body,
        width: 750,
        height: 400,
        border: false,
        layout: {
            type: 'vbox',
            align: 'stretch'
        },
        items: [{
            height: 200,
            xtype: 'container',
            layout: 'card',
            margin: '0 0 5 0'
        }, {
            flex: 1,
            title: 'Loader log',
            tplWriteMode: 'append',
            tpl: '<div class="{cls}">[{now:date("H:i:s")}] - {msg}</div>',
            bodyPadding: 5,
            autoScroll: true,
            listeners: {
                render: Logger.init
            }
        }]
    });
    Logger.log('Begin loading customer store', true);
    main.items.first().add({
        xtype: 'customergrid'
    });
    
});

