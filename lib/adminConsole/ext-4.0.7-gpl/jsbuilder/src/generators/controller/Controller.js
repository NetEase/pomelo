/**
 * @class Ext.generator.Controller
 * @extends Ext.generator.Base
 * Generates a Controller file based on a template
 */
Ext.generator.Controller = Ext.extend(Ext.generator.Base, {

    generate: function() {
        var controllerFile = 'app/controllers/' + this.name + '.js';
        
        this.headline("Generating the " + this.name + " controller");
        
        this.template('Controller', this, controllerFile);
        this.template('ControllerSpec', this, 'test/unit/controllers/' + this.name + '.js');
        
        this.insertInclude(controllerFile, 'sencha-controllers');
        this.insertInclude('../../' + controllerFile, 'app-controllers', 'test/unit/index.html');
        this.insertInclude('controllers/' + this.name + '.js', 'spec-controllers', 'test/unit/index.html');
    },
    
    decodeArgs: function(args) {
        this.name = args[0];
        this.actions = args.slice(1);
    }
});

Ext.regGenerator('controller', Ext.generator.Controller);

load('src/generators/controller/templates/ControllerSpec.js');
load('src/generators/controller/templates/Controller.js');