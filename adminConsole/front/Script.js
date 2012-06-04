/*
 * Copyright (C) 2008 Apple Inc. All Rights Reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions
 * are met:
 * 1. Redistributions of source code must retain the above copyright
 *    notice, this list of conditions and the following disclaimer.
 * 2. Redistributions in binary form must reproduce the above copyright
 *    notice, this list of conditions and the following disclaimer in the
 *    documentation and/or other materials provided with the distribution.
 *
 * THIS SOFTWARE IS PROVIDED BY APPLE INC. ``AS IS'' AND ANY
 * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR
 * PURPOSE ARE DISCLAIMED.  IN NO EVENT SHALL APPLE INC. OR
 * CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
 * EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
 * PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
 * PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY
 * OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

/**
 * @constructor
 * @param {string} scriptId
 * @param {string} sourceURL
 * @param {number} startLine
 * @param {number} startColumn
 * @param {number} endLine
 * @param {number} endColumn
 * @param {boolean} isContentScript
 * @param {string=} sourceMapURL
 */
WebInspector.Script = function(scriptId, sourceURL, startLine, startColumn, endLine, endColumn, isContentScript, sourceMapURL)
{
    this.scriptId = scriptId;
    this.sourceURL = sourceURL;
    this.lineOffset = startLine;
    this.columnOffset = startColumn;
    this.endLine = endLine;
    this.endColumn = endColumn;
    this.isContentScript = isContentScript;
    this.sourceMapURL = sourceMapURL;
}

WebInspector.Script.prototype = {
    /**
     * @param {function(string)} callback
     */
    requestSource: function(callback)
    {
        if (this._source) {
            callback(this._source);
            return;
        }

        /**
         * @this {WebInspector.Script}
         * @param {?Protocol.Error} error
         * @param {string} source
         */
        function didGetScriptSource(error, source)
        {
            this._source = error ? "" : source;
            callback(this._source);
        }
        if (this.scriptId) {
            // Script failed to parse.
            DebuggerAgent.getScriptSource(this.scriptId, didGetScriptSource.bind(this));
        } else
            callback("");
    },

    /**
     * @param {string} query
     * @param {boolean} caseSensitive
     * @param {boolean} isRegex
     * @param {function(Array.<PageAgent.SearchMatch>)} callback
     */
    searchInContent: function(query, caseSensitive, isRegex, callback)
    {
        /**
         * @this {WebInspector.Script}
         * @param {?Protocol.Error} error
         * @param {Array.<PageAgent.SearchMatch>} searchMatches
         */
        function innerCallback(error, searchMatches)
        {
            if (error)
                console.error(error);
            var result = [];
            for (var i = 0; i < searchMatches.length; ++i) {
                var searchMatch = new WebInspector.ContentProvider.SearchMatch(searchMatches[i].lineNumber, searchMatches[i].lineContent);
                result.push(searchMatch);
            }
            callback(result || []);
        }

        if (this.scriptId) {
            // Script failed to parse.
            DebuggerAgent.searchInContent(this.scriptId, query, caseSensitive, isRegex, innerCallback.bind(this));
        } else
            callback([]);
    },

    /**
     * @param {string} newSource
     * @param {function(?Protocol.Error, Array.<DebuggerAgent.CallFrame>=)} callback
     */
    editSource: function(newSource, callback)
    {
        /**
         * @this {WebInspector.Script}
         * @param {?Protocol.Error} error
         * @param {Array.<DebuggerAgent.CallFrame>|undefined} callFrames
         */
        function didEditScriptSource(error, callFrames)
        {
            if (!error)
                this._source = newSource;
            callback(error, callFrames);
        }
        if (this.scriptId) {
            // Script failed to parse.
            DebuggerAgent.setScriptSource(this.scriptId, newSource, undefined, didEditScriptSource.bind(this));
        } else
            callback("Script failed to parse");
    },

    /**
     * @return {boolean}
     */
    isInlineScript: function()
    {
        return !!this.sourceURL && this.lineOffset !== 0 && this.columnOffset !== 0;
    }
}
