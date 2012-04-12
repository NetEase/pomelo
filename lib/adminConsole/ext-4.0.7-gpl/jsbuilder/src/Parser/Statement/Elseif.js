Parser.Statement.Elseif = Ext.extend(Parser.Statement.If, {
    isEnd: function(line, stream) {
        var statement,
            isEnd = false;

        statement = Parser.parseStatement(line);

        if (statement) {
            if (statement.type === 'elseif' || statement.type === 'else') {
                isEnd = true;
            }
        } else if (this.parent.isEnd.apply(this.parent, arguments)) {
            isEnd = true;
        }

        if (isEnd) {
            stream.goBack(line.length + 1);
        }

        return isEnd;
    }
});
