/**
 * @class Ext.generator.Model
 * @extends Ext.generator.Base
 * Generates a model file based on config
 */
Ext.generator.Model = Ext.extend(Ext.generator.Base, {

    generate: function() {
        var modelFile   = 'app/models/' + this.name + '.js',
            specFile    = 'test/unit/models/' + this.name + '.js',
            fixtureFile = 'test/fixtures/' + this.name + '.js';
        
        this.headline("Generating the " + this.name + " model");
        this.template("Model", this, modelFile);
        this.template("ModelSpec", this, specFile);
        this.template("Fixture", this, fixtureFile);
        
        this.insertInclude(modelFile, 'sencha-models');
        
        this.insertInclude('../../' + modelFile, 'app-models', 'test/unit/index.html');
        this.insertInclude('models/' + this.name + '.js',  'spec-models', 'test/unit/index.html');
        this.insertInclude('../fixtures/' + this.name + '.js',  'fixtures', 'test/unit/index.html');
    },
    
    decodeArgs: function(args) {
        this.name = args[0];
        this.fields = args.slice(1);
        
        var length = this.fields.length,
            field, i;
        
        for (i = 0; i < length; i++) {
            field = this.fields[i].split(':');
            
            this.fields[i] = {
                name: field[0],
                type: field[1]
            };
        }
    }
});

Ext.regGenerator('model', Ext.generator.Model);

load('src/generators/model/templates/ModelSpec.js');
load('src/generators/model/templates/Model.js');
load('src/generators/model/templates/Fixture.js');