/**
 * @class Ext.generator.Application
 * @extends Ext.generator.Base
 * Generates a full application
 */
Ext.generator.Application = Ext.extend(Ext.generator.Base, {
    generate: function() {
        this.headline('Generating the ' + this.name + ' application');
        
        this.createDirectoryStructure();
        this.copyApplicationFiles();
        this.copyJasmine();
        this.copyJSBuilder();
    },
    
    /**
     * Copies all files required for jasmine to the lib directory
     */
    copyJasmine: function() {
        Logger.log("Copying dependencies...");
        
        this.mkdir('lib/jasmine', 'lib/sencha-jasmine', 'lib/sencha-jasmine/matchers');
        
        this.file('lib/jasmine/jasmine.css');
        this.file('lib/jasmine/jasmine-html.js');
        this.file('lib/jasmine/jasmine.js');
        this.file('lib/jasmine/MIT.LICENSE');
        
        this.file('lib/sencha-jasmine/sencha-jasmine.css');
        this.file('lib/sencha-jasmine/sencha-jasmine.js');
        this.file('lib/sencha-jasmine/matchers/Model.js');
        this.file('lib/sencha-jasmine/matchers/Controller.js');
    },
    
    /**
     * Copies all static application files to their destination directories
     */
    copyApplicationFiles: function() {
        Logger.log("Copying files...");
        
        this.file('index.html');
        this.file('app/routes.js');
        this.file('public/resources/css/application.css');
        this.file('test/unit/index.html');
        this.file('test/unit/SpecOptions.js');
        this.file('test/unit/.htaccess');
        
        this.template('Application', this, "app/app.js");
        this.template('Viewport', this, "app/views/Viewport.js");
    },
    
    /**
     * Creates all of the necessary directories for a new app
     */
    createDirectoryStructure: function() {
        Logger.log("Creating directories...");
        this.mkdir(
            'app', 'app/models', 'app/controllers', 'app/views', 'lib', 
            'public', 'public/resources/images', 'public/resources/css',
            'test', 'test/acceptance', 'test/fixtures', 'test/unit',
            'test/unit/models', 'test/unit/controllers', 'test/unit/views'
        );
    },
    
    /**
     * Copies all files/folders required for JSBuilder into the lib directory
     */
    copyJSBuilder: function() {
        Logger.log("Copying JSBuilder");
        this.mkdir("lib/JSBuilder", "lib/JSBuilder/bin");
        this.file("lib/JSBuilder/bin/Dispatch.js");
        
        var builderDirs = ['bin', 'jsdb', 'src', 'tests', 'ycompressor'],
            length      = builderDirs.length,
            i;
        
        for (i = 0; i < length; i++) {
            this.copyDir(builderDirs[i], "lib/JSBuilder");
        }
        
        Logger.log("    Copying JSBuilder files");
        this.file("sencha.sh");
    },
    
    decodeArgs: function(args) {
        this.name = args[0];
        this.basePath = args[1] || this.name;
    }
});

Ext.regGenerator('app', Ext.generator.Application);