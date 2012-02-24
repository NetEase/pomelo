var layouts = require('../layouts');

function consoleAppender (layout) {
    layout = layout || layouts.colouredLayout;
    return function(loggingEvent) {
	console._preLog4js_log(layout(loggingEvent));
    };
}

function configure(config) {
    var layout;
    if (config.layout) {
	layout = layouts.layout(config.layout.type, config.layout);
    }
    return consoleAppender(layout);
}

exports.name = "console";
exports.appender = consoleAppender;
exports.configure = configure;
