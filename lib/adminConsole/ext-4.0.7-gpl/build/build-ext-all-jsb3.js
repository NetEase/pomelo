function addJS(jsfile, onready) {
    var script = document.createElement('script'),
        head = document.head || document.getElementsByTagName('head')[0];

    script.type = 'text/javascript';
    script.src = jsfile;
    if (onready !== undefined) {
        script.onload = function() {
            onready();
        }
    }

    head.appendChild(script);
}

var extclasses = [];
var excludes = [
        "legacy",
        "tree/",
        "scaffold/",
        "data/ideas.js",
        ".old.js",
        "/broken",
        "src/View.js",
        "src/ViewManager.js",
        "src/grid/CellModel.js",
        "src/grid/CheckboxSelectionModel.js"
    ];
var root = 'src';

function rxescape(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}
excludes = excludes.map(rxescape);
var excludesrx = new RegExp(excludes.join("|"), "i");

var traverse;
traverse = function(directory) {
    var dirs = phantom.fs.entryList(directory, phantom.fs.DIRECTORIES);
    for (var d = 0; d < dirs.length; ++d) {
        var dir = dirs[d];
        if (dir === '.' || dir === '..')
            continue;
        traverse(directory + "/" + dir);
    }

    var files = phantom.fs.entryList(directory, phantom.fs.FILES);
    for (var f = 0; f < files.length; ++f) {
        var file = directory + "/" + files[f];
        if (file.substr(-3) === '.js' && !file.match(excludesrx)) {
            file = file.substr(0, file.length - 3).replace(new RegExp('^' + root + '/'), '').replace(/\//g, '.');
            extclasses.push('Ext.' + file);
        }
    }
};

traverse(root);

function extCoreLoaded() {
    Ext.Loader.setConfig({ enabled: true, basePath: root });
    Ext.Loader.require(extclasses);
    addJS('build-all-jsb/JSBGenerator.js', function() {
        Ext.Loader.onReady(function() {
            console.log('Done: ' + Ext.ClassManager.dependencyOrder.length + ' files');
            phantom.fs.writeFile('ext-all.jsb3', JSON.stringify(Ext.JSBGenerator.getJsbConfig(), null, 4));

            Ext.ClassManager.dependencyOrder.forEach(function(name) {
                console.log(name)
            });

            phantom.exit();
        }, Ext.global, false);
    });
}

addJS('ext-core-debug.js', extCoreLoaded);
