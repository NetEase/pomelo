
__resources__["/__builtin__/platform.js"] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {
var ex = {
  domReady: function() {
    if (this._isReady) {
      return;
    }

    if (!document.body) {
      setTimeout(function() { ex.domReady(); }, 13);
    }

    window.__isReady = true;

    if (window.__readyList) {
      var fn, i = 0;
      while ( (fn = window.__readyList[ i++ ]) ) {
        fn.call(document);
      }

      window.__readyList = null;
      delete window.__readyList;
    }
  },


  /**
     * Adapted from jQuery
     * @ignore
     */
  bindReady: function() {

    if (window.__readyBound) {
      return;
    }

    window.__readyBound = true;

    // Catch cases where $(document).ready() is called after the
    // browser event has already occurred.
    if ( document.readyState === "complete" ) {
      return ex.domReady();
    }

    // Mozilla, Opera and webkit nightlies currently support this event
    if ( document.addEventListener ) {
      // Use the handy event callback
      //document.addEventListener( "DOMContentLoaded", DOMContentLoaded, false );
      
      // A fallback to window.onload, that will always work
      window.addEventListener( "load", ex.domReady, false );

      // If IE event model is used
    } else if ( document.attachEvent ) {
      // ensure firing before onload,
      // maybe late but safe also for iframes
      //document.attachEvent("onreadystatechange", DOMContentLoaded);
      
      // A fallback to window.onload, that will always work
      window.attachEvent( "onload", ex.domReady );

      // If IE and not a frame
      /*
            // continually check to see if the document is ready
            var toplevel = false;

            try {
                toplevel = window.frameElement == null;
            } catch(e) {}

            if ( document.documentElement.doScroll && toplevel ) {
                doScrollCheck();
            }
            */
    }
  },

  ready: function(func) {
    if (window.__isReady) {
      func()
    } else {
      if (!window.__readyList) {
        window.__readyList = [];
      }
      window.__readyList.push(func);
    }

    ex.bindReady();
  }
};

module.exports = ex;

}};