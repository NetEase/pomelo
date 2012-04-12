Cli = Ext.extend(Object, {
    map: {
        h: {
            name: 'help',
            desc: 'Prints this help display'
        }
    },

    // Override this on a subclass of Cli.
    // An array with a description on how to use this Cli.
    // Each entry in the array is printed on a new line.
    usage: [],
    
    constructor : function() {
        if (this.map !== this.superproto.map) {
            this.map = Ext.apply({}, this.map, this.superproto.map);
        }
        
        this.initArguments();
        
        try {
            this.run();
        }
        catch (e) {
            Logger.log(e);
            if (e.stack) {
                Logger.log('\n' + 'Stack trace:\n' + e.stack);
            }
        }
    },
    
    initArguments : function() {
        var args = system.arguments,
            ln = args.length,
            parsedArgs = this.args = {},
            curArg = null,
            i, arg;

        for (i = 0; i < ln; i++) {
            arg = args[i];
            if (arg[0] == '-') {
                if (arg[1] == '-') {
                    curArg = arg.substr(2);
                }
                else if (arg.length == 2) {
                    curArg = this.map[arg[1]] ? this.map[arg[1]].name : arg[1];
                }
                else {
                    continue;
                }

                if (args[i + 1] && args[i + 1][0] != '-') {
                    parsedArgs[curArg] = args[i + 1] || true;
                    i++;
                }
                else {
                    parsedArgs[curArg] = true;
                }
            }
        }
    },
    
    printUsage : function(message) {
        var map = this.map,
            usage = [''],
            i, mapping;
        
        if (!message) {
            usage.push(this.name + ' version ' + this.version);
            usage.push('Powered by Sencha Inc');
            usage.push('');
            usage.push('Available arguments:');
            for (i in map) {
                mapping = map[i];
                usage.push(
                    '    --' + mapping.name + '  -' + i
                );
                usage.push('      ' + (mapping.required ? '(required)' : '(optional)') + ' ' + (mapping.desc || ''));
                usage.push('');
            }
        }
        else {
            usage.push(message);
        }
        
        usage.push('');
        usage = usage.concat(this.usage);
        usage.push('');

        for (i = 0; i < usage.length; i++) {
            Logger.log(usage[i]);
        }
    },
    
    checkRequired : function() {
        var args = this.args,
            i, req;
        
        for (i in this.map) {
            if (this.map[i].required && args[this.map[i].name] === undefined) {
                return i;
            }
        }
        
        return true;
    },
    
    run : function() {
        if (this.get('help')) {
            this.printUsage();
            return false;            
        }
        
        var required = this.checkRequired();
        if (required !== true) {
            this.error('The --' + this.map[required].name + ' or -' + required + ' argument is required');
            this.printUsage();
            return false;
        }
    },
    
    get : function(key) {
        return this.args[key] || false;
    },
    
    set : function(key, value, ifNotExists) {
        if (ifNotExists && this.get(key) !== false) {
            return;
        }
        this.args[key] = value;
    },
    
    log : function(variable) {
        Logger.log(variable);
    },
    
    error : function(error) {
        throw error;
    }
});