Parser = {
    isBuild: function(builds) {
        return builds.split('|').indexOf(this.build) != -1;
    },

    parse: function(file, build) {
        var line,
            trimmed,
            o = this.output = [];

        this.build = build;

        file = new Stream(file);
        while (!file.eof) {
            line = file.readLine();
            trimmed = line.trim();
            if (this.isStatement(trimmed)) {
                this.handleStatement(this.parseStatement(trimmed), file);
            }
            else {
                this.output.push(line);
                this.checkExtraComma();
            }
        }
        file.close();
        return this.output.join('\n');
    },

    checkExtraComma: function() {
        var output = this.output,
            ln = output.length - 1,
            line = output[ln],
            trimmed = line.trim(),
            prevLine;

        if (trimmed[0] == '}') {
            while (output[--ln].trim() == '') {
                output.splice(ln, 1);
            }
            prevLine = output[ln];
            if (prevLine.trim().slice( - 1) == ',') {
                output[ln] = prevLine.slice(0, prevLine.lastIndexOf(','));
            }
        }
    },

    isStatement: function(line) {
        return line.substr(0, 3) == '//[' && line.substr( - 1) == ']';
    },

    handleStatement: function(statement, file) {
        switch (statement.type) {
            case 'if':
            case 'elseif':
                this.handleIf(file, statement.condition);
                break;

            case 'else':
                this.handleElse(file);
                break;
        }
    },

    parseStatement: function(statement) {
        var parts = statement.substring(3, statement.length - 1).split(' ');
        return {
            type: parts[0],
            condition: parts[1]
        };
    },

    handleIf: function(file, condition) {
        if (this.isBuild(condition)) {
            var next = this.getNextStatement(file);
            this.output.push(next.buffer);
            this.toEndIf(file, next);
        }
        else {
            this.handleStatement(this.getNextStatement(file), file);
        }
    },

    handleElse: function(file) {
        var next = this.toEndIf(file);
        this.output.push(next.buffer);
    },

    toEndIf: function(file, next) {
        next = next || this.getNextStatement(file);
        while (next && next.type != 'endif') {
            next = this.getNextStatement(file);
        }
        return next;
    },

    getNextStatement: function(file) {
        var buffer = [],
            line,
            trimmed,
            ret;

        while (!file.eof) {
            line = file.readLine();
            trimmed = line.trim();
            if (!this.isStatement(trimmed)) {
                buffer.push(line);
            }
            else {
                ret = this.parseStatement(trimmed);
                ret.buffer = buffer.join('\n');
                return ret;
            }
        }
        return null;
    }
};