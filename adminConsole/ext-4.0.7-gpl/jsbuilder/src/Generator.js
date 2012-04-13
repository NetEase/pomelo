load(JSBuilderPath + 'src/Template.js');
load(JSBuilderPath + 'src/XTemplate.js');

Ext.generator = {};

/**
 * @class Ext.generator.Base
 * @extends Object
 * Base class for all Generators
 */
Ext.generator.Base = Ext.extend(Object, {
    /**
     * @cfg {Boolean} pretend True to only output what the generator would do (e.g. which files would be created),
     * without actually modifying anything on the filesystem.
     */
    pretend: false,
    
    basePath: '.',
    
    constructor: function(config) {
        Ext.apply(this, config);
        
        if (this.args) {
            this.decodeArgs(this.args);
        }
    },
    
    /**
     * Creates an empty directory at the given location
     * @param {String} path The directory path
     */
    mkdir: function() {
        var length = arguments.length,
            dirName, i;
        
        for (i = 0; i < length; i++) {
            dirName = this.basePath + "/" + arguments[i];
            Logger.log("    Creating dir: " + dirName);
            
            if (!this.pretend) {
                Filesystem.mkdir(dirName);
            }
        }
    },
    
    /**
     * Applies data to an XTemplate, saving its output to the given file name
     * @param {String} name The name of the template
     */
    template: function(name, data, filename) {
        Logger.log("    Creating file: " + filename);
        
        // dirty hack to let <tpl> get through without being picked up
        Ext.apply(data, {
            tpl: 'tpl'
        });
        
        var name        = 'src/generators/' + this.dirName + '/templates/' + name + '.js',
            stream      = new Stream(name, 'rw'),
            template    = new Ext.XTemplate(stream.readText()),
            contents    = template.apply(data),
            destination = this.basePath + '/' + filename,
            newFile     = new Stream(destination, "w");
        
        newFile.writeLine(contents);
        system.move(destination, filename, true);
        newFile.close();
    },
    
    /**
     * Copies a file from the generator's files directory into the app
     * @param {String} fileName The name of the file to copy
     * @param {String} destination The destination path (defaults to the fileName)
     * @param {Boolean} silent True to not log any messages (defaults to false)
     */
    file: function(fileName, destination, silent) {
        Logger.log("    Copying " + fileName);
        
        destination = this.basePath + '/' + (destination || fileName);
        fileName = 'src/generators/' + this.dirName + '/files/' + fileName;
        
        if (!this.pretend && this.silent !== true) {
            Filesystem.copy(fileName, destination);
        }
    },
    
    /**
     * Copies all contents of the given source directory to a destination
     * @param {String} dirName The name of the directory to copy
     * @param {String} destination The destination for the source files
     */
    copyDir: function(dirName, destination) {
        destination = this.basePath + '/' + (destination || dirName);
        
        if (!this.pretend) {
            Filesystem.copy(dirName, destination);
        }
    },
    
    /**
     * Inserts a script tag to load the given src file inside the given div id
     * @param {String} path The path to the script to be included
     * @param {String} id The id of the div to include after
     * @param {String} htmlFile Optional html file to update (defaults to index.html)
     */
    insertInclude: function(path, id, htmlFile) {
        htmlFile = htmlFile || 'index.html';
        
        var stream = new Stream(htmlFile, 'rw'),
            regex  = new RegExp('<div id="' + id + '">'),
            lines  = [],
            line;
        
        while (line = stream.readLine()) {
            lines.push(line);
            
            if (regex.test(line)) {
                lines.push('            <script type="text/javascript" src="' + path + '"></script>');
            }
        }
        
        var destination = htmlFile + "-modified",
            newFile     = new Stream(destination, "w");
        
        newFile.writeLine(lines.join("\n"));
        system.move(destination, htmlFile, true);
        newFile.close();
    },
    
    /**
     * Convenience function for displaying a clear message to the user
     * @param {String} message The message to display
     */
    headline: function(message) {
        Logger.log("");
        Logger.log("*********************************************");
        Logger.log(message);
        Logger.log("*********************************************");
        Logger.log("");
    },
    
    generate: function() {
        
    }
});

/**
 * @class GeneratorHelper
 * @extends Cli
 * Generates files and folders based on a template
 */
Ext.generator.Factory = Ext.extend(Object, {
    name: "Generator",
    version: "0.0.1",
    
    constructor: function(config) {
        Ext.apply(this, config);
        
        Cli.call(this);
    },
    
    initArguments: function() {},
    
    usage: [
        'Example usage:',
        'Arguments in square brackets are optional',
        '',
        'Generating an application:',
        '    ./generate app AppName [../path/to/app]',
        '',
        'Generating a model:',
        '    ./generate model User id:int name:string active:boolean',
        '',
        'Generating a controller:',
        '    ./generate controller users create update destroy',
        ''
    ],
    
    run: function() {
        var args = this.args || system.arguments,
            Gen  = Ext.generator.Factory.types[args[0]];
        
        if (Gen) {
            new Gen({args: args.slice(1)}).generate();
        } else {
            this.printUsage();
        }
    }
});

Ext.generator.Factory.types = {};
Ext.regGenerator = function(name, constructor) {
    Ext.generator.Factory.types[name] = constructor;
    
    constructor.prototype.dirName = name;
    constructor.templates = {};
};

Ext.regDispatchable('generate', Ext.generator.Factory);

// generate app FB examples/facebook
// generate model User id:int name:string email:string
// generate controller users index build show new