var levels = require("./levels");
/**
 * Log requests with the given `options` or a `format` string.
 *
 * Options:
 *
 *   - `format`        Format string, see below for tokens
 *   - `level`         A log4js levels instance.
 *
 * Tokens:
 *
 *   - `:req[header]` ex: `:req[Accept]`
 *   - `:res[header]` ex: `:res[Content-Length]`
 *   - `:http-version`
 *   - `:response-time`
 *   - `:remote-addr`
 *   - `:date`
 *   - `:method`
 *   - `:url`
 *   - `:referrer`
 *   - `:user-agent`
 *   - `:status`
 *
 * @param {String|Function|Object} format or options
 * @return {Function}
 * @api public
 */

function getLogger(logger4js, options) {
    if ('object' == typeof options) {
	options = options || {};
    } else if (options) {
	options = { format: options };
    } else {
	options = {};
    }

    var thislogger = logger4js
  , level = levels.toLevel(options.level, levels.INFO)
  , fmt = options.format || ':remote-addr - - ":method :url HTTP/:http-version" :status :content-length ":referrer" ":user-agent"'
  , nolog = options.nolog ? createNoLogCondition(options.nolog) : null;

    return function (req, res, next) {

	// mount safety
	if (req._logging) return next();

  // nologs
  if(nolog && nolog.test(req.originalUrl)) return next();

	if (thislogger.isLevelEnabled(level)) {

	    var start = +new Date
	  , statusCode
	  , writeHead = res.writeHead
	  , end = res.end
	  , url = req.originalUrl;

	    // flag as logging
	    req._logging = true;

	    // proxy for statusCode.
	    res.writeHead = function(code, headers){
		res.writeHead = writeHead;
		res.writeHead(code, headers);
		res.__statusCode = statusCode = code;
		res.__headers = headers || {};
	    };

	    // proxy end to output a line to the provided logger.
	    res.end = function(chunk, encoding) {
		res.end = end;
		res.end(chunk, encoding);
		res.responseTime = +new Date - start;
		if ('function' == typeof fmt) {
		    var line = fmt(req, res, function(str){ return format(str, req, res); });
		    if (line) thislogger.log(level, line);
		} else {
		    thislogger.log(level, format(fmt, req, res));
		}
	    };

	    next();
	}
    };
}

/**
 * Return formatted log line.
 *
 * @param  {String} str
 * @param  {IncomingMessage} req
 * @param  {ServerResponse} res
 * @return {String}
 * @api private
 */

function format(str, req, res) {
    return str
      .replace(':url', req.originalUrl)
	.replace(':method', req.method)
	  .replace(':status', res.__statusCode || res.statusCode)
	    .replace(':response-time', res.responseTime)
	      .replace(':date', new Date().toUTCString())
		.replace(':referrer', req.headers['referer'] || req.headers['referrer'] || '')
		  .replace(':http-version', req.httpVersionMajor + '.' + req.httpVersionMinor)
		    .replace(':remote-addr', req.socket && (req.socket.remoteAddress || (req.socket.socket && req.socket.socket.remoteAddress)))
		      .replace(':user-agent', req.headers['user-agent'] || '')
                        .replace(':content-length', (res._headers && res._headers['content-length']) || (res.__headers && res.__headers['Content-Length']) || '-')
		          .replace(/:req\[([^\]]+)\]/g, function(_, field){ return req.headers[field.toLowerCase()]; })
		            .replace(/:res\[([^\]]+)\]/g, function(_, field){
		                return res._headers
			      ? (res._headers[field.toLowerCase()] || res.__headers[field])
			      : (res.__headers && res.__headers[field]);
		            });
}

/**
 * Return RegExp Object about nolog
 *
 * @param  {String} nolog
 * @return {RegExp}
 * @api private
 */

/**
 * syntax
 *  1. String
 *   1.1 "\\.gif"
 *         NOT LOGGING http://example.com/hoge.gif and http://example.com/hoge.gif?fuga
 *         LOGGING http://example.com/hoge.agif
 *   1.2 in "\\.gif|\\.jpg$"
 *         NOT LOGGING http://example.com/hoge.gif and http://example.com/hoge.gif?fuga and http://example.com/hoge.jpg?fuga
 *         LOGGING http://example.com/hoge.agif, http://example.com/hoge.ajpg and http://example.com/hoge.jpg?hoge
 *   1.3 in "\\.(gif|jpe?g|png)$"
 *         NOT LOGGING http://example.com/hoge.gif and http://example.com/hoge.jpeg
 *         LOGGING http://example.com/hoge.gif?uid=2 and http://example.com/hoge.jpg?pid=3
 *  2. RegExp
 *   2.1 in /\.(gif|jpe?g|png)$/
 *         SAME AS 1.3
 *  3. Array
 *   3.1 ["\\.jpg$", "\\.png", "\\.gif"]
 *         SAME AS "\\.jpg|\\.png|\\.gif"
 */
function createNoLogCondition(nolog, type) {
  if(!nolog) return null;
  type = type || '';

  if(nolog instanceof RegExp){
    if(type === 'string')
      return nolog.source;
    return nolog;
  } else if(typeof nolog === 'string'){
    if(type === 'string')
      return nolog;
    try{
      return new RegExp(nolog);
    } catch (ex) {
      return null;
    }
  } else if(nolog instanceof Array){
    var regexps = nolog.map(function(o){ return createNoLogCondition(o, 'string')});
    return new RegExp(regexps.join('|'));
  }
}

exports.connectLogger = getLogger;