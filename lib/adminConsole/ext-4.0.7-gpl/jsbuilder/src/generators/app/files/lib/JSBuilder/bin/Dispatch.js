var JSBuilderPath = system.cwd + '/lib/JSBuilder/';

load(JSBuilderPath + 'src/Loader.js');
Loader.setBasePath(JSBuilderPath + 'src');

Loader.require([
    'Ext', 'Cmd', 'Filesystem', 'Platform', 'Cli', 'Logger', 'Project', 'Target', 'Package', 'Build'
]);

/**
 * @class Ext.CommandDispatcher
 * @extends Object
 * Dispaches to the relevant Cli subclass from the command line 'sencha' command. e.g.
 * sencha generate xyz is dispatched to whichever Ext.Cli subclass registered itself to
 * handler the 'generate' command (Ext.generator.Factory in this case).
 */
Ext.CommandDispatcher = {
    types: {},
    
    dispatch: function(module, args) {
        new this.types[module]({args: args});
    }
};

Ext.regDispatchable = function(name, constructor) {
    Ext.CommandDispatcher.types[name] = constructor;
};

load('src/Generator.js');
load('src/generators/app/Application.js');
load('src/generators/controller/Controller.js');
load('src/generators/model/Model.js');

var args   = system.arguments,
    module = args[0];

Ext.CommandDispatcher.dispatch(module, args.slice(1));