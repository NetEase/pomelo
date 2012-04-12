(function(ROOT) {

var Loader = ROOT.Loader = {
    paths: {
        _base: "."
    },

    existing: {},

    exists: function(name) {
        var root = ROOT;
        var chunks = name.split('.');

        for (var i = 0; i < chunks.length; i++) {
            if (!root.hasOwnProperty(chunks[i]))
                return false;

            root = root[chunks[i]];
        }

        return true;
    },

    setBasePath: function(name, path) {
        if (!path) {
            path = name;
            name = "_base";
        }

        Loader.paths[name] = path;
    },

    getBasePath: function(name) {
        // Start with the base path
        var path = Loader.paths._base;

        // Iterate through each specified name path ("Ext.layout.Layout" => "js/Ext/layout/Layout.js")
        for (var stub in Loader.paths) {
            if (stub === name.substring(0, stub.length)) {
                path += "/" + Loader.paths[stub];
                // Remove stub from name, as we've already pathed it
                name = name.substring(stub.length + 1);
                break;
            }
        }

        return path + "/" + name.replace(/\./g, "/");
    },

    require: function(names, compulsory) {
        if (compulsory == undefined)
            compulsory = true;

        if (typeof names == 'string')
            names = [names];

        names.forEach(function(name) {
            if (!this.existing.hasOwnProperty(name)) {
//                writeln(this.getBasePath(name) + '.js');
                load(this.getBasePath(name) + '.js');

                var loaded = this.exists(name);
                this.existing[name] = loaded;
            }

            if (this.existing[name] == false && compulsory) {
                throw new Error("[Loader] Failed loading '" + name + "'");
            }
        }, Loader);
    }
};

})(this);

