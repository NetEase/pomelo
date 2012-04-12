# Getting Started

## 1. Requirements

### 1.1 Web Browsers

Ext JS 4 supports all major web browsers, from Internet Explorer 6 to the latest version of Google Chrome. During development, however, we recommend that you choose one of the following browsers for the best debugging experience:

- [Google Chrome](http://www.google.com/chrome/) 10+
- [Apple Safari](http://www.apple.com/safari/download/) 5+
- [Mozilla Firefox](http://www.mozilla.com/en-US/firefox/fx/) 4+ with the [Firebug](http://getfirebug.com/) Web Development Plugin

This tutorial assumes you are using the latest version of Google Chrome.  If you don't already have Chrome take a moment to install it, and familiarize yourself with the [Chrome Developer Tools](http://code.google.com/chrome/devtools/docs/overview.html).

### 1.2 Web Server

Even though a local web server is not a requirement to use Ext JS 4, it is still highly recommended that you develop with one, since [XHR](http://en.wikipedia.org/wiki/XHR) over local [file:// protocol](http://en.wikipedia.org/wiki/File_URI_scheme) has [cross origin restriction](http://en.wikipedia.org/wiki/Same_origin_policy) on most browsers.
If you don't already have a local web server it is recommended that you download and install Apache HTTP Server.

- [Instructions for installing Apache on Windows](http://httpd.apache.org/docs/current/platform/windows.html)
- [Instructions for installing Apache on Linux](http://httpd.apache.org/docs/current/install.html)
- Mac OS X comes with a build in apache installation which you can enable by navigating to "System Preferences > Sharing" and checking the box next to "Web Sharing".

Once you have installed or enabled Apache you can verify that it is running by navigating to [localhost](http://localhost/) in your browser.  You should see a startup page indicating that Apache HTTP Server was installed successfully and is running.

### 1.3. Ext JS 4 SDK

Download [Ext JS 4 SDK][sdk-download]. Unzip the package to a new directory called "extjs" within your web root directory.  If you aren't sure where your web root directory is, consult the docs for your web server.
Your web root directory may vary depending on your operating system, but if you are using Apache it is typically located at:

- Windows - "C:\Program Files\Apache Software Foundation\Apache2.2\htdocs"
- Linux - "/var/www/"
- Mac OS X - "/Library/WebServer/Documents/"

Once you have finished installing Apache navigate to [http://localhost/extjs/index.html](http://localhost/extjs/index.html) in your browser. If an Ext JS 4 welcome page appears, you are all set.

## 2. Application Structure

### 2.1 Basic Structure

Although not mandatory, all suggestions listed below should be considered as best-practice guidelines to keep your application well organized, extensible and maintainable.
The following is the recommended directory structure for an Ext JS application:

    - appname
        - app
            - namespace
                - Class1.js
                - Class2.js
                - ...
        - extjs
        - resources
            - css
            - images
            - ...
        - app.js
        - index.html

- `appname` is a directory that contains all your application's source files
- `app` contains all your classes, the naming style of which should follow the convention listed in the [Class System](#/guide/class_system) guide
- `extjs` contains the Ext JS 4 SDK files
- `resources` contains additional CSS and image files which are responsible for the look and feel of the application, as well as other static resources (XML, JSON, etc.)
- `index.html` is the entry-point HTML document
- `app.js` contains your application's logic

Don't worry about creating all those directories at the moment.  For now lets just focus on creating the minimum amount of code necessary to get an Ext JS application up and running.
To do this we'll create a basic "hello world" Ext JS application called "Hello Ext".  First, create the following directory and files in your web root directory.

    - helloext
        - app.js
        - index.html

Then unzip the Ext JS 4 SDK to a directory named `extjs` in the `helloext` directory

A typical Ext JS application is contained in a single HTML document - `index.html`.  Open `index.html` and insert the following html code:

    <html>
    <head>
        <title>Hello Ext</title>

        <link rel="stylesheet" type="text/css" href="extjs/resources/css/ext-all.css">
        <script type="text/javascript" src="extjs/ext-debug.js"></script>
        <script type="text/javascript" src="app.js"></script>
    </head>
    <body></body>
    </html>

- `extjs/resources/css/ext-all.css` contains all styling information needed for the whole framework
- `extjs/ext-debug.js` contains a minimal set of Ext JS 4 Core library classes
- `app.js` will contain your application code

Now you're ready to write your application code. Open `app.js` and insert the following JavaScript code:

    Ext.application({
        name: 'HelloExt',
        launch: function() {
            Ext.create('Ext.container.Viewport', {
                layout: 'fit',
                items: [
                    {
                        title: 'Hello Ext',
                        html : 'Hello! Welcome to Ext JS.'
                    }
                ]
            });
        }
    });

Now open your browser and navigate to [http://localhost/helloext/index.html](http://localhost/helloext/index.html). You should see a panel with a title bar containing the text "Hello Ext" and the "welcome" message in the panel's body area.

### 2.2 Dynamic Loading

Open the Chrome Developer Tools and click on the Console option.  Now refresh the Hello Ext application.  You should see a warning in the console that looks like this:

{@img loader-warning-viewport.png testing}

Ext JS 4 comes with a system for dynamically loading only the JavaScript resources necessary to run your app.
In our example `Ext.create` creates an instance of `Ext.container.Viewport`.  When `Ext.create` is called the loader will first check to see if `Ext.container.Viewport` has been defined.
If it is undefined the loader will try to load the JavaScript file that contains the code for `Ext.container.Viewport` before instantiating the viewport object.  In our example the `Viewport.js` file gets loaded successfully, but the loader detects
that files are being loaded in a less-than optimal manner.  Since we are loading the `Viewport.js` file only when an instance of `Ext.container.Viewport` is requested, execution of the code is stopped until that file has been loaded successfully, causing a short delay.
This delay would be compounded if we had several calls to Ext.create,  because the application would wait for each file to load before requesting the next one.

To fix this, we can add this one line of code above the call to `Ext.application`:

`Ext.require('Ext.container.Viewport');`

This will ensure that the file containing the code for `Ext.container.Viewport` is loaded before the application runs.  You should no longer see the `Ext.Loader` warning when you refresh the page.

### 2.3 Library Inclusion methods

When you unzip the Ext JS 4 download, you will see the following files:

1. `ext-debug.js` - This file is only for use during development.  It provides the minimum number of core Ext JS classes needed to get up and running.  Any additional classes should be dynamically loaded as separate files as demonstrated above.

2. `ext.js` - same as `ext-debug.js` but minified for use in production.  Meant to be used in combination with your application's `app-all.js` file. (see section *3*)

3. `ext-all-debug.js` - This file contains the entire Ext JS library.  This can be helpful for shortening your initial learning curve, however `ext-debug.js` is preferred in most cases for actual application development.

4. `ext-all.js` - This is a minified version of `ext-all-debug.js` that can be used in production environments, however, it is not recommended since most applications will not make use of all the classes that it contains.  Instead it is recommended that you create a custom build for your production environment as described in section *3*.

## 3. Deployment

The newly-introduced Sencha SDK Tools ([download here][sdk-download]) makes deployment of any Ext JS 4 application easier than ever. The tools allow you to generate a manifest of all JavaScript dependencies in the form of a JSB3 (JSBuilder file format) file, and create a custom build containing only the code that your application needs.

Once you've installed the SDK Tools, open a terminal window and navigate into your application's directory.

    cd path/to/web/root/helloext

From here you only need to run a couple of simple commands. The first one generates a JSB3 file:

    sencha create jsb -a index.html -p app.jsb3

For applications built on top of a dynamic server-side language like PHP, Ruby, ASP, etc., you can simply replace `index.html` with the actual URL of your application:

    sencha create jsb -a http://localhost/helloext/index.html -p app.jsb3

This scans your `index.html` file for all framework and application files that are actually used by the app, and then creates a JSB file called `app.jsb3`. Generating the JSB3 first gives us a chance to modify the generated `app.jsb3` before building - this can be helpful if you have custom resources to copy, but in most cases we can immediately proceed to build the application with the second command:

    sencha build -p app.jsb3 -d .

This creates 2 files based on the JSB3 file:

1. `all-classes.js` - This file contains all of your application's classes. It is not minified so is very useful for debugging problems with your built application.  In our example this file is empty because our "Hello Ext" application does not contain any classes.

2. `app-all.js` - This file is a minimized build of your application plus all of the Ext JS classes required to run it. It is the minified and production-ready version of `all-classes.js + app.js`.

An Ext JS application will need a separate `index.html` for the production version of the app.  You will typically handle this in your build process or server side logic, but for now let's just create a new file in the `helloext` directory called `index-prod.html`:

    <html>
    <head>
        <title>Hello Ext</title>

        <link rel="stylesheet" type="text/css" href="extjs/resources/css/ext-all.css">
        <script type="text/javascript" src="extjs/ext.js"></script>
        <script type="text/javascript" src="app-all.js"></script>
    </head>
    <body></body>
    </html>

Notice that `ext-debug.js` has been replaced with `ext.js`, and `app.js` has been replaced with `app-all.js`. If you navigate to [http://localhost/helloext/index-prod.html](http://localhost/helloext/index-prod.html) in your browser, you should see the production version of the "Hello Ext" application.

## 4. Further Reading

1. [Class System](#/guide/class_system)
2. [MVC Application Architecture](#/guide/application_architecture)
3. [Layouts and Containsers](#/guide/layouts_and_containers)
4. [Working with Data](#/guide/data)

[sdk-download]: http://www.sencha.com/products/extjs/
