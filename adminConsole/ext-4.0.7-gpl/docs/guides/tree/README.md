# Trees
______________________________________________

The {@link Ext.tree.Panel Tree Panel} Component is one of the most versatile Components in Ext JS and is an excellent tool for displaying heirarchical data in an application.  Tree Panel extends from the same class as {@link Ext.grid.Panel Grid Panel}, so all of the benefits of Grid Panels - features, extensions, and plugins can also be used on Tree Panels. Things like columns, column resizing, dragging and dropping, renderers, sorting and filtering can be expected to work similarly for both components.

Let's start by creating a very simple Tree.

    @example
    Ext.create('Ext.tree.Panel', {
        renderTo: Ext.getBody(),
        title: 'Simple Tree',
        width: 150,
        height: 150,
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

This Tree Panel renders itself to the document body.  We defined a root node that is expanded by default. The root node has three children, the first two of which are leaf nodes which means they cannot have any children.  The third node is not a leaf node and has has one child leaf node.  The `text` property is used as the node's text label. See [Simple Tree](guides/tree/examples/simple_tree/index.html) for a live demo.

Internally a Tree Panel stores its data in a {@link Ext.data.TreeStore TreeStore}. The above example uses the {@link Ext.tree.Panel#root root} config as a shortcut for configuring a store.  If we were to configure the store separately, the code would look something like this:

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
                ...
            ]
        }
    });

    Ext.create('Ext.tree.Panel', {
        title: 'Simple Tree',
        store: store,
        ...
    });

For more on {@link Ext.data.Store Store}s see the [Data Guide](#/guide/data).


## The Node Interface
In the above examples we set a couple of different properties on tree nodes. But what are nodes exactly? As mentioned before, the Tree Panel is bound to a {@link Ext.data.TreeStore TreeStore}. A Store in Ext JS manages a collection of {@link Ext.data.Model Model} instances. Tree nodes are simply Model instances that are decorated with a {@link Ext.data.NodeInterface NodeInterface}.  Decorating a Model with a NodeInterface gives the Model the fields, methods and properties that are required for it to be used in a tree.  The following is a screenshot that shows the structure of a node in the developer tools.

{@img nodeinterface.png A model instance decorated with the NodeInterface}

In order to see the full set of fields, methods and properties available on nodes, see the API documentation for the {@link Ext.data.NodeInterface NodeInterface} class.

## Visually changing your tree
Let's try something simple. When you set the {@link Ext.tree.Panel#useArrows useArrows} configuration to true, the Tree Panel hides the lines and uses arrows as expand and collapse icons.

{@img arrows.png Arrows}

Setting the {@link Ext.tree.Panel#rootVisible rootVisible} property to false visually removes the root node. By doing this, the root node will automatically be expanded. The following image shows the same tree with `rootVisible` set to false and {@link Ext.tree.Panel#lines lines} set to false.

{@img root-lines.png Root not visible and no lines}

## Multiple columns
Since {@link Ext.tree.Panel Tree Panel} extends from the same base class as {@link Ext.grid.Panel Grid Panel} adding more columns is very easy to do.

    @example
    var tree = Ext.create('Ext.tree.Panel', {
        renderTo: Ext.getBody(),
        title: 'TreeGrid',
        width: 300,
        height: 150,
        fields: ['name', 'description'],
        columns: [{
            xtype: 'treecolumn',
            text: 'Name',
            dataIndex: 'name',
            width: 150,
            sortable: true
        }, {
            text: 'Description',
            dataIndex: 'description',
            flex: 1,
            sortable: true
        }],
        root: {
            name: 'Root',
            description: 'Root description',
            expanded: true,
            children: [{
                name: 'Child 1',
                description: 'Description 1',
                leaf: true
            }, {
                name: 'Child 2',
                description: 'Description 2',
                leaf: true
            }]
        }
    });

The {@link Ext.tree.Panel#columns columns} configuration expects an array of {@link Ext.grid.column.Column} configurations just like a {@link Ext.grid.Panel Grid Panel} would have.  The only difference is that a Tree Panel requires at least one column with an xtype of 'treecolumn'.  This type of column has tree-specific visual effects like depth, lines and expand and collapse icons. A typical Tree Panel would have only one 'treecolumn'.

The `fields` configuration is passed on to the Model that the internally created Store uses (See the [Data Guide](#/guide/data) for more information on {@link Ext.data.Model Model}s). Notice how the {@link Ext.grid.column.Column#dataIndex dataIndex} configurations on the columns map to the fields we specified - name and description.

It is also worth noting that when columns are not defined, the tree will automatically create one single `treecolumn` with a `dataIndex` set to 'text'. It also hides the headers on the tree. To show this header when using only a single column set the `hideHeaders` configuration to 'false'.

## Adding nodes to the tree

The root node for the Tree Panel does not have to be specified in the initial configuration.  We can always add it later:

    var tree = Ext.create('Ext.tree.Panel');
    tree.setRootNode({
        text: 'Root',
        expanded: true,
        children: [{
            text: 'Child 1',
            leaf: true
        }, {
            text: 'Child 2',
            leaf: true
        }]
    });

Although this is useful for very small trees with only a few static nodes, most Tree Panels will contain many more nodes. So let's take a look at how we can programmatically add new nodes to the tree.

    var root = tree.getRootNode();

    var parent = root.appendChild({
        text: 'Parent 1'
    });

    parent.appendChild({
        text: 'Child 3',
        leaf: true
    });

    parent.expand();

Every node that is not a leaf node has an {@link Ext.data.NodeInterface#appendChild appendChild} method which accepts a Node, or a config object for a Node as its first parameter, and returns the Node that was appended. The above example also calls the {@link Ext.data.NodeInterface#expand expand} method to expand the newly created parent.

{@img append-children.png Appending to the tree}

Also useful is the ability to define children inline when creating the new parent nodes. The following code gives us the same result.

    var parent = root.appendChild({
        text: 'Parent 1',
        expanded: true,
        children: [{
            text: 'Child 3',
            leaf: true
        }]
    });

Sometimes we want to insert a node into a specific location in the tree instead of appending it. Besides the `appendChild` method, {@link Ext.data.NodeInterface} also provides {@link Ext.data.NodeInterface#insertBefore insertBefore} and {@link Ext.data.NodeInterface#insertChild insertChild} methods.

    var child = parent.insertChild(0, {
        text: 'Child 2.5',
        leaf: true
    });

    parent.insertBefore({
        text: 'Child 2.75',
        leaf: true
    }, child.nextSibling);

The `insertChild` method expects an index at which the child will be inserted. The `insertBefore` method expects a reference node. The new node will be inserted before the reference node.

{@img insert-children.png Inserting children into the tree}

NodeInterface also provides several more properties on nodes that can be used to reference other nodes.

* {@link Ext.data.NodeInterface#nextSibling nextSibling}
* {@link Ext.data.NodeInterface#previousSibling previousSibling}
* {@link Ext.data.NodeInterface#parentNode parentNode}
* {@link Ext.data.NodeInterface#lastChild lastChild}
* {@link Ext.data.NodeInterface#firstChild firstChild}
* {@link Ext.data.NodeInterface#childNodes childNodes}
