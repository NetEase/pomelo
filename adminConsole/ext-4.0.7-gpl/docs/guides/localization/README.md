# Localization in Ext JS
______________________________________________

Creating an application that works is one thing; creating an application that works for your users is something very different. Communicating with users in a language that they understand and with conventions that they're used to is vital.

Imagine this scenario, you hand your phone to a friend in good faith but when they return it, everything's in Japanese. Frustrated, you try to remember which combination of buttons leads you to the Settings menu so you can change it back, navigating through, you realize that menus slide in the opposite direction, maybe even the color scheme is different. You start to realize just how important language and cultural conventions are and how disorienting it is when faced with a localization setting that wasn't meant for you. Now imagine your users, wanting to use your Ext JS application but feeling the same confusion and unsure of what's being asked of them.

To fix this, we go through a process known as 'localization' (sometimes called l10n). A large part of localization is translation and, thankfully, Ext JS makes it easy to localize your application.

## Ext's Localization Files

In the root directory of your copy of Ext JS there is a folder called `locale`. This contains common examples (e.g. day names) in 45 languages ranging from Indonesian to Macedonian. You can inspect the contents of each to see exactly what they contain. Here's an excerpt from the Spanish localization file:

    if (Ext.toolbar.Paging){
        Ext.apply(Ext.PagingToolbar.prototype, {
            beforePageText : "P&#225;gina",
            afterPageText  : "de {0}",
            firstText      : "Primera p&#225;gina",
            prevText       : "P&#225;gina anterior",
            nextText       : "P&#225;gina siguiente",
            lastText       : "Última p&#225;gina",
            refreshText    : "Actualizar",
            displayMsg     : "Mostrando {0} - {1} de {2}",
            emptyMsg       : "Sin datos para mostrar"
        });
    }

Note: The `&#000;` are character entity references which render as special characters, e.g. `&#225;` shows &#225;.

You can see that it checks to see if a {@link Ext.view.BoundList#pagingToolbar Paging toolbar} is in use, and if it is, applies the Spanish strings to each area text is shown. If you have custom text areas you, can append them here as well with the appropriate translations. You'll also notice that it is setting these properties to the Paging Toolbar's prototype. The upshot of this is that every new Paging Toolbar that is created will inherit these translated properties.

## Utilizing Localization

There are two ways you could implement localization in your application: statically or dynamically. We're going to look at how to do it dynamically so users can choose which language they're most familiar with. First, we're going to create a Combobox where users will select their language and secondly, we'll deduce the language from the URL so if a user visits http://yoursite.com/?lang=es the Spanish version of your Ext application is used.

Set up a basic HTML page with links to Ext JS's necessary parts and our localized application's languages.js and app.js files.

    <!DOCTYPE html>
    <html>
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
        <title>Localization example</title>
        <!-- Ext Library Files -->
        <link rel="stylesheet" type="text/css" href="ext/resources/css/ext-all.css">
        <script src="ext/ext-all-debug.js"></script>
        <!-- App Scripts -->
        <script src="languages.js"></script>
        <script src="app.js"></script>
    </head>
    <body>
        <div id="languages"></div>
        <div id="datefield"></div>
    </body>
    </html>

We have two separate JavaScript files: the first will be a list of all the languages that Ext JS comes with, the second will be the application itself. We've also set up two `div` tags, the first will contain the combobox for users to select their language and the second, `datefield`, will have a date picker.

Now create a file called `languages.js`. In this we'll store the languages in an array with two values, the language code and the name of the language like so:

    Ext.namespace('Ext.local');

    Ext.local.languages = [
        ['af', 'Afrikaans'],
        ['bg', 'Bulgarian'],
        ['ca', 'Catalonian'],
        ['cs', 'Czech'],
        ['da', 'Danish'],
        ['de', 'German'],
        ['el_GR', 'Greek'],
        ['en_GB', 'English (UK)'],
        ['en', 'English'],
        ['es', 'Spanish/Latin American'],
        ['fa', 'Farsi (Persian)'],
        ['fi', 'Finnish'],
        ['fr_CA', 'French (Canadian)'],
        ['fr', 'French (France)'],
        ['gr', 'Greek (Old Version)'],
        ['he', 'Hebrew'],
        ['hr', 'Croatian'],
        ['hu', 'Hungarian'],
        ['id', 'Indonesian'],
        ['it', 'Italian'],
        ['ja', 'Japanese'],
        ['ko', 'Korean'],
        ['lt', 'Lithuanian'],
        ['lv', 'Latvian'],
        ['mk', 'Macedonian'],
        ['nl', 'Dutch'],
        ['no_NB', 'Norwegian Bokmål'],
        ['no_NN', 'Norwegian Nynorsk'],
        ['pl', 'Polish'],
        ['pt_BR', 'Portuguese/Brazil'],
        ['pt_PT', 'Portuguese/Portugal'],
        ['ro', 'Romanian'],
        ['ru', 'Russian'],
        ['sk', 'Slovak'],
        ['sl', 'Slovenian'],
        ['sr_RS', 'Serbian Cyrillic'],
        ['sr', 'Serbian Latin'],
        ['sv_SE', 'Swedish'],
        ['th', 'Thai'],
        ['tr', 'Turkish'],
        ['ukr', 'Ukrainian'],
        ['vn', 'Vietnamese'],
        ['zh_CN', 'Simplified Chinese'],
        ['zh_TW', 'Traditional Chinese']
    ];

This is all the languages file will consist of but will serve as a useful reference for our Ext JS application.

Next, we'll start building the application itself. Using the module pattern, we will have four methods: `init`, `onSuccess`, `onFailure` and `setup`.

    Ext.Loader.setConfig({enabled: true});
    Ext.Loader.setPath('Ext.ux', 'ext/examples/ux/');
    Ext.require([
        'Ext.data.*',
        'Ext.tip.QuickTipManager',
        'Ext.form.*',
        'Ext.ux.data.PagingMemoryProxy',
        'Ext.grid.Panel'
    ]);

    Ext.onReady(function() {

        MultiLangDemo = (function() {
            return {
                init: function() {

                },
                onSuccess: function() {

                },
                onFailure: function() {

                },
                setup: function() {

                }
            };
        })();

        MultiLangDemo.init();
    });

To create the {@link Ext.form.field.ComboBox combobox} that will contain all the possible language selections we first need to create an {@link Ext.data.ArrayStore array store} in the `init` function like so.

    var store = Ext.create('Ext.data.ArrayStore', {
        fields: ['code', 'language'],
        data  : Ext.local.languages //from languages.js
    });

This is a very simple store that contains the two fields that correspond to the two values for each record in the `languages.js` file. As we gave it a namespace, we can refer to it as `Ext.local.languages`. You can type this in your browser's console to see what it consists of.

Now create the combobox itself, again, within the `init` function:

    var combo = Ext.create('Ext.form.field.ComboBox', {
        renderTo: 'languages',
        store: store,
        displayField: 'language',
        queryMode: 'local',
        emptyText: 'Select a language...',
        hideLabel: true,
        listeners: {
            select: {
                fn: function(cb, records) {
                    var record = records[0];
                    window.location.search = Ext.urlEncode({"lang":record.get("code")});
                },
                scope: this
            }
        }
    });

If you refresh your browser, you should see a combobox that, when clicked, shows a list of languages bundled with Ext JS. When one of these languages is selected, the page refreshes and appends `?lang=da` (if you chose Danish) to the URL. We'll use this information to display the desired language to the user.

{@img combobox.png}

After the creation of the combobox, we're going to check to see if any language has been previously selected and act accordingly by checking the URL with Ext's {@link Ext#urlDecode urlDecode} function.

    var params = Ext.urlDecode(window.location.search.substring(1));

    if (params.lang) {
        var url = Ext.util.Format.format('ext/locale/ext-lang-{0}.js', params.lang);

        Ext.Ajax.request({
            url: url,
            success: this.onSuccess,
            failure: this.onFailure,
            scope: this
        });

        // check if there's really a language with passed code
        var record = store.findRecord('code', params.lang, null, null, null, true);
        // if language was found in store, assign it as current value in combobox

        if (record) {
            combo.setValue(record.data.language);
        }
    } else {
        // no language found, default to english
        this.setup();
    }

    Ext.tip.QuickTipManager.init();

Note: We're loading the files with an AJAX request, so the files will have to be uploaded to a server otherwise they'll fail to load due to browser security measures.

Here you can see why we have the `onSuccess` and `onFailure` methods. If a language file fails to load then the user must be notified instead of failing silently. First, we'll deal with failed files to make it obvious if debugging is needed; the idea is that if a user types in a nonexistent language code, or for some reason the language has been removed, an alert will be displayed so the user won't be surprised that the application is still in English.

    onFailure: function() {
        Ext.Msg.alert('Failure', 'Failed to load locale file.');
        this.setup();
    },

{@img onfailure.png}

The `onSuccess` method is similar. We evaluate the locale file and then setup the demo knowing that the file has been loaded:

    onSuccess: function(response) {
        eval(response.responseText);
        this.setup();
    },

The AJAX call that we made returns a few parameters. We use JavaScript's `eval` function on `responseText`. `responseText` is the entirety of the locale file that we loaded and `eval` parses all of the JavaScript contained in the string that is `responseText`, that is, applying all of the translated text and thus localizing the application.

However, there's nothing in `setup()` to look at yet so we'll move onto this method next. We're going to start by creating a {@link Ext.menu.DatePicker date picker} that will change based on the chosen language.

    setup: function() {
        Ext.create('Ext.FormPanel', {
            renderTo: 'datefield',
            frame: true,
            title: 'Date picker',
            width: 380,
            defaultType: 'datefield',
            items: [{
                fieldLabel: 'Date',
                name: 'date'
            }]
        });
    }

Now, if you click on the calendar icon you'll see the month in the specified language as well as the first letter of each day.

{@img datepicker.png}

To show more of Ext JS's localization features we'll now create an e-mail field and a month browser. Inside the setup method, write the following:

    Ext.create('Ext.FormPanel', {
        renderTo: 'emailfield',
        labelWidth: 100,
        frame: true,
        title: 'E-mail Field',
        width: 380,
        defaults: {
            msgTarget: 'side',
            width: 340
        },
        defaultType: 'textfield',
        items: [{
            fieldlabel: 'Email',
            name: 'email',
            vtype: 'email'
        }]
    });

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

Remember that `renderTo` corresponds to an `id` on an HTML tag so add those to our index file, too.

Notice that when typing in fields, a warning icon is displayed that, when hovered over, reveals context-specific information in the native language as a tooltip.

{@img tooltip.png}

An excellent example of what localization means beyond translation can be seen by selecting Polish and seeing how the order of the date field changes from DD-MM-YYYY to YYYY-MM-DD. Another is selecting Finnish and seeing how instead of dashes (-), periods (.) are used to separate day from month from year and the months are not capitalized. It's details like this that Ext takes care for you with it's comprehensive locale files.

## Conclusion

In this tutorial we have looked at how to load different locale files included with Ext JS by using AJAX requests that reload the application in the desired language along with subtle cultural conventions.

Your users will benefit from a more native experience and appreciate the extra lengths that you've gone to to ensure a better experience.
