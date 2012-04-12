# Keyboard Navigation
______________________________________________

Navigating with your keyboard is often faster than using the cursor and is useful for both power users and to provide accessibility to users that find a mouse difficult to use.

We're going to convert a modified version of the relatively complicated Ext JS [complex layout example](#!/example/layout/complex.html) into an application that is fully accessible through the keyboard. We'll also add keyboard shortcuts to potentially make navigation via the keyboard faster than the cursor.

By the end of this guide you will have an understanding of where keyboard navigation is most needed and how to utilize keyboard navigation with {@link Ext.util.KeyNav KeyNav}, {@link Ext.util.KeyMap KeyMap} and the {@link Ext.FocusManager FocusManager}.

## Getting Started

[These are the files we'll be starting from](guides/keyboard_nav/start.zip). Unzip them and open complex.html and complex.js in your preferred editor. Also unzip a copy of Ext JS 4 into the same directory and rename it 'ext'.

## The Focus Manager

The Focus Manager provides a very quick way to enable basic keyboard navigation. What's more, it's simple to implement:

    Ext.FocusManager.enable(true);

Write this line inside {@link Ext#onReady Ext.onReady}; we pass the {@link Boolean} `true` to show a "visual cue" in the form of a blue ring around the focused area (this is known as a focus frame). This focus frame makes it easy to see at a glance which area has focus. The user presses Enter to enter the application and then move up and down 'levels', with Enter to go down a level and Backspace or Escape to go up a level. The Tab key can be used to jump between sibling elements (those that are on the same level).

Experiment with navigating around the elements solely with the FocusManager. If you can, turn off your mouse too. Although adequate, you'll probably find that certain areas are either inaccessible (such as the grid) or it's quite cumbersome to get around the screen. We're going to tackle this with 'shortcuts' which will allow users to jump to certain panels of the application with ease.

When deciding which panels should have shortcuts to them it's useful to have some criteria to go by:

 - Is it often used?
 - Could it be used as an anchor - that is, could it provide a stepping stone to make other remote areas easier to get to?
 - Does it feel intuitive to navigate to?

If the answer is yes to at least one of these, give it a keyboard shortcut and aid your end-users.

## KeyNav

It's the job of KeyNav to provide easy keyboard navigation. It allows you to use the following keys to navigate through your Ext JS application:

 - Enter
 - Space
 - Left
 - Right
 - Up
 - Down
 - Tab
 - Escape
 - Page Up
 - Page Down
 - Delete
 - Backspace
 - Home
 - End

It's also worth keeping in mind users with limited keyboards that might not have certain keys, for example certain Apple computers don't have Page Up, Page Down, Del, Home or End keys. Let's take a look at an example of how you'd use it.

    var nav = Ext.create('Ext.util.KeyNav', "my-element", {
        "left" : function(e){
            this.moveLeft(e.ctrlKey);
        },
        "right" : function(e){
            this.moveRight(e.ctrlKey);
        },
        "enter" : function(e){
            this.save();
        },
        scope : this
    });

KeyNav's speciality is listening for arrow keys, so we're going to add the ability to navigate around panels with the arrow keys instead of having to use tab, enter and escape.

    var nav = Ext.create('Ext.util.KeyNav', Ext.getBody(), {
        "left" : function(){
            var el = Ext.FocusManager.focusedCmp;
            if (el.previousSibling()) el.previousSibling().focus();
        },
        "right" : function(){
            var el = Ext.FocusManager.focusedCmp;
            if (el.nextSibling()) el.nextSibling().focus();
        },
        "up" : function() {
            var el = Ext.FocusManager.focusedCmp;
            if (el.up()) el.up().focus();
        },
        "down" : function() {
            var el = Ext.FocusManager.focusedCmp;
            if (el.items) el.items.items[0].focus();
        },
        scope : this
    });

We get the currently focused component with {@link Ext.FocusManager#focusedCmp focusedCmp}. If the function has a value other than `null`, we focus on the element that we want, be it the previous sibling with the Left arrow key or the first child component with the Down key. Already we've made our application much easier to navigate. Next, we're going to look at Ext.util.KeyMap and how to add specific functionality to keys.

## KeyMap

You'll notice that there are many regions to our Ext application: North, South, East, and West. We're going to create a {@link Ext.util.KeyMap KeyMap} that will not only focus on these elements but, if the region is collapsed, expand it too. Let's have a look at what a typical KeyMap object looks like.

    var map = Ext.create('Ext.util.KeyMap', "my-element", {
        key: 13, // or Ext.EventObject.ENTER
        ctrl: true,
        shift: false,
        fn: myHandler,
        scope: myObject
    });

The first property, `key` is the numeric keycode that maps a key. A useful document that maps which numbers correlate to which keys can be [found here](ext-js/4-0/source/EventObject.html). The next two, `ctrl` and `shift`, specify if the respective key is required to be held down to activate the function. In our case ctrl does, so ctrl+Enter will invoke `myHandler`. `fn` is the function to be called. This can either be inline or a reference to a function. Finally, `scope` defines where this `KeyMap` will be effective.

`KeyMap` is versatile in that it allows you to specify either one key that carries out a function or an array of keys that carry out the same function. If we wanted a number of keys to invoke `myHandler` we'd write it like `key: [10, 13]`.

We'll start by concentrating on the main panels: north, south, east and west.

    var map = Ext.create('Ext.util.KeyMap', Ext.getBody(), [
        {
            key: Ext.EventObject.E, // E for east
            shift: true,
            ctrl: false, // explicitly set as false to avoid collisions
            fn: function() {
                var parentPanel = eastPanel;
                expand(parentPanel);
            }
        },
        {
            key: Ext.EventObject.W, // W for west
            shift: true,
            ctrl: false,
            fn: function() {
                var parentPanel = westPanel;
                expand(parentPanel);
            }
        },
        {
            key: Ext.EventObject.S, // S for south
            shift: true,
            ctrl: false,
            fn: function() {
                var parentPanel = southPanel;
                expand(parentPanel);
            }
        }
    ]);

We use {@link Ext.EventObject Ext.EventObject.X} to make it obvious which key we're listening for, the rest should be clear from the example above. Then we write the `expand()` function underneath:

    function expand(parentPanel) {
        parentPanel.toggleCollapse();
        parentPanel.on('expand', function(){
            parentPanel.el.focus();
        });
        parentPanel.on('collapse', function(){
            viewport.el.focus();
        });
    }

This function toggles the collapsing of the panel and focuses on it if it's been expanded, or collapses it if it's already expanded, returning focus to the next level up, the `viewport`.

Now that all of the code is in place, try expanding and collapsing the panels with a key press versus clicking on the small button that expands or collapses them.  It's much faster with the keyboard!

Next, we'll go through a similar process with the Navigation, Settings and Information tabs on the West Panel. I've called them subPanels because they're children to the other `parentPanels` that we've seen already.

    {
        key: Ext.EventObject.S, // S for settings
        ctrl: true,
        fn: function() {
            var parentPanel = westPanel;
            var subPanel = settings;
            expand(parentPanel, subPanel);
        }
    },
    {
        key: Ext.EventObject.I, // I for information
        ctrl: true,
        fn: function() {
            var parentPanel = westPanel;
            var subPanel = information;
            expand(parentPanel, subPanel);
        }
    },
    {
        key: Ext.EventObject.N, // N for navigation
        ctrl: true,
        fn: function(){
            var parentPanel = westPanel;
            var subPanel = navigation;
            expand(parentPanel, subPanel);
        }
    }

We follow the same pattern as we've used before but added a variable called `subPanel`. Our `expand` function won't know what to do with these so we'll refactor it to act accordingly depending on whether `subPanel` is declared or not.

    function expand(parentPanel, subPanel) {

        if (subPanel) {
            function subPanelExpand(subPanel) {
                // set listener for expand function
                subPanel.on('expand', function() {
                    setTimeout(function() { subPanel.focus(); }, 200);
                });
                // expand the subPanel
                subPanel.expand();
            }

            if (parentPanel.collapsed) {
                // enclosing panel is collapsed, open it
                parentPanel.expand();
                subPanelExpand(subPanel);
            }
            else if (!subPanel.collapsed) {
                // subPanel is open and just needs focusing
                subPanel.focus();
            }
            else {
                // parentPanel isn't collapsed but subPanel is
                subPanelExpand(subPanel);
            }
        }
        else {
            // no subPanel detected
            parentPanel.toggleCollapse();
            parentPanel.on('expand', function(){
                parentPanel.el.focus();
            });
            parentPanel.on('collapse', function(){
                viewport.el.focus();
            });
        }
    }

Despite `focus` being in the `expand` event listener, which is meant to fire _after_ the panel has been expanded, it needs wrapping in a `setTimeout` because otherwise it focuses too early resulting in a focus frame smaller than the panel (that is, it focuses while it's expanding). Compensating 200 milliseconds gets around this; this problem isn't present with the `parentPanel`s.

At this point you can open and close panels, as well as focus them, purely with the keyboard (e.g. shift+e or ctrl+s). Naturally, any function of Ext JS can be triggered by a key press leading to many possibilities for a more native-feeling application.

There's one last object to add to our `KeyMap`, there are two tabs, one on the center panel and the other next to the 'Eye Data' tab. It would be useful to be able to close these as you would a tab in a browser with ctrl+w.

    {
        key: Ext.EventObject.W, // W to close
        ctrl: true,
        fn: function(){
            var el = Ext.FocusManager.focusedCmp;
            if (el.xtype === 'tab' && el.closable) {
                el.up().focus();
                el.destroy();
            }
        },
        scope: this
    }

We've configured which key presses we're listening for and get which component is currently focused with the Focus Manager's {@link Ext.FocusManager#focusedCmp focusedCmp} property. If the currently focused component is a tab and it's closable, then we set the focus to the parent panel and destroy the tab.

### Fixing the Grid

You may have noticed that when we try to focus a row in the grid it isn't possible without the mouse. If you look in the console we get a clue as to why this is, it reports that "pos is undefined". The click event passes information on the record, including what its position in the grid is. However, using the FocusManager, it doesn't pass this information so we need to emulate it by passing an object that specifies the `row` and `column` properties. Do the following underneath the `viewport` variable:

    var easttab = Ext.getCmp('easttab');

    var gridMap = Ext.create('Ext.util.KeyMap', 'eastPanel', [
        {
            key: '\r', // Return key
            fn: function() {
                easttab.getSelectionModel().setCurrentPosition({row: 0, column: 1});
            },
            scope: 'eastPanel'
        },
        {
            key: Ext.EventObject.ESC,
            fn: function() {
                easttab.el.focus();
            },
            scope: 'eastPanel'
        }
    ]);

Try this and you'll see that we can successfully enter and exit the grid using the keyboard. It's important that we specify the `scope` on these keys otherwise you won't be able to escape from the grid.

### Toggling Keyboard Mapping

A useful feature of `KeyMap` is that it can easily be enabled or disabled. It could be that you don't want most users of your application to have a focus frame when they click on an element, so you could make a button (or another `KeyMap`) that enables this behavior.

If you wanted to add a global key press that would turn on and off keyboard navigation you could do so with the following:

    var initMap = Ext.create('Ext.util.KeyMap', Ext.getBody(), {
        key: Ext.EventObject.T, // T for toggle
        shift: true,
        fn: function(){
            map.enabled ? map.disable() : map.enable();
            Ext.FocusManager.enabled ? Ext.FocusManager.disable() : Ext.FocusManager.enable(true);
        }
    });

We've created a new `KeyMap` that will turn off keyboard navigation with shift+t and turn it back on with the same. We aren't able to use the existing `KeyMap` because it would be turning itself off and wouldn't be able to be reinitialized.

## Conclusion

We've converted a complex series of panels that would have otherwise been inaccessible to use the keyboard. We've also encountered some examples where we've had to add some custom functionality on top of the Focus Manager.

With `KeyMap`, we've learnt that we can jump to different Panels as well as invoke any functionality that we'd usually write with a keystroke. Finally, with `KeyNav` we've seen how easy it is to move around an application with arrow keys.
