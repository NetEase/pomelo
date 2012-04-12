Filesystem = {
    exists : function(path) {
        return system.exists(path);
    },

    getFullPath: function(path) {
        var currentPath = system.setcwd(path);
        return system.setcwd(currentPath);
    },

    getPath: function(path){
        return path.replace(/\//g, Fs.sep);
    },

    mkdir: function(path) {
        if (Platform.isWindows) {
            system.mkdir(path);
        }
        else {
            Cmd.execute('mkdir -p ' + path);
        }
        return this.getFullPath(path);
    },

    readFile : function(file) {
        if (!Fs.exists(file)) {
            Logger.log("[ERROR] File '" + file + "' does not exist or is not readable!");
            return '';
        }

        file = new Stream(file);
        var contents = file.readFile();
        file.close();

        return contents;
    },

    writeFile: function(file, contents) {
        file = new Stream(file, 'w');
        file.writeln(contents);
        file.close();

        return contents;
    },

    copy: function(src, dest) {
        src = Fs.getPath(src);
        dest = Fs.getPath(dest);

        if (Platform.isWindows) {
            if (Fs.endsWith(src, Fs.sep)) {
                src = src.slice(0, -1); // cut off any trailing \
            }

            /**
             * Check if we're copying a single file. This isn't bulletproof, however xcopy
             * will prompt regarding if the item is a directory or file, with no way to
             * suppress the prompt. As such, this will catch a majority of scenarios
             * and actually make the build work!
             */
            var isFile = /\.[0-9a-z]{2,4}$/i;
            if (isFile.test(src)) {
                system.copy(src, dest);
            } else {
                Cmd.execute('xcopy ' + src + ' ' + dest + ' /E /Y /I');
            }
        }
        else {
            try {
                // q: quiet
                // r: recursive
                // u: only update if newer
                // p: keep permissions
                // L: copy the contents of symlinks
                Cmd.execute('rsync -qrupL ' + src + ' ' + dest);
            }
            catch(e) {
                Cmd.execute('cp -Rpf ' + src + ' ' + dest);
            }
        }
    },

    endsWith: function(str, last){
        return str.lastIndexOf(last) == str.length - 1;
    },

    split: function(file) {
        var split = [];
        if (!Fs.exists(file)) {
            return split;
        }
        file = new Stream(file);
        while (!file.eof) {
            split.push(file.readln().trim());
        }
        return split;
    },

    remove: function(file) {
        if (Platform.isWindows) {
            system.remove(file);
        } else {
            Cmd.execute('rm -Rf "' + file + '"');
        }
    }
};

// Create short alias
Fs = Filesystem;

Fs.sep = (Fs.getFullPath('.')[0] == '/') ? '/': '\\';
Fs.fileWorkingDir = Fs.getFullPath('.');
