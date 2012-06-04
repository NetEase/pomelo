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

// RawSourceCode represents JavaScript resource or HTML resource with inlined scripts
// as it came from network.

/**
 * @constructor
 * @extends {WebInspector.Object}
 * @param {string} id
 * @param {WebInspector.Script} script
 * @param {WebInspector.Resource} resource
 * @param {WebInspector.ScriptFormatter} formatter
 * @param {boolean} formatted
 */
WebInspector.RawSourceCode = function(id, script, resource, formatter, formatted)
{
    this.id = id;
    this.url = script.sourceURL;
    this.isContentScript = script.isContentScript;
    this._scripts = [script];
    this._formatter = formatter;
    this._formatted = formatted;
    this._resource = resource;

    this._useTemporaryContent = this._resource && !this._resource.finished;
    this._hasNewScripts = true;
    if (!this._useTemporaryContent)
        this._updateSourceMapping();
    else if (this._resource)
        this._resource.addEventListener("finished", this._resourceFinished.bind(this));
}

WebInspector.RawSourceCode.Events = {
    UISourceCodeChanged: "us-source-code-changed"
}

WebInspector.RawSourceCode.prototype = {
    /**
     * @param {WebInspector.Script} script
     */
    addScript: function(script)
    {
        this._scripts.push(script);
        this._hasNewScripts = true;
    },

    /**
     * @param {DebuggerAgent.Location} rawLocation
     * @return {WebInspector.UILocation}
     */
    rawLocationToUILocation: function(rawLocation)
    {
        if (this._sourceMapping)
            return this._sourceMapping.rawLocationToUILocation(rawLocation);
        return null;
    },

    /**
     * @param {WebInspector.UISourceCode} uiSourceCode
     * @param {number} lineNumber
     * @param {number} columnNumber
     * @return {DebuggerAgent.Location}
     */
    uiLocationToRawLocation: function(uiSourceCode, lineNumber, columnNumber)
    {
        if (this._sourceMapping)
            return this._sourceMapping.uiLocationToRawLocation(uiSourceCode, lineNumber, columnNumber);
        return null;
    },

    /**
     * @return {WebInspector.UISourceCode|null}
     */
    uiSourceCode: function()
    {
        if (this._sourceMapping)
            return this._sourceMapping.uiSourceCode();
        return null;
    },

    /**
     * @param {boolean} formatted
     */
    setFormatted: function(formatted)
    {
        if (this._formatted === formatted)
            return;
        this._formatted = formatted;
        this._updateSourceMapping();
    },

    _resourceFinished: function()
    {
        this._useTemporaryContent = false;
        this._updateSourceMapping();
    },

    /**
     * @param {WebInspector.Script} script
     */
    forceUpdateSourceMapping: function(script)
    {
        if (!this._useTemporaryContent || !this._hasNewScripts)
            return;
        this._hasNewScripts = false;
        this._updateSourceMapping();
    },

    _updateSourceMapping: function()
    {
        if (this._updatingSourceMapping) {
            this._updateNeeded = true;
            return;
        }
        this._updatingSourceMapping = true;
        this._updateNeeded = false;

        this._createSourceMapping(didCreateSourceMapping.bind(this));

        /**
         * @this {WebInspector.RawSourceCode}
         * @param {WebInspector.RawSourceCode.SourceMapping} sourceMapping
         */
        function didCreateSourceMapping(sourceMapping)
        {
            this._updatingSourceMapping = false;
            if (sourceMapping && !this._updateNeeded)
                this._saveSourceMapping(sourceMapping);
            else
                this._updateSourceMapping();
        }
    },

    _createContentProvider: function()
    {
        if (this._resource && this._resource.finished)
            return new WebInspector.ResourceContentProvider(this._resource);
        if (this._scripts.length === 1 && !this._scripts[0].lineOffset && !this._scripts[0].columnOffset)
            return new WebInspector.ScriptContentProvider(this._scripts[0]);
        return new WebInspector.ConcatenatedScriptsContentProvider(this._scripts);
    },

    /**
     * @param {function(WebInspector.RawSourceCode.SourceMapping)} callback
     */
    _createSourceMapping: function(callback)
    {
        var originalContentProvider = this._createContentProvider();
        if (!this._formatted) {
            var uiSourceCode = this._createUISourceCode(this.url, this.url, originalContentProvider);
            var sourceMapping = new WebInspector.RawSourceCode.PlainSourceMapping(this, uiSourceCode);
            callback(sourceMapping);
            return;
        }

        /**
         * @this {WebInspector.RawSourceCode}
         * @param {string} mimeType
         * @param {string} content
         */
        function didRequestContent(mimeType, content)
        {
            /**
             * @this {WebInspector.RawSourceCode}
             * @param {string} formattedContent
             * @param {WebInspector.FormattedSourceMapping} mapping
             */
            function didFormatContent(formattedContent, mapping)
            {
                var contentProvider = new WebInspector.StaticContentProvider(mimeType, formattedContent)
                var uiSourceCode = this._createUISourceCode("deobfuscated:" + this.url, this.url, contentProvider);
                var sourceMapping = new WebInspector.RawSourceCode.FormattedSourceMapping(this, uiSourceCode, mapping);
                callback(sourceMapping);
            }
            this._formatter.formatContent(mimeType, content, didFormatContent.bind(this));
        }
        originalContentProvider.requestContent(didRequestContent.bind(this));
    },

    /**
     * @param {string} id
     * @param {string} url
     * @param {WebInspector.ContentProvider} contentProvider
     */
    _createUISourceCode: function(id, url, contentProvider)
    {
        var uiSourceCode = new WebInspector.UISourceCodeImpl(id, url, contentProvider);
        uiSourceCode.isContentScript = this.isContentScript;
        uiSourceCode.isEditable = this._scripts.length === 1 && !this._scripts[0].lineOffset && !this._scripts[0].columnOffset && !this._formatted;
        return uiSourceCode;
    },

    /**
     * @param {WebInspector.RawSourceCode.SourceMapping} sourceMapping
     */
    _saveSourceMapping: function(sourceMapping)
    {
        var oldUISourceCode;
        if (this._sourceMapping)
            oldUISourceCode = this._sourceMapping.uiSourceCode();
        this._sourceMapping = sourceMapping;
        this.dispatchEventToListeners(WebInspector.RawSourceCode.Events.UISourceCodeChanged, { oldUISourceCode: oldUISourceCode });
    }
}

WebInspector.RawSourceCode.prototype.__proto__ = WebInspector.Object.prototype;

/**
 * @interface
 */
WebInspector.RawSourceCode.SourceMapping = function()
{
}

WebInspector.RawSourceCode.SourceMapping.prototype = {
    /**
     * @param {DebuggerAgent.Location} rawLocation
     * @return {WebInspector.UILocation}
     */
    rawLocationToUILocation: function(rawLocation) { },

    /**
     * @param {WebInspector.UISourceCode} uiSourceCode
     * @param {number} lineNumber
     * @param {number} columnNumber
     * @return {DebuggerAgent.Location}
     */
    uiLocationToRawLocation: function(uiSourceCode, lineNumber, columnNumber) { },

    /**
     * @return {WebInspector.UISourceCode}
     */
    uiSourceCode: function() { }
}

/**
 * @constructor
 * @implements {WebInspector.RawSourceCode.SourceMapping}
 * @param {WebInspector.RawSourceCode} rawSourceCode
 * @param {WebInspector.UISourceCode} uiSourceCode
 */
WebInspector.RawSourceCode.PlainSourceMapping = function(rawSourceCode, uiSourceCode)
{
    this._rawSourceCode = rawSourceCode;
    this._uiSourceCode = uiSourceCode;
}

WebInspector.RawSourceCode.PlainSourceMapping.prototype = {
    /**
     * @param {DebuggerAgent.Location} rawLocation
     * @return {WebInspector.UILocation}
     */
    rawLocationToUILocation: function(rawLocation)
    {
        return new WebInspector.UILocation(this._uiSourceCode, rawLocation.lineNumber, rawLocation.columnNumber || 0);
    },

    /**
     * @param {WebInspector.UISourceCode} uiSourceCode
     * @param {number} lineNumber
     * @param {number} columnNumber
     * @return {DebuggerAgent.Location}
     */
    uiLocationToRawLocation: function(uiSourceCode, lineNumber, columnNumber)
    {
        console.assert(uiSourceCode === this._uiSourceCode);
        return WebInspector.debuggerModel.createRawLocation(this._rawSourceCode._scripts[0], lineNumber, columnNumber);
    },

    /**
     * @return {WebInspector.UISourceCode}
     */
    uiSourceCode: function()
    {
        return this._uiSourceCode;
    }
}

/**
 * @constructor
 * @implements {WebInspector.RawSourceCode.SourceMapping}
 * @param {WebInspector.RawSourceCode} rawSourceCode
 * @param {WebInspector.UISourceCode} uiSourceCode
 * @param {WebInspector.FormattedSourceMapping} mapping
 */
WebInspector.RawSourceCode.FormattedSourceMapping = function(rawSourceCode, uiSourceCode, mapping)
{
    this._rawSourceCode = rawSourceCode;
    this._uiSourceCode = uiSourceCode;
    this._mapping = mapping;
}

WebInspector.RawSourceCode.FormattedSourceMapping.prototype = {
    /**
     * @param {DebuggerAgent.Location} rawLocation
     */
    rawLocationToUILocation: function(rawLocation)
    {
        var location = this._mapping.originalToFormatted(rawLocation.lineNumber, rawLocation.columnNumber || 0);
        return new WebInspector.UILocation(this._uiSourceCode, location[0], location[1]);
    },

    /**
     * @param {WebInspector.UISourceCode} uiSourceCode
     * @param {number} lineNumber
     * @param {number} columnNumber
     * @return {DebuggerAgent.Location}
     */
    uiLocationToRawLocation: function(uiSourceCode, lineNumber, columnNumber)
    {
        console.assert(uiSourceCode === this._uiSourceCode);
        var location = this._mapping.formattedToOriginal(lineNumber, columnNumber);
        return WebInspector.debuggerModel.createRawLocation(this._rawSourceCode._scripts[0], location[0], location[1]);
    },

    /**
     * @return {WebInspector.UISourceCode}
     */
    uiSourceCode: function()
    {
        return this._uiSourceCode;
    }
}

/**
 * @constructor
 * @param {WebInspector.UISourceCode} uiSourceCode
 * @param {number} lineNumber
 * @param {number} columnNumber
 */
WebInspector.UILocation = function(uiSourceCode, lineNumber, columnNumber)
{
    this.uiSourceCode = uiSourceCode;
    this.lineNumber = lineNumber;
    this.columnNumber = columnNumber;
}
