Parser.Statement.Else = Ext.extend(Parser.Statement, {
    isEnd: function(line, stream) {
        if (this.parent.isEnd.apply(this.parent, arguments)) {
            stream.goBack(line.length + 1);
            return true;
        }

        return false;
    }
});