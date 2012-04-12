/**
 * @example Simple Tree
 *
 */
Ext.require('Ext.tree.Panel');
Ext.require('Ext.data.TreeStore');
Ext.onReady(function() {
    var store = Ext.create('Ext.data.TreeStore', {
        root: {
            text: 'Root',
            expanded: true,
            children: [
                {
                    text: 'Child 1',
                    leaf: true
                },
                {
                    text: 'Child 2',
                    leaf: true
                },
                {
                    text: 'Child 3',
                    expanded: true,
                    children: [
                        {
                            text: 'Grandchild',
                            leaf: true
                        }
                    ]
                }
            ]
        }
    });

    Ext.create('Ext.tree.Panel', {
        renderTo: Ext.getBody(),
        title: 'Simple Tree',
        width: 150,
        height: 150,
        store: store
    });
});
