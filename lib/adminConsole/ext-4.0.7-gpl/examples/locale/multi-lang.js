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
    'Ext.tip.QuickTipManager',
    'Ext.form.*',
    'Ext.ux.data.PagingMemoryProxy',
    'Ext.grid.Panel'
]);

Ext.onReady(function(){
    MultiLangDemo = (function() {
        // get the selected language code parameter from url (if exists)
        var params = Ext.urlDecode(window.location.search.substring(1));
        //Ext.form.Field.prototype.msgTarget = 'side';
                
        return {
            init: function() {
                Ext.tip.QuickTipManager.init();
            
                /* Language chooser combobox  */
                var store = Ext.create('Ext.data.ArrayStore', {
                    fields: ['code', 'language', 'charset'],
                    data : Ext.exampledata.languages // from languages.js
                });
                
                var combo = Ext.create('Ext.form.field.ComboBox', {
                    renderTo: 'languages',
                    store: store,
                    displayField:'language',
                    queryMode: 'local',
                    emptyText: 'Select a language...',
                    hideLabel: true,
                    listeners: {
                        select: {
                            fn: function(cb, records) {
                                var record = records[0];
                                window.location.search = Ext.urlEncode({"lang":record.get("code"),"charset":record.get("charset")});
                            },
                            scope: this
                        }
                    }
                });
        
                if (params.lang) {
                    // check if there's really a language with that language code
                    var record = store.findRecord('code', params.lang, null, null, null, true);
                    // if language was found in store assign it as current value in combobox
                    if (record) {
                        combo.setValue(record.data.language);
                    }
                }            
            
                if (params.lang) {
                    var url = Ext.util.Format.format("../../locale/ext-lang-{0}.js", params.lang);
                
                    Ext.Ajax.request({
                        url: url,
                        success: this.onSuccess,
                        failure: this.onFailure,
                        scope: this 
                    });
                } else {
                    this.setupDemo();
                }
            },
            onSuccess: function(response, opts) {
                eval(response.responseText);
                this.setupDemo();
            },
            onFailure: function() {
                Ext.Msg.alert('Failure', 'Failed to load locale file.');
                this.setupDemo();
            },
            setupDemo: function() {
                /* Email field */
                Ext.create('Ext.FormPanel', {
                    renderTo: 'emailfield',
                    labelWidth: 100, // label settings here cascade unless overridden
                    frame: true,
                    title: 'Email Field',
                    bodyStyle: 'padding:5px 5px 0',
                    width: 380,
                    defaults: {
                        msgTarget: 'side',
                        width: 340
                    },
                    defaultType: 'textfield',
                    items: [{
                        fieldLabel: 'Email',
                        name: 'email',
                        vtype: 'email'
                    }]
                });
            
                /* Datepicker */
                Ext.create('Ext.FormPanel', {
                    renderTo: 'datefield',
                    labelWidth: 100, // label settings here cascade unless overridden
                    frame: true,
                    title: 'Datepicker',
                    bodyStyle: 'padding:5px 5px 0',
                    width: 380,
                    defaults: {
                        msgTarget: 'side',
                        width: 340
                    },
                    defaultType: 'datefield',
                    items: [{
                        fieldLabel: 'Date',
                        name: 'date'
                    }]
                });
            
                // shorthand alias                
                var monthArray = Ext.Array.map(Ext.Date.monthNames, function (e) { return [e]; });
                var ds = Ext.create('Ext.data.Store', {
                     fields: ['month'],
                     remoteSort: true,
                     pageSize: 6,
                     proxy: {
                         type: 'pagingmemory',
                         data: monthArray,
                         reader: {
                             type: 'array'
                         }
                     }
                 });
                             
                 Ext.create('Ext.grid.Panel', {
                     renderTo: 'grid',
                     width: 380,
                     height: 203,
                     title:'Month Browser',
                     columns:[{
                         text: 'Month of the year',
                         dataIndex: 'month',
                         width: 240 
                     }],
                     store: ds,            
                     bbar: Ext.create('Ext.toolbar.Paging', {
                             pageSize: 6,
                             store: ds,
                             displayInfo: true
                     })
                 });
            
                // trigger the data store load
                ds.load();            
            }
        };
    
    })();
    MultiLangDemo.init();
});
