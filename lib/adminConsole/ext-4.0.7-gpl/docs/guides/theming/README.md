# Theming

Ext JS 4 has a brand new theming system to customize the look of your application while still supporting all browsers.

## A Brief Introduction to SASS & Compass

SASS is a pre-processor which adds new syntax to CSS allowing for things like variables, mixins, nesting, and math/color functions. For example, in SASS we can write:

    $blue: #3bbfce;
    $margin: 16px;

    .content-navigation {
        border-color: $blue;
        color: darken($blue, 9%);
    }

    .border {
        padding: $margin / 2;
        margin: $margin / 2;
        border-color: $blue;
    }

And it will compile to:

    .content-navigation {
        border-color: #3bbfce;
        color: #2b9eab;
    }

    .border {
        padding: 8px;
        margin: 8px;
        border-color: #3bbfce;
    }

To see the wide variety of other features available in SASS, please see [http://sass-lang.com/](http://sass-lang.com/). Compass extends SASS by adding a variety of CSS3 mixins and providing the extension system that Ext JS leverages. With Compass, one can include rules like:

    $boxheight: 10em;

    .mybox {
        @include border-radius($boxheight/4);
    }

Which compiles into:

    .mybox {
        -webkit-border-radius: 2.5em;
        -moz-border-radius: 2.5em;
        -o-border-radius: 2.5em;
        -ms-border-radius: 2.5em;
        -khtml-border-radius: 2.5em;
        border-radius: 2.5em;
    }

You can learn more about the pre-included mixins with Compass and the other tools it provides here: [http://compass-style.org/docs/](http://compass-style.org/docs/).

## Requirements

### Ruby

#### Mac OSX

XCode installs Ruby and all necessary dependencies to your Mac when installed.

Xcode can be found on the Apple Developer Website: [http://developer.apple.com/xcode/](http://developer.apple.com/xcode/)

#### Windows

Visit [http://rubyinstaller.org/](http://rubyinstaller.org/) and download the latest packaged version of Ruby (1.9.2 at the time of writing)

### Compass/SASS gem

#### Mac OSX

In `/Applications/Utilities/Terminal.app`, run the following code (you will be asked for your password):

    sudo gem install compass

You can verify you have Compass and Sass installed by running the following in `Terminal.app`:

    compass -v

    sass -v

At the time of writing, the latest version of Compass is `0.11.1 (Antares)`. The latest version of Sass is `3.1.1 (Brainy Betty)`

#### Windows

Select **Start Command Prompt with Ruby** from the new Start Menu option.

Type the following:

    gem install compass

You can verify you have Compass and Sass installed by running the following in **Terminal.app**:

    compass -v
    sass -v

At the time of writing, the latest version of Compass is `0.11.1 (Antares)`. The latest version of Sass is `3.1.1 (Brainy Betty)`

## Directory Structure

The Ext JS SDK comes with a template which can be used as a base for your new theme. If you followed the [Getting Started](#/guide/getting_started) guide, you should have a directory for your application with a subfolder `extjs` containing the Ext JS SDK. It should look something like this:

    appname/
    appname/extjs/
    appname/app.js
    appname/index.html

Copy the template resources folder from `appname/extjs/resources/themes/templates/resource` to your root application folder:

    appname/
    appname/resources/
    appname/resources/css/
    appname/resources/sass/
    appname/resources/sass/config.rb
    appname/resources/sass/my-ext-theme.sass

You will also need to copy the images from `appname/extjs/resources/themes/images/default` to `appname/resources/images`.

Ensure the path to your Ext JS folder is correct in `appname/resources/sass/config.rb`:

    # $ext_path: This should be the path of the Ext JS SDK relative to this file
    $ext_path = "../../extjs"

Due to a bug in Ext JS 4.0.2a you will also need to edit line 62 of `appname/extjs/resources/themes/lib/utils.rb` from this:

    images_path = File.join($ext_path, 'resources', 'themes', 'images', theme)

to this:

    images_path = relative_path

This ensures images will be served from `appname/resources/images` rather than `appname/extjs/resources/images`

## Compiling your CSS

Compiling your CSS is a simple process using Compass.

First, change to your sass directory in `appname/resources/sass`, then run the following command in **Terminal.app on Mac OSX** or **Command Prompt on Windows**:

    > compass compile

This should output the following:

    > create ../css/my-ext-theme.css

Your minified css file should now be in `appname/resources/css/my-ext-theme.css`.

## Changing global SASS variables

The Ext JS theming system comes with global SASS variables which you can use to change the look of your application with a few lines of code.

These SASS variables can be added to your `appname/resources/sass/my-ext-theme.scss` file, but they **must** be inserted before the call to `@import 'ext4/default/all'`. You can see an example commented out at the top of your `my-ext-theme.scss` file:

    // Insert your custom variables here.
    // $base-color: #aa0000;

Try uncommenting this line and changing the base-color to something else, perhaps the green #a1c148.

Now regenerate your theme by navigating to `appname/resources/sass` and running `compass compile`

### Available Variables

Navigate to `appname/extjs/resources/themes/stylesheets/ext4/default/variables` directory. This directory contains all defined variables for each component in Ext JS 4.

The naming convention for variables follows CSS property names, prepends by the component name. For example:

- **Panel border radius**
  - CSS Property: `border-radius`
  - Variable: ``$panel-border-radius``

- **Panel body background color**
  - CSS Property: `background-color`
  - Variable: `$panel-body-background-color`

- **Toolbar background color**
  - CSS Property: `background-color`
  - Variable: `$toolbar-background-color`

You can copy any of these variables and add them to your `appname/resources/sass/my-ext-theme.scss` file **before** the `@import 'ext4/default/all'` line.

## View the Results

To view your new theme, lets overwrite `app.js` with the Theme example from the main SDK. This example shows most Ext JS components on a single page. Copy `appname/extjs/examples/themes/themes.js` to `appname/app.js`.

Update `appname/index.html` to the following:

    <html>
    <head>
        <title>Ext Theme</title>

        <link rel="stylesheet" type="text/css" href="resources/css/my-ext-theme.css">
        <script type="text/javascript" src="extjs/ext-debug.js"></script>
        <script type="text/javascript" src="app.js"></script>
    </head>
    <body></body>
    </html>

Now open `index.html` in your browser and you should see your new theme in action. Try updating the base color in `my-ext-theme.sass` to something else, recompile your sass, and refresh your browser to see the change. Also try experimenting with other sass variables.

## Component UIs

Every component in the Ext JS framework has a `ui` configuration (which defaults to `default`). This property can be changed to allow components in your application to have different styles.

The `ui` of any component can be changed at any time, even after render, by using the `setUI` method. An example of this can be found in `examples/panel/bubble-panel.html`.

### Creating new Ext JS UIs

Some Ext JS components have SASS `@mixin`'s which allow you to quickly generate new UIs. These include: `Ext.panel.Panel`, `Ext.button.Button`, `Ext.Toolbar` and `Ext.window.Window`.

Creating these new UIs is simple. Simply call the associated `@mixin` (found in the documentation) for the component you want to create a new UI for.

Lets look at the Panel `@mixin` as an example (which can be found in `examples/panel/bubble-panel/sass/bubble-panel.scss`):

    @include extjs-panel-ui(
        'bubble',

        $ui-header-font-size: 12px,
        $ui-header-font-weight: bold,
        $ui-header-color: #0D2A59,
        $ui-header-background-color: #fff,
        $ui-header-background-gradient: null,

        $ui-border-color: #fff,
        $ui-border-radius: 4px,
        $ui-body-background-color: #fff,
        $ui-body-font-size: 14px
    );

The above code will create a new `ui` for any Ext.panel.Panel component, which you can then use in your application by specifying the `ui` configuration:

    Ext.create('widget.panel', {
        ui: 'bubble',
        width: 300,
        height: 300,
        title: 'Panel with a bubble UI!'
    });

## Supporting Legacy Browsers

In most cases when creating new UI's, you will want to include background gradients or rounded corners. Unfortunately legacy browsers do not support the corresponding CSS3 properties, so we must use images instead.

With Ext JS 4, we have included a Slicing tool which does the hard work for you. Simply pass it a manifest file of your new UI's (if you have created any) and run the tool from the command line.

### How it works

The slicing tool creates a new browser instance, which loads Ext JS and a specified CSS file. Once loaded, it parses a JavaScript file which includes every Ext JS component that needs styling (panel, window, toolbar, etc.). It then analyzes each of those components and determines the size and location of each image that needs to be sliced. It then slices each of the images, sprites them together and saves them in the location defined in the manifest.

The slicer too itself can be run from the command line and is installed as part of the SDK Tools package. It can be run by calling `sencha slice theme`. Example usage (assuming you are in your application root directory):

    sencha slice theme -d extjs -c resources/css/my-ext-theme.css -o resources/images -v

It accepts several arguments:

- **--css[=]value, -c[=]value**
  > The path to your theme's complete CSS file, e.g., ext-all-access.css. Uses
  > the default Ext JS 4 theme CSS if not provided.

- **--ext-dir[=]value, -d[=]value (required)**
  > The path to the root of your Ext JS 4 SDK directory.

- **--manifest[=]value, -m[=]value**
  > The path to your Theme Generator JSON manifest file, e.g., manifest.json.
  > Uses the default packaged manifest if not provided.

- **--output-dir[=]value, -o[=]value**
  > The destination path to save all generated theme images. This should be inside the `resources/themes/images/<themename>/` directory.
  > Defaults to the current working directory.

- **--verbose, -v**
  > Display a message for every image that is generated.

### Usage

1.  **Compile your CSS**

    You must ensure your SASS theme file has been compiled as this is used for the slicer. Passing no CSS file would result in the slicer to revert to the default ext-all.css file, which would be pointless in most cases.

2.  **Creating your manifest file (optional)**

    The manifest file is a simple JavaScript file which tells the Slicing tool which custom UI's you would like to slice. This step is only necessary when you have created new UI's.

    Let's look at the bubble panel example again:

        Ext.onReady(function() {
            Ext.manifest = {
                widgets: [
                    {
                        xtype: 'widget.header',
                        ui   : 'bubble'
                    },
                    {
                        xtype: 'widget.panel',
                        ui   : 'bubble'
                    }
                ]
            };
        });

    As you can see, you define an Object called `Ext.manifest` and give it an Array property called `widgets`. In this Array you should insert an object containing the `xtype` and `ui` of the component you want to generate the images for.

    **It is important that the `Ext.manifest` Object is defined inside the `Ext.onReady` method.**

3. **Generating your images**

    Now all that is left is to run the command, including the arguments to the Ext JS SDK folder, your theme CSS file and the output directory of the sliced images.

        sencha slice theme -d extjs -c resources/css/my-ext-theme.css -o resources/images -v

## FAQ

 * **I am getting a '`error resources/sass/my-ext-theme.scss (Line 8: File to import not found or unreadable: ext4/default/all)`' error when I compile?**

    > This is because Compass cannot file the Ext JS 4 theme files. Ensure the `$ext_path` in the `sass/config.rb` file is correct.
