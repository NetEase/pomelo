/*

This file is part of Ext JS 4

Copyright (c) 2011 Sencha Inc

Contact:  http://www.sencha.com/contact

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please contact the sales department at http://www.sencha.com/contact.

*/
Ext.require('widget.panel');

Ext.onReady(function(){
    var data = {
        name: 'Abe Elias',
        company: 'Sencha Inc',
        address: '525 University Ave',
        city: 'Palo Alto',
        state: 'California',
        zip: '44102',
        kids: [{
            name: 'Solomon',
            age:3
        },{
            name: 'Rebecca',
            age:2
        },{
            name: 'Rebecca 1',
            age:0
        }]
    };

    Ext.create('Ext.Panel', {
        width: 300,
        renderTo: 'template-example',
        style: "margin:15px",
        bodyStyle: "padding:5px;font-size:11px;",
        title: 'Basic Template',
        tbar: [{
            text: 'Apply Template',
            listeners: {
                click: function() {
                    var panel = this.up("panel"),
                        tpl = Ext.create('Ext.Template', 
                            '<p>Name: {name}</p>',
                            '<p>Company: {company}</p>',
                            '<p>Location: {city}, {state}</p>'
                        );

                    tpl.overwrite(panel.body, data);
                    panel.doComponentLayout();
                }
            }
        }],
        html: '<p><i>Apply the template to see results here</i></p>'
    });

    Ext.create('Ext.Panel', {
        width: 300,
        renderTo: 'xtemplate-example',
        style: "margin:15px",
        bodyStyle: "padding:5px;font-size:11px;",
        title: 'XTemplate',
        tbar: [{
            text: 'Apply Template',
            listeners: {
                click: function() {
                    var panel = this.up('panel'),
                        tpl =Ext.create('Ext.XTemplate',
                            '<p>Name: {name}</p>',
                            '<p>Company: {company}</p>',
                            '<p>Location: {city}, {state}</p>',
                            '<p>Kids: ',
                            '<tpl for="kids" if="name==\'Abe Elias\'">',
                                '<tpl if="age &gt; 1"><p>{#}. {parent.name}\'s kid - {name}</p></tpl>',
                            '</tpl></p>'
                        );
                    tpl.overwrite(panel.body, data);
                    panel.doComponentLayout();
                }
            }
        }],
        html: '<p><i>Apply the template to see results here</i></p>'
    });
});
