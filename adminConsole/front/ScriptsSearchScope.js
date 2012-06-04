/*
 * Copyright (C) 2011 Google Inc. All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are
 * met:
 *
 * 1. Redistributions of source code must retain the above copyright
 * notice, this list of conditions and the following disclaimer.
 *
 * 2. Redistributions in binary form must reproduce the above
 * copyright notice, this list of conditions and the following disclaimer
 * in the documentation and/or other materials provided with the
 * distribution.
 *
 * THIS SOFTWARE IS PROVIDED BY GOOGLE INC. AND ITS CONTRIBUTORS
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
 * A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL GOOGLE INC.
 * OR ITS CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 * LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
 * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

/**
 * @constructor
 * @implements {WebInspector.SearchScope}
 */
WebInspector.ScriptsSearchScope = function()
{
    // FIXME: Add title once it is used by search controller.
    WebInspector.SearchScope.call(this)
    this._searchId = 0;
}

WebInspector.ScriptsSearchScope.prototype = {
    /**
     * @param {WebInspector.SearchConfig} searchConfig
     * @param {function(Object)} searchResultCallback
     * @param {function(boolean)} searchFinishedCallback
     */
    performSearch: function(searchConfig, searchResultCallback, searchFinishedCallback)
    {
        this.stopSearch();
        
        var uiSourceCodes = this._sortedUISourceCodes();
        var uiSourceCodeIndex = 0;
        
        function filterOutContentScripts(uiSourceCode)
        {
            return !uiSourceCode.isContentScript;
        }
        
        if (!WebInspector.settings.searchInContentScripts.get())
            uiSourceCodes = uiSourceCodes.filter(filterOutContentScripts);

        function continueSearch()
        {
            // FIXME: Enable support for counting matches for incremental search.
            // FIXME: Enable support for bounding search results/matches number to keep inspector responsive.
            if (uiSourceCodeIndex < uiSourceCodes.length) {
                var uiSourceCode = uiSourceCodes[uiSourceCodeIndex++];
                uiSourceCode.searchInContent(searchConfig.query, !searchConfig.ignoreCase, searchConfig.isRegex, searchCallbackWrapper.bind(this, this._searchId, uiSourceCode));
            } else 
                searchFinishedCallback(true);
        }

        function searchCallbackWrapper(searchId, uiSourceCode, searchMatches)
        {
            if (searchId !== this._searchId) {
                searchFinishedCallback(false);
                return;
            }
                
            var searchResult = new WebInspector.FileBasedSearchResultsPane.SearchResult(uiSourceCode, searchMatches);
            searchResultCallback(searchResult);
            continueSearch.call(this);
        }
        
        continueSearch.call(this);
        return uiSourceCodes.length;
    },

    stopSearch: function()
    {
        ++this._searchId;
    },

    /**
     * @param {WebInspector.SearchConfig} searchConfig
     */
    createSearchResultsPane: function(searchConfig)
    {
        return new WebInspector.ScriptsSearchResultsPane(searchConfig);
    },

    /**
     * @return {Array.<WebInspector.UISourceCode>}
     */
    _sortedUISourceCodes: function()
    {
        function filterOutAnonymous(uiSourceCode)
        {
            return !!uiSourceCode.url;
        }
        
        function comparator(a, b)
        {
            return a.url.localeCompare(b.url);   
        }
        
        var uiSourceCodes = WebInspector.debuggerPresentationModel.uiSourceCodes();
        
        uiSourceCodes = uiSourceCodes.filter(filterOutAnonymous);
        uiSourceCodes.sort(comparator);
        
        return uiSourceCodes;
    }
}

WebInspector.ScriptsSearchScope.prototype.__proto__ = WebInspector.SearchScope.prototype;

/**
 * @constructor
 * @extends {WebInspector.FileBasedSearchResultsPane}
 * @param {WebInspector.SearchConfig} searchConfig
 */
WebInspector.ScriptsSearchResultsPane = function(searchConfig)
{
    WebInspector.FileBasedSearchResultsPane.call(this, searchConfig)

    this._linkifier = WebInspector.debuggerPresentationModel.createLinkifier(new WebInspector.ScriptsSearchResultsPane.LinkifierFormatter());
}

WebInspector.ScriptsSearchResultsPane.prototype = {
    /**
     * @param {Object} file
     * @param {number} lineNumber
     * @param {number} columnNumber
     */
    createAnchor: function(file, lineNumber, columnNumber)
    {
        var uiSourceCode = /** @type {WebInspector.UISourceCode} */ file;
        var rawLocation = WebInspector.debuggerPresentationModel.uiLocationToRawLocation(uiSourceCode, lineNumber, columnNumber);
        var anchor = this._linkifier.linkifyRawLocation(rawLocation);
        anchor.removeChildren();
        return anchor;
    },
    
    /**
     * @param {Object} file
     * @return {string}
     */
    fileName: function(file)
    {
        var uiSourceCode = file;
        return uiSourceCode.url;
    },
}

WebInspector.ScriptsSearchResultsPane.prototype.__proto__ = WebInspector.FileBasedSearchResultsPane.prototype;

/**
 * @constructor
 * @implements {WebInspector.DebuggerPresentationModel.LinkifierFormatter}
 */
WebInspector.ScriptsSearchResultsPane.LinkifierFormatter = function()
{
}

WebInspector.ScriptsSearchResultsPane.LinkifierFormatter.prototype = {
    /**
     * @param {Element} anchor
     * @param {WebInspector.UILocation} uiLocation
     */
    formatLiveAnchor: function(anchor, uiLocation)
    {
        // Empty because we don't want to ever update anchor contents after creation.
    }
}

WebInspector.ScriptsSearchResultsPane.LinkifierFormatter.prototype.__proto__ = WebInspector.DebuggerPresentationModel.LinkifierFormatter.prototype;

WebInspector.settings.searchInContentScripts = WebInspector.settings.createSetting("searchInContentScripts", false);
