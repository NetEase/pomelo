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
 * @extends {WebInspector.ScriptMapping}
 */
WebInspector.ResourceScriptMapping = function()
{
    this._rawSourceCodes = [];
    this._rawSourceCodeForScriptId = {};
    this._rawSourceCodeForURL = {};
    this._rawSourceCodeForDocumentURL = {};
    this._rawSourceCodeForUISourceCode = new Map();
    this._formatter = new WebInspector.ScriptFormatter();
    this._formatSource = false;
}

WebInspector.ResourceScriptMapping.prototype = {
    /**
     * @param {DebuggerAgent.Location} rawLocation
     * @return {WebInspector.UILocation}
     */
    rawLocationToUILocation: function(rawLocation)
    {
        var rawSourceCode = this._rawSourceCodeForScriptId[rawLocation.scriptId];
        return rawSourceCode.rawLocationToUILocation(rawLocation);
    },

    /**
     * @param {WebInspector.UISourceCode} uiSourceCode
     * @param {number} lineNumber
     * @param {number} columnNumber
     * @return {DebuggerAgent.Location}
     */
    uiLocationToRawLocation: function(uiSourceCode, lineNumber, columnNumber)
    {
        var rawSourceCode = this._rawSourceCodeForUISourceCode.get(uiSourceCode);
        return rawSourceCode.uiLocationToRawLocation(uiSourceCode, lineNumber, columnNumber);
    },

    /**
     * @return {Array.<WebInspector.UISourceCode>}
     */
    uiSourceCodeList: function()
    {
        var result = [];
        for (var i = 0; i < this._rawSourceCodes.length; ++i) {
            var uiSourceCode = this._rawSourceCodes[i].uiSourceCode();
            if (uiSourceCode)
                result.push(uiSourceCode);
        }
        return result;
    },

    /**
     * @param {WebInspector.Script} script
     */
    addScript: function(script)
    {
        var resource = null;
        var isInlineScript = false;
        if (script.isInlineScript()) {
            resource = WebInspector.networkManager.inflightResourceForURL(script.sourceURL) || WebInspector.resourceForURL(script.sourceURL);
            if (resource && resource.type === WebInspector.Resource.Type.Document) {
                isInlineScript = true;
                var rawSourceCode = this._rawSourceCodeForDocumentURL[script.sourceURL];
                if (rawSourceCode) {
                    rawSourceCode.addScript(script);
                    this._bindScriptToRawSourceCode(script, rawSourceCode);
                    return;
                }
            }
        }

        var rawSourceCode = new WebInspector.RawSourceCode(script.scriptId, script, resource, this._formatter, this._formatSource);
        this._rawSourceCodes.push(rawSourceCode);
        this._bindScriptToRawSourceCode(script, rawSourceCode);

        if (isInlineScript)
            this._rawSourceCodeForDocumentURL[script.sourceURL] = rawSourceCode;

        if (rawSourceCode.uiSourceCode())
            this._uiSourceCodeChanged(rawSourceCode, null, rawSourceCode.uiSourceCode());
        rawSourceCode.addEventListener(WebInspector.RawSourceCode.Events.UISourceCodeChanged, this._handleUISourceCodeChanged, this);
    },

    /**
     * @param {WebInspector.Event} event
     */
    _handleUISourceCodeChanged: function(event)
    {
        var rawSourceCode = /** @type {WebInspector.RawSourceCode} */ event.target;
        var oldUISourceCode = /** @type {WebInspector.UISourceCode} */ event.data.oldUISourceCode;
        this._uiSourceCodeChanged(rawSourceCode, oldUISourceCode, rawSourceCode.uiSourceCode());
    },

    /**
     * @param {WebInspector.RawSourceCode} rawSourceCode
     * @param {WebInspector.UISourceCode} removedItem
     * @param {WebInspector.UISourceCode} addedItem
     */
    _uiSourceCodeChanged: function(rawSourceCode, removedItem, addedItem)
    {
        if (removedItem)
            this._rawSourceCodeForUISourceCode.remove(removedItem);
        if (addedItem)
            this._rawSourceCodeForUISourceCode.put(addedItem, rawSourceCode);

        var scriptIds = [];
        for (var i = 0; i < rawSourceCode._scripts.length; ++i)
            scriptIds.push(rawSourceCode._scripts[i].scriptId);
        var removedItems = removedItem ? [removedItem] : [];
        var addedItems = addedItem ? [addedItem] : [];

        if (removedItem) {
            for (var i = 0; i < scriptIds.length; ++i) {
                var data = { scriptId: scriptIds[i], uiSourceCodes: [removedItem] };
                this.dispatchEventToListeners(WebInspector.ScriptMapping.Events.ScriptUnbound, data);
            }
        }

        var data = { removedItems: removedItems, addedItems: addedItems };
        this.dispatchEventToListeners(WebInspector.ScriptMapping.Events.UISourceCodeListChanged, data);

        if (addedItem) {
            for (var i = 0; i < scriptIds.length; ++i) {
                var data = { scriptId: scriptIds[i], uiSourceCodes: [addedItem] };
                this.dispatchEventToListeners(WebInspector.ScriptMapping.Events.ScriptBound, data);
            }
        }
    },

    /**
     * @param {WebInspector.Script} script
     * @param {WebInspector.RawSourceCode} rawSourceCode
     */
    _bindScriptToRawSourceCode: function(script, rawSourceCode)
    {
        this._rawSourceCodeForScriptId[script.scriptId] = rawSourceCode;
        this._rawSourceCodeForURL[script.sourceURL] = rawSourceCode;
    },

    /**
     * @param {boolean} formatSource
     */
    setFormatSource: function(formatSource)
    {
        if (this._formatSource === formatSource)
            return;

        this._formatSource = formatSource;
        for (var i = 0; i < this._rawSourceCodes.length; ++i)
            this._rawSourceCodes[i].setFormatted(this._formatSource);
    },

    /**
     * @param {DebuggerAgent.Location} rawLocation
     */
    forceUpdateSourceMapping: function(rawLocation)
    {
        var rawSourceCode = this._rawSourceCodeForScriptId[rawLocation.scriptId];
        rawSourceCode.forceUpdateSourceMapping();
    },

    reset: function()
    {
        for (var i = 0; i < this._rawSourceCodes.length; ++i) {
            var rawSourceCode = this._rawSourceCodes[i];
            this._uiSourceCodeChanged(rawSourceCode, rawSourceCode.uiSourceCode(), null);
            rawSourceCode.removeAllListeners();
        }
        this._rawSourceCodes = [];
        this._rawSourceCodeForScriptId = {};
        this._rawSourceCodeForURL = {};
        this._rawSourceCodeForDocumentURL = {};
        this._rawSourceCodeForUISourceCode.clear();
    }
}

WebInspector.ResourceScriptMapping.prototype.__proto__ = WebInspector.ScriptMapping.prototype;
