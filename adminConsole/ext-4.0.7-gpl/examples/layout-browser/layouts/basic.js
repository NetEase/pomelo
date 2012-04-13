/*

This file is part of Ext JS 4

Copyright (c) 2011 Sencha Inc

Contact:  http://www.sencha.com/contact

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please contact the sales department at http://www.sencha.com/contact.

*/
//
// Note that these are all defined as panel configs, rather than instantiated
// as panel objects.  You could just as easily do this instead:
//
// var absolute = Ext.create('Ext.Panel', { ... });
//
// However, by passing configs into the main container instead of objects, we can defer
// layout AND object instantiation until absolutely needed.  Since most of these panels
// won't be shown by default until requested, this will save us some processing
// time up front when initially rendering the page.
//
// Since all of these configs are being added into a layout container, they are
// automatically assumed to be panel configs, and so the xtype of 'panel' is
// implicit.  To define a config of some other type of component to be added into
// the layout, simply provide the appropriate xtype config explicitly.
//
function getBasicLayouts() {
    // This is a fake CardLayout navigation function.  A real implementation would
    // likely be more sophisticated, with logic to validate navigation flow.  It will
    // be assigned next as the handling function for the buttons in the CardLayout example.
    var cardNav = function(incr){
        var l = Ext.getCmp('card-wizard-panel').getLayout();
        var i = l.activeItem.id.split('card-')[1];
        var next = parseInt(i, 10) + incr;
        l.setActiveItem(next);
        Ext.getCmp('card-prev').setDisabled(next===0);
        Ext.getCmp('card-next').setDisabled(next===2);
    };
    return {
        /*
         * ================  Start page config  =======================
         */
        // The default start page, also a simple example of a FitLayout.
        start: {
            id: 'start-panel',
            title: 'Start Page',
            layout: 'fit',
            bodyStyle: 'padding:25px',
            contentEl: 'start-div'  // pull existing content from the page
        },

        /*
         * ================  AbsoluteLayout config  =======================
         */
        absolute: {
            id: 'absolute-panel',
            title: 'Absolute Layout',
            layout: 'absolute',
            defaults: {
                bodyStyle: 'padding:15px;',
                width: 200,
                height: 100,
                frame: true
            },
            items:[{
                title: 'Panel 1',
                x: 50,
                y: 50,
                html: 'Positioned at x:50, y:50'
            },{
                title: 'Panel 2',
                x: 125,
                y: 125,
                html: 'Positioned at x:125, y:125'
            }]
        },

        /*
         * ================  AccordionLayout config  =======================
         */
        accordion: {
            id: 'accordion-panel',
            title: 'Accordion Layout',
            layout: 'accordion',
            bodyStyle: 'background-color:#DFE8F6',  // if all accordion panels are collapsed, this looks better in this layout
            defaults: {bodyStyle: 'padding:15px'},
            items: [{
                title: 'Introduction',
                tools: [{type:'gear'},{type:'refresh'}],
                html: '<p>Here is some accordion content.  Click on one of the other bars below for more.</p>'
            },{
                title: 'Basic Content',
                html: '<br /><br /><p>More content.  Open the third panel for a customized look and feel example.</p>',
                items: {
                    xtype: 'button',
                    text: 'Show Next Panel',
                    handler: function(){
                        Ext.getCmp('acc-custom').expand(true);
                    }
                }
            },{
                id: 'acc-custom',
                title: 'Custom Panel Look and Feel',
                cls: 'custom-accordion', // look in layout-browser.css to see the CSS rules for this class
                html: '<p>Here is an example of how easy it is to completely customize the look and feel of an individual panel simply by adding a CSS class in the config.</p>'
            }]
        },

        /*
         * ================  AnchorLayout config  =======================
         */
        anchor: {
            id:'anchor-panel',
            title: 'Anchor Layout',
            layout:'anchor',
            defaults: {bodyStyle: 'padding:15px'},
            items: [{
                title: 'Panel 1',
                height: 100,
                anchor: '50%',
                html: '<p>Width = 50% of the container</p>'
            },{
                title: 'Panel 2',
                height: 100,
                anchor: '-100',
                html: '<p>Width = container width - 100 pixels</p>'
            },{
                title: 'Panel 3',
                anchor: '-10, -262',
                html: '<p>Width = container width - 10 pixels</p><p>Height = container height - 262 pixels</p>'
            }]
        },

        /*
         * ================  BorderLayout config  =======================
         */
        border: {
            id:'border-panel',
            title: 'Border Layout',
            layout: 'border',
            bodyBorder: false,
            defaults: {
                collapsible: true,
                split: true,
                animFloat: false,
                autoHide: false,
                useSplitTips: true,
                bodyStyle: 'padding:15px'
            },
            items: [{
                title: 'Footer',
                region: 'south',
                height: 150,
                minSize: 75,
                maxSize: 250,
                cmargins: '5 0 0 0',
                html: '<p>Footer content</p>'
            },{
                title: 'Navigation',
                region:'west',
                floatable: false,
                margins: '5 0 0 0',
                cmargins: '5 5 0 0',
                width: 175,
                minSize: 100,
                maxSize: 250,
                html: '<p>Secondary content like navigation links could go here</p>'
            },{
                title: 'Main Content',
                collapsible: false,
                region: 'center',
                margins: '5 0 0 0',
                html: '<h1>Main Page</h1><p>This is where the main content would go</p>'
            }]
        },

        /*
         * ================  CardLayout config (TabPanel)  =======================
         */
        // Note that the TabPanel component uses an internal CardLayout -- it is not
        // something you have to explicitly configure.  However, it is still a perfect
        // example of how this layout style can be used in a complex component.
        cardTabs: {
            xtype: 'tabpanel',
            id: 'card-tabs-panel',
            plain: true,  //remove the header border
            activeTab: 0,
            style: 'background-color:#dfe8f6; ',
            defaults: {bodyStyle: 'padding:15px'},
            items:[{
                title: 'Tab 1',
                html: 'This is tab 1 content.'
            },{
                title: 'Tab 2',
                html: 'This is tab 2 content.'
            },{
                title: 'Tab 3',
                html: 'This is tab 3 content.'
            }]
        },

        /*
         * ================  CardLayout config (Wizard)  =======================
         */
        cardWizard: {
            id:'card-wizard-panel',
            title: 'Card Layout (Wizard)',
            layout:'card',
            activeItem: 0,
            bodyStyle: 'padding:15px',
            defaults: {border:false},
            bbar: ['->', {
                id: 'card-prev',
                text: '&laquo; Previous',
                handler: Ext.Function.bind(cardNav, this, [-1]),
                disabled: true
            },{
                id: 'card-next',
                text: 'Next &raquo;',
                handler: Ext.Function.bind(cardNav, this, [1])
            }],
            items: [{
                id: 'card-0',
                html: '<h1>Welcome to the Demo Wizard!</h1><p>Step 1 of 3</p><p>Please click the "Next" button to continue...</p>'
            },{
                id: 'card-1',
                html: '<p>Step 2 of 3</p><p>Almost there.  Please click the "Next" button to continue...</p>'
            },{
                id: 'card-2',
                html: '<h1>Congratulations!</h1><p>Step 3 of 3 - Complete</p>'
            }]
        },

        /*
         * ================  ColumnLayout config  =======================
         */
        column: {
            id:'column-panel',
            title: 'Column Layout',
            layout: 'column',
            bodyStyle: 'padding:5px',
            defaults: {bodyStyle:'padding:15px'},
            items: [{
                title: 'Width = 0.25',
                columnWidth: 0.25,
                html: '<p>This is some short content.</p>'
            },{
                title: 'Width = 0.75',
                columnWidth: 0.75,
                html: '<p>This is some longer content.</p><p>This is some longer content.</p><p>This is some longer content.</p><p>This is some longer content.</p><p>This is some longer content.</p><p>This is some longer content.</p>'
            },{
                title: 'Width = 250px',
                width: 250,
                html: 'Not much here!'
            }]
        },

        /*
         * ================  FitLayout config  =======================
         */
        fit: {
            id: 'fit-panel',
            title: 'Fit Layout',
            layout: 'fit',
            items: {
                title: 'Inner Panel',
                html: '<p>This panel is fit within its container.</p>',
                bodyStyle: 'padding:15px',
                border: false
            }
        },

        /*
         * ================  FormLayout config  =======================
         */
        // NOTE: While you can create a basic Panel with layout:'form', practically
        // you should usually use a FormPanel to also get its form-specific functionality.
        // Note that the layout config is not required on FormPanels.
        form: {
            xtype: 'form', // since we are not using the default 'panel' xtype, we must specify it
            id: 'form-panel',
            labelWidth: 75,
            title: 'Form Layout',
            bodyStyle: 'padding:15px',
            width: 350,
            labelPad: 20,

            defaults: {
                width: 230,
                labelSeparator: '',
                msgTarget: 'side'
            },
            defaultType: 'textfield',
            items: [{
                    fieldLabel: 'First Name',
                    name: 'first',
                    allowBlank:false
                },{
                    fieldLabel: 'Last Name',
                    name: 'last'
                },{
                    fieldLabel: 'Company',
                    name: 'company'
                },{
                    fieldLabel: 'Email',
                    name: 'email',
                    vtype:'email'
                }
            ],
            buttons: [{text: 'Save'},{text: 'Cancel'}]
        },

        /*
         * ================  TableLayout config  =======================
         */
        table: {
            id: 'table-panel',
            title: 'Table Layout',
            layout: {
                type: 'table',
                columns: 4
            },
            defaults: {
                bodyStyle:'padding:15px 20px'
            },
            items: [{
                title: 'Lots of Spanning',
                html: '<p>Row spanning.</p><br /><p>Row spanning.</p><br /><p>Row spanning.</p><br /><p>Row spanning.</p><br /><p>Row spanning.</p><br /><p>Row spanning.</p>',
                rowspan: 3
            },{
                title: 'Basic Table Cell',
                html: '<p>Basic panel in a table cell.</p>',
                cellId: 'basic-cell',
                cellCls: 'custom-cls'
            },{
                html: '<p>Plain panel</p>'
            },{
                title: 'Another Cell',
                html: '<p>Row spanning.</p><br /><p>Row spanning.</p><br /><p>Row spanning.</p><br /><p>Row spanning.</p>',
                width: 300,
                rowspan: 2
            },{
                html: 'Plain cell spanning two columns',
                colspan: 2
            },{
                title: 'More Column Spanning',
                html: '<p>Spanning three columns.</p>',
                colspan: 3
            },{
                title: 'Spanning All Columns',
                html: '<p>Spanning all columns.</p>',
                colspan: 4
            }]
        },


        /*
         * ================  VBoxLayout config  =======================
         */
        vbox: {
            id: 'vbox-panel',
            title: 'vBox Layout',
            layout: {
                type: 'vbox',
                pack: 'start',
                align: 'stretch'
            },
            defaults: {
                frame: true
            },
            items: [{
                title: 'Panel 1',
                flex: 1,
                html: 'flex : 1'
            }, {
                title: 'Panel 2',
                height: 100,
                html: 'height: 100'
            }, {
                title: 'Panel 3',
                flex: 2,
                html: 'flex : 2'
            }]
        },

        /*
         * ================  HBoxLayout config  =======================
         */
        hbox: {
            id: 'hbox-panel',
            title: 'hBox Layout',
            layout: {
                type: 'hbox',
                pack: 'start',
                align: 'stretch'
            },
            defaults: {
                frame: true
            },
            items: [{
                title: 'Panel 1',
                flex: 1,
                html: 'flex : 1'
            }, {
                title: 'Panel 2',
                width: 100,
                html: 'width : 100'
            }, {
                title: 'Panel 3',
                flex: 2,
                html: 'flex : 2'
            }]
        }
    };
}

