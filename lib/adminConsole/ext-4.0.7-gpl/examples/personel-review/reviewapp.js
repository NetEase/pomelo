/*

This file is part of Ext JS 4

Copyright (c) 2011 Sencha Inc

Contact:  http://www.sencha.com/contact

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please contact the sales department at http://www.sencha.com/contact.

*/
Ext.require([
    '*'
]);

Ext.BLANK_IMAGE_URL = '../libs/ext-4.0/resources/themes/images/default/tree/s.gif';

Ext.onReady(function() {

    // Employee Data Model
    Ext.regModel('Employee', {
        fields: [
            {name:'id', type:'int'},
            {name:'first_name', type:'string'},
            {name:'last_name', type:'string'},
            {name:'title', type:'string'}
        ],
        
        hasMany: {model:'Review', name:'reviews'}
    });
    
    // Review Data Model    
    Ext.regModel('Review', {
        fields: [
            {name:'review_date', label:'Date', type:'date', dateFormat:'d-m-Y'},
            {name:'attendance', label:'Attendance', type:'int'},
            {name:'attitude', label:'Attitude', type:'int'},
            {name:'communication', label:'Communication', type:'int'},
            {name:'excellence', label:'Excellence', type:'int'},
            {name:'skills', label:'Skills', type:'int'},
            {name:'teamwork', label:'Teamwork', type:'int'},
            {name:'employee_id', label:'Employee ID', type:'int'}
        ],
        
        belongsTo: 'Employee'
    });
    
    // Instance of a Data Store to hold Employee records
    var employeeStore = new Ext.data.Store({
        storeId:'employeeStore',
        model:'Employee',
        data:[
            {id:1, first_name:'Michael', last_name:'Scott', title:'Regional Manager'},
            {id:2, first_name:'Dwight', last_name:'Schrute', title:'Sales Rep'},
            {id:3, first_name:'Jim', last_name:'Halpert', title:'Sales Rep'},
            {id:4, first_name:'Pam', last_name:'Halpert', title:'Office Administrator'},
            {id:5, first_name:'Andy', last_name:'Bernard', title:'Sales Rep'},
            {id:6, first_name:'Stanley', last_name:'Hudson', title:'Sales Rep'},
            {id:7, first_name:'Phyllis', last_name:'Lapin-Vance', title:'Sales Rep'},
            {id:8, first_name:'Kevin', last_name:'Malone', title:'Accountant'},
            {id:9, first_name:'Angela', last_name:'Martin', title:'Senior Accountant'},             
            {id:10, first_name:'Meredith', last_name:'Palmer', title:'Supplier Relations Rep'}                                                                                   
        ],
        autoLoad:true        
    });    
      
   /**
     * App.RadarStore
     * @extends Ext.data.Store
     * This is a specialized Data Store with dynamically generated fields
     * data reformating capabilities to transform Employee and Review data
     * into the format required by the Radar Chart.
     *
     * The constructor demonstrates dynamically generating store fields.
     * populateReviewScores() populates the store using records from 
     * the reviewStore which holds all the employee review scores.
     *
     * calculateAverageScores() iterates through each metric in the
     * review and calculates an average across all available reviews.
     * 
     * Most of the actual data population and updates done by
     * addUpdateRecordFromReviews() and removeRecordFromReviews()
     * called when add/update/delete events are triggered on the ReviewStore.      
     */      
    Ext.define('App.RadarStore', {
        extend: 'Ext.data.Store',
        
        constructor: function(config) {
            config = config || {};
            var dynamicFields = ['metric', 'avg'];  // initalize the non-dynamic fields first

            employeeStore.each(function(record){    // loops through all the employees to setup the dynamic fields
                dynamicFields.push('eid_' + record.get('id'));
            });
                        
            Ext.apply(config, {
                storeId:'radarStore',   // let's us look it up later using Ext.data.StoreMgr.lookup('radarStore')
                fields:dynamicFields,
                data:[]
            });
            
            App.RadarStore.superclass.constructor.call(this, config);
        },
        
        addUpdateRecordFromReviews: function(reviews) {
            var me = this;
            
            Ext.Array.each(reviews, function(review, recordIndex, all) {    // add a new radarStore record for each review record 
                var eid = 'eid_' + review.get('employee_id');   // creates a unique id for each employee column in the store    
                    
                review.fields.each(function(field) {
                
                    if(field.name !== "employee_id" && field.name !== "review_date") {  // filter out the fields we don't need
                        var metricRecord = me.findRecord('metric', field.name); // checks for an existing metric record in the store
                        if(metricRecord) {
                            metricRecord.set(eid, review.get(field.name));  // updates existing record with field value from review
                        } else {
                            var newRecord = {};    // creates a new object we can populate with dynamic keys and values to create a new record
                            newRecord[eid] = review.get(field.name);
                            newRecord['metric'] = field.label;
                            me.add(newRecord);
                        }
                    }
                });
            });
            
            this.calculateAverageScores();  // update average scores
        },
        
       /**
         * Calculates an average for each metric across all employees.
         * We use this to create the average series always shown in the Radar Chart.      
         */              
        calculateAverageScores: function() {
            var me = this; // keeps the store in scope during Ext.Array.each
            var reviewStore = Ext.data.StoreMgr.lookup('reviewStore');
            
            var Review = Ext.ModelMgr.getModel('Review');
            
            Ext.Array.each(Review.prototype.fields.keys, function(fieldName) {  // loop through the Review model fields and calculate average scores
                if(fieldName !== "employee_id" && fieldName !== "review_date") {  // ignore non-score fields
                    var avgScore = Math.round(reviewStore.average(fieldName));  // takes advantage of Ext.data.Store.average()
                    var record = me.findRecord('metric', fieldName);
                        
                    if(record) {
                        record.set('avg', avgScore);
                    } else {
                        me.add({metric:fieldName, avg:avgScore});
                    }
                }
            });
        },
        
        populateReviewScores: function() {
            var reviewStore = Ext.data.StoreMgr.lookup('reviewStore');
            this.addUpdateRecordFromReviews(reviewStore.data.items); // add all the review records to this store
        },
           
        removeRecordFromReviews: function(reviews) {
            var me = this;
            Ext.Array.each(reviews, function(review, recordIndex, all) {
                var eid = 'eid_' + review.get('employee_id');
                
                me.each(function(record) {
                    delete record.data[eid];
                });
            });
            
            // upate average scores
            this.calculateAverageScores(); 
        }
    }); // end App.RadarStore definition
      
    
   /** Creates an instance of App.RadarStore here so we
     * here so we can re-use it during the life of the app.
     * Otherwise we'd have to create a new instance everytime
     * refreshRadarChart() is run.
     */
    var radarStore = new App.RadarStore();
            
    var reviewStore = new Ext.data.Store({
        storeId:'reviewStore',
        model:'Review',
        data:[
            {review_date:'01-04-2011', attendance:10, attitude:6, communication:6, excellence:3, skills:3, teamwork:3, employee_id:1},
            {review_date:'01-04-2011', attendance:6, attitude:5, communication:2, excellence:8, skills:9, teamwork:5, employee_id:2},
            {review_date:'01-04-2011', attendance:5, attitude:4, communication:3, excellence:5, skills:6, teamwork:2, employee_id:3},
            {review_date:'01-04-2011', attendance:8, attitude:2, communication:4, excellence:2, skills:5, teamwork:6, employee_id:4},
            {review_date:'01-04-2011', attendance:4, attitude:1, communication:5, excellence:7, skills:5, teamwork:5, employee_id:5},
            {review_date:'01-04-2011', attendance:5, attitude:2, communication:4, excellence:7, skills:9, teamwork:8, employee_id:6},
            {review_date:'01-04-2011', attendance:10, attitude:7, communication:8, excellence:7, skills:3, teamwork:4, employee_id:7},                        
            {review_date:'01-04-2011', attendance:10, attitude:8, communication:8, excellence:4, skills:8, teamwork:7, employee_id:8},
            {review_date:'01-04-2011', attendance:6, attitude:4, communication:9, excellence:7, skills:6, teamwork:5, employee_id:9},
            {review_date:'01-04-2011', attendance:7, attitude:5, communication:9, excellence:4, skills:2, teamwork:4, employee_id:10}            
        ],
        listeners: {
            add:function(store, records, storeIndex) {
                var radarStore = Ext.data.StoreMgr.lookup('radarStore');
                
                if(radarStore) {    // only add records if an instance of the rardarStore already exists
                    radarStore.addUpdateRecordFromReviews(records);   // add a new radarStore records for new review records                              
                }
            }, // end add listener
            update: function(store, record, operation) {
                radarStore.addUpdateRecordFromReviews([record]);
                refreshRadarChart();
            },
            remove: function(store, records, storeIndex) {
                // update the radarStore and regenerate the radarChart
                Ext.data.StoreMgr.lookup('radarStore').removeRecordFromReviews(records);
                refreshRadarChart();
            } // end remove listener
        }
    });
        
   /**
     * App.PerformanceRadar
     * @extends Ext.chart.Chart
     * This is a specialized Radar Chart which we use to display employee 
     * performance reviews.
     *
     * The class will be registered with an xtype of 'performanceradar'
     */      
    Ext.define('App.PerformanceRadar', {
        extend: 'Ext.chart.Chart',
        alias: 'widget.performanceradar',           // register xtype performanceradar
        constructor: function(config) {
            config = config || {};
            
            this.setAverageSeries(config);    // make sure average is always present
            
            Ext.apply(config, {
                id:'radarchart',
                theme:'Category2',
                animate:true,
                store: Ext.data.StoreMgr.lookup('radarStore'),
                margin:'0 0 50 0',
                width:350,
                height:500,
                insetPadding:80,
                legend:{
                    position: 'bottom'
                },
                axes: [{
                    type:'Radial',
                    position:'radial',
                    label:{
                        display: true
                    }
                }]
            }); // end Ext.apply
            
            App.PerformanceRadar.superclass.constructor.call(this, config);
        
        }, // end constructor
        
        setAverageSeries: function(config) {
            var avgSeries = {
                type: 'radar',
                xField: 'metric',
                yField: 'avg',
                title: 'Avg',
                labelDisplay:'over',
                showInLegend: true,
                showMarkers: true,
                markerCfg: {
                    radius: 5,
                    size: 5,
                    stroke:'#0677BD',
                    fill:'#0677BD'
                },
                style: {
                    'stroke-width': 2,
                    'stroke':'#0677BD',
                    fill: 'none'
                }
            }
            
            if(config.series) {        
                config.series.push(avgSeries);     // if a series is passed in then append the average to it
            } else {                    
                config.series = [avgSeries];    // if a series isn't passed just create average
            }
        } 
    
    }); // end Ext.ux.Performance radar definition
    
   /**
     * App.EmployeeDetail
     * @extends Ext.Panel
     * This is a specialized Panel which is used to show information about
     * an employee and the reviews we have on record for them.
     *
     * This demonstrates adding 2 custom properties (tplMarkup and
     * startingMarkup) to the class. It also overrides the initComponent
     * method and adds a new method called updateDetail.
     *
     * The class will be registered with an xtype of 'employeedetail'
     */
    Ext.define('App.EmployeeDetail', {
        extend: 'Ext.panel.Panel',
        // register the App.EmployeeDetail class with an xtype of employeedetail
        alias: 'widget.employeedetail',
        // add tplMarkup as a new property
        tplMarkup: [
            '<b>{first_name}&nbsp;{last_name}</b>&nbsp;&nbsp;',
            'Title: {title}<br/><br/>',
            '<b>Last Review</b>&nbsp;&nbsp;',
            'Attendance:&nbsp;{attendance}&nbsp;&nbsp;',
            'Attitude:&nbsp;{attitude}&nbsp;&nbsp;',
            'Communication:&nbsp;{communication}&nbsp;&nbsp;',
            'Excellence:&nbsp;{excellence}&nbsp;&nbsp;',
            'Skills:&nbsp;{skills}&nbsp;&nbsp;',
            'Teamwork:&nbsp;{teamwork}' 
        ],
        
        height:90,
        bodyPadding: 7,
        // override initComponent to create and compile the template
        // apply styles to the body of the panel
        initComponent: function() {
            this.tpl = new Ext.Template(this.tplMarkup);
                                   
            // call the superclass's initComponent implementation
            App.EmployeeDetail.superclass.initComponent.call(this);
        }
    });
            
    Ext.define('App.ReviewWindow', {
        extend: 'Ext.window.Window',

        constructor: function(config) {        
            config = config || {};
            Ext.apply(config, {        
                title:'Employee Performance Review',
                width:320,
                height:420,
                layout:'fit',        
                items:[{
                    xtype:'form',
                    id:'employeereviewcomboform',
                    fieldDefaults: {
                        labelAlign: 'left',
                        labelWidth: 90,
                        anchor: '100%'
                    },            
                    bodyPadding:5,
                    items:[{
                        xtype:'fieldset',
                        title:'Employee Info',
                        items:[{
                            xtype:'hiddenfield',
                            name:'employee_id'
                        },{
                            xtype:'textfield',
                            name:'first_name',
                            fieldLabel:'First Name',
                            allowBlank:false
                        },{
                            xtype:'textfield',
                            name:'last_name',
                            fieldLabel:'Last Name',
                            allowBlank:false                               
                        },{
                            xtype:'textfield',
                            name:'title',
                            fieldLabel:'Title',
                            allowBlank:false                               
                        }]
                    },{
                        xtype:'fieldset',
                        title:'Performance Review',
                        items:[{
                            xtype:'datefield',
                            name:'review_date',
                            fieldLabel:'Review Date',
                            format:'d-m-Y',                   
                            maxValue: new Date(),
                            value: new Date(),
                            allowBlank:false
                        },{
                            xtype:'slider',
                            name:'attendance',
                            fieldLabel:'Attendance',                    
                            value:5,
                            increment:1,
                            minValue:1,
                            maxValue:10
                        },{
                            xtype:'slider',
                            name:'attitude',
                            fieldLabel:'Attitude',
                            value:5,
                            minValue: 1,
                            maxValue: 10
                        },{
                            xtype:'slider',
                            name:'communication',
                            fieldLabel:'Communication',                    
                            value:5,
                            increment:1,
                            minValue:1,
                            maxValue:10
                        },{
                            xtype:'numberfield',
                            name:'excellence',
                            fieldLabel:'Excellence',
                            value:5,
                            minValue: 1,
                            maxValue: 10                
                        },{
                            xtype:'numberfield',
                            name:'skills',
                            fieldLabel:'Skills',
                            value:5,
                            minValue: 1,
                            maxValue: 10                
                        },{
                            xtype:'numberfield',
                            name:'teamwork',
                            fieldLabel:'Teamwork',
                            value:5,
                            minValue: 1,
                            maxValue: 10                
                        }]
                    }]
                }],
                buttons:[{
                    text:'Cancel',
                    width:80,
                    handler:function() {
                        this.up('window').close();
                    }
                },
                {
                    text:'Save',
                    width:80,
                    handler:function(btn, eventObj) {
                        var window = btn.up('window');
                        var form = window.down('form').getForm();
                        
                        if (form.isValid()) {
                            window.getEl().mask('saving data...');
                            var vals = form.getValues();
                            var employeeStore = Ext.data.StoreMgr.lookup('employeeStore');
                            var currentEmployee = employeeStore.findRecord('id', vals['employee_id']);
                            
                            // look up id for this employee to see if they already exist
                            if(vals['employee_id'] && currentEmployee) {
                                currentEmployee.set('first_name', vals['first_name']);
                                currentEmployee.set('last_name', vals['last_name']);
                                currentEmployee.set('title', vals['title']);
                                
                                var currentReview = Ext.data.StoreMgr.lookup('reviewStore').findRecord('employee_id', vals['employee_id']);
                                currentReview.set('review_date', vals['review_date']);
                                currentReview.set('attendance', vals['attendance']);
                                currentReview.set('attitude', vals['attitude']);
                                currentReview.set('communication', vals['communication']);
                                currentReview.set('excellence', vals['excellence']);
                                currentReview.set('skills', vals['skills']);
                                currentReview.set('teamwork', vals['teamwork']);                                                                                                                                                                
                            } else {
                                var newId = employeeStore.getCount() + 1; 
                                                                                           
                                employeeStore.add({
                                    id: newId,
                                    first_name: vals['first_name'],
                                    last_name: vals['last_name'],
                                    title: vals['title']
                                });
    
                                Ext.data.StoreMgr.lookup('reviewStore').add({
                                    review_date: vals['review_date'],
                                    attendance: vals['attendance'],
                                    attitude: vals['attitude'],
                                    communication: vals['communication'],
                                    excellence: vals['excellence'],
                                    skills: vals['skills'],
                                    teamwork: vals['teamwork'],
                                    employee_id: newId
                                });
                            }
                            window.getEl().unmask();
                            window.close();
                        }
                    }
                }]
            }); // end Ext.apply
            
            App.ReviewWindow.superclass.constructor.call(this, config);
            
        } // end constructor
        
    });

            
    // adds a record to the radar chart store and 
    // creates a series in the chart for selected employees
    function refreshRadarChart(employees) {       
        employees = employees || []; // in case its called with nothing we'll at least have an empty array
        var existingRadarChart = Ext.getCmp('radarchart'); // grab the radar chart component (used down below)
        var reportsPanel = Ext.getCmp('reportspanel'); // grab the reports panel component (used down below)
        var dynamicSeries = []; // setup an array of chart series that we'll create dynamically
       
        for(var index = 0; index < employees.length; index++) {
            var fullName = employees[index].get('first_name') + ' ' + employees[index].get('last_name');
            var eid = 'eid_' + employees[index].get('id');
                       
            // add to the dynamic series we're building
            dynamicSeries.push({
                type: 'radar',
                title: fullName,
                xField: 'metric',
                yField: eid,
                labelDisplay: 'over',
                showInLegend: true,
                showMarkers: true,
                markerCfg: {
                    radius: 5,
                    size: 5
                },
                style: {
                    'stroke-width': 2,
                    fill: 'none'
                }
            });
            
        } // end for loop
        
        // create the new chart using the dynamic series we just made
        var newRadarChart = new App.PerformanceRadar({series:dynamicSeries});
        // mask the panel while we switch out charts
        reportsPanel.getEl().mask('updating chart...');
        // destroy the existing chart
        existingRadarChart.destroy();
        // display the new one
        reportsPanel.add(newRadarChart);
        // un mask the reports panel
        reportsPanel.getEl().unmask();
    }
    
    function refreshEmployeeDetails(employees) {
        var detailsPanel = Ext.getCmp('detailspanel');
        var reviewStore = Ext.data.StoreMgr.lookup('reviewStore');
        var items = [];
               
        for(var index = 0; index < employees.length; index++) {
            var templateData = Ext.merge(employees[index].data, reviewStore.findRecord('employee_id', employees[index].get('id')).data);
            var employeePanel = new App.EmployeeDetail({
                title:employees[index].get('first_name') + ' ' + employees[index].get('last_name'),
                data:templateData // combined employee and latest review dataTransfer
            });
            items.push(employeePanel);
        }
        
        detailsPanel.getEl().mask('updating details...');
        detailsPanel.removeAll();
        detailsPanel.add(items);
        detailsPanel.getEl().unmask();
    }
    
    // sets Up Checkbox Selection Model for the Employee Grid
    var checkboxSelModel = new Ext.selection.CheckboxModel();
    
    var viewport = new Ext.container.Viewport({
        id:'mainviewport',
        layout: 'border',            // sets up Ext.layout.container.Border
        items: [{
            xtype:'panel',
            region:'center',
            layout:'auto',
            autoScroll:true,
            title:'Employee Performance Manager',
            tbar:[{
                text:'Add Employee',
                tooltip:'Add a new employee',
                iconCls:'add',
                handler:function() {       // display a window to add a new employee
                    new App.ReviewWindow().show();
                }
            }],
            items:[{
                xtype:'grid',
                store:Ext.data.StoreMgr.lookup('employeeStore'),
                height:300,
                columns:[{
                    text:'First Name',
                    dataIndex:'first_name',
                    flex:2
                },
                {
                    text:'Last Name',
                    dataIndex:'last_name',
                    flex:2
                },
                {
                    text:'Title',
                    dataIndex:'title',
                    flex:3
                },
                {
                    xtype:'actioncolumn',
                    width:45,
                    items:[{
                        icon:'images/edit.png',
                        tooltip:'Edit Employee',
                        handler:function(grid, rowIndex, colIndex) {
                              var employee = grid.getStore().getAt(rowIndex);
                              var review = reviewStore.findRecord('employee_id', employee.get('id'));
                              var win = new App.ReviewWindow({hidden:true});
                              var form = win.down('form').getForm();
                              form.loadRecord(employee);
                              form.loadRecord(review);
                              win.show();
                        }
                    },
                    {
                        icon:'images/delete.png',
                        tooltip:'Delete Employee',
                        width:75,
                        handler:function(grid, rowIndex, colIndex) {
                            Ext.Msg.confirm('Remove Employee?', 'Are you sure you want to remove this employee?',
                                function(choice) {
                                    if(choice === 'yes') {
                                        var reviewStore = Ext.data.StoreMgr.lookup('reviewStore');
                                    
                                        var employee = grid.getStore().getAt(rowIndex);
                                        var reviewIndex = reviewStore.find('employee_id', employee.get('id'));
                                        reviewStore.removeAt(reviewIndex);
                                        grid.getStore().removeAt(rowIndex);
                                    }
                                }
                            );   
                        }
                    }]
                }],
                selModel: new Ext.selection.CheckboxModel(),
                columnLines: true,
                viewConfig: {stripeRows:true},
                listeners:{
                    selectionchange:function(selModel, selected) {
                        refreshRadarChart(selected);
                        refreshEmployeeDetails(selected);
                    }
                }
            },{
                xtype:'container',
                id:'detailspanel',
                layout:{
                    type:'vbox',
                    align:'stretch',
                    autoSize:true
                }
            }]
        },{
            xtype:'panel',          // sets up the chart panel (starts collapsed)
            region:'east',
            id:'reportspanel',
            title:'Performance Report',
            width:350,
            layout: 'fit',
            items:[{
                xtype:'performanceradar'  // this instantiates a App.PerformanceRadar object
            }]
        }]  // mainviewport items array ends here
    });
        
});
