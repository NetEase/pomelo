/*!
 * Connect - vhost
 * Copyright(c) 2010 Sencha Inc.
 * Copyright(c) 2011 TJ Holowaychuk
 * MIT Licensed
 */

/**
 * Vhost:
 * 
 *   Setup vhost for the given `hostname` and `server`.
 *
 *     connect()
 *       .use(connect.vhost('foo.com', fooApp))
 *       .use(connect.vhost('bar.com', barApp))
 *       .use(connect.vhost('*.com', mainApp))
 *
 * @param {String} hostname
 * @param {Server} server
 * @return {Function}
 * @api public
 */

module.exports = function vhost(hostname, server){
  if (!hostname) throw new Error('vhost hostname required');
  if (!server) throw new Error('vhost server required');
  var regexp = new RegExp('^' + hostname.replace(/[*]/g, '(.*?)') + '$', 'i');
  if (server.onvhost) server.onvhost(hostname);
  return function vhost(req, res, next){
    if (!req.headers.host) return next();
    var host = req.headers.host.split(':')[0];
    if (req.subdomains = regexp.exec(host)) {
      req.subdomains = req.subdomains[0].split('.').slice(0, -1);
      server.emit('request', req, res);
    } else {
      next();
    }
  };
};
