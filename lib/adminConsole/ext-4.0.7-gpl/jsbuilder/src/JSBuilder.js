var JSBuilderPath = system.script.replace(/bin(\/|\\)JSBuilder\.js/, '');

load(JSBuilderPath + 'src/Loader.js');
Loader.setBasePath(JSBuilderPath + 'src');

Loader.require([
    'Ext', 'Cmd', 'Filesystem', 'Platform', 'Cli', 'Logger', 'Project', 'Target', 'Package', 'Build'
]);

/**
 * @class JSBuilder
 */
JSBuilder = Ext.extend(Cli, {
    name: 'JSBuilder',
    version: '3.0.0',
    
    map: {
        p: {
            name: 'projectFile',
            required: true,
            desc: 'Location of a jsb2 project file'
        },
        d: {
            name: 'deployDir',
            required: true,
            desc: 'The directory to build the project to'
        },
        v: {
            name: 'verbose',
            desc: 'Output detailed information about what is being built'
        },
        s: {
            name: 'debugSuffix',
            desc: 'Suffix to append to JS debug targets, defaults to \'debug\''
        },
        c: {
            name: 'nocompress',
            desc: 'Dont compress the targets'
        }     
    },
    
    usage: [
        'Example Usage:',
        '',
        'Windows:',
        'JSBuilder.bat -p C:\\Apps\\www\\ext3svn\\ext.jsb2 -d C:\\Apps\\www\\deploy\\',
        '',
        'Linux and OS X:',
        'JSBuilder.sh -p /home/tommy/www/trunk/ext.jsb2 -d /home/tommy/www/deploy/',
        '',
        'JSBuilder3 is a Sencha Project build tool.',
        'For additional information, see http://www.sencha.com/products/jsbuilder/'
    ],
    
    run : function() {
        if (JSBuilder.superclass.run.call(this) === false) {
            return;
        }
        
        // true to only set if it is not defined
        this.set('debugSuffix', '-debug', true); 

        this.project = new Project(this.get('projectFile'), this);
        
        if (this.get('sourceFiles')) {
            this.project.getSourceFiles();
        } else if (this.get('specFiles')) {
            this.project.getSpecFiles();
        } else {
            this.log('\nLoading the ' + this.project.get('name') + ' Project'); 
            this.log('Loaded ' + this.project.get('packages').length + ' Packages');
            this.log('Loaded ' + this.project.get('builds').length + ' Builds');

            this.project.build();
        }
    }    
});