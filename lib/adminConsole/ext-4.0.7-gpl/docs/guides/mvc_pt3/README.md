# Architecting Your App in Ext JS 4, Part 3

In the previous series of articles [Part 1](#!/guide/mvc_pt1) and [Part 2](#!/guide/mvc_pt2), we explored architecting a Pandora-style application using the new features of Ext JS 4. We started by applying the Model-View-Controller architecture to a complex UI that has multiple views, stores and models. We looked at the basic techniques of architecting your application, like controlling your views from Controllers, and firing application-wide events that controllers can listen to. In this part of the series, we will continue implementing controller logic inside of the application’s MVC architecture.

## Getting References

Before we continue implementing our application, we should review some of the more advanced functionality available in the Ext JS 4 MVC package. In the previous part of this series, we showed how you could automatically load **stores** and **models** in your application by adding them to the stores and models arrays in your Ext.application configuration. We also explained that an instance would be created for each store loaded in this way, giving it a storeId equal to its name.

### `app/Application.js`

    Ext.application({
        ...
        models: ['Station', 'Song'],
        stores: ['Stations', 'RecentSongs', 'SearchResults']
        ...
    });

In addition to loading and instantiating these classes, adding stores and models into these arrays also automatically creates getters for you. This is also the case for controllers and views. The stores, models, controllers and views configurations also exist in Controllers and work exactly the same way as they do in the Application instance. This means that in order to get a reference to the Stations store inside of the Station controller, all we need to do is add the store to the stores array.

### `app/controller/Station.js`

    ...
    stores: ['Stations'],
    ...

Now we can get a reference to the Stations store from anywhere in the controller using the automatically generated getter named `getStationsStore`. The convention is straightforward and predictable:

    views: ['StationsList'] // creates getter named 'getStationsListView' -> returns reference to StationsList class
    models: ['Station']     // creates getter named 'getStationModel'     -> returns reference to Station model class
    controllers: ['Song']   // creates getter named 'getSongController'   -> returns the Song controller instance
    stores: ['Stations']    // creates getter named 'getStationsStore'    -> returns the Stations store instance

It’s important to note that the getters for both views and models return a reference to the class (requiring you to instantiate your own instances), while the getters for stores and controllers return actual instances.

## Referencing view instances

In the previous section, we described how the stores, models, controllers and views configurations automatically create getters allowing you to easily retrieve references to them. The `getStationsListView` getter will return a reference to the view class. In our application flow, we would like to select the first item in our StationsList. In this case, we don’t want a reference to the view class; instead, we want a reference to the actual StationsList instance that is inside our viewport.

In Ext JS 3, a very common approach to getting a reference to an existing component instance on the page was the Ext.getCmp method. While this method continues to work, it’s not the recommended method in Ext JS 4. Using {@link Ext#getCmp Ext.getCmp} requires you to give every component a unique ID in order to reference it in your application. In the new MVC package, we can put a reference to a view instance (component) inside of a controller by leveraging a new feature in Ext JS 4: {@link Ext.ComponentQuery ComponentQuery}.

### `app/controller/Station.js`

    ...
    refs: [{
        // A component query
        selector: 'viewport > #west-region > stationslist',
        ref: 'stationsList'
    }]
    ...

In the `refs` configuration, you can set up references to view instances. This allows you to retrieve and manipulate components on the page inside of your controller’s actions. To describe the component that you want to reference, you can use a ComponentQuery inside the selector property. The other required information inside of this object is the `ref` property. This will be used as part of the name of the getter that will be generated automatically for each item inside the refs array. For example, by defining `ref: 'stationsList'` (note the capital L), a getter will be generated on the controller called `getStationsList`. Alternatively, if you did not set up a reference inside your controller, you could continue to use `Ext.getCmp` inside of the controller actions. However, we discourage you from doing this because it forces you to manage unique component ID's in your project, often leading to problems as your project grows.

It’s important to remember that these getters will be created independent of whether the view actually exists on the page. When you call the getter and the selector successfully matches a component on the page, it caches the result so that subsequent calls to the getter will be fast. However, when the selector doesn’t match any views on the page, the getter will return null. This means that if you have logic that depends on a view and there is a possibility that the view does not exist on the page yet, you need to add a check around your logic to ensure it only executes if the getter returned a result. In addition, if multiple components match the selector, only the first one will be returned. Thus, it’s good practice to make your selectors specific to the single view you wish to get. Lastly, when you destroy a component you are referencing, calls to the getter will start returning null again until there is another component matching the selector on the page.

## Cascading your controller logic on application launch.

When the application starts, we want to load the user’s existing stations. While you could put this logic inside of the application’s `onReady` method, the MVC architecture provides you with an `onLaunch` method which fires on each controller as soon as all the controllers, models and stores are instantiated, and your initial views are rendered. This provides you with a clean separation between global application logic and logic specific to a controller.

### Step 1
### `app/controller/Station.js`

    ...
    onLaunch: function() {
        // Use the automatically generated getter to get the store
        var stationsStore = this.getStationsStore();
        stationsStore.load({
            callback: this.onStationsLoad,
            scope: this
        });
    }
    ...

The onLaunch method of the Station controller seems like the perfect place to call the Station store’s load method. As you can see, we have also set up a callback which gets executed as soon as our store is loaded.

### Step 2
### `app/controller/Station.js`

    ...
    onStationsLoad: function() {
        var stationsList = this.getStationsList();
        stationsList.getSelectionModel().select(0);
    }
    ...

In this callback we get the StationsList instance using the automatically generated getter, and select the first item. This will trigger a `selectionchange` event on the StationsList.

### Step 3
### `app/controller/Station.js`

    ...
    init: function() {
        this.control({
            'stationslist': {
                selectionchange: this.onStationSelect
            },
            ...
        });
    },

    onStationSelect: function(selModel, selection) {
        this.application.fireEvent('stationstart', selection[0]);
    },
    ...

Application events are extremely useful when you have many controllers in your application that are interested in an event. Instead of listening for the same view event in each of these controllers, only one controller will listen for the view event and fire an application-wide event that the others can listen for. This also allows controllers to communicate to one another without knowing about or depending on each other’s existence. In the `onStationSelect` action, we fire an application event called `stationstart`.

### Step 4
### `app/controller/Song.js`

    ...
    refs: [{
        ref: 'songInfo',
        selector: 'songinfo'
    }, {
        ref: 'recentlyPlayedScroller',
        selector: 'recentlyplayedscroller'
    }],

    stores: ['RecentSongs'],

    init: function() {
        ...
        // We listen for the application-wide stationstart event
        this.application.on({
            stationstart: this.onStationStart,
            scope: this
        });
    },

    onStationStart: function(station) {
        var store = this.getRecentSongsStore();

        store.load({
            callback: this.onRecentSongsLoad,
            params: {
                station: station.get('id')
            },
            scope: this
        });
    }
    ...

As part of the init method of the Song controller, we have set up a listener to the `stationstart` application event. When this happens, we need to load the songs for this station into our RecentSongs store. We do this in the `onStationStart` method. We get a reference to the RecentSongs store and call the load method on it, defining the controller action that needs to get fired as soon as the loading has finished.

### Step 5
### `app/controller/Song.js`

    ...
    onRecentSongsLoad: function(songs, request) {
        var store = this.getRecentSongsStore(),
            selModel = this.getRecentlyPlayedScroller().getSelectionModel();

        selModel.select(store.last());
    }
    ...

When the songs for the station are loaded into the RecentSongs store, we select the last song in the RecentlyPlayedScroller. We do this by getting the selection model on the RecentlyPlayedScroller `dataview` and calling the select method on it, passing the last record in the RecentSongs store.

### Step 6
### `app/controller/Song.js`

    ...
    init: function() {
        this.control({
            'recentlyplayedscroller': {
                selectionchange: this.onSongSelect
            }
        });
        ...
    },

    onSongSelect: function(selModel, selection) {
        this.getSongInfo().update(selection[0]);
    }
    ...

When we select the last song in the scroller, it will fire a `selectionchange` event. In the control method, we already set up a listener for this event; and in the onSongSelect method, we complete the application flow by updating the data in the SongInfo view.

## Starting a new station

Now, it becomes pretty easy to implement additional application flows. Adding logic to create and select a new station looks like:

### `app/controller/Station.js`

    ...
    refs: [{
        ref: 'stationsList',
        selector: 'stationslist'
    }],

    init: function() {
        // Listen for the select event on the NewStation combobox
        this.control({
            ...
            'newstation': {
                select: this.onNewStationSelect
            }
        });
    },

    onNewStationSelect: function(field, selection) {
        var selected = selection[0],
            store = this.getStationsStore(),
            list = this.getStationsList();

        if (selected && !store.getById(selected.get('id'))) {
            // If the newly selected station does not exist in our station store we add it
            store.add(selected);
        }

        // We select the station in the Station list
        list.getSelectionModel().select(selected);
    }
    ...

## Summary

We have illustrated that by using some advanced controller techniques and keeping your logic separate from your views, the application’s architecture becomes easier to understand and maintain. At this stage, the application is already quite functional. We can search for and add new stations, and we can start stations by selecting them. Songs for the station will be loaded, and we show the song and artist information.

We will continue to refine our application in the next part of this series, with the focus on styling and custom component creation.

[Download project files](guides/mvc_pt3/code.zip)