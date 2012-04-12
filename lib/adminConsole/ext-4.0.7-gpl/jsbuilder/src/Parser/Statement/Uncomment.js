Parser.Statement.Uncomment = Ext.extend(Parser.Statement, {
    parse: function(stream) {
        var line;

        while (!stream.eof) {
            line = stream.readLine();

            if (this.isEnd(line, stream)) {
                break;
            }

            this.pushBuffer(line.replace(/^([\s\t]*)\/\//, "$1"), !stream.eof);
        }

        return this.buffer;
    }
});
