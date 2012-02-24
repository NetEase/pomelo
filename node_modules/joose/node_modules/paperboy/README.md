# Paperboy

## Purpose

A node.js module for delivering static files.

## Current Status

This module is used by [tempalias.com](http://tempalias.com/) in production
and is mainted by [Felix Geisendörfer](https://github.com/felixge). However,
this one one of my first node modules and it lacks a test suite, you've been
warned : ).

## Features
  
 * Configurable callbacks on most events
 * ETag / 304 Support
 * Custom HTTP headers

## Example

Example from example/basic.js:

    var
      path = require('path'),
      http = require('http'),
      paperboy = require('../lib/paperboy'),
    
      PORT = 8003,
      WEBROOT = path.join(path.dirname(__filename), 'webroot');
    
    http.createServer(function(req, res) {
      var ip = req.connection.remoteAddress;
      paperboy
        .deliver(WEBROOT, req, res)
        .addHeader('Expires', 300)
        .addHeader('X-PaperRoute', 'Node')
        .before(function() {
          console.log('Received Request');
        })
        .after(function(statCode) {
          log(statCode, req.url, ip);
        })
        .error(function(statCode, msg) {
          res.writeHead(statCode, {'Content-Type': 'text/plain'});
          res.end("Error " + statCode);
          log(statCode, req.url, ip, msg);
        })
        .otherwise(function(err) {
          res.writeHead(404, {'Content-Type': 'text/plain'});
          res.end("Error 404: File not found");
          log(404, req.url, ip, err);
        });
    }).listen(PORT);
    
    function log(statCode, url, ip, err) {
      var logStr = statCode + ' - ' + url + ' - ' + ip;
      if (err)
        logStr += ' - ' + err;
      console.log(logStr);
    }

## API Docs

### paperboy.deliver(webroot, req, res)

Checks the `webroot` folder if it has a file that matches the `req.url` and streams it to the client. If `req.url` ends with a '/' (slash), 'index.html' is appended automatically.

Parameters:

* `webroot`: Absolute path where too look for static files to serve
* `req`: A `http.ServerRequest` object
* `res`: A `http.ServerResponse` object

This returns an object with several functions that you can call, to modify how the static content is delivered. Each of these functions returns the object, so you can chain them, as shown in the example above. They each take a callback function, whose arguments and expected behavior are detailed below.

#### before(callback())

Fires if a matching file was found in the `webroot` and is about to be delivered. The delivery can be canceled by returning `false` from within the callback.

#### after(callback(statCode))

Fires after a file has been successfully delivered from the `webroot`. `statCode` contains the numeric HTTP status code that was sent to the client. You must close the connection yourself if the error callback fires!

#### error(callback(statCode, msg))

Fires if there was an error delivering a file from the `webroot`. `statCode` contains the numeric HTTP status code that was sent to the client. `msg` contains the error message. You must close the connection yourself if the error callback fires! The default callback shows a minimal HTTP error page.

#### otherwise(callback(err))

Fires if no matching file was found in the `webroot`. Also fires if `false` was returned in the `delegate.before()` callback. If there was a problem stating the file, `err` is set to the contents of that error message. The default callback shows a simple "HTTP 404 File Not Found" page.

#### addHeader(callback(name, value))

Sets an arbitrary HTTP header. The header name `Expires` is special and expects the number of milliseconds till expiry, from which it will calculate the proper HTTP date.

## License

Paperboy is licensed under the MIT license.

## Credits

* [Jan Lehnardt](http://twitter.com/janl) for coming up with the name "Paperboy"
