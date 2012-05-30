/*
 * Copyright (C) 2012 Google Inc. All rights reserved.
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
WebInspector.ScriptMapping = function()
{
}

WebInspector.ScriptMapping.Events = {
    UISourceCodeListChanged: "ui-source-code-list-changed",
    ScriptBound: "script-bound",
    ScriptUnbound: "script-unbound",
}

WebInspector.ScriptMapping.prototype = {
    /**
     * @param {DebuggerAgent.Location} rawLocation
     * @return {WebInspector.UILocation}
     */
    rawLocationToUILocation: function(rawLocation) {},

    /**
     * @param {WebInspector.UISourceCode} uiSourceCode
     * @param {number} lineNumber
     * @param {number} columnNumber
     * @return {DebuggerAgent.Location}
     */
    uiLocationToRawLocation: function(uiSourceCode, lineNumber, columnNumber) {},

    /**
     * @return {Array.<WebInspector.UISourceCode>}
     */
    uiSourceCodeList: function() {}
}

WebInspector.ScriptMapping.prototype.__proto__ = WebInspector.Object.prototype;

/**
 * @constructor
 * @extends {WebInspector.Object}
 */
WebInspector.MainScriptMapping = function()
{
    this._mappings = [];

    this._resourceMapping = new WebInspector.ResourceScriptMapping();
    this._mappings.push(this._resourceMapping);
    this._compilerMapping = new WebInspector.CompilerScriptMapping();
    this._mappings.push(this._compilerMapping);
    this._snippetsMapping = new WebInspector.SnippetsScriptMapping();
    this._mappings.push(this._snippetsMapping);

    for (var i = 0; i < this._mappings.length; ++i) {
        this._mappings[i].addEventListener(WebInspector.ScriptMapping.Events.UISourceCodeListChanged, this._handleUISourceCodeListChanged, this);
        this._mappings[i].addEventListener(WebInspector.ScriptMapping.Events.ScriptBound, this._handleScriptBound, this);
        this._mappings[i].addEventListener(WebInspector.ScriptMapping.Events.ScriptUnbound, this._handleScriptUnbound, this);
    }

    this._mappingForScriptId = {};
    this._mappingForUISourceCode = new Map();
    this._liveLocationsForScriptId = {};
}

WebInspector.MainScriptMapping.Events = {
    UISourceCodeListChanged: "ui-source-code-list-changed"
}

WebInspector.MainScriptMapping.prototype = {
    /**
     * @param {DebuggerAgent.Location} rawLocation
     * @return {WebInspector.UILocation}
     */
    rawLocationToUILocation: function(rawLocation)
    {
        return this._mappingForScriptId[rawLocation.scriptId].rawLocationToUILocation(rawLocation);
    },

    /**
     * @param {WebInspector.UISourceCode} uiSourceCode
     * @param {number} lineNumber
     * @param {number} columnNumber
     * @return {DebuggerAgent.Location}
     */
    uiLocationToRawLocation: function(uiSourceCode, lineNumber, columnNumber)
    {
        return this._mappingForUISourceCode.get(uiSourceCode).uiLocationToRawLocation(uiSourceCode, lineNumber, columnNumber);
    },

    /**
     * @param {DebuggerAgent.Location} rawLocation
     * @param {function(WebInspector.UILocation)} updateDelegate
     * @return {WebInspector.LiveLocation}
     */
    createLiveLocation: function(rawLocation, updateDelegate)
    {
        return new WebInspector.LiveLocation(this, rawLocation, updateDelegate);
    },

    _registerLiveLocation: function(scriptId, liveLocation)
    {
        this._liveLocationsForScriptId[scriptId].push(liveLocation)
        liveLocation._update();
    },

    _unregisterLiveLocation: function(scriptId, liveLocation)
    {
        if (this._liveLocationsForScriptId[scriptId])
            this._liveLocationsForScriptId[scriptId].remove(liveLocation);
    },

    _updateLiveLocation: function(scriptId)
    {
        var liveLocations = this._liveLocationsForScriptId[scriptId];
        for (var j = 0; j < liveLocations.length; ++j)
            liveLocations[j]._update();
    },

    /**
     * @return {Array.<WebInspector.UISourceCode>}
     */
    uiSourceCodeList: function()
    {
        var result = [];
        for (var i = 0; i < this._mappings.length; ++i) {
            var uiSourceCodeList = this._mappings[i].uiSourceCodeList();
            for (var j = 0; j < uiSourceCodeList.length; ++j)
                result.push(uiSourceCodeList[j]);
        }
        return result;
    },

    /**
     * @param {WebInspector.Script} script
     */
    addScript: function(script)
    {
        this._liveLocationsForScriptId[script.scriptId] = [];

        var mapping = this._mappingForScript(script);
        this._mappingForScriptId[script.scriptId] = mapping;
        mapping.addScript(script);
    },

    /**
     * @param {WebInspector.Script} script
     * @return {WebInspector.ScriptMapping}
     */
    _mappingForScript: function(script)
    {
        if (WebInspector.experimentsSettings.snippetsSupport.isEnabled()) {
            if (WebInspector.snippetsModel.snippetIdForSourceURL(script.sourceURL))
                return this._snippetsMapping;
        }

        if (WebInspector.settings.sourceMapsEnabled.get() && script.sourceMapURL) {
            if (this._compilerMapping.loadSourceMapForScript(script))
                return this._compilerMapping;
        }

        return this._resourceMapping;
    },

    /**
     * @param {WebInspector.Event} event
     */
    _handleUISourceCodeListChanged: function(event)
    {
        var scriptMapping = /** @type {WebInspector.ScriptMapping} */ event.target;
        var removedItems = /** @type {Array.<WebInspector.UISourceCode>} */ event.data["removedItems"];
        var addedItems = /** @type {Array.<WebInspector.UISourceCode>} */ event.data["addedItems"];

        for (var i = 0; i < removedItems.length; ++i)
            this._mappingForUISourceCode.remove(removedItems[i]);
        for (var i = 0; i < addedItems.length; ++i)
            this._mappingForUISourceCode.put(addedItems[i], scriptMapping);
        this.dispatchEventToListeners(WebInspector.MainScriptMapping.Events.UISourceCodeListChanged, event.data);
    },

    /**
     * @param {WebInspector.Event} event
     */
    _handleScriptBound: function(event)
    {
        var scriptId = /** @type {number} */ event.data.scriptId;
        this._updateLiveLocation(scriptId);
    },

    /**
     * @param {WebInspector.Event} event
     */
    _handleScriptUnbound: function(event)
    {
        var scriptId = /** @type {number} */ event.data.scriptId;
        this._updateLiveLocation(scriptId);
    },


    /**
     * @param {boolean} formatSource
     */
    setFormatSource: function(formatSource)
    {
        this._resourceMapping.setFormatSource(formatSource);
    },

    /**
     * @param {DebuggerAgent.Location} rawLocation
     */
    forceUpdateSourceMapping: function(rawLocation)
    {
        if (this._mappingForScriptId[rawLocation.scriptId] === this._resourceMapping)
            this._resourceMapping.forceUpdateSourceMapping(rawLocation);
    },

    reset: function()
    {
        for (var i = 0; i < this._mappings.length; ++i)
            this._mappings[i].reset();
        this._mappingForScriptId = {};
        this._mappingForUISourceCode = new Map();
        this._liveLocationsForScriptId = {};
    }
}

WebInspector.MainScriptMapping.prototype.__proto__ = WebInspector.Object.prototype;

/**
 * @constructor
 * @param {WebInspector.MainScriptMapping} scriptMapping
 * @param {DebuggerAgent.Location} rawLocation
 * @param {function(WebInspector.UILocation)} updateDelegate
 */
WebInspector.LiveLocation = function(scriptMapping, rawLocation, updateDelegate)
{
    this._scriptMapping = scriptMapping;
    this._rawLocation = rawLocation;
    this._updateDelegate = updateDelegate;
}

WebInspector.LiveLocation.prototype = {
    init: function()
    {
        this._scriptMapping._registerLiveLocation(this._rawLocation.scriptId, this);
    },

    dispose: function()
    {
        this._scriptMapping._unregisterLiveLocation(this._rawLocation.scriptId, this);
    },

    _update: function()
    {
        var uiLocation = this._scriptMapping.rawLocationToUILocation(this._rawLocation);
        if (uiLocation)
            this._updateDelegate(uiLocation);
    }
}
