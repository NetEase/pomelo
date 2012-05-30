/*
 * Copyright (C) 2010 Google Inc. All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are
 * met:
 *
 *     * Redistributions of source code must retain the above copyright
 * notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above
 * copyright notice, this list of conditions and the following disclaimer
 * in the documentation and/or other materials provided with the
 * distribution.
 *     * Neither the name of Google Inc. nor the names of its
 * contributors may be used to endorse or promote products derived from
 * this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
 * A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
 * OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 * LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
 * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

/**
 * @constructor
 * @extends {WebInspector.Object}
 */
WebInspector.DebuggerModel = function()
{
    this._debuggerPausedDetails = null;
    /**
     * @type {Object.<string, WebInspector.Script>}
     */
    this._scripts = {};

    this._canSetScriptSource = false;

    InspectorBackend.registerDebuggerDispatcher(new WebInspector.DebuggerDispatcher(this));
}

/**
 * @constructor
 * @param {Array.<DebuggerAgent.CallFrame>} callFrames
 * @param {string} reason
 * @param {*} auxData
 */
WebInspector.DebuggerPausedDetails = function(callFrames, reason, auxData)
{
    this.callFrames = callFrames;
    this.reason = reason;
    this.auxData = auxData;
}

/**
 * @constructor
 * @extends {DebuggerAgent.Location}
 * @param {WebInspector.Script} script
 * @param {number} lineNumber
 * @param {number} columnNumber
 */
WebInspector.DebuggerModel.Location = function(script, lineNumber, columnNumber)
{
    this.scriptId = script.scriptId;
    this.lineNumber = lineNumber;
    this.columnNumber = columnNumber;
}

WebInspector.DebuggerModel.Events = {
    DebuggerWasEnabled: "debugger-was-enabled",
    DebuggerWasDisabled: "debugger-was-disabled",
    DebuggerPaused: "debugger-paused",
    DebuggerResumed: "debugger-resumed",
    ParsedScriptSource: "parsed-script-source",
    FailedToParseScriptSource: "failed-to-parse-script-source",
    BreakpointResolved: "breakpoint-resolved",
    GlobalObjectCleared: "global-object-cleared"
}

WebInspector.DebuggerModel.BreakReason = {
    DOM: "DOM",
    EventListener: "EventListener",
    XHR: "XHR",
    Exception: "exception"
}

WebInspector.DebuggerModel.prototype = {
    enableDebugger: function()
    {
        function callback(error, result)
        {
            this._canSetScriptSource = result;
        }
        DebuggerAgent.canSetScriptSource(callback.bind(this));
        DebuggerAgent.enable(this._debuggerWasEnabled.bind(this));
    },

    disableDebugger: function()
    {
        DebuggerAgent.disable(this._debuggerWasDisabled.bind(this));
    },

    /**
     * @return {boolean}
     */
    canSetScriptSource: function()
    {
        return this._canSetScriptSource;
    },

    _debuggerWasEnabled: function()
    {
        this.dispatchEventToListeners(WebInspector.DebuggerModel.Events.DebuggerWasEnabled);
    },

    _debuggerWasDisabled: function()
    {
        this.dispatchEventToListeners(WebInspector.DebuggerModel.Events.DebuggerWasDisabled);
    },

    /**
     * @param {DebuggerAgent.Location} location
     */
    continueToLocation: function(location)
    {
        DebuggerAgent.continueToLocation(location);
    },

    /**
     * @param {DebuggerAgent.Location} location
     * @param {string} condition
     * @param {function()} callback
     */
    setBreakpointByScriptLocation: function(location, condition, callback)
    {
        var script = this.scriptForSourceID(location.scriptId);
        if (script.sourceURL)
            this.setBreakpoint(script.sourceURL, location.lineNumber, location.columnNumber, condition, callback);
        else
            this.setBreakpointBySourceId(location, condition, callback);
    },

    /**
     * @param {string} url
     * @param {number} lineNumber
     * @param {number=} columnNumber
     * @param {string=} condition
     * @param {function(?DebuggerAgent.BreakpointId, Array.<DebuggerAgent.Location>=)=} callback
     */
    setBreakpoint: function(url, lineNumber, columnNumber, condition, callback)
    {
        // Adjust column if needed.
        var minColumnNumber = 0;
        for (var id in this._scripts) {
            var script = this._scripts[id];
            if (url === script.sourceURL && lineNumber === script.lineOffset)
                minColumnNumber = minColumnNumber ? Math.min(minColumnNumber, script.columnOffset) : script.columnOffset;
        }
        columnNumber = Math.max(columnNumber, minColumnNumber);

        /**
         * @this {WebInspector.DebuggerModel}
         * @param {?Protocol.Error} error
         * @param {DebuggerAgent.BreakpointId} breakpointId
         * @param {Array.<DebuggerAgent.Location>=} locations
         */
        function didSetBreakpoint(error, breakpointId, locations)
        {
            if (callback)
                callback(error ? null : breakpointId, locations);
        }
        DebuggerAgent.setBreakpointByUrl(lineNumber, url, undefined, columnNumber, condition, didSetBreakpoint.bind(this));
        WebInspector.userMetrics.ScriptsBreakpointSet.record();
    },

    /**
     * @param {DebuggerAgent.Location} location
     * @param {string} condition
     * @param {function(?DebuggerAgent.BreakpointId, Array.<DebuggerAgent.Location>)=} callback
     */
    setBreakpointBySourceId: function(location, condition, callback)
    {
        /**
         * @this {WebInspector.DebuggerModel}
         * @param {?Protocol.Error} error
         * @param {DebuggerAgent.BreakpointId} breakpointId
         * @param {DebuggerAgent.Location} actualLocation
         */
        function didSetBreakpoint(error, breakpointId, actualLocation)
        {
            if (callback)
                callback(error ? null : breakpointId, [actualLocation]);
        }
        DebuggerAgent.setBreakpoint(location, condition, didSetBreakpoint.bind(this));
        WebInspector.userMetrics.ScriptsBreakpointSet.record();
    },

    /**
     * @param {DebuggerAgent.BreakpointId} breakpointId
     * @param {function(?Protocol.Error)=} callback
     */
    removeBreakpoint: function(breakpointId, callback)
    {
        DebuggerAgent.removeBreakpoint(breakpointId, callback);
    },

    /**
     * @param {DebuggerAgent.BreakpointId} breakpointId
     * @param {DebuggerAgent.Location} location
     */
    _breakpointResolved: function(breakpointId, location)
    {
        this.dispatchEventToListeners(WebInspector.DebuggerModel.Events.BreakpointResolved, {breakpointId: breakpointId, location: location});
    },

    _globalObjectCleared: function()
    {
        this._debuggerPausedDetails = null;
        this._scripts = {};
        this.dispatchEventToListeners(WebInspector.DebuggerModel.Events.GlobalObjectCleared);
    },

    /**
     * @return {Object.<string, WebInspector.Script>}
     */
    get scripts()
    {
        return this._scripts;
    },

    /**
     * @param {DebuggerAgent.ScriptId} scriptId
     * @return {WebInspector.Script}
     */
    scriptForSourceID: function(scriptId)
    {
        return this._scripts[scriptId] || null;
    },

    /**
     * @param {DebuggerAgent.ScriptId} scriptId
     * @param {string} newSource
     * @param {function(?Protocol.Error)} callback
     */
    setScriptSource: function(scriptId, newSource, callback)
    {
        this._scripts[scriptId].editSource(newSource, this._didEditScriptSource.bind(this, scriptId, newSource, callback));
    },

    /**
     * @param {DebuggerAgent.ScriptId} scriptId
     * @param {string} newSource
     * @param {function(?Protocol.Error)} callback
     * @param {?Protocol.Error} error
     * @param {Array.<DebuggerAgent.CallFrame>=} callFrames
     */
    _didEditScriptSource: function(scriptId, newSource, callback, error, callFrames)
    {
        if (!error && callFrames && callFrames.length)
            this._debuggerPausedDetails.callFrames = callFrames;
        callback(error);
    },

    /**
     * @return {Array.<DebuggerAgent.CallFrame>}
     */
    get callFrames()
    {
        return this._debuggerPausedDetails ? this._debuggerPausedDetails.callFrames : null;
    },

    /**
     * @return {?WebInspector.DebuggerPausedDetails}
     */
    get debuggerPausedDetails()
    {
        return this._debuggerPausedDetails;
    },

    /**
     * @param {Array.<DebuggerAgent.CallFrame>} callFrames
     * @param {string} reason
     * @param {*} auxData
     */
    _pausedScript: function(callFrames, reason, auxData)
    {
        this._debuggerPausedDetails = new WebInspector.DebuggerPausedDetails(callFrames, reason, auxData);
        this.dispatchEventToListeners(WebInspector.DebuggerModel.Events.DebuggerPaused, this._debuggerPausedDetails);
    },

    _resumedScript: function()
    {
        this._debuggerPausedDetails = null;
        this.dispatchEventToListeners(WebInspector.DebuggerModel.Events.DebuggerResumed);
    },

    /**
     * @param {DebuggerAgent.ScriptId} scriptId
     * @param {string} sourceURL
     * @param {number} startLine
     * @param {number} startColumn
     * @param {number} endLine
     * @param {number} endColumn
     * @param {boolean} isContentScript
     */
    _parsedScriptSource: function(scriptId, sourceURL, startLine, startColumn, endLine, endColumn, isContentScript, sourceMapURL)
    {
        var script = new WebInspector.Script(scriptId, sourceURL, startLine, startColumn, endLine, endColumn, isContentScript, sourceMapURL);
        this._scripts[scriptId] = script;
        this.dispatchEventToListeners(WebInspector.DebuggerModel.Events.ParsedScriptSource, script);
    },

    /**
     * @param {string} sourceURL
     * @param {string} source
     * @param {number} startingLine
     * @param {number} errorLine
     * @param {string} errorMessage
     */
    _failedToParseScriptSource: function(sourceURL, source, startingLine, errorLine, errorMessage)
    {
        var script = new WebInspector.Script("", sourceURL, startingLine, 0, 0, 0, false);
        this.dispatchEventToListeners(WebInspector.DebuggerModel.Events.FailedToParseScriptSource, script);
    },

    /**
     * @param {WebInspector.Script} script
     * @param {number} lineNumber
     * @param {number} columnNumber
     * @return {DebuggerAgent.Location}
     */
    createRawLocation: function(script, lineNumber, columnNumber)
    {
        if (script.sourceURL)
            return this.createRawLocationByURL(script.sourceURL, lineNumber, columnNumber)
        return new WebInspector.DebuggerModel.Location(script, lineNumber, columnNumber);
    },

    /**
     * @param {string} sourceURL
     * @param {number} lineNumber
     * @param {number} columnNumber
     * @return {DebuggerAgent.Location}
     */
    createRawLocationByURL: function(sourceURL, lineNumber, columnNumber)
    {
        var closestScript = null;
        for (var scriptId in this._scripts) {
            var script = this._scripts[scriptId];
            if (script.sourceURL !== sourceURL)
                continue;
            if (!closestScript)
                closestScript = script;
            if (script.lineOffset > lineNumber || (script.lineOffset === lineNumber && script.columnOffset > columnNumber))
                continue;
            if (script.endLine < lineNumber || (script.endLine === lineNumber && script.endColumn <= columnNumber))
                continue;
            closestScript = script;
            break;
        }
        return closestScript ? new WebInspector.DebuggerModel.Location(closestScript, lineNumber, columnNumber) : null;
    }
}

WebInspector.DebuggerModel.prototype.__proto__ = WebInspector.Object.prototype;

WebInspector.DebuggerEventTypes = {
    JavaScriptPause: 0,
    JavaScriptBreakpoint: 1,
    NativeBreakpoint: 2
};

/**
 * @constructor
 * @implements {DebuggerAgent.Dispatcher}
 * @param {WebInspector.DebuggerModel} debuggerModel
 */
WebInspector.DebuggerDispatcher = function(debuggerModel)
{
    this._debuggerModel = debuggerModel;
}

WebInspector.DebuggerDispatcher.prototype = {
    /**
     * @param {Array.<DebuggerAgent.CallFrame>} callFrames
     * @param {string} reason
     * @param {*} auxData
     */
    paused: function(callFrames, reason, auxData)
    {
        this._debuggerModel._pausedScript(callFrames, reason, auxData);
    },

    resumed: function()
    {
        this._debuggerModel._resumedScript();
    },

    globalObjectCleared: function()
    {
        this._debuggerModel._globalObjectCleared();
    },

    /**
     * @param {DebuggerAgent.ScriptId} scriptId
     * @param {string} sourceURL
     * @param {number} startLine
     * @param {number} startColumn
     * @param {number} endLine
     * @param {number} endColumn
     * @param {boolean=} isContentScript
     */
    scriptParsed: function(scriptId, sourceURL, startLine, startColumn, endLine, endColumn, isContentScript, sourceMapURL)
    {
        this._debuggerModel._parsedScriptSource(scriptId, sourceURL, startLine, startColumn, endLine, endColumn, !!isContentScript, sourceMapURL);
    },

    /**
     * @param {string} sourceURL
     * @param {string} source
     * @param {number} startingLine
     * @param {number} errorLine
     * @param {string} errorMessage
     */
    scriptFailedToParse: function(sourceURL, source, startingLine, errorLine, errorMessage)
    {
        this._debuggerModel._failedToParseScriptSource(sourceURL, source, startingLine, errorLine, errorMessage);
    },

    /**
    * @param {DebuggerAgent.BreakpointId} breakpointId
    * @param {DebuggerAgent.Location} location
     */
    breakpointResolved: function(breakpointId, location)
    {
        this._debuggerModel._breakpointResolved(breakpointId, location);
    }
}

/**
 * @type {?WebInspector.DebuggerModel}
 */
WebInspector.debuggerModel = null;
