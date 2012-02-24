var dateFormat = require('./date_format')
, util = require('util')
, replacementRegExp = /%[sdj]/g
, layoutMakers = {
    "messagePassThrough": function() { return messagePassThroughLayout; }
  , "basic": function() { return basicLayout; }
  , "colored": function() { return colouredLayout; }
  , "coloured": function() { return colouredLayout; }
  , "pattern": function (config) {
	var pattern = config.pattern || undefined;
	return patternLayout(pattern);
    }
}
, colours = {
    ALL: "grey"
  , TRACE: "blue"
  , DEBUG: "cyan"
  , INFO: "green"
  , WARN: "yellow"
  , ERROR: "red"
  , FATAL: "magenta"
  , OFF: "grey"
};


function formatLogData(logData) {
    var output = ""
    , data = Array.isArray(logData) ? logData.slice() : Array.prototype.slice.call(arguments)
    , format = data.shift();

    if (typeof format  === "string") {
        output = format.replace(replacementRegExp, function(match) {
            switch (match) {
            case "%s": return new String(data.shift());
            case "%d": return new Number(data.shift());
            case "%j": return JSON.stringify(data.shift());
            default:
                return match;
            };
        });
    } else {
        //put it back, it's not a format string
        data.unshift(format);
    }

    data.forEach(function (item) {
        if (output) {
            output += ' ';
        }
        if (item && item.stack) {
            output += item.stack;
        } else {
            output += util.inspect(item);
        }
    });

    return output;
}

/**
 * Taken from masylum's fork (https://github.com/masylum/log4js-node)
 */
function colorize (str, style) {
    var styles = {
        //styles
        'bold'      : [1,  22],
        'italic'    : [3,  23],
        'underline' : [4,  24],
        'inverse'   : [7,  27],
        //grayscale
        'white'     : [37, 39],
        'grey'      : [90, 39],
        'black'     : [90, 39],
        //colors
        'blue'      : [34, 39],
        'cyan'      : [36, 39],
        'green'     : [32, 39],
        'magenta'   : [35, 39],
        'red'       : [31, 39],
        'yellow'    : [33, 39]
    };
    return style ? '\033[' + styles[style][0] + 'm' + str +
        '\033[' + styles[style][1] + 'm' : str;
}

function timestampLevelAndCategory(loggingEvent, colour) {
    var output = colorize(
        formatLogData(
            '[%s] [%s] %s - '
          , dateFormat.asString(loggingEvent.startTime)
          , loggingEvent.level
          , loggingEvent.categoryName
        )
      , colour
    );
    return output;
}

/**
 * BasicLayout is a simple layout for storing the logs. The logs are stored
 * in following format:
 * <pre>
 * [startTime] [logLevel] categoryName - message\n
 * </pre>
 *
 * @author Stephan Strittmatter
 */
function basicLayout (loggingEvent) {
    return timestampLevelAndCategory(loggingEvent) + formatLogData(loggingEvent.data);
}

/**
 * colouredLayout - taken from masylum's fork.
 * same as basicLayout, but with colours.
 */
function colouredLayout (loggingEvent) {
    return timestampLevelAndCategory(loggingEvent, colours[loggingEvent.level.toString()]) + formatLogData(loggingEvent.data);
}

function messagePassThroughLayout (loggingEvent) {
    return formatLogData(loggingEvent.data);
}

/**
 * PatternLayout
 * Format for specifiers is %[padding].[truncation][field]{[format]}
 * e.g. %5.10p - left pad the log level by 5 characters, up to a max of 10
 * Fields can be any of:
 *  - %r time in toLocaleTimeString format
 *  - %p log level
 *  - %c log category
 *  - %m log data
 *  - %d date in various formats
 *  - %% %
 *  - %n newline
 * Takes a pattern string and returns a layout function.
 * @author Stephan Strittmatter
 */
function patternLayout (pattern) {
    var TTCC_CONVERSION_PATTERN  = "%r %p %c - %m%n";
    var regex = /%(-?[0-9]+)?(\.?[0-9]+)?([cdmnpr%])(\{([^\}]+)\})?|([^%]+)/;

    pattern = pattern || TTCC_CONVERSION_PATTERN;

    return function(loggingEvent) {
	var formattedString = "";
	var result;
	var searchString = pattern;

	while ((result = regex.exec(searchString))) {
	    var matchedString = result[0];
	    var padding = result[1];
	    var truncation = result[2];
	    var conversionCharacter = result[3];
	    var specifier = result[5];
	    var text = result[6];

	    // Check if the pattern matched was just normal text
	    if (text) {
		formattedString += "" + text;
	    } else {
		// Create a raw replacement string based on the conversion
		// character and specifier
		var replacement = "";
		switch(conversionCharacter) {
		case "c":
		    var loggerName = loggingEvent.categoryName;
		    if (specifier) {
			var precision = parseInt(specifier, 10);
			var loggerNameBits = loggingEvent.categoryName.split(".");
			if (precision >= loggerNameBits.length) {
			    replacement = loggerName;
			} else {
			    replacement = loggerNameBits.slice(loggerNameBits.length - precision).join(".");
			}
		    } else {
			replacement = loggerName;
		    }
		    break;
		case "d":
		    var format = dateFormat.ISO8601_FORMAT;
		    if (specifier) {
			format = specifier;
			// Pick up special cases
			if (format == "ISO8601") {
			    format = dateFormat.ISO8601_FORMAT;
			} else if (format == "ABSOLUTE") {
			    format = dateFormat.ABSOLUTETIME_FORMAT;
			} else if (format == "DATE") {
			    format = dateFormat.DATETIME_FORMAT;
			}
		    }
		    // Format the date
		    replacement = dateFormat.asString(format, loggingEvent.startTime);
		    break;
		case "m":
		    replacement = formatLogData(loggingEvent.data);
		    break;
		case "n":
		    replacement = "\n";
		    break;
		case "p":
		    replacement = loggingEvent.level.toString();
		    break;
		case "r":
		    replacement = "" + loggingEvent.startTime.toLocaleTimeString();
		    break;
		case "%":
		    replacement = "%";
		    break;
		default:
		    replacement = matchedString;
		    break;
		}
		// Format the replacement according to any padding or
		// truncation specified

		var len;

		// First, truncation
		if (truncation) {
		    len = parseInt(truncation.substr(1), 10);
		    replacement = replacement.substring(0, len);
		}
		// Next, padding
		if (padding) {
		    if (padding.charAt(0) == "-") {
			len = parseInt(padding.substr(1), 10);
			// Right pad with spaces
			while (replacement.length < len) {
			    replacement += " ";
			}
		    } else {
			len = parseInt(padding, 10);
			// Left pad with spaces
			while (replacement.length < len) {
			    replacement = " " + replacement;
			}
		    }
		}
		formattedString += replacement;
	    }
	    searchString = searchString.substr(result.index + result[0].length);
	}
	return formattedString;
    };

};


module.exports = {
    basicLayout: basicLayout
  , messagePassThroughLayout: messagePassThroughLayout
  , patternLayout: patternLayout
  , colouredLayout: colouredLayout
  , coloredLayout: colouredLayout
  , layout: function(name, config) {
        return layoutMakers[name] && layoutMakers[name](config);
    }
};