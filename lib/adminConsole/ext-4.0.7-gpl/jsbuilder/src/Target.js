Target = Ext.extend(Object, {
    constructor: function(config, project) {
        this.config = config || {};
        this.project = project;
    },

    create: function() {
        this.parseTarget();

        var project = this.project,
            builder = project.builder,
            verbose = builder.get('verbose'),
            file;

        if (verbose) {
            Logger.log('\nCreating the "' + this.get('name') + '" target as "' + this.get('target') + '"');
        }

        // Open the file stream
        file = new Stream(this.get('targetPath'), 'w');

        this.onCreate(file);
        this.writeIncludes(file);
        this.onAfterWriteIncludes(file);

        // Close the target file
        file.close();

        this.afterCreate();
    },

    afterCreate: function() {
        this.project.compressTarget(this);

        var filePath = this.get('targetPath');
        var license = (this.project.get('license')) ? "/*\n" + this.project.get('license') + "\n*/\n" : '';

        if (license) {
            var content = Fs.readFile(filePath);

            if (content.substring(0, license.length) !== license) {
                Fs.writeFile(filePath, license + content);
            }
        }
    },

    onAfterWriteIncludes: function(file) {
        var namespaceRewrites = this.get('namespaceRewrites'),
            settings = this.get('settings'),
            suffix = '})(',
            names = [];

        if (namespaceRewrites) {
            namespaceRewrites.forEach(function(rewrite) {
                names.push('this.' + rewrite.to + ' || (this.' + rewrite.to + ' = {})');
            });

            suffix += names.join(', ');
            suffix += ');';

            file.writeln(suffix);
        }
    },

    onCreate: function(file) {
        var namespaceRewrites = this.get('namespaceRewrites'),
            prefix = '(function(',
            settings = this.get('settings'),
            names = [];

        if (namespaceRewrites) {
            namespaceRewrites.forEach(function(rewrite) {
                names.push(rewrite.from);
            });

            prefix += names.join(', ');
            prefix += '){';

            if (settings) {
                prefix += "\n";
                prefix +=  ["if (typeof Ext === 'undefined') {",
                                "this.Ext = {};",
                            "}",
                            "",
                            "Ext.buildSettings = " + JSON.stringify(settings) + ";",
                            "Ext.isSandboxed = true;"
                           ].join("\n");
            }


            file.writeln(prefix);
        }
    },

    parseTarget: function() {
        if (this.parsed) {
            return;
        }

        // Backwards compatibility with JSB2
        var target = this.get('target') || this.get('file') || this.getDefaultTarget(),
            basePath = this.project.get('deployDir') + Fs.sep,
            dir;

        target = target.replace(/\//g, Fs.sep);

        if (target.indexOf('.js') !== -1) {
            target = target.replace('.js', '');
//            if (this.get('debug')) {
//                target += this.project.builder.get('debugSuffix');
//            }
            target += '.js';
        }

        this.set('target', target);

        // If the target is a path, then create the needed folders
        if (target.indexOf(Fs.sep) !== -1) {
            dir = target.substr(0, target.lastIndexOf(Fs.sep));
            target = target.replace(dir, '').substr(1);
            target = Fs.mkdir(basePath + dir) + Fs.sep + target;
        }
        else {
            target = basePath + target;
        }

        this.set('targetPath', target);
        this.parsed = true;
    },

    writeIncludes: function(file) {
        var project = this.project,
            verbose = project.builder.get('verbose'),
            includes = this.get('files') || this.get('fileIncludes') || [],
            jsbDir = project.get('jsbDir') + Fs.sep;

        if (verbose && includes.length) {
            Logger.log('  - ' + includes.length + ' file(s) included in this target.');
        }

        // Loop over all file includes, read the contents, and write
        // it to our target file
        includes.forEach(function(include) {
            var path = this.getIncludePath(include),
                content = '',
				gotFile = false,
                filesStream, files;

            if (verbose) {
                Logger.log('    + ' + path);
            }


            if (!Fs.exists(jsbDir + path)) {
                if (Platform.isUnix) {
                    filesStream = new Stream('exec://ls -a ' + jsbDir + path);
                    files = filesStream.readFile().split('\n');
                    filesStream.close();

                    files.forEach(function(filePath) {
                        if (!Ext.isEmpty(filePath)) {
                            include = new Stream(filePath);
                            content += include.readFile() + '\n';
                            include.close();
							gotFile = true;
                        }
                    });

					if (!gotFile) {
						Logger.log("[ERROR] File '" + jsbDir + path + "' is either not existent or unreadble");
					}
                }
            }
            else {
                content = this.getContent(jsbDir + path);
            }



            file.writeln(content);
        }, this);
    },


    getContent: function(file, callNum) {
        /**
         * This function should pretty much never fail since we already know the file exists.
         * However in Windows it seems to randomly omit files when building because it can't
         * open the stream, which causes the build to break. Since we know the file is there,
         * we'll just re-request it until we get it. While stupid, this makes it reliable.
         */

        var content = '';

        callNum = callNum || 0;
        try {
            content = Fs.readFile(file);
        } catch (e) {
            if (Platform.isWindows && callNum < 5) {
                return this.getContent(file, callNum + 1);
            }
        }
        return content;
    },

    getIncludePath : function(include) {
        return include.path.replace(/\//g, Fs.sep) + (include.name || include.text || '');
    },


    get: function(key) {
        return this.config[key] || false;
    },

    set: function(key, value, ifNotExists) {
        if (ifNotExists && this.get(key) !== false) {
            return;
        }
        this.config[key] = value;
    }
});
