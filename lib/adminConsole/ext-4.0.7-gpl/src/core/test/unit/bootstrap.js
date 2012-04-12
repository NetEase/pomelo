/*

This file is part of Ext JS 4

Copyright (c) 2011 Sencha Inc

Contact:  http://www.sencha.com/contact

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please contact the sales department at http://www.sencha.com/contact.

*/
(function() {
    var rootPath =  '../../../../extjs/', 
        bootstrap;

    bootstrap = this.ExtBootstrap = {
        rootPath: rootPath,

        disableCaching: window.location.search.match('(\\?|&)disableCacheBuster=true') === null,
        
        cacheBuster: function() {
            return ((this.disableCaching) ? ('?' + (new Date()).getTime()) : '');
        },
        
        loadScript: function(path) {
            document.write('<script type="text/javascript" src="' + rootPath + path + this.cacheBuster() + '"></script>');
        },
                
        loadSpecs: function(callback) {
            ExtBootstrap.afterAllSpecsAreLoaded = callback;
            ExtBootstrap.pendingSpecs = 0;
            ExtBootstrap.loadedSpecs = 0;
            Ext.Array.each(ExtSpecs, function(spec) {
                ExtBootstrap.pendingSpecs++;
                Ext.Loader.injectScriptElement(spec + ExtBootstrap.cacheBuster(), ExtBootstrap.afterSpecLoad, ExtBootstrap.afterSpecLoad, ExtBootstrap);
            });
        },
        
        afterSpecLoad: function() {
            ExtBootstrap.loadedSpecs++;
            if (ExtBootstrap.loadedSpecs == ExtBootstrap.pendingSpecs) {
                ExtBootstrap.afterAllSpecsAreLoaded();
            }
        }
    };
    
    bootstrap.loadScript('../testreporter/deploy/testreporter/jasmine.js');
    bootstrap.loadScript('../platform/core/test/unit/data.js');
    bootstrap.loadScript('bootstrap/data.js');
    bootstrap.loadScript('bootstrap/core.js');
})();


