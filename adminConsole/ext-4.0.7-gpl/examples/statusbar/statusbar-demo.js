/*

This file is part of Ext JS 4

Copyright (c) 2011 Sencha Inc

Contact:  http://www.sencha.com/contact

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please contact the sales department at http://www.sencha.com/contact.

*/
Ext.Loader.setConfig({
    enabled: true
});

Ext.Loader.setPath('Ext.ux', '../ux/');

Ext.require([
  'Ext.panel.Panel',
  'Ext.button.Button',
  'Ext.window.Window',
  'Ext.ux.statusbar.StatusBar',
  'Ext.toolbar.TextItem',
  'Ext.menu.Menu',
  'Ext.toolbar.Spacer',
  'Ext.button.Split',
  'Ext.form.field.TextArea'
]);

Ext.onReady(function(){

    // This is a shared function that simulates a load action on a StatusBar.
    // It is reused by most of the example panels.
    var loadFn = function(btn, statusBar){
        btn = Ext.getCmp(btn);
        statusBar = Ext.getCmp(statusBar);

        btn.disable();
        statusBar.showBusy();

         Ext.defer(function(){
            statusBar.clearStatus({useDefaults:true});
            btn.enable();
        }, 2000);
    };

/*
 * ================  Basic StatusBar example  =======================
 */
    Ext.create('Ext.Panel', {
        title: 'Basic StatusBar',
        renderTo: 'basic',
        width: 550,
        height: 100,
        bodyStyle: 'padding:10px;',
        items:[{
            xtype: 'button',
            id: 'basic-button',
            text: 'Do Loading',
            handler: Ext.Function.pass(loadFn, ['basic-button', 'basic-statusbar'])
        }],
        bbar: Ext.create('Ext.ux.StatusBar', {
            id: 'basic-statusbar',

            // defaults to use when the status is cleared:
            defaultText: 'Default status text',
            //defaultIconCls: 'default-icon',
        
            // values to set initially:
            text: 'Ready',
            iconCls: 'x-status-valid',

            // any standard Toolbar items:
            items: [
                {
                    xtype: 'button',
                    text: 'Show Warning & Clear',
                    handler: function (){
                        var sb = Ext.getCmp('basic-statusbar');
                        sb.setStatus({
                            text: 'Oops!',
                            iconCls: 'x-status-error',
                            clear: true // auto-clear after a set interval
                        });
                    }
                },
                {
                    xtype: 'button',
                    text: 'Show Busy',
                    handler: function (){
                        var sb = Ext.getCmp('basic-statusbar');
                        // Set the status bar to show that something is processing:
                        sb.showBusy();
                    }
                },
                {
                    xtype: 'button',
                    text: 'Clear status',
                    handler: function (){
                        var sb = Ext.getCmp('basic-statusbar');
                        // once completed
                        sb.clearStatus(); 
                    }
                },
                '-',
                'Plain Text'
            ]
        })
    });

/*
 * ================  Right-aligned StatusBar example  =======================
 */
    Ext.create('Ext.Panel', {
        title: 'Right-aligned StatusBar',
        renderTo: 'right-aligned',
        width: 550,
        height: 100,
        bodyStyle: 'padding:10px;',
        items:[{
            xtype: 'button',
            id: 'right-button',
            text: 'Do Loading',
            handler: Ext.Function.pass(loadFn, ['right-button', 'right-statusbar'])
        }],
        bbar: Ext.create('Ext.ux.StatusBar', {
            defaultText: 'Default status',
            id: 'right-statusbar',
            statusAlign: 'right', // the magic config
            items: [{
                text: 'A Button'
            }, '-', 'Plain Text', ' ', ' ']
        })
    });

/*
 * ================  StatusBar Window example  =======================
 */
    var win = Ext.create('Ext.Window', {
        title: 'StatusBar Window',
        width: 400,
        minWidth: 350,
        height: 150,
        modal: true,
        closeAction: 'hide',
        bodyStyle: 'padding:10px;',
        items:[{
            xtype: 'button',
            id: 'win-button',
            text: 'Do Loading',
            handler: Ext.Function.pass(loadFn, ['win-button', 'win-statusbar'])
        }],
        bbar: Ext.create('Ext.ux.StatusBar', {
            id: 'win-statusbar',
            defaultText: 'Ready',
            items: [{
                xtype: 'button',
                text: 'A Button'
            }, '-',
            Ext.Date.format(new Date(), 'n/d/Y'), ' ', ' ', '-', {
                xtype:'splitbutton',
                text:'Status Menu',
                menuAlign: 'br-tr?',
                menu: Ext.create('Ext.menu.Menu', {
                    items: [{text: 'Item 1'}, {text: 'Item 2'}]
                })
            }]
        })
    });

    Ext.create('Ext.Button', {
        text: 'Show Window',
        renderTo: 'window',
        handler: function(){
            win.show();
        }
    });

/*
 * ================  Ext Word Processor example  =======================
 *
 * The StatusBar used in this example is completely standard.  What is
 * customized are the styles and event handling to make the example a
 * lot more dynamic and application-oriented.
 *
 */
    // Create these explicitly so we can manipulate them later
    var wordCount = Ext.create('Ext.toolbar.TextItem', {text: 'Words: 0'}),
        charCount = Ext.create('Ext.toolbar.TextItem', {text: 'Chars: 0'}), 
        clock = Ext.create('Ext.toolbar.TextItem', {text: Ext.Date.format(new Date(), 'g:i:s A')}),
        event = Ext.isOpera ? 'keypress' : 'keydown'; // opera behaves a little weird with keydown

    Ext.create('Ext.Panel', {
        title: 'Ext Word Processor',
        renderTo: 'word-proc',
        width: 500,
        autoHeight: true,
        bodyStyle: 'padding:5px;',
        layout: 'fit',
        bbar: Ext.create('Ext.ux.StatusBar', {
            id: 'word-status',
            // These are just the standard toolbar TextItems we created above.  They get
            // custom classes below in the render handler which is what gives them their
            // customized inset appearance.
            items: [wordCount, ' ', charCount, ' ', clock, ' ']
        }),
        items: {
            xtype: 'textarea',
            id: 'word-textarea',
            enableKeyEvents: true,
            hideLabel: true,
            grow: true,
            growMin: 100,
            growMax: 200
        },
        listeners: {
            render: {
                fn: function(){
                    // Add a class to the parent TD of each text item so we can give them some custom inset box
                    // styling. Also, since we are using a greedy spacer, we have to add a block level element
                    // into each text TD in order to give them a fixed width (TextItems are spans).  Insert a
                    // spacer div into each TD using createChild() so that we can give it a width in CSS.
                    Ext.fly(wordCount.getEl().parent()).addCls('x-status-text-panel').createChild({cls:'spacer'});
                    Ext.fly(charCount.getEl().parent()).addCls('x-status-text-panel').createChild({cls:'spacer'});
                    Ext.fly(clock.getEl().parent()).addCls('x-status-text-panel').createChild({cls:'spacer'});

                    // Kick off the clock timer that updates the clock el every second:
                 Ext.TaskManager.start({
                     run: function(){
                         Ext.fly(clock.getEl()).update(Ext.Date.format(new Date(), 'g:i:s A'));
                     },
                     interval: 1000
                 });
                },
                delay: 100
            }
        }
    });

    // This sets up a fake auto-save function.  It monitors keyboard activity and after no typing
    // has occurred for 1.5 seconds, it updates the status message to indicate that it's saving.
    // After a fake delay so that you can see the save activity it will update again to indicate
    // that the action succeeded.
    Ext.getCmp('word-textarea').on(event, function(){
        var sb = Ext.getCmp('word-status');
        sb.showBusy('Saving draft...');
        Ext.defer(function(){
            sb.setStatus({
                iconCls: 'x-status-saved',
                text: 'Draft auto-saved at ' + Ext.Date.format(new Date(), 'g:i:s A')
            });
        }, 4000);
    }, null, {buffer:1500});
    
    // Set up our event for updating the word/char count
    Ext.getCmp('word-textarea').on(event, function(comp){
        var v = comp.getValue(),
            wc = 0, 
            cc = v.length ? v.length : 0;

        if (cc > 0) {
            wc = v.match(/\b/g);
            wc = wc ? wc.length / 2 : 0;
        }
        wordCount.update('Words: ' + wc);
        charCount.update('Chars: ' + cc);
    }, null, {buffer: 1});

});

