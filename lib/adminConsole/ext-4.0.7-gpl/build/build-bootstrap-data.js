var startTime = Date.now();

load('../../jsbuilder/src/Filesystem.js');
load('../../jsbuilder/src/Logger.js');
load('../../jsbuilder/src/Platform.js');
load('../../jsbuilder/src/Cmd.js');

function pathToNamespace(path) {
    var escapedSep = Ext.String.escapeRegex(Fs.sep);

    return path.replace(new RegExp('^' + escapedSep), '')
               .replace(new RegExp(escapedSep, 'g'), '.')
               .replace(/\.js$/, '');
}


var PATH = {
    BUILD: Fs.getFullPath('./'),
    ROOT: Fs.getFullPath('../'),
    JSBUILDER: Fs.getFullPath('../../jsbuilder/src'),
    PLATFORM: Fs.getFullPath('../../platform/src'),
    EXTJS: Fs.getFullPath('../src')
};

var sdkManifest = JSON.parse(Fs.readFile('sdk.jsb3')),
    foundationFiles = [],
    coreFiles = [];

sdkManifest.packages.forEach(function(pkg) {
    if (pkg.id === 'foundation') {
        foundationFiles = pkg.files;
    }

    if (['foundation', 'extras', 'dom'].indexOf(pkg.id) !== -1) {
        pkg.files.forEach(function(file) {
            coreFiles.push((file.path + file.name).replace(/^\.\.\//, ''));
        });
    }
});

foundationFiles.forEach(function(file) {
    load(file.path + file.name);
});

var platformOnlyFolders = [],
    excludes = JSON.parse(Fs.readFile('ignore.json')),
    excludeRegex = new RegExp(excludes.map(Ext.String.escapeRegex).join('|'));

function getPlatformOnlyFolders(path) {
    system.setcwd(PATH.PLATFORM + Fs.sep + path);

    var folders = system.folders(),
        currentPath;

    folders.forEach(function(folder) {
        currentPath = (path) ? (path + Fs.sep + folder) : folder;

        system.setcwd(PATH.EXTJS + Fs.sep + path);

        if (system.folders().indexOf(folder) !== -1) {
            getPlatformOnlyFolders(currentPath);
        }
        else {
            platformOnlyFolders.push(currentPath);
        }
    });
}

getPlatformOnlyFolders('');
Logger.log("Folders:\n---------------------------------");
Logger.log(platformOnlyFolders.join("\n"));

var platformOnlyFiles = [];

function getPlatformOnlyFiles(path) {
    system.setcwd(PATH.PLATFORM + Fs.sep + path);

    var files = system.files('*.js'),
        folders = system.folders(),
        currentPath;

    files.forEach(function(file) {
        platformOnlyFiles.push(path + Fs.sep + file);
    });

    folders.forEach(function(folder) {
        currentPath = (path) ? (path + Fs.sep + folder) : folder;

        if (platformOnlyFolders.indexOf(currentPath) === -1) {
            getPlatformOnlyFiles(currentPath);
        }
    });
}

getPlatformOnlyFiles('');
Logger.log("\nFiles:\n---------------------------------");
Logger.log(platformOnlyFiles.join("\n"));

var sourcePaths = [
        PATH.PLATFORM,
        PATH.EXTJS
    ],
    sourceManifestPath = PATH.BUILD + Fs.sep + "Ext4-manifest.json",
    classes,
    alias,
    parentClassName,
    allClasses = [],
    classMap = {},
    classInheritanceMap = {},
    nameToAliasesMap = {},
    alternateToNameMap = {};

function getAllClasses(root, path) {
    system.setcwd(root + Fs.sep + path);

    var files = system.files('*.js'),
        folders = system.folders(),
        filePath,
        currentPath;

    files.forEach(function(file) {
        filePath = path + Fs.sep + file;

        if (filePath.search(excludeRegex) === -1) {
            allClasses.push('Ext.' + pathToNamespace(filePath));
        }
    });

    folders.forEach(function(folder) {
        currentPath = (path) ? (path + Fs.sep + folder) : folder;

        getAllClasses(root, currentPath);
    });
}

getAllClasses(PATH.PLATFORM, '');
getAllClasses(PATH.EXTJS, '');

var hammerjsPath = PATH.BUILD + Fs.sep + "bin" + Fs.sep + (system.arguments[1] || "mac") + Fs.sep + "hammerjs";

Cmd.execute(hammerjsPath + " " + PATH.BUILD + Fs.sep + "build-manifest.js " + sourcePaths.join(',') +
            " " + sourceManifestPath);

classes = JSON.parse(Fs.readFile(sourceManifestPath));
classes.forEach(function(cls) {
    classMap[cls.className] = cls;
});

//classes.forEach(function(cls) {
//    if (cls.extend) {
//        classInheritanceMap[cls.className] = cls.extend;
//    }
//});

function getAliasOf(cls) {
    if (!cls.alias) {
//        parentClassName = classInheritanceMap[cls.className];
//
//        if (parentClassName && classMap[parentClassName]) {
//            return getAliasOf(classMap[parentClassName]);
//        }
//        else {
            return '';
//        }
    }

    return cls.alias;
}

var aliases, i, ln, alternates;

allClasses.forEach(function(name) {
    aliases = classMap[name] ? Ext.Array.from(getAliasOf(classMap[name])) : [];
    alternates = classMap[name] ? Ext.Array.from(classMap[name].alternateClassName) : [];

    nameToAliasesMap[name] = aliases;

    for (i = 0, ln = alternates.length; i < ln; i++) {
        alternateToNameMap[alternates[i]] = name;
    }
});

system.setcwd(PATH.BUILD);
var generatedFilePath = system.arguments[0] + Fs.sep + 'data.js';
Fs.writeFile(generatedFilePath, 'this.ExtBootstrap.data = ' + JSON.stringify({
    coreFiles: coreFiles,
    platformFolders: platformOnlyFolders.map(pathToNamespace),
    platformFiles: platformOnlyFiles.map(pathToNamespace),
    nameToAliasesMap: nameToAliasesMap,
    alternateToNameMap: alternateToNameMap
}, null, 4));

var releaseData = Fs.readFile(PATH.ROOT + Fs.sep + 'bootstrap' + Fs.sep + 'data-release-base.js');

Fs.writeFile(PATH.ROOT + Fs.sep + 'bootstrap' + Fs.sep + 'data-release.js', '(function(){ var data = ' + JSON.stringify({
    nameToAliasesMap: nameToAliasesMap,
    alternateToNameMap: alternateToNameMap
}, null, 4) + ';' + releaseData + '})();');

//Fs.remove(sourceManifestPath);

Logger.log("\nSuccessfully re-generated: " + generatedFilePath + " in " + ((Date.now() - startTime) / 1000) + 's');
