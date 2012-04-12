Project = Ext.extend(Object, {
    constructor : function(projectFile, builder) {
        var fileName = projectFile.split(/\\|\//i).pop(),
            dir = projectFile.replace(fileName, ''),
            contents, config;

        if (!Fs.exists(projectFile)) {
            throw 'Project file doesn\'t exist';
        }

        contents = Fs.readFile(projectFile);
        try {
            config = JSON.parse(contents);
        }
        catch (e) {
            throw 'The JSB file is not valid JSON.\n' + e.toString();
        }

        Ext.apply(config, {
            targets: config.targets || config.pkgs || [],
            name: config.projectName,
            license: config.licenseText,
            jsbDir: Fs.getFullPath(dir),
            jsbFile: fileName,
            packages: config.packages || [],
            builds: config.builds || [],
            // If the JSB file contains a deployDir property, append that to the -d deployDir
            deployDir: builder.get('deployDir') + Fs.sep + (config.deployDir || ''),
            resources: config.resources || []
        });

        this.builder = builder;
        this.config = config;

        this.parseTargets();
    },

    parseTargets : function() {
        // Split targets up into packages and builds for backwards compatibility
        this.get('targets').forEach(function(item) {
            if (item.packages) {
                this.get('builds').push(item);
            }
            else {
                this.get('packages').push(item);
            }
        }, this);

        // Convert each package config object into an actual Package instance
        this.set('packages', this.get('packages').map(function(item) {
            return new Package(item, this);
        }, this));

        // Convert each build config object into an actual Build instance
        this.set('builds', this.get('builds').map(function(item) {
            return new Build(item, this);
        }, this));
    },

    getPackageById : function(id) {
        var ret = false;
        this.get('packages').forEach(function(pkg) {
            if (pkg.get('id') == id) {
                ret = pkg;
            }
        });
        return ret;
    },

    /**
     * Creates the directory we are going to deploy to.
     */
    makeDeployDir: function() {
        var project = this.project,
            deployDir = Fs.mkdir(this.get('deployDir'));

        this.set('deployDir', deployDir);

        if (this.get('verbose')) {
            this.log('Created the deploy directory ' + deployDir);
        }
    },

    build : function() {
        this.makeDeployDir();
        this.createPackages();
        this.createBuilds();
        this.copyResources();

        if (this.builder.get('verbose')) {
            Logger.log('');
        }
        Logger.log('Done building!\n');
    },

    createPackages : function() {
        this.get('packages').forEach(function(pkg) {
            pkg.create();
        });
    },

    createBuilds : function() {
        this.get('builds').forEach(function(build) {
            build.create();
        });
    },

    copyResources : function() {
        if (this.builder.get('verbose')) {
            Logger.log('');
        }

        Logger.log('Copy resources...');

        this.get('resources').forEach(function(resource) {
            var filters = resource.filters,
                srcDir = this.get('jsbDir') + Fs.sep + resource.src,
                dest = resource.dest || resource.src;

            dest = dest || '';
            dest = this.get('deployDir') + Fs.sep + dest;

            // TODO: Implement filters
            if (this.builder.get('verbose')) {
                Logger.log('  + ' + resource.src + ' -> ' + dest);
            }

            Fs.copy(srcDir, dest);
        }, this);
    },

    get : function(key) {
        return this.config[key] || false;
    },

    set : function(key, value, ifNotExists) {
        if (ifNotExists && this.get(key) !== false) {
            return;
        }
        this.config[key] = value;
    },

    compressTarget : function(target) {
        if (this.builder.get('nocompress') || !target.get('compress')) {
            return;
        }

        Logger.log('  * Compress and obfuscate ' + target.get('target') + '...');

        var destination = target.get('targetPath'),
            source = destination + '-temp-' + Date.now() * Math.random(),
            command = this.getCompressor() + '-o ' + destination + ' ' + source;
            
        Fs.copy(destination, source);
        Cmd.execute(command);
        // If we don't wait, it won't copy from the temp file.
        if (Platform.isWindows) {
            system.sleep(5000);
        }
        Fs.remove(source);
    },

    getCompressor : function() {
        return 'java -jar ' + system.script.replace(Fs.getPath('bin/JSBuilder.js'), '') + Fs.getPath('ycompressor/ycompressor.jar') + ' --type js ';
    },

    getSourceFiles: function() {
        Logger.log('<!--');
        Logger.log('    Source files');
        Logger.log('-->');
        Logger.log('');

        this.get('builds').forEach(function(build) {
            if (build.get('packages')) {
                Logger.log('<!-- build: ' + build.get('name') + ' -->');

                build.get('packages').forEach(function(pkg) {
                    pkg = build.project.getPackageById(pkg);

                    Logger.log('<!-- package: ' + pkg.get('name') + ' -->');

                    pkg.get('files').forEach(function(file) {
                        Logger.log('<script type="text/javascript" src="../../' + file.path + file.name + '"></script>');
                    });

                    Logger.log('');
                });

                Logger.log('');
            }
        });
    },

    getSpecFiles: function() {
        Logger.log('<!--');
        Logger.log('    Spec files');
        Logger.log('-->');
        Logger.log('');

        this.get('builds').forEach(function(build) {
            if (build.get('packages')) {
                Logger.log('<!-- build: ' + build.get('name') + ' -->');

                build.get('packages').forEach(function(pkg) {
                    pkg = build.project.getPackageById(pkg);

                    Logger.log('<!-- package: ' + pkg.get('name') + ' -->');

                    pkg.get('files').forEach(function(file) {
                        Logger.log('<script type="text/javascript" src="spec/' + file.path.replace('src/', '') + file.name + '"></script>');
                    });

                    Logger.log('');
                });

                Logger.log('');
            }
        });
    }
});
