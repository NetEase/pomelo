/*
 * Copyright (C) 2011 Google Inc. All rights reserved.
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
 * @param {WebInspector.Setting} breakpointStorage
 * @param {WebInspector.DebuggerModel} debuggerModel
 * @param {WebInspector.MainScriptMapping} scriptMapping
 */
WebInspector.BreakpointManager = function(breakpointStorage, debuggerModel, scriptMapping)
{
    this._breakpointStorage = breakpointStorage;

    /**
     * @type {Object.<string, Object.<string,WebInspector.Breakpoint>>}
     */
    this._breakpointsByUILocation = {};

    this._debuggerModel = debuggerModel;
    this._scriptMapping = scriptMapping;

    /**
     * @type {Object.<DebuggerAgent.BreakpointId, WebInspector.Breakpoint>}
     */
    this._breakpointsByDebuggerId = {};
    this._debuggerModel.addEventListener(WebInspector.DebuggerModel.Events.BreakpointResolved, this._breakpointResolved, this);

    var breakpoints = this._breakpointStorage.get();
    for (var i = 0; i < breakpoints.length; ++i) {
        var breakpoint = WebInspector.Breakpoint.deserialize(breakpoints[i]);
        if (!this._breakpoint(breakpoint.uiSourceCodeId, breakpoint.lineNumber))
            this._addBreakpointToModel(breakpoint);
    }
}

WebInspector.BreakpointManager.prototype = {
    /**
     * @param {WebInspector.UISourceCode} uiSourceCode
     */
    uiSourceCodeAdded: function(uiSourceCode)
    {
        var breakpoints = this._breakpoints(uiSourceCode.id);
        for (var lineNumber in breakpoints) {
            var breakpoint = breakpoints[lineNumber];
            this._addBreakpointToUI(breakpoint, uiSourceCode);
            this._materializeBreakpoint(breakpoint, uiSourceCode);
            if (breakpoint._debuggerLocation)
                this._breakpointDebuggerLocationChanged(breakpoint);
        }
    },

    /**
     * @param {WebInspector.UISourceCode} uiSourceCode
     */
    uiSourceCodeRemoved: function(uiSourceCode)
    {
        var uiBreakpoints = uiSourceCode.breakpoints();
        for (var lineNumber in uiBreakpoints) {
            var uiBreakpoint = uiBreakpoints[lineNumber];
            this._removeBreakpointFromUI(uiBreakpoint);
        }
    },

    /**
     * @param {WebInspector.UISourceCode} uiSourceCode
     * @param {number} lineNumber
     * @param {string} condition
     * @param {boolean} enabled
     */
    setBreakpoint: function(uiSourceCode, lineNumber, condition, enabled)
    {
        if (uiSourceCode.breakpoints()[lineNumber])
            return;
        var breakpoint = new WebInspector.Breakpoint(uiSourceCode.id, lineNumber, condition, enabled, !!uiSourceCode.url);
        this._addBreakpointToModel(breakpoint);
        this._addBreakpointToUI(breakpoint, uiSourceCode);
        this._materializeBreakpoint(breakpoint, uiSourceCode);
    },

    /**
     * @param {WebInspector.UISourceCode} uiSourceCode
     * @param {number} lineNumber
     */
    removeBreakpoint: function(uiSourceCode, lineNumber)
    {
        var uiBreakpoint = uiSourceCode.breakpoints()[lineNumber];
        if (!uiBreakpoint)
            return;
        this._innerRemoveBreakpoint(uiBreakpoint.breakpoint);
    },

    /**
     * @param {WebInspector.Breakpoint} breakpoint
     */
    _innerRemoveBreakpoint: function(breakpoint)
    {
        if (breakpoint.uiBreakpoint)
            this._removeBreakpointFromUI(breakpoint.uiBreakpoint);
        this._removeBreakpointFromModel(breakpoint);
        this._removeBreakpointFromDebugger(breakpoint);
    },

    removeAllBreakpoints: function()
    {
        this._forEachBreakpoint(this._innerRemoveBreakpoint.bind(this));
    },

    /**
     * @param {WebInspector.Breakpoint} breakpoint
     * @param {WebInspector.UISourceCode} uiSourceCode
     */
    _materializeBreakpoint: function(breakpoint, uiSourceCode)
    {
        if (!breakpoint.enabled || breakpoint._materialized)
            return;

        breakpoint._materialized = true;
        var rawLocation = this._scriptMapping.uiLocationToRawLocation(uiSourceCode, breakpoint.lineNumber, 0);
        this._setBreakpointInDebugger(breakpoint, rawLocation);
    },

    /**
     * @param {WebInspector.Breakpoint} breakpoint
     */
    _breakpointDebuggerLocationChanged: function(breakpoint)
    {
        var uiLocation = this._scriptMapping.rawLocationToUILocation(breakpoint._debuggerLocation);
        if (!uiLocation)
            return;
        if (uiLocation.lineNumber === breakpoint.lineNumber)
            return;

        if (!this._moveBreakpointInUI(breakpoint, uiLocation.lineNumber))
            this._removeBreakpointFromDebugger(breakpoint);
    },

    /**
     * @param {WebInspector.Breakpoint} breakpoint
     * @param {number} lineNumber
     * @return {boolean}
     */
    _moveBreakpointInUI: function(breakpoint, lineNumber)
    {
        var uiSourceCode;
        var uiBreakpoint = breakpoint.uiBreakpoint;
        if (uiBreakpoint) {
            this._removeBreakpointFromUI(uiBreakpoint);
            uiSourceCode = uiBreakpoint.uiSourceCode;
        }

        this._removeBreakpointFromModel(breakpoint);
        if (this._breakpoint(breakpoint.uiSourceCodeId, lineNumber))
            return false;
        breakpoint.lineNumber = lineNumber;
        this._addBreakpointToModel(breakpoint);

        if (uiSourceCode)
            this._addBreakpointToUI(breakpoint, uiSourceCode);

        return true;
    },

    /**
     * @param {WebInspector.Breakpoint} breakpoint
     * @param {WebInspector.UISourceCode} uiSourceCode
     */
    _addBreakpointToUI: function(breakpoint, uiSourceCode)
    {
        var uiBreakpoint = breakpoint.createUIBreakpoint(uiSourceCode);
        uiSourceCode.breakpointAdded(uiBreakpoint.lineNumber, uiBreakpoint);
    },

    /**
     * @param {WebInspector.UIBreakpoint} uiBreakpoint
     */
    _removeBreakpointFromUI: function(uiBreakpoint)
    {
        var uiSourceCode = uiBreakpoint.uiSourceCode;
        var lineNumber = uiBreakpoint.lineNumber;
        console.assert(uiSourceCode.breakpoints()[lineNumber] === uiBreakpoint);
        uiSourceCode.breakpointRemoved(lineNumber);
        uiBreakpoint.breakpoint.removeUIBreakpoint();
    },

    /**
     * @param {string} id
     * @return {?Object.<string,WebInspector.Breakpoint>}
     */
    _breakpoints: function(id)
    {
        if (!this._breakpointsByUILocation[id])
            this._breakpointsByUILocation[id] = {};
        return this._breakpointsByUILocation[id];
    },

    /**
     * @param {string} id
     * @param {number} lineNumber
     * @return {?WebInspector.Breakpoint}
     */
    _breakpoint: function(id, lineNumber)
    {
        return this._breakpoints(id)[String(lineNumber)];
    },

    /**
     * @param {WebInspector.Breakpoint} breakpoint
     */
    _addBreakpointToModel: function(breakpoint)
    {
        console.assert(!this._breakpoint(breakpoint.uiSourceCodeId, breakpoint.lineNumber));
        this._breakpoints(breakpoint.uiSourceCodeId)[breakpoint.lineNumber] = breakpoint;
        this._saveBreakpoints();
    },

    /**
     * @param {WebInspector.Breakpoint} breakpoint
     */
    _removeBreakpointFromModel: function(breakpoint)
    {
        console.assert(this._breakpoint(breakpoint.uiSourceCodeId, breakpoint.lineNumber) === breakpoint);
        delete this._breakpoints(breakpoint.uiSourceCodeId)[breakpoint.lineNumber];
        this._saveBreakpoints();
    },

    /**
     * @param {function(WebInspector.Breakpoint)} handler
     */
    _forEachBreakpoint: function(handler)
    {
        for (var id in this._breakpointsByUILocation) {
            var breakpoints = this._breakpointsByUILocation[id];
            for (var lineNumber in breakpoints)
                handler(breakpoints[lineNumber]);
        }
    },

    /**
     * @param {WebInspector.Breakpoint} breakpoint
     * @param {DebuggerAgent.Location} rawLocation
     */
    _setBreakpointInDebugger: function(breakpoint, rawLocation)
    {
        /**
         * @this {WebInspector.BreakpointManager}
         * @param {DebuggerAgent.BreakpointId} breakpointId
         * @param {Array.<DebuggerAgent.Location>} locations
         */
        function didSetBreakpoint(breakpointId, locations)
        {
            if (breakpoint === this._breakpoint(breakpoint.uiSourceCodeId, breakpoint.lineNumber)) {
                if (!breakpointId) {
                    if (breakpoint.uiBreakpoint)
                        this._removeBreakpointFromUI(breakpoint.uiBreakpoint);
                    this._removeBreakpointFromModel(breakpoint);
                    return;
                }
            } else {
                if (breakpointId)
                    this._debuggerModel.removeBreakpoint(breakpointId);
                return;
            }

            this._breakpointsByDebuggerId[breakpointId] = breakpoint;
            breakpoint._debuggerId = breakpointId;
            breakpoint._debuggerLocation = locations[0];
            if (breakpoint._debuggerLocation)
                this._breakpointDebuggerLocationChanged(breakpoint);
        }
        this._debuggerModel.setBreakpointByScriptLocation(rawLocation, breakpoint.condition, didSetBreakpoint.bind(this));
    },

    /**
     * @param {WebInspector.Breakpoint} breakpoint
     */
    _removeBreakpointFromDebugger: function(breakpoint)
    {
        if (typeof(breakpoint._debuggerId) === "undefined")
            return;
        this._debuggerModel.removeBreakpoint(breakpoint._debuggerId);
        delete this._breakpointsByDebuggerId[breakpoint._debuggerId];
        delete breakpoint._debuggerId;
        delete breakpoint._debuggerLocation;
    },

    /**
     * @param {WebInspector.Event} event
     */
    _breakpointResolved: function(event)
    {
        var breakpoint = this._breakpointsByDebuggerId[event.data["breakpointId"]];
        breakpoint._debuggerLocation = event.data["location"];
        this._breakpointDebuggerLocationChanged(breakpoint);
    },

    _saveBreakpoints: function()
    {
        var serializedBreakpoints = [];
        /**
         * @this {WebInspector.BreakpointManager}
         * @param {WebInspector.Breakpoint} breakpoint
         */
        function serializePersistent(breakpoint)
        {
            if (breakpoint.persistent)
                serializedBreakpoints.push(breakpoint.serialize());
        }
        this._forEachBreakpoint(serializePersistent.bind(this));
        this._breakpointStorage.set(serializedBreakpoints);
    },

    reset: function()
    {
        /**
         * @this {WebInspector.BreakpointManager}
         * @param {WebInspector.Breakpoint} breakpoint
         */
        function resetBreakpoint(breakpoint)
        {
            this._removeBreakpointFromDebugger(breakpoint);
            delete breakpoint._materialized;
        }
        this._forEachBreakpoint(resetBreakpoint.bind(this));
    },

    debuggerReset: function()
    {
        /**
         * @this {WebInspector.BreakpointManager}
         * @param {WebInspector.Breakpoint} breakpoint
         */
        function resetOrDeleteBreakpoint(breakpoint)
        {
            if (breakpoint.uiBreakpoint)
                this._removeBreakpointFromUI(breakpoint.uiBreakpoint);
            if (breakpoint.persistent)
                delete breakpoint._debuggerLocation;
            else {
                this._removeBreakpointFromModel(breakpoint);
                delete this._breakpointsByDebuggerId[breakpoint._debuggerId];
            }
        }
        this._forEachBreakpoint(resetOrDeleteBreakpoint.bind(this));

        for (var id in this._breakpointsByUILocation) {
            var empty = true;
            for (var lineNumber in this._breakpointsByUILocation[id]) {
                empty = false;
                break;
            }
            if (empty)
                delete this._breakpointsByUILocation[id];
        }
    }
}

/**
 * @constructor
 * @param {string} uiSourceCodeId
 * @param {number} lineNumber
 * @param {string} condition
 * @param {boolean} enabled
 * @param {boolean} persistent
 */
WebInspector.Breakpoint = function(uiSourceCodeId, lineNumber, condition, enabled, persistent)
{
    this.uiSourceCodeId = uiSourceCodeId;
    this.lineNumber = lineNumber;
    this.condition = condition;
    this.enabled = enabled;
    this.persistent = persistent;
}

WebInspector.Breakpoint.prototype = {
    /**
     * @return {Object}
     */
    serialize: function()
    {
        var serializedBreakpoint = {};
        serializedBreakpoint.sourceFileId = this.uiSourceCodeId;
        serializedBreakpoint.lineNumber = this.lineNumber;
        serializedBreakpoint.condition = this.condition;
        serializedBreakpoint.enabled = this.enabled;
        return serializedBreakpoint;
    },

    /**
     * @type {WebInspector.UIBreakpoint}
     */
    get uiBreakpoint()
    {
        return this._uiBreakpoint;
    },

    /**
     * @param {WebInspector.UISourceCode} uiSourceCode
     * @return {WebInspector.UIBreakpoint}
     */
    createUIBreakpoint: function(uiSourceCode)
    {
        this._uiBreakpoint = new WebInspector.UIBreakpoint(uiSourceCode, this.lineNumber, this.condition, this.enabled, this);
        return this._uiBreakpoint;
    },

    removeUIBreakpoint: function()
    {
        delete this._uiBreakpoint;
    }
}

/**
 * @param {Object} serializedBreakpoint
 * @return {WebInspector.Breakpoint}
 */
WebInspector.Breakpoint.deserialize = function(serializedBreakpoint)
{
    return new WebInspector.Breakpoint(
            serializedBreakpoint.sourceFileId,
            serializedBreakpoint.lineNumber,
            serializedBreakpoint.condition,
            serializedBreakpoint.enabled,
            true);
}

/**
 * @constructor
 * @param {WebInspector.UISourceCode} uiSourceCode
 * @param {number} lineNumber
 * @param {string} condition
 * @param {boolean} enabled
 * @param {WebInspector.Breakpoint} breakpoint
 */
WebInspector.UIBreakpoint = function(uiSourceCode, lineNumber, condition, enabled, breakpoint)
{
    this.uiSourceCode = uiSourceCode;
    this.lineNumber = lineNumber;
    this.condition = condition;
    this.enabled = enabled;
    this.breakpoint = breakpoint;
    this.resolved = true;
}
