Cmd = {
    execute: function(cmd) {
        if (Platform.isWindows) {
            var stream = new Stream('exec://' + cmd);
            stream.close();   
        }
        else {
            system.execute(cmd);
        }
    }
};