// Singleton
Parser = new(Ext.extend(Object, {
    params: {},

    parse: function(filename) {
        var stream = new Stream(filename),
            ret;

        Loader.require('Parser.Statement');
        ret = (new Parser.Statement()).parse(stream);
        stream.close();

        return ret;
    },

    evaluate: function(name, value) {
        var modifier = null,
            param = (this.params.hasOwnProperty(name)) ? this.params[name] : false,
            match;

        if (value === undefined) {
            value = true;
        }

        if (Ext.isString(value)) {
            match = value.match(/^(\!|<=|>=|<|>)/);

            if (match) {
                modifier = match[0];
                value = value.slice(modifier.length);
            }

            // Boolean
            if (value === 'true') {
                value = true;
            }
            else if (value === 'false') {
                value = false;
            }
            // Numeric
            else if (!isNaN(value)) {
                value = parseFloat(value);
            }
        }

        switch (modifier) {
            case '!':
                return (param !== value);
            case '>':
                return (param > value);
            case '<':
                return (param < value);
            case '<=':
                return (param <= value);
            case '>=':
                return (param >= value);
            default:
                return (param === value);
        }
    },

    setParams: function(params) {
        this.params = params || {};
    },

    isCloseOf: function(str, statement) {
        if (!statement.type) {
            return false;
        }

        return str.trim().match(new RegExp("^\\/\\/(?:\\t|\\s)*<\\/" + ((statement.isInverted) ? "!" : "") + statement.type + ">$")) !== null;
    },

    isStatement: function(str) {
        return this.parseStatementParts(str) !== null;
    },

    parseStatementParts: function(str) {
        return str.trim().match(/^\/\/(?:\t|\s)*<([^\/]+)>$/);
    },

    parseStatementProperties: function(str) {
        var properties = {},
            expect = function(regexp) {
                var result = str.match(regexp);

                if (result !== null) {
                    str = str.slice(result[0].length);
                    return result[0];
                }

                return null;
            },
            name, equalSign, valueWrapper, valueCheck, value;

        while (str.length > 0) {
            expect(/^[^\w]+/i);
            name = expect(/^[\w]+/i);

            if (name === null) {
                break;
            }

            equalSign = expect(/^=/);

            if (equalSign === null) {
                properties[name] = true;
                continue;
            }

            valueWrapper = expect(/^('|")/i);
            valueCheck = valueWrapper || "\\s";

            value = expect(new RegExp('^[^' + valueCheck + ']+'));

            if (valueWrapper !== null) {
                expect(new RegExp(valueWrapper));
            }

            properties[name] = value;
        }

        return properties;
    },

    parseStatement: function(string) {
        var str = string.trim(),
            parts = this.parseStatementParts(str),
            typeMatch, statement;

        // Check if it's actually a valid statement
        if (parts === null) {
            return false;
        }

        str = parts[1];

        typeMatch = str.match(/^(\!)?([\w]+)/i);

        if (typeMatch === null) {
            return false;
        }

        statement = {
            properties: {}
        };

        statement.type = typeMatch[2];
        statement.isInverted = (typeMatch[1] !== undefined);

        str = str.substr(typeMatch[0].length, str.length).trim();
        statement.properties = this.parseStatementProperties(str);

        return statement;
    }
}));
