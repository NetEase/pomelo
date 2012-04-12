# Doing CRUD with the Editable Grid

## Part One: Setting up the Stack

The {@link Ext.grid.Panel Grid Panel} is a powerful way to display tabular data. It is an ideal solution for displaying dynamic data from a database. It can also allow users to edit the data displayed in the grid. Changes to the dataset can be easily saved back to the server. This guide describes how to create this functionality using Ext's MVC application architecture. If you're not familiar with this, then I recommend you check out [the guide](#!/guide/application_architecture) for more details.  The first part of this tutorial will cover the setting up of the application on the client and server, to the point where we can read data from the database and display it in the grid. Creating, updating, and deleting the records in the grid will be covered in the second part.

We will be building a database driven application, so we will need:

1. A web server
2. A server-side programming environment
3. A database

Traditionally, this has been done with a LAMP (Linux, Apache, Mysql, PHP) stack, or (on Windows) ASP.NET. For this guide I have decided to use the new kid on the block: [Node.js](http://nodejs.org). In particular, [Express](http://expressjs.com), the Node-based web application framework, provides a quick and easy way both to host static content and a ready-made web application framework. As for the database, [MongoDB](http://mongodb.org) provides a lightweight alternative to relational databases like MySQL or Postgres, which require using SQL. All these technologies are JavaScript based.

One limitation of this toolchain is that it is currently not supported on Windows. Although Node is currently being ported to Windows, this work is not yet complete. Furthermore the Node Package Manager uses Unix features such as symbolic links, and simply does not work on Windows at present. So if you are using Windows, you will need to use a Virtual Machine running Ubuntu (or other linux distro). [VirtualBox](http://virtualbox.org) and [VMWare](https://help.ubuntu.com/community/VMware) are free virtualization solutions. If you are using Mac OS X, or Linux, you will be fine.

Express is built on [Connect](https://github.com/senchalabs/connect), which is a SenchaLabs project. This gives some assurance that it is not going to disappear tomorrow (which may be a concern with something so young). Node.js is growing very rapidly in terms of the number of users, the number of libraries (modules) available and the number of hosting providers which support it. The online documentation is excellent, and the IRC community is apparently also quite helpful. There are also a few books in the works, which should be hitting shelves later this year. It seems that MongoDB is taking off as the [most popular NoSQL database](http://css.dzone.com/news/nosql-job-trends).

### Installation

While a full guide to installation, configuration, and use of Node, NPM, and MongoDB, are beyond the scope of this guide, here are the commands which worked for me.


#### Node.js
I downloaded the latest *stable* source package, which at the time of writing was [node v0.4.11](http://nodejs.org/dist/node-v0.4.11.tar.gz). Then execute the following commands in the folder where the archive was downloaded:

      tar zxvf node-v0.4.11.tar.gz
      cd node-v0.4.11
      ./configure
      make
      sudo make install

The 'make' stage will take a few minutes.

#### NPM

The instructions on the [npm website](http://npmjs.org) say to execute this command:

    curl http://npmjs.org/install.sh | sh

For some reason this does not work for me, even when I add 'sudo' in front of it. So I break the command into the following steps:

    wget http://npmjs.org/install.sh
    chmod +x install.sh
    sudo ./install.sh

'wget' is similar to curl, but a bit simpler to use as it just downloads the URL to a local file. You can install it with 'apt-get install wget' on Ubuntu, or 'brew install wget' on the Mac, if you are using [HomeBrew](http://mxcl.github.com/homebrew/).

#### MongoDB

The installation process is well documented on [the MongoDB website](http://www.mongodb.org/display/DOCS/Quickstart). It should be available though your system package manager. The details of creating a database are covered later in this guide.

#### Express

Now we can simply use npm to install this:

    sudo npm install -g express

## Setting up the Application

### Express Yourself!

The example dataset we will be dealing with is the set of movies which computer geeks like. This is a matter of opinion, hence the editable aspect is important. So we will call the demo app 'geekflicks'. As instructed on the [express website](http://expressjs.com/guide.html), simply create your application using the 'express' command:

    express geekflicks

Which should output that it created the following files:

    create : geekflicks
    create : geekflicks/package.json
    create : geekflicks/app.js
    create : geekflicks/public/javascripts
    create : geekflicks/public/stylesheets
    create : geekflicks/public/stylesheets/style.css
    create : geekflicks/public/images
    create : geekflicks/views
    create : geekflicks/views/layout.jade
    create : geekflicks/views/index.jade

Note that the public/ directory is where the Ext JS application will live.  In order to finish setting up the Express app, we need to also execute this command from within the 'geekflicks' directory:

    npm install -d

This will install the additional Node packages which are required.  The dependencies are defined in the 'package.json' file, which by default looks like this:

    {
        "name": "application-name",
        "version": "0.0.1",
        "private": true,
        "dependencies": {
            "express": "2.4.6",
            "jade": ">= 0.0.1"
        }
    }

For accessing the MongoDB database in our NodeJS app, I've chosen to use [Mongoose](http://mongoosejs.com/) which provides a nice high-level API. Lets add that as an explicit dependency in the package.json file, and change the name of our app while we're at it:

    {
        "name": "geekflicks",
        "version": "0.0.1",
        "private": true,
        "dependencies": {
            "express": "2.4.6",
            "jade": ">= 0.0.1",
            "mongoose": ">= 2.0.0"
        }
    }

Now if we re-execute the 'npm install -d' command, we see that it picks up the additional dependency, and installs it. What actually happens here is that the dependencies are installed in a folder called 'node_modules'. They are not installed globally, which means that our app has its own copy of these modules, which is a Good Thing, as it makes it independent of the global Node modules on your system.

To run our webapp, go into the 'geekflicks' directory, and run the following command:

    node app.js

Which should say that the app is running on port 3000. If you open a browser to [http://localhost:3000](http://localhost:3000), you should see a page with the message: 'Express' and 'Welcome to Express'. How does this work? Well, in the geekflicks/app.js file, there is a definition of a 'route' as follows:

    // Routes
    app.get('/', function (req, res) {
        res.render('index', {
            title: 'Express'
        });
    });

Which says that whenever a request is made to the root of the webserver, it should render the 'index' template in the 'views' directory, using the given data object. This uses the Jade templating system which is bundled into Express. While this is neat, what we want it to do is redirect to the index.html file inside the 'public' folder, which is where we will be building our Ext JS app. We can achieve this using a redirect:

    // Routes
    app.get('/', function (req, res) {
        res.redirect('/index.html');
    });

### Creating the Ext JS Application

Lets create a directory structure for our Ext JS application in the 'public' directory, as described in the [getting started guide](#!/guide/getting_started):

    geekflicks/
      public/
        app/
            controller/
            model/
            store/
            view/
        extjs/
      ...

The extjs/ folder has the ExtJS 4 SDK (or a symlink to it). In the GeekFlicks folder, we create a index.html file with the following:

    <!doctype html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Editable Grid</title>
      <link rel="stylesheet" href="extjs/resources/css/ext-all.css">
      <script src="extjs/ext-all-debug.js"></script>
      <script>
        Ext.Loader.setConfig({
            enabled: true
        });
      </script>
      <script type="text/javascript" src="app.js"> </script>
    </head>
    <body>

    </body>
    </html>

I'm using the HTML5 recommended syntax here, though this is not necessary. Also, note that I have included 'ext-all-debug.js' not 'ext.js'. This ensures that all the Ext JS classes are available immediately after the app is loaded, rather than loading each class file dynamically, which is what would occur if you used 'ext.js' (or ext-debug.js). The grid does require a large number of classes, and this tends to slow down the initial page load, and clutter up the class list with a bunch of classes, which makes finding your own classes harder. However the MVC Application class does require the Loader to be enabled, and it is disabled by default when you use the 'ext-all' version. So I've manually re-enabled it here.

The app.js has this:

    Ext.application({
        name: "GeekFlicks",
        appFolder: "app",
        launch: function () {
            Ext.create('Ext.container.Viewport', {
                layout: 'fit',
                items: [{
                    xtype: 'panel',
                    title: 'Flicks for Geeks',
                    html: 'Add your favorite geeky movies'
                }]
            });
        }
    });

So now if you stop the Express webserver (by typing Ctrl-C in the terminal where you issued the 'node app.js' command) and restarting it (by issuing the 'node app.js' command again ) and navigate to [http://localhost:3000](http://localhost:3000) (or refresh the browser), you should see a panel with the title "Flicks for Geeks" and the text "Add your favorite geeky movies" beneath it. If not, check the console for errors.. perhaps something got misplaced. Now we still don't have a Grid panel anywhere in sight, so lets remedy that.

### The View & Viewport

Now lets setup the MVC components of our application, rather than have it all in one file. This will allow us to take advantage of the features of Ext JS 4's Application framework. Create a view for the editable data grid in the 'views' folder, called 'Movies', with the following code:

    Ext.define('GeekFlicks.view.Movies', {
        extend: 'Ext.grid.Panel',
        alias: 'widget.movieseditor',

        initComponent: function () {

            // Hardcoded store with static data:
            this.store = {
                fields: ['title', 'year'],
                data: [{
                    title: 'The Matrix',
                    year: '1999'
                }, {
                    title: 'Star Wars: Return of the Jedi',
                    year: '1983'
                }]
            };

            this.columns = [{
                header: 'Title',
                dataIndex: 'title',
                flex: 1
            }, {
                header: 'Year',
                dataIndex: 'year',
                flex: 1
            }];

            this.callParent(arguments);
        }
    });

This creates a new view class called 'Movies' which extends the grid panel and hardcodes some data in a store, which is simply declared inline. This will be refactored later, but is enough to get us going for now.  Additionally, instead of creating the Viewport manually in the app.js file when the 'launch' event fires, we can create the main viewport of our application as a separate class called 'Viewport.js' in the view/ folder. It includes the Movies view we just created, using its xtype:

    Ext.define('GeekFlicks.view.Viewport', {
        extend: 'Ext.container.Viewport',

        layout: 'fit',

        items: [{
            xtype: 'panel',
            title: 'Top Geek Flicks of All Time',
            items: [{
                xtype: 'movieseditor'
            }]
        }]
    });

In order for the Viewport to be loaded automatically when the application launches, we set the 'autoCreateViewport' property to true in app.js (see next section for a listing of it).

### The Controller

Now lets create the controller, in the 'controller' folder, as follows:

    Ext.define("GeekFlicks.controller.Movies", {
        extend: 'Ext.app.Controller',

        views: [
            'Movies'
        ],

        init: function () {
            this.control({
                'movieseditor': {
                    render: this.onEditorRender
                }
            });
        },

        onEditorRender: function () {
            console.log("Movies editor was rendered");
        }
    });

This sets up a controller for the view we just created, by including it in the `views` array.  The `init()` method is automatically called by the Application when it starts. The `{@link Ext.app.Controller#method-control control()}` method adds the `onEditorRender` event listener to the movies editor grid which was selected by the {@link Ext.ComponentQuery ComponentQuery} expression `movieseditor` (which selects components with that xtype, or 'alias'). This is nice because it means the view does not have to know anything about the Controller (or the Model) and so it can potentially be reused in more than one context.

So now we have added a view, and a controller to listen for its events. Now we need to tell the Application about it. We set the `controllers` array to contain the `Movies` controller. Our main app.js file now looks like this.

    Ext.application({

        name: "GeekFlicks",
        appFolder: "app",

        autoCreateViewport: true,

        controllers: [
            'Movies'
        ]
    });


Now, when you refresh your browser, you should see the actual grid panel show up with the data we hardcoded into the view. Next we will refactor this to make this data load dynamically.

### The Model

The Model element of the MVC trinity consists of a few classes with specific responsibilities. They are:

* The Model: defines the schema of the data (think of it as a data-model or object-model)
* The Store: stores records of data (which are defined by the Model)
* The Proxy: loads the Store from the server (or other storage) and saves changes

These are covered in more detail in the [data package guide](#!/guide/data). So lets define our data, first by creating `Movie.js` in the 'model' folder:

    Ext.define('GeekFlicks.model.Movie', {
        extend: 'Ext.data.Model',

        fields: [{
            name: 'title',
            type: 'string'
        }, {
            name: 'year',
            type: 'int'
        }]
    });

Then, in `store/Movies.js`, add the following:

    Ext.define('GeekFlicks.store.Movies', {
        extend: 'Ext.data.Store',
        model: 'GeekFlicks.model.Movie',

        data: [{
            title: 'The Matrix',
            year: '1999'
        }, {
            title: 'Star Wars: Return of the Jedi',
            year: '1983'
        }]
    });

Which is just copied from the View, where it was previously set in the `initComponent()` method. The one change is that instead on the fields being defined inline, there is a reference to the Model we just created, where they are defined. Let's now clean up the view to reference our store... change the contents of the `view/Movies.js` to:

    Ext.define('GeekFlicks.view.Movies', {
        extend: 'Ext.grid.Panel',
        alias: 'widget.movieseditor',

        store: 'Movies',

        initComponent: function () {
            // Note: store removed
            this.columns = [{
                header: 'Title',
                dataIndex: 'title',
                flex: 1
            }, {
                header: 'Year',
                dataIndex: 'year',
                flex: 1
            }];

            this.callParent(arguments);
        }
    });

Note that the `store` configuration property was set to 'Movies' which will cause an instance of the Movies store to be instantiated at run time, and assigned to the grid.

The Controller also needs to know about the Model and Store, so we tell it about them by adding a couple of config items, named (surprise!) `models` and `stores`:

    Ext.define("GeekFlicks.controller.Movies", {
        extend: 'Ext.app.Controller',

        models: ['Movie'],
        stores: ['Movies'],
        views:  ['Movies'],

        init: function () {
            this.control({
                'movieseditor': {
                    render: this.onEditorRender
                }
            });
        },

        onEditorRender: function () {
            console.log("movies editor was rendered");
        }
    });

## The Proxy and the Server

We still have hard-coded data in our Store, so lets fix that using a {@link Ext.data.proxy.Proxy Proxy}. The proxy will load the data from our Express app. Specifically, it will access the URL `/movies`. We must define this as a route in `geekflicks/app.js`. The first version of this simply echoes back a JSON representation of the current movies. Here is the new route definition:

      app.get('/movies', function (req, res) {
          res.contentType('json');
          res.json({
              success: true,
              data: [{
                  title: "The Matrix",
                  year: 1999
              }, {
                  title: "Star Wars: Return of the Jedi",
                  year: 1983
              }]
          });
      });


The format here is significant: the JSON response must be a single object, with a `success` property, and a `data` property, which is an array of records matching the definition of the Model. Actually you can customize these properties by configuring your Proxy's `{@link Ext.data.proxy.Proxy#cfg-reader reader}` differently, but the important thing is that the server sends the same names which the {@link Ext.data.reader.Reader Reader} is expecting.  Now this data is still hardcoded - just on the server-side. In the next section we will be reading this out of a database. But at least we can remove the hardcoded data from our store, and replace it with the Proxy definition:

    Ext.define('GeekFlicks.store.Movies', {
        extend: 'Ext.data.Store',

        autoLoad: true,
        fields: ['title', 'year'],

        // Data removed, instead using proxy:
        proxy: {
            type: 'ajax',
            url: '/movies',
            reader: {
                type: 'json',
                root: 'data',
                successProperty: 'success'
            }
        }
    });

If you restart the server app, and reload the page, you should see the grid with the first two movies in it.

### Setting up the Database

For our app to be truly dynamic and interactive, we'll need a database to store our movies in. Because of its simplicity and JavaScript syntax, we will be using MongoDB for this demo. If you haven't installed it as described at the start of this guide, you should do that now. Once you have the `mongodb` daemon running, typing `mongo` will put you into a MongoDB console where you can create a new database and collection (similar to a table in SQL). You can then insert the default movies using a nice JavaScript API, as follows (you just type the commands on the lines starting with '>' which is the mongo prompt.)

      $ mongo
      MongoDB shell version: 2.0.0
      connecting to: test
      > use example
      switched to db example
      > db.movies.insert({title: "The Matrix", year: 1999});
      > db.movies.insert({title: "Star Wars", year: 1977});
      > db.movies.find();
      { "_id" : ObjectId("4e7018a79abdbdfb5d235b6c"), "title" : "The Matrix", "year" : 1999 }
      { "_id" : ObjectId("4e7018dd9abdbdfb5d235b6d"), "title" : "Star Wars", "year" : 1977 }
      > quit()

The find() command is like SQL `select *`. It returns all members of the collection, which confirms that the rows were added as expected. Note that they have also been given a unique id. Now that the data is in the database, we just need to pull it out with our Node JS app. This can be done by using Mongoose to define a model, and then modifying the `/movies` route in `app.js` to query it:

    var mongoose = require('mongoose'),

    db = mongoose.connect('mongodb://127.0.0.1/example'),

    //create the movie Model using the 'movies' collection as a data-source
    movieModel = mongoose.model('movies', new mongoose.Schema({
        title: String,
        year: Number
    }));

    //...

    app.get('/movies', function (req, res) {
        movieModel.find({}, function (err, movies) {
            res.contentType('json');
            res.json({
                success: true,
                data: movies
            });
        });
    });

After restarting the server (this will need to be done to see any change to the server code, but not after changing Ext JS code only) the index page of our app will show the movies we entered into the database above. Note the change to the Star Wars film title and date. This is what the app should look like at this point:

{@img geekflicks_readonly.png}

Admittedly, it is not very exciting, as it simply displays the data from the database. However, we have set up a full web stack from the database to the UI, using NodeJS and the Ext JS 4 Application framework. Now we are in a good position to add more functionality to the app, specifically creating new movies and updating or deleting existing ones. This will be described in part two of this tutorial.

[Download project files](guides/editable_grid/geekflicks.zip)