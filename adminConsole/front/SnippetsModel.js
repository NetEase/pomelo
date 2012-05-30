/*
 * Copyright (C) 2012 Google Inc. All rights reserved.
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
 * @extends {WebInspector.Object}
 */
WebInspector.SnippetsModel = function()
{
    this._snippets = {};

    this._lastSnippetIdentifierSetting = WebInspector.settings.createSetting("lastSnippetIdentifier", 0);
    this._snippetsSetting = WebInspector.settings.createSetting("snippets", []);
    this._lastSnippetEvaluationIndexSetting = WebInspector.settings.createSetting("lastSnippetEvaluationIndex", 0);

    this._loadSettings();
}

WebInspector.SnippetsModel.snippetsSourceURLPrefix = "snippets://";

WebInspector.SnippetsModel.EventTypes = {
    SnippetAdded: "SnippetAdded",
    SnippetWillBeEvaluated: "SnippetWillBeEvaluated",
    SnippetRenamed: "SnippetRenamed",
    SnippetRemoved: "SnippetRemoved",
}

WebInspector.SnippetsModel.prototype = {
    _saveSettings: function()
    {
        var savedSnippets = [];
        for (var id in this._snippets)
            savedSnippets.push(this._snippets[id].serializeToObject());
        this._snippetsSetting.set(savedSnippets);
    },

    _loadSettings: function()
    {
        var savedSnippets = this._snippetsSetting.get();
        for (var i = 0; i < savedSnippets.length; ++i)
            this._snippetAdded(WebInspector.Snippet.fromObject(savedSnippets[i]));
    },

    /**
     * @param {WebInspector.Snippet} snippet
     */
    deleteSnippet: function(snippet)
    {
        delete this._snippets[snippet.id];
        this._saveSettings();
        this.dispatchEventToListeners(WebInspector.SnippetsModel.EventTypes.SnippetRemoved, snippet);
    },

    /**
     * @return {WebInspector.Snippet}
     */
    createSnippet: function()
    {
        var nextId = this._lastSnippetIdentifierSetting.get() + 1;
        var snippetId = String(nextId);
        this._lastSnippetIdentifierSetting.set(nextId);
        var snippet = new WebInspector.Snippet(this, snippetId);
        this._snippetAdded(snippet);
        this._saveSettings();

        return snippet;
    },

    /**
     * @param {WebInspector.Snippet} snippet
     */
    _snippetAdded: function(snippet)
    {
        this._snippets[snippet.id] = snippet;
        this.dispatchEventToListeners(WebInspector.SnippetsModel.EventTypes.SnippetAdded, snippet);
    },

    /**
     * @param {string} snippetId
     */
    _snippetContentUpdated: function(snippetId)
    {
        this._saveSettings();
    },

    /**
     * @param {WebInspector.Snippet} snippet
     */
    _snippetRenamed: function(snippet)
    {
        this._saveSettings();
        this.dispatchEventToListeners(WebInspector.SnippetsModel.EventTypes.SnippetRenamed, snippet);
    },

    /**
     * @param {WebInspector.Snippet} snippet
     */
    _evaluateSnippet: function(snippet)
    {
        this.dispatchEventToListeners(WebInspector.SnippetsModel.EventTypes.SnippetWillBeEvaluated, snippet);
        var evaluationIndex = this._lastSnippetEvaluationIndexSetting.get() + 1;
        this._lastSnippetEvaluationIndexSetting.set(evaluationIndex);

        var sourceURL = this._sourceURLForSnippet(snippet, evaluationIndex);
        snippet._lastEvaluationSourceURL = sourceURL;
        var expression = "\n//@ sourceURL=" + sourceURL + "\n" + snippet.content;
        WebInspector.evaluateInConsole(expression, true);
    },

    /**
     * @param {WebInspector.Snippet} snippet
     * @param {string} evaluationIndex
     * @return {string}
     */
    _sourceURLForSnippet: function(snippet, evaluationIndex)
    {
        var snippetsPrefix = WebInspector.SnippetsModel.snippetsSourceURLPrefix;
        var evaluationSuffix = evaluationIndex ? "_" + evaluationIndex : "";
        return snippetsPrefix + snippet.id + evaluationSuffix;
    },

    /**
     * @param {string} sourceURL
     * @return {string|null}
     */
    snippetIdForSourceURL: function(sourceURL)
    {
        var snippetsPrefix = WebInspector.SnippetsModel.snippetsSourceURLPrefix;
        if (sourceURL.indexOf(snippetsPrefix) !== 0)
            return null;
        var splittedURL = sourceURL.substring(snippetsPrefix.length).split("_");
        var snippetId = splittedURL[0];
        return snippetId;
    },

    /**
     * @param {string} sourceURL
     * @return {WebInspector.Snippet|null}
     */
    snippetForSourceURL: function(sourceURL)
    {
        var snippetId = this.snippetIdForSourceURL(sourceURL);
        if (!snippetId)
            return null;
        var snippet = this._snippets[snippetId];
        if (!snippet || snippet._lastEvaluationSourceURL !== sourceURL)
            return null;
        return snippet;
    }
}

WebInspector.SnippetsModel.prototype.__proto__ = WebInspector.Object.prototype;

/**
 * @constructor
 * @extends {WebInspector.Object}
 * @param {WebInspector.SnippetsModel} model
 * @param {string} id
 * @param {string=} name
 * @param {string=} content
 */
WebInspector.Snippet = function(model, id, name, content)
{
    this._model = model;
    this._id = id;
    this._name = name || "Snippet #" + id;
    this._content = content || "";
}

WebInspector.Snippet.evaluatedSnippetExtraLinesCount = 2;

/**
 * @param {Object} serializedSnippet
 * @return {WebInspector.Snippet}
 */
WebInspector.Snippet.fromObject = function(serializedSnippet)
{
    return new WebInspector.Snippet(this, serializedSnippet.id, serializedSnippet.name, serializedSnippet.content);
}

WebInspector.Snippet.prototype = {
    /**
     * @type {number}
     */
    get id()
    {
        return this._id;
    },

    /**
     * @type {string}
     */
    get name()
    {
        return this._name;
    },

    set name(name)
    {
        if (this._name === name)
            return;

        this._name = name;
        this._model._snippetRenamed(this);
    },

    /**
     * @type {string}
     */
    get content()
    {
        return this._content;
    },

    set content(content)
    {
        if (this._content === content)
            return;

        this._content = content;
        this._model._snippetContentUpdated(this._id);
    },

    evaluate: function()
    {
        this._model._evaluateSnippet(this);
    },

    /**
     * @return {Object}
     */
    serializeToObject: function()
    {
        var serializedSnippet = {};
        serializedSnippet.id = this.id;
        serializedSnippet.name = this.name;
        serializedSnippet.content = this.content;
        return serializedSnippet;
    }
}

WebInspector.Snippet.prototype.__proto__ = WebInspector.Object.prototype;

/**
 * @constructor
 * @extends {WebInspector.ScriptMapping}
 */
WebInspector.SnippetsScriptMapping = function()
{
    this._snippetForScriptId = {};
    this._uiSourceCodeForScriptId = {};
    this._scriptForUISourceCode = new Map();
    this._uiSourceCodeForSnippet = new Map();

    WebInspector.snippetsModel.addEventListener(WebInspector.SnippetsModel.EventTypes.SnippetAdded, this._snippetAdded.bind(this));
    WebInspector.snippetsModel.addEventListener(WebInspector.SnippetsModel.EventTypes.SnippetWillBeEvaluated, this._snippetWillBeEvaluated.bind(this));
    WebInspector.snippetsModel.addEventListener(WebInspector.SnippetsModel.EventTypes.SnippetRemoved, this._snippetRemoved.bind(this));
}

WebInspector.SnippetsScriptMapping.prototype = {
    /**
     * @param {DebuggerAgent.Location} rawLocation
     * @return {WebInspector.UILocation}
     */
    rawLocationToUILocation: function(rawLocation)
    {
        var uiSourceCode = this._uiSourceCodeForScriptId[rawLocation.scriptId];

        var snippet = this._snippetForScriptId[rawLocation.scriptId];
        if (snippet) {
            var uiLineNumber = rawLocation.lineNumber - WebInspector.Snippet.evaluatedSnippetExtraLinesCount;
            return new WebInspector.UILocation(uiSourceCode, uiLineNumber, rawLocation.columnNumber || 0);
        }

        return new WebInspector.UILocation(uiSourceCode, rawLocation.lineNumber, rawLocation.columnNumber || 0);
    },

    /**
     * @param {WebInspector.UISourceCode} uiSourceCode
     * @param {number} lineNumber
     * @param {number} columnNumber
     * @return {DebuggerAgent.Location}
     */
    uiLocationToRawLocation: function(uiSourceCode, lineNumber, columnNumber)
    {
        var script = this._scriptForUISourceCode.get(uiSourceCode);
        if (!script)
            return null;

        if (uiSourceCode.isSnippet) {
            var rawLineNumber = lineNumber + WebInspector.Snippet.evaluatedSnippetExtraLinesCount;
            return WebInspector.debuggerModel.createRawLocation(script, rawLineNumber, columnNumber);
        }

        return WebInspector.debuggerModel.createRawLocation(script, lineNumber, columnNumber);
    },

    /**
     * @return {Array.<WebInspector.UISourceCode>}
     */
    uiSourceCodeList: function()
    {
        var result = [];
        for (var uiSourceCode in this._uiSourceCodeForSnippet.values())
            result.push(uiSourceCode);
        result = result.concat(this._releasedUISourceCodes());
        return result;
    },

    /**
     * @return {Array.<WebInspector.UISourceCode>}
     */
    _releasedUISourceCodes: function()
    {
        var result = [];
        for (var scriptId in this._uiSourceCodeForScriptId) {
            var uiSourceCode = this._uiSourceCodeForScriptId[scriptId];
            if (uiSourceCode.isSnippet)
                continue;
            result.push(uiSourceCode);
        }
        return result;
    },

    /**
     * @param {WebInspector.Script} script
     */
    addScript: function(script)
    {
        var snippet = WebInspector.snippetsModel.snippetForSourceURL(script.sourceURL);
        if (!snippet) {
            this._createUISourceCodeForScript(script);
            return;
        }
        var uiSourceCode = this._uiSourceCodeForSnippet.get(snippet);
        console.assert(!this._scriptForUISourceCode.get(uiSourceCode));

        this._uiSourceCodeForScriptId[script.scriptId] = uiSourceCode;
        this._snippetForScriptId[script.scriptId] = snippet;
        this._scriptForUISourceCode.put(uiSourceCode, script);
        var data = { scriptId: script.scriptId, uiSourceCodes: [uiSourceCode] };
        this.dispatchEventToListeners(WebInspector.ScriptMapping.Events.ScriptBound, data);
    },

    /**
     * @param {WebInspector.Event} event
     */
    _snippetAdded: function(event)
    {
        var snippet = /** @type {WebInspector.Snippet} */ event.data;
        var uiSourceCodeId = ""; // FIXME: to be implemented.
        var uiSourceCodeURL = ""; // FIXME: to be implemented.
        var uiSourceCode = new WebInspector.UISourceCodeImpl(uiSourceCodeId, uiSourceCodeURL, new WebInspector.SnippetContentProvider(snippet));
        uiSourceCode.isSnippet = true;
        uiSourceCode.isEditable = true;
        this._uiSourceCodeForSnippet.put(snippet, uiSourceCode);
        uiSourceCode.snippet = snippet;
        var data = { removedItems: [], addedItems: [uiSourceCode] };
        this.dispatchEventToListeners(WebInspector.ScriptMapping.Events.UISourceCodeListChanged, data);
    },

    /**
     * @param {WebInspector.Event} event
     */
    _snippetWillBeEvaluated: function(event)
    {
        var snippet = /** @type {WebInspector.Snippet} */ event.data;
        this._releaseSnippetScript(snippet);
    },

    /**
     * @param {WebInspector.Script} script
     */
    _createUISourceCodeForScript: function(script)
    {
        var uiSourceCode = new WebInspector.UISourceCodeImpl(script.sourceURL, script.sourceURL, new WebInspector.ScriptContentProvider(script));
        uiSourceCode.isSnippetEvaluation = true;
        var oldUISourceCode = this._uiSourceCodeForScriptId[script.scriptId];
        this._uiSourceCodeForScriptId[script.scriptId] = uiSourceCode;
        this._scriptForUISourceCode.put(uiSourceCode, script);
        var data = { scriptId: script.scriptId, uiSourceCodes: [oldUISourceCode] };
        this.dispatchEventToListeners(WebInspector.ScriptMapping.Events.ScriptUnbound, data);
        var data = { removedItems: [], addedItems: [uiSourceCode] };
        this.dispatchEventToListeners(WebInspector.ScriptMapping.Events.UISourceCodeListChanged, data);
        var data = { scriptId: script.scriptId, uiSourceCodes: [uiSourceCode] };
        this.dispatchEventToListeners(WebInspector.ScriptMapping.Events.ScriptBound, data);
    },

    /**
     * @param {WebInspector.Snippet} snippet
     */
    _releaseSnippetScript: function(snippet)
    {
        var uiSourceCode = this._uiSourceCodeForSnippet.get(snippet);
        var script = this._scriptForUISourceCode.get(uiSourceCode);
        if (!script)
            return;

        delete this._uiSourceCodeForScriptId[script.scriptId];
        delete this._snippetForScriptId[script.scriptId];
        this._scriptForUISourceCode.remove(uiSourceCode);

        this._createUISourceCodeForScript(script);
    },

    /**
     * @param {WebInspector.Event} event
     */
    _snippetRemoved: function(event)
    {
        var snippet = /** @type {WebInspector.Snippet} */ event.data;
        var uiSourceCode = this._uiSourceCodeForSnippet.get(snippet);
        this._releaseSnippetScript(snippet);
        this._uiSourceCodeForSnippet.remove(snippet);
        var data = { removedItems: [uiSourceCode], addedItems: [] };
        this.dispatchEventToListeners(WebInspector.ScriptMapping.Events.UISourceCodeListChanged, data);
    },

    reset: function()
    {
        var removedUISourceCodes = this._releasedUISourceCodes();
        this._snippetForScriptId = {};
        this._uiSourceCodeForScriptId = {};
        this._scriptForUISourceCode = new Map();
        var data = { removedItems: removedUISourceCodes, addedItems: [] };
        this.dispatchEventToListeners(WebInspector.ScriptMapping.Events.UISourceCodeListChanged, data);
    }
}

WebInspector.SnippetsScriptMapping.prototype.__proto__ = WebInspector.ScriptMapping.prototype;

/**
 * @constructor
 * @extends {WebInspector.StaticContentProvider}
 * @param {WebInspector.Snippet} snippet
 */
WebInspector.SnippetContentProvider = function(snippet)
{
    WebInspector.StaticContentProvider.call(this, "text/javascript", snippet.content);
}

WebInspector.SnippetContentProvider.prototype.__proto__ = WebInspector.StaticContentProvider.prototype;

/**
 * @type {?WebInspector.SnippetsModel}
 */
WebInspector.snippetsModel = null;
