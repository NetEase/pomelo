/*

This file is part of Ext JS 4

Copyright (c) 2011 Sencha Inc

Contact:  http://www.sencha.com/contact

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please contact the sales department at http://www.sencha.com/contact.

*/
/**
 * Represents a single sorter that can be applied to a Store. The sorter is used
 * to compare two values against each other for the purpose of ordering them. Ordering
 * is achieved by specifying either:
 *
 * - {@link #property A sorting property}
 * - {@link #sorterFn A sorting function}
 *
 * As a contrived example, we can specify a custom sorter that sorts by rank:
 *
 *     Ext.define('Person', {
 *         extend: 'Ext.data.Model',
 *         fields: ['name', 'rank']
 *     });
 *
 *     Ext.create('Ext.data.Store', {
 *         model: 'Person',
 *         proxy: 'memory',
 *         sorters: [{
 *             sorterFn: function(o1, o2){
 *                 var getRank = function(o){
 *                     var name = o.get('rank');
 *                     if (name === 'first') {
 *                         return 1;
 *                     } else if (name === 'second') {
 *                         return 2;
 *                     } else {
 *                         return 3;
 *                     }
 *                 },
 *                 rank1 = getRank(o1),
 *                 rank2 = getRank(o2);
 *
 *                 if (rank1 === rank2) {
 *                     return 0;
 *                 }
 *
 *                 return rank1 < rank2 ? -1 : 1;
 *             }
 *         }],
 *         data: [{
 *             name: 'Person1',
 *             rank: 'second'
 *         }, {
 *             name: 'Person2',
 *             rank: 'third'
 *         }, {
 *             name: 'Person3',
 *             rank: 'first'
 *         }]
 *     });
 */
Ext.define('Ext.util.Sorter', {

    /**
     * @cfg {String} property
     * The property to sort by. Required unless {@link #sorterFn} is provided. The property is extracted from the object
     * directly and compared for sorting using the built in comparison operators.
     */
    
    /**
     * @cfg {Function} sorterFn
     * A specific sorter function to execute. Can be passed instead of {@link #property}. This sorter function allows
     * for any kind of custom/complex comparisons. The sorterFn receives two arguments, the objects being compared. The
     * function should return:
     *
     *   - -1 if o1 is "less than" o2
     *   - 0 if o1 is "equal" to o2
     *   - 1 if o1 is "greater than" o2
     */
    
    /**
     * @cfg {String} root
     * Optional root property. This is mostly useful when sorting a Store, in which case we set the root to 'data' to
     * make the filter pull the {@link #property} out of the data object of each item
     */
    
    /**
     * @cfg {Function} transform
     * A function that will be run on each value before it is compared in the sorter. The function will receive a single
     * argument, the value.
     */
    
    /**
     * @cfg {String} direction
     * The direction to sort by.
     */
    direction: "ASC",
    
    constructor: function(config) {
        var me = this;
        
        Ext.apply(me, config);
        
        //<debug>
        if (me.property === undefined && me.sorterFn === undefined) {
            Ext.Error.raise("A Sorter requires either a property or a sorter function");
        }
        //</debug>
        
        me.updateSortFunction();
    },
    
    /**
     * @private
     * Creates and returns a function which sorts an array by the given property and direction
     * @return {Function} A function which sorts by the property/direction combination provided
     */
    createSortFunction: function(sorterFn) {
        var me        = this,
            property  = me.property,
            direction = me.direction || "ASC",
            modifier  = direction.toUpperCase() == "DESC" ? -1 : 1;
        
        //create a comparison function. Takes 2 objects, returns 1 if object 1 is greater,
        //-1 if object 2 is greater or 0 if they are equal
        return function(o1, o2) {
            return modifier * sorterFn.call(me, o1, o2);
        };
    },
    
    /**
     * @private
     * Basic default sorter function that just compares the defined property of each object
     */
    defaultSorterFn: function(o1, o2) {
        var me = this,
            transform = me.transform,
            v1 = me.getRoot(o1)[me.property],
            v2 = me.getRoot(o2)[me.property];
            
        if (transform) {
            v1 = transform(v1);
            v2 = transform(v2);
        }

        return v1 > v2 ? 1 : (v1 < v2 ? -1 : 0);
    },
    
    /**
     * @private
     * Returns the root property of the given item, based on the configured {@link #root} property
     * @param {Object} item The item
     * @return {Object} The root property of the object
     */
    getRoot: function(item) {
        return this.root === undefined ? item : item[this.root];
    },
    
    /**
     * Set the sorting direction for this sorter.
     * @param {String} direction The direction to sort in. Should be either 'ASC' or 'DESC'.
     */
    setDirection: function(direction) {
        var me = this;
        me.direction = direction;
        me.updateSortFunction();
    },
    
    /**
     * Toggles the sorting direction for this sorter.
     */
    toggle: function() {
        var me = this;
        me.direction = Ext.String.toggle(me.direction, "ASC", "DESC");
        me.updateSortFunction();
    },
    
    /**
     * Update the sort function for this sorter.
     * @param {Function} [fn] A new sorter function for this sorter. If not specified it will use the default
     * sorting function.
     */
    updateSortFunction: function(fn) {
        var me = this;
        fn = fn || me.sorterFn || me.defaultSorterFn;
        me.sort = me.createSortFunction(fn);
    }
});
