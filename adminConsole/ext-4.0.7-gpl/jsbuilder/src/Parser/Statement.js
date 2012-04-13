Loader.require('Logger');

Parser.Statement = Ext.extend(Object, {
    isInverted: false,
    properties: {},
    buffer: '',
    parent: null,

    constructor: function(properties, isInverted) {
        if (properties === undefined) {
            properties = {};
        }

        if (isInverted === undefined) {
            isInverted = false;
        }

        this.properties = properties;
        this.isInverted = isInverted;
    },

    setProperty: function(name, value) {
        this.properties[name] = value;
    },

    getProperty: function(name) {
        return this.properties.hasOwnProperty(name) ? this.properties[name] : null;
    },

    removeProperty: function(name) {
        delete this.properties[name];
    },

    isEnd: function(line, stream) {
        return Parser.isCloseOf(line, this);
    },

    pushBuffer: function(content, withNewLine) {
        if (withNewLine === undefined) {
            withNewLine = false;
        }

        this.buffer += content + ((withNewLine) ? "\n" : "");
    },

    resetBuffer: function() {
        this.buffer = '';
    },

    parse: function(stream) {
        var line, subStatementData, subStatement;

        while (!stream.eof) {
            line = stream.readLine();

            if (this.isEnd(line, stream)) {
                break;
            }

            if ((subStatementData = Parser.parseStatement(line)) && (subStatement = Parser.Statement.factory(subStatementData))) {
                subStatement.parent = this;
                this.onSubStatement(subStatement, stream);
            } else {
                this.pushBuffer(line, !stream.eof);
            }
        }

        return this.buffer;
    },

    onSubStatement: function(statement, stream) {
        this.pushBuffer(statement.parse(stream));
    }
});

Ext.apply(Parser.Statement, {
    factory: function(type, properties, isInverted) {
        var capitalizedType, statementClass, statement;

        if (Ext.isObject(type)) {
            properties = type.properties;
            isInverted = type.isInverted;
            type = type.type;
        }

        type = type.toLowerCase();
        capitalizedType = type.charAt(0).toUpperCase() + type.slice(1);

        Loader.require('Parser.Statement.' + capitalizedType, false);
        statementClass = Parser.Statement[capitalizedType];

        if (!statementClass) {
            // Not supported
            Logger.log("[NOTICE][Parser.Statement.factory] Statement type '" + type + "' is currently not supported, ignored");
            return false;
        }

        statement = new statementClass(properties, isInverted);
        statement.type = type;

        return statement;
    }
});
