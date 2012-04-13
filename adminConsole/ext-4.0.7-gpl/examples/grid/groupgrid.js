/*

This file is part of Ext JS 4

Copyright (c) 2011 Sencha Inc

Contact:  http://www.sencha.com/contact

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please contact the sales department at http://www.sencha.com/contact.

*/
Ext.require(['Ext.data.*', 'Ext.grid.*']);
Ext.onReady(function() {
    // wrapped in closure to prevent global vars.
    Ext.define('Restaurant', {
        extend: 'Ext.data.Model',
        fields: ['name', 'cuisine']
    });

    var Restaurants = Ext.create('Ext.data.Store', {
        storeId: 'restaraunts',
        model: 'Restaurant',
        sorters: ['cuisine','name'],
        groupField: 'cuisine',
        data: [{
            name: 'Cheesecake Factory',
            cuisine: 'American'
        },{
            name: 'University Cafe',
            cuisine: 'American'
        },{
            name: 'Slider Bar',
            cuisine: 'American'
        },{
            name: 'Shokolaat',
            cuisine: 'American'
        },{
            name: 'Gordon Biersch',
            cuisine: 'American'
        },{
            name: 'Crepevine',
            cuisine: 'American'
        },{
            name: 'Creamery',
            cuisine: 'American'
        },{
            name: 'Old Pro',
            cuisine: 'American'
        },{
            name: 'Nola\'s',
            cuisine: 'Cajun'
        },{
            name: 'House of Bagels',
            cuisine: 'Bagels'
        },{
            name: 'The Prolific Oven',
            cuisine: 'Sandwiches'
        },{
            name: 'La Strada',
            cuisine: 'Italian'
        },{
            name: 'Buca di Beppo',
            cuisine: 'Italian'
        },{
            name: 'Pasta?',
            cuisine: 'Italian'
        },{
            name: 'Madame Tam',
            cuisine: 'Asian'
        },{
            name: 'Sprout Cafe',
            cuisine: 'Salad'
        },{
            name: 'Pluto\'s',
            cuisine: 'Salad'
        },{
            name: 'Junoon',
            cuisine: 'Indian'
        },{
            name: 'Bistro Maxine',
            cuisine: 'French'
        },{
            name: 'Three Seasons',
            cuisine: 'Vietnamese'
        },{
            name: 'Sancho\'s Taquira',
            cuisine: 'Mexican'
        },{
            name: 'Reposado',
            cuisine: 'Mexican'
        },{
            name: 'Siam Royal',
            cuisine: 'Thai'
        },{
            name: 'Krung Siam',
            cuisine: 'Thai'
        },{
            name: 'Thaiphoon',
            cuisine: 'Thai'
        },{
            name: 'Tamarine',
            cuisine: 'Vietnamese'
        },{
            name: 'Joya',
            cuisine: 'Tapas'
        },{
            name: 'Jing Jing',
            cuisine: 'Chinese'
        },{
            name: 'Patxi\'s Pizza',
            cuisine: 'Pizza'
        },{
            name: 'Evvia Estiatorio',
            cuisine: 'Mediterranean'
        },{
            name: 'Cafe 220',
            cuisine: 'Mediterranean'
        },{
            name: 'Cafe Renaissance',
            cuisine: 'Mediterranean'
        },{
            name: 'Kan Zeman',
            cuisine: 'Mediterranean'
        },{
            name: 'Gyros-Gyros',
            cuisine: 'Mediterranean'
        },{
            name: 'Mango Caribbean Cafe',
            cuisine: 'Caribbean'
        },{
            name: 'Coconuts Caribbean Restaurant &amp; Bar',
            cuisine: 'Caribbean'
        },{
            name: 'Rose &amp; Crown',
            cuisine: 'English'
        },{
            name: 'Baklava',
            cuisine: 'Mediterranean'
        },{
            name: 'Mandarin Gourmet',
            cuisine: 'Chinese'
        },{
            name: 'Bangkok Cuisine',
            cuisine: 'Thai'
        },{
            name: 'Darbar Indian Cuisine',
            cuisine: 'Indian'
        },{
            name: 'Mantra',
            cuisine: 'Indian'
        },{
            name: 'Janta',
            cuisine: 'Indian'
        },{
            name: 'Hyderabad House',
            cuisine: 'Indian'
        },{
            name: 'Starbucks',
            cuisine: 'Coffee'
        },{
            name: 'Peet\'s Coffee',
            cuisine: 'Coffee'
        },{
            name: 'Coupa Cafe',
            cuisine: 'Coffee'
        },{
            name: 'Lytton Coffee Company',
            cuisine: 'Coffee'
        },{
            name: 'Il Fornaio',
            cuisine: 'Italian'
        },{
            name: 'Lavanda',
            cuisine: 'Mediterranean'
        },{
            name: 'MacArthur Park',
            cuisine: 'American'
        },{
            name: 'St Michael\'s Alley',
            cuisine: 'Californian'
        },{
            name: 'Cafe Renzo',
            cuisine: 'Italian'
        },{
            name: 'Osteria',
            cuisine: 'Italian'
        },{
            name: 'Vero',
            cuisine: 'Italian'
        },{
            name: 'Cafe Renzo',
            cuisine: 'Italian'
        },{
            name: 'Miyake',
            cuisine: 'Sushi'
        },{
            name: 'Sushi Tomo',
            cuisine: 'Sushi'
        },{
            name: 'Kanpai',
            cuisine: 'Sushi'
        },{
            name: 'Pizza My Heart',
            cuisine: 'Pizza'
        },{
            name: 'New York Pizza',
            cuisine: 'Pizza'
        },{
            name: 'California Pizza Kitchen',
            cuisine: 'Pizza'
        },{
            name: 'Round Table',
            cuisine: 'Pizza'
        },{
            name: 'Loving Hut',
            cuisine: 'Vegan'
        },{
            name: 'Garden Fresh',
            cuisine: 'Vegan'
        },{
            name: 'Cafe Epi',
            cuisine: 'French'
        },{
            name: 'Tai Pan',
            cuisine: 'Chinese'
        }]
    });
    
    var groupingFeature = Ext.create('Ext.grid.feature.Grouping',{
        groupHeaderTpl: 'Cuisine: {name} ({rows.length} Item{[values.rows.length > 1 ? "s" : ""]})'
    });

    var grid = Ext.create('Ext.grid.Panel', {
        renderTo: Ext.getBody(),
        collapsible: true,
        iconCls: 'icon-grid',
        frame: true,
        store: Restaurants,
        width: 600,
        height: 400,
        title: 'Restaurants',
        features: [groupingFeature],
        columns: [{
            text: 'Name',
            flex: 1,
            dataIndex: 'name'
        },{
            text: 'Cuisine',
            flex: 1,
            dataIndex: 'cuisine'
        }],
        fbar  : ['->', {
            text:'Clear Grouping',
            iconCls: 'icon-clear-group',
            handler : function(){
                groupingFeature.disable();
            }
        }]
    });
});

