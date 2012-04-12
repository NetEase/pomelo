Loader.require('Parser');

Build = Ext.extend(Target, {
    getDefaultTarget : function() {
        return (this.get('id') || this.get('name').replace(/ /g, '').toLowerCase()) + '.js';
    },

    onCreate: function(file) {
        Build.superclass.onCreate.apply(this, arguments);

        var project = this.project,
            verbose = project.builder.get('verbose'),
            packages = this.get('packages') || [];

        if (verbose && packages.length) {
            Logger.log('  - ' + packages.length + ' package(s) included in this target.');
        }

        // Loop over all file includes, read the contents, and write
        // it to our target file
        packages.forEach(function(id) {
            var pkg = this.project.getPackageById(id),
                content;

            if (!pkg) {
                return true;
            }

            if (verbose) {
                Logger.log('    + ' + pkg.get('target'));
            }

            pkg = new Stream(pkg.get('targetPath'));
            content = pkg.readFile();
            pkg.close();

            file.writeln(content);
            return true;
        }, this);
    },

    afterCreate : function() {
        var params = Ext.apply({debug: this.get('debug'), debugLevel: 1}, this.get('options') || {});

        Logger.log('  * Parse ' + this.get('target') + ' with options:');

        Ext.iterate(params, function(n, v) {
            Logger.log('    - ' + n + ": " + v);
        });

        Parser.setParams(params);

        var filePath = this.get('targetPath');
        var parsedContent = Parser.parse(filePath);

        var file = new Stream(filePath, 'w');
        file.writeln(parsedContent);
        file.close();

        Build.superclass.afterCreate.apply(this);
    }
});
