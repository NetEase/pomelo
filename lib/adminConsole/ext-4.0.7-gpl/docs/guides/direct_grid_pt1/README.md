Mapping a Grid to a MySQL table using Direct and PHP Part 1
===========================================================

I. Introduction
---------------
In this tutorial we will be looking at how to build a table, or 'grid', that receives its data from a MySQL database. It's aimed at people who have some familiarity with JavaScript, PHP and MySQL but are new to the Ext JS framework. By the end of the tutorial, we'll have a grid component that looks like this:

{@img grid-full.png The finished product}

II. Getting Started
-------------------
### 1.1 Requirements

You will need:

*   A server with PHP (5.3+) and MySQL (4.1.3+) installed
*   A browser compatible with Ext JS 4
*   A text editor

### 1.2 What is Ext Grid?
A grid in Ext JS is "essentially a supercharged `<table>`" to quote [its documentation](#!/api/Ext.grid.Panel). It allows you to manipulate data by sorting and filtering, and to fetch new data in, so it's much more dynamic than your run-of-the-mill table. As you can imagine, this allows you to do some pretty cool things.

### 1.3 What is Ext Direct?
Ext Direct provides a way to communicate between the browser and server using less code than traditional methods (i.e. PHP) to actually _do_ stuff with your data.

### 1.4 What's the Benefit of Doing This?
There are a number of benefits to using Ext Direct to handle your data:

 - It's platform agnostic, so it doesn't matter whether you're using PHP, Java or C\# to serve the data.
 - You can serve _as much_ data as you want, with no negative client-side impacts.
 - It has [3 types of 'providers'](#!/api/Ext.direct.Manager), that communicate with the server in different ways, we will be using the `RemotingProvider`.
 - It can bundle your AJAX requests into a single request (by default, all those sent in the first 10ms) and so the server only has to send back one response.

Now that we've all been persuaded, lets get to building it.

III. Setting Up
---------------
Following the best practices for an Ext application highlighted in the [getting started guide](#/guide/getting_started), we can set up a skeleton directory structure with an index.html file and a blank JavaScript file called grid.js.

index.html

    <!DOCTYPE html>
    <html>
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
        <title>List of Velociraptor Owners</title>
        <!--Ext JS-->
        <link rel="stylesheet" type="text/css" href="resources/css/ext-all.css">
        <script src="extjs/ext-all-debug.js"></script>
        <!--Application JS-->
        <script src="grid.js"></script>
        <script src="php/api.php"></script>
    </head>
    <body>
    </body>
    </html>

Because we're using the HTML5 document type we're allowed to omit the type in a script tag. It assumes that all `<script>` tags will be JavaScript which helps cut down our bytes. However, you've probably also noticed the peculiar api.php file, surely that can't be JavaScript? All will be explained.

Now that the index is pointing to all the right places, unzip your copy of Ext 4 into a folder called 'extjs'. We are now ready to start building the application.

IV. Writing the Application
---------------------------
We'll start by writing the JavaScript portion to give us something to look at when we start trying to debug the PHP side of the app. Within grid.js we first want to declare what parts of the Ext framework we'll be dealing with, this will probably be a familiar process to ActionScript and Java users but for the rest of us, it's very simple. Because I've seen into the future, I know that we'll be using Ext Direct, Ext Data and Ext Grid, to display the data so we require the following:

### `grid.js`

    Ext.require([
        'Ext.direct.*',
        'Ext.data.*',
        'Ext.grid.*'
    ]);

The asterisk ('`*`') in this context loads all of the classes within those areas of Ext JS, we could optimize it at the end by only requiring the classes that we use. We then want to make a pretty grid to look at, but first, a slight digression.

### 4.1 Models and Stores, An Overview
(You can skip this section if you're already familiar with the concept of models and stores)

Models and stores are key to presenting users with dynamic data. A 'model' is a blueprint of what a store will look like. Say you have a menu of beers, the model would define what headings to expect, in this case: type (ale, stout, etc.), name, price, and ABV (alcohol by volume). The 'store' will then contain the individual properties, so, Type: 'Ale', Name: 'Jewel', Price: $4.00, ABV: 5.0%. Stores can be represented in many ways and come from many sources but ultimately end up being converted to JSON for use with Ext.

### 4.2 Back to the App

To create a model we write the following:

### `grid.js`

    Ext.define('PersonalInfo', {
        extend: 'Ext.data.Model',
        fields: ['id', 'name', 'address', 'state']
    });

What we've done here is give it a name (PersonalInfo), told it that this _extends_ Ext.data.Model, (thankfully we don't need to write all of the necessary code to get a model working, we simply tell it that this extends what the Ext JS framework already provides) and told it what fields (headings) we're going to present to it. All exciting stuff, I'm sure you'll agree.

Now, we don't want the JavaScript that renders the grid to initiate before the framework has loaded, this is increasingly important with browsers running JavaScript at near-native speeds. To get around this, we want to use `Ext.onReady`, this will wait for Ext to be fully loaded and the DOM to be fully initialized before we start trying to put our grid on it.

### `grid.js`

    Ext.onReady(function() {
        // Create the Grid
        Ext.create('Ext.grid.Panel', {
            store: {
                model: 'PersonalInfo',
                autoLoad: true,
                proxy: {
                    type: 'direct',
                }
            },
            columns: [{
                dataIndex: 'id',
                width: 50,
                text: 'ID'
            }],
            height: 450,
            width: 700,
            title: 'Velociraptor Owners',
            renderTo: Ext.getBody()
        });
    });

Once the DOM is ready we use `Ext.create` to make a new grid. A grid requires a store, otherwise it won't have a purpose. We will give it a store that uses the model we defined earlier with the name of 'PersonalInfo' and use the proxy type `direct` to tell it that we'll be using Ext Direct. A proxy tells the application how we'll be communicating with the store. There are many different types which you can find more information [here](#!/api/Ext.data.proxy.Proxy).

We then gave the grid a single column (wrapped in an array as we'll be adding more later) with the properties of width and text. The only part that may be unfamiliar here is `dataIndex` - this is what binds the column with the store, so it has to have the same name. After that, everything should be self-explanatory apart from `renderTo: Ext.getBody()`. This is a function that gets the body of the document and will attach the grid to it. Remember that we wrap it all in the `onReady` function? That is so that we don't try to attach it to `<body>` before `<body>` exists.

Hopefully, your efforts will be rewarded with this when you refresh the page:

{@img grid-bare.png The grid laid bare}

### 4.3 Working with MySQL
Now that we have a basic grid working, we'll move on to serving up some data. For our example, we'll be listing everyone that owns a Velociraptor in the USA. You'd expect this to be a fairly small dataset - it's not. [Download and execute this .sql file](guides/direct_grid_pt1/grid-tutorial.sql) and you'll know who to steer clear of. Disclaimer, all of this data has been automatically generated by a dummy data script, any correlations with reality is purely coincidental.

If all went well, you should now have a MySQL table populated with 1,000 records which we'll display in our grid.

In the root directory of our app, create a folder called `php` followed by another one inside it called `classes`. Within classes create a file called `QueryDatabase.php`.

We'll be taking advantage of PHP's MySQLi extension which works with MySQL 4.1.3 and above (any version released after mid-2004 will work fine).

First, we'll make a new class and declare some variables:

### `QueryDatabase.php`

    <?php
    class QueryDatabase
    {
        private $_db;
        protected $_result;
        public $results;

    }

_Within_ this class, we want to make a function that will connect to the database, (note that you don't write the ..., it's to denote that this block of code continues on from the last one).

### `QueryDatabase.php`

    ...
    public function __construct()
    {
        $_db = new mysqli('host', 'username' ,'password', 'database');

        if ($_db->connect_error) {
            die('Connection Error (' . $_db->connect_errno . ') ' . $_db->connect_error);
        }

        return $_db;
    }

On line 10, replace 'hostname', 'username', 'password' and 'database' with your own configuration. If this all looks a little alien to you, yet you're used to PHP, it uses a style called 'object-oriented' programming, you can [read more about it online](https://encrypted.google.com/search?q=object+oriented+php). The `->` is called an arrow operator and gets a method (aka a function) from that object. So we're calling the `connect_error` and `connect_errno` functions from the `mysqli` object in this script with the arrow operators.

We also want to close the database connection once we're done with it which is simply enough done with:

### `QueryDatabase.php`

    ...
    public function __destruct()
    {
        $_db = $this->__construct();
        $_db->close();

        return $this;
    }

Notice in the parenthesis we've put `$_db`? This means that this function is going to expect a parameter passed to it, i.e. it's expecting `$_db` otherwise it'll have nothing to close.

Now we've got a connection to our database opening and closing we can query it. To do this, we'll create a new function called getResults.

### `QueryDatabase.php`

    ...
    public function getResults($params)
    {
        $_db = $this->openConnection();

        $_result = $_db->query("SELECT id, name, address, state FROM owners") or die('Connect Error (' . $_db->connect_errno . ') ' . $_db->connect_error);

        $results = array();

        while ($row = $_result->fetch_assoc()) {
            array_push($results, $row);
        }

        $this->closeConnection($_db);

        return $results;
    }

That's all for our first PHP file. To recap, we declared some variables at the top of the class and then made 3 functions that will help us as we expand our application. The first function defines the database to use with the credentials needed to access it and fails if it cannot connect (hopefully providing a detailed error message). The second is a simple function that closes the database connection.

The third function uses the first function to open a connection and queries the database for all of the records from the fields: 'id', 'name', 'address' and 'state'. We could have used the wildcard operator (`*`) to do the same, but in larger tables you'll probably only want to reveal a subset of fields so it's better to specify them individually. We then push all of the results into a an array called `$results` in a while statement, close the connection to the database once we're done and return the results.

### 4.4 The Complicated Bit
Going up a level to the php directory, create a new file called config.php and write the following:

### `config.php`

    <?php
    $API = array(
        'QueryDatabase'=>array(
            'methods'=>array(
                'getResults'=>array(
                    'len'=>1
                ),
            )
        )
    );

This exposes what methods (functions) are available to our Ext application to call on the server. At the moment, there's only one that we want to reveal, the 'getResults' method we just created. That's all there is to our config.php file for now.

To make sure the correct methods are called, we need a router. The router is where the calls from Ext Direct get routed to the correct class using a Remote Procedure Call (RPC).

### `router.php`

    <?php
    require('config.php');

    class Action {
        public $action;
        public $method;
        public $data;
        public $tid;
    }

Here, we've declared a class and required our config file that contains which methods we expose in our API.

### `router.php`

    ...
    $isForm = false;
    $isUpload = false;
    if(isset($HTTP_RAW_POST_DATA)) {
        header('Content-Type: text/javascript');
        $data = json_decode($HTTP_RAW_POST_DATA);
    } else if (isset($_POST['extAction'])) { // form post
        $isForm = true;
        $isUpload = $_POST['extUpload'] == 'true';
        $data = new Action();
        $data->action = $_POST['extAction'];
        $data->method = $_POST['extMethod'];
        $data->tid = isset($_POST['extTID']) ? $_POST['extTID'] : null; // not set for upload
        $data->data = array($_POST, $_FILES);
    } else {
        die('Invalid request.');
    }

    function doRpc($cdata){
        global $API;
        try {
            if(!isset($API[$cdata->action])){
                throw new Exception('Call to undefined action: ' . $cdata->action);
            }

            $action = $cdata->action;
            $a = $API[$action];

            doAroundCalls($a['before'], $cdata);

            $method = $cdata->method;
            $mdef = $a['methods'][$method];
            if(!$mdef){
                throw new Exception("Call to undefined method: $method on action $action");
            }
            doAroundCalls($mdef['before'], $cdata);

            $r = array(
                'type'=>'rpc',
                'tid'=>$cdata->tid,
                'action'=>$action,
                'method'=>$method
            );

            require_once("classes/$action.php");
            $o = new $action();
            if (isset($mdef['len'])) {
                $params = isset($cdata->data) && is_array($cdata->data) ? $cdata->data : array();
            } else {
                $params = array($cdata->data);
            }

            $r['result'] = call_user_func_array(array($o, $method), $params);

            doAroundCalls($mdef['after'], $cdata, $r);
            doAroundCalls($a['after'], $cdata, $r);
        }
        catch(Exception $e){
            $r['type'] = 'exception';
            $r['message'] = $e->getMessage();
            $r['where'] = $e->getTraceAsString();
        }
        return $r;
    }

The doRpc function will provide important information on our data and responses from the server. Basically, if you refresh the page and have a console open you'll see something that looks like this:

{@img firebug-post-result.png Sending a request to router.php and getting a response}

You can see the results of our $r variable clearly laid out. If you've made an error the result is where the PHP error text will be, but when everything's gone to plan you'll see all of the records that we have added to our database stored as JSON. The PHP that converts it to JSON is:

    ...
    function doAroundCalls(&$fns, &$cdata, &$returnData=null){
        if(!$fns){
            return;
        }
        if(is_array($fns)){
            foreach($fns as $f){
                $f($cdata, $returnData);
            }
        }else{
            $fns($cdata, $returnData);
        }
    }

    $response = null;
    if (is_array($data)) {
        $response = array();
        foreach($data as $d){
            $response[] = doRpc($d);
        }
    } else {
        $response = doRpc($data);
    }
    if ($isForm && $isUpload) {
        echo '<html><body><textarea>';
        echo json_encode($response);
        echo '</textarea></body></html>';
    } else {
        echo json_encode($response);
    }

Then create a file called 'api.php'. Remember when we pointed our index.html file to a PHP file but told it that it was JavaScript? This is where the magic happens.

### `api.php`

    <?php
    require('config.php');
    header('Content-Type: text/javascript');

    // convert API config to Ext.Direct spec
    $actions = array();
    foreach ($API as $aname=>&$a) {
        $methods = array();
        foreach ($a['methods'] as $mname=>&$m) {
            if (isset($m['len'])) {
                $md = array(
                    'name'=>$mname,
                    'len'=>$m['len']
                );
            } else {
                $md = array(
                    'name'=>$mname,
                    'params'=>$m['params']
                );
            }
            if (isset($m['formHandler']) && $m['formHandler']) {
                $md['formHandler'] = true;
            }
            $methods[] = $md;
        }
        $actions[$aname] = $methods;
    }

    $cfg = array(
        'url'=>'php/router.php',
        'type'=>'remoting',
        'actions'=>$actions
    );

    echo 'Ext.ns("Ext.app"); Ext.app.REMOTING_API = ';

    echo json_encode($cfg);
    echo ';';

The last two files are taken straight from the example in the Ext Direct directory, made by people much smarter than I (hence the sparse comments).

It uses the config.php file we made earlier and sets it's header to JavaScript, so any output the browser will expect to be JavaScript. It then proceeds to turn our config and router PHP files into JSON so the right method is called when Ext Direct calls it. Further information can be found on the [Ext Direct specification page](http://www.sencha.com/products/extjs/extdirect).

### 4.5 Get it Together
With the hard part now over, the final bits to finish our application are found back in grid.js. We need to tell the proxy what function to call to get the results, tell Ext Direct what type of provider we're using and add the other columns to our grid.

To accomplish this, add the following to the relevant parts of grid.js.

### `grid.js`

    Ext.onReady(function() {
        //add a provider to our grid
        Ext.direct.Manager.addProvider(Ext.app.REMOTING_API);
        ...

        //add directFn to our proxy
        proxy: {
            type: 'direct',
            directFn: QueryDatabase.getResults
        },

        //add the other columns
        columns: [{
            dataIndex: 'id',
            width: 50,
            text: 'ID'
        }, {
            dataIndex: 'name',
            flex: 1,
            text: 'Name'
        }, {
            dataIndex: 'address',
            flex: 1.3,
            text: 'Address'
        }, {
            dataIndex: 'state',
            flex: 1,
            text: 'State'
        }],

We finally tell our application to use the Remoting Provider and `directFn` calls `getResults` as soon as it's run to add our data to the grid.

The columns are largely the same as we did initially apart from `flex`. This dynamically sizes the field relative to the others so a `flex: 1.3` will be slightly larger than `flex: 1` and, together, fill all of the remaining space left over by our fixed width id column.

Refresh your browser and you should have a fully populated grid. If you hover over or click any of the headings you will see that you are able to dynamically sort by any of the fields.

{@img grid-full.png The completed grid in all of it's glory}

V. Conclusion
-------------
In this tutorial, we've learnt the basics of how to utilize Ext Direct while getting experience with how to create Ext grids as well as writing some pretty advanced PHP. Take some time to experiment with other configuration options by [looking at the documentation](#!/api) and getting a feel for what can be achieved and what customizations can be made.

For reference, [here are the working source files](guides/direct_grid_pt1/reference-files.zip).

In the next tutorial, we'll harness a bit more of Ext Direct's power to run server-side functions to create, update and delete from our MySQL database building on top of our current work.