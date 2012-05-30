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
WebInspector.CompilerScriptMapping = function()
{
    this._sourceMapByURL = {};
    this._sourceMapForScriptId = {};
    this._scriptForSourceMap = new Map();
    this._sourceMapForUISourceCode = new Map();
    this._uiSourceCodeByURL = {};
}

WebInspector.CompilerScriptMapping.prototype = {
    /**
     * @param {DebuggerAgent.Location} rawLocation
     * @return {WebInspector.UILocation}
     */
    rawLocationToUILocation: function(rawLocation)
    {
        var sourceMap = this._sourceMapForScriptId[rawLocation.scriptId];
        var entry = sourceMap.findEntry(rawLocation.lineNumber, rawLocation.columnNumber || 0);
        return new WebInspector.UILocation(this._uiSourceCodeByURL[entry[2]], entry[3], entry[4]);
    },

    /**
     * @param {WebInspector.UISourceCode} uiSourceCode
     * @param {number} lineNumber
     * @param {number} columnNumber
     * @return {DebuggerAgent.Location}
     */
    uiLocationToRawLocation: function(uiSourceCode, lineNumber, columnNumber)
    {
        var sourceMap = this._sourceMapForUISourceCode.get(uiSourceCode);
        var entry = sourceMap.findEntryReversed(uiSourceCode.url, lineNumber);
        return WebInspector.debuggerModel.createRawLocation(this._scriptForSourceMap.get(sourceMap), entry[0], entry[1]);
    },

    /**
     * @return {Array.<WebInspector.UISourceCode>}
     */
    uiSourceCodeList: function()
    {
        var result = []
        for (var url in this._uiSourceCodeByURL)
            result.push(this._uiSourceCodeByURL[url]);
        return result;
    },

    /**
     * @param {WebInspector.SourceMapParser} sourceMap
     * @return {Array.<WebInspector.UISourceCode>}
     */
    _uiSourceCodesForSourceMap: function(sourceMap)
    {
        var result = []
        var sourceURLs = sourceMap.sources();
        for (var i = 0; i < sourceURLs.length; ++i)
            result.push(this._uiSourceCodeByURL[sourceURLs[i]]);
        return result;
    },

    /**
     * @param {WebInspector.Script} script
     */
    addScript: function(script)
    {
        var sourceMap = this.loadSourceMapForScript(script);

        if (this._scriptForSourceMap.get(sourceMap)) {
            this._sourceMapForScriptId[script.scriptId] = sourceMap;
            var uiSourceCodes = this._uiSourceCodesForSourceMap(sourceMap);
            var data = { scriptId: script.scriptId, uiSourceCodes: uiSourceCodes };
            this.dispatchEventToListeners(WebInspector.ScriptMapping.Events.ScriptBound, data);
            return;
        }

        var uiSourceCodeList = [];
        var sourceURLs = sourceMap.sources();
        for (var i = 0; i < sourceURLs.length; ++i) {
            var sourceURL = sourceURLs[i];
            if (this._uiSourceCodeByURL[sourceURL])
                continue;
            var sourceContent = sourceMap.sourceContent(sourceURL);
            var contentProvider;
            if (sourceContent)
                contentProvider = new WebInspector.StaticContentProvider("text/javascript", sourceContent);
            else
                contentProvider = new WebInspector.CompilerSourceMappingContentProvider(sourceURL);
            var uiSourceCode = new WebInspector.UISourceCodeImpl(sourceURL, sourceURL, contentProvider);
            uiSourceCode.isContentScript = script.isContentScript;
            uiSourceCode.isEditable = false;
            this._uiSourceCodeByURL[sourceURL] = uiSourceCode;
            this._sourceMapForUISourceCode.put(uiSourceCode, sourceMap);
            uiSourceCodeList.push(uiSourceCode);
        }

        this._sourceMapForScriptId[script.scriptId] = sourceMap;
        this._scriptForSourceMap.put(sourceMap, script);
        var data = { removedItems: [], addedItems: uiSourceCodeList };
        this.dispatchEventToListeners(WebInspector.ScriptMapping.Events.UISourceCodeListChanged, data);
        var data = { scriptId: script.scriptId, uiSourceCodes: uiSourceCodeList };
        this.dispatchEventToListeners(WebInspector.ScriptMapping.Events.ScriptBound, data);
    },

    /**
     * @param {WebInspector.Script} script
     * @return {WebInspector.SourceMapParser}
     */
    loadSourceMapForScript: function(script)
    {
        var sourceMapURL = WebInspector.SourceMapParser.prototype._canonicalizeURL(script.sourceMapURL, script.sourceURL);
        var sourceMap = this._sourceMapByURL[sourceMapURL];
        if (sourceMap)
            return sourceMap;

        try {
            // FIXME: make sendRequest async.
            var response = InspectorFrontendHost.loadResourceSynchronously(sourceMapURL);
            if (response.slice(0, 3) === ")]}")
                response = response.substring(response.indexOf('\n'));
            var payload = /** @type {WebInspector.SourceMapPayload} */ JSON.parse(response);
            sourceMap = new WebInspector.SourceMapParser(sourceMapURL, payload);
        } catch(e) {
            console.error(e.message);
            return null;
        }
        this._sourceMapByURL[sourceMapURL] = sourceMap;
        return sourceMap;
    },

    reset: function()
    {
        var data = { removedItems: this.uiSourceCodeList(), addedItems: [] };
        this.dispatchEventToListeners(WebInspector.ScriptMapping.Events.UISourceCodeListChanged, data);

        this._sourceMapByURL = {};
        this._sourceMapForScriptId = {};
        this._scriptForSourceMap = new Map();
        this._sourceMapForUISourceCode = new Map();
        this._uiSourceCodeByURL = {};
    }
}

WebInspector.CompilerScriptMapping.prototype.__proto__ = WebInspector.ScriptMapping.prototype;

/**
 * @constructor
 */
WebInspector.SourceMapPayload = function()
{
    this.sections = [];
    this.mappings = "";
    this.sourceRoot = "";
    this.sources = [];
}

/**
 * Implements Source Map V3 consumer. See http://code.google.com/p/closure-compiler/wiki/SourceMaps
 * for format description.
 * @constructor
 * @param {string} sourceMappingURL
 * @param {WebInspector.SourceMapPayload} payload
 */
WebInspector.SourceMapParser = function(sourceMappingURL, payload)
{
    if (!WebInspector.SourceMapParser.prototype._base64Map) {
        const base64Digits = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
        WebInspector.SourceMapParser.prototype._base64Map = {};
        for (var i = 0; i < base64Digits.length; ++i)
            WebInspector.SourceMapParser.prototype._base64Map[base64Digits.charAt(i)] = i;
    }

    this._sourceMappingURL = sourceMappingURL;
    this._mappings = [];
    this._reverseMappingsBySourceURL = {};
    this._sourceContentByURL = {};
    this._parseMappingPayload(payload);
}

WebInspector.SourceMapParser.prototype = {
    /**
     * @return {Array.<string>}
     */
    sources: function()
    {
        var sources = [];
        for (var sourceURL in this._reverseMappingsBySourceURL)
            sources.push(sourceURL);
        return sources;
    },

    sourceContent: function(sourceURL)
    {
        return this._sourceContentByURL[sourceURL];
    },

    findEntry: function(lineNumber, columnNumber)
    {
        var first = 0;
        var count = this._mappings.length;
        while (count > 1) {
          var step = count >> 1;
          var middle = first + step;
          var mapping = this._mappings[middle];
          if (lineNumber < mapping[0] || (lineNumber == mapping[0] && columnNumber < mapping[1]))
              count = step;
          else {
              first = middle;
              count -= step;
          }
        }
        return this._mappings[first];
    },

    findEntryReversed: function(sourceURL, lineNumber)
    {
        var mappings = this._reverseMappingsBySourceURL[sourceURL];
        for ( ; lineNumber < mappings.length; ++lineNumber) {
            var mapping = mappings[lineNumber];
            if (mapping)
                return mapping;
        }
        return this._mappings[0];
    },

    _parseMappingPayload: function(mappingPayload)
    {
        if (mappingPayload.sections)
            this._parseSections(mappingPayload.sections);
        else
            this._parseMap(mappingPayload, 0, 0);
    },

    _parseSections: function(sections)
    {
        for (var i = 0; i < sections.length; ++i) {
            var section = sections[i];
            this._parseMap(section.map, section.offset.line, section.offset.column)
        }
    },

    _parseMap: function(map, lineNumber, columnNumber)
    {
        var sourceIndex = 0;
        var sourceLineNumber = 0;
        var sourceColumnNumber = 0;
        var nameIndex = 0;

        var sources = [];
        for (var i = 0; i < map.sources.length; ++i) {
            var sourceURL = map.sources[i];
            if (map.sourceRoot)
                sourceURL = map.sourceRoot + "/" + sourceURL;
            var url = this._canonicalizeURL(sourceURL, this._sourceMappingURL);
            sources.push(url);
            if (!this._reverseMappingsBySourceURL[url])
                this._reverseMappingsBySourceURL[url] = [];
            if (map.sourcesContent && map.sourcesContent[i])
                this._sourceContentByURL[url] = map.sourcesContent[i];
        }

        var stringCharIterator = new WebInspector.SourceMapParser.StringCharIterator(map.mappings);
        var sourceURL = sources[sourceIndex];
        var reverseMappings = this._reverseMappingsBySourceURL[sourceURL];

        while (true) {
            if (stringCharIterator.peek() === ",")
                stringCharIterator.next();
            else {
                while (stringCharIterator.peek() === ";") {
                    lineNumber += 1;
                    columnNumber = 0;
                    stringCharIterator.next();
                }
                if (!stringCharIterator.hasNext())
                    break;
            }

            columnNumber += this._decodeVLQ(stringCharIterator);
            if (!this._isSeparator(stringCharIterator.peek())) {
                var sourceIndexDelta = this._decodeVLQ(stringCharIterator);
                if (sourceIndexDelta) {
                    sourceIndex += sourceIndexDelta;
                    sourceURL = sources[sourceIndex];
                    reverseMappings = this._reverseMappingsBySourceURL[sourceURL];
                }
                sourceLineNumber += this._decodeVLQ(stringCharIterator);
                sourceColumnNumber += this._decodeVLQ(stringCharIterator);
                if (!this._isSeparator(stringCharIterator.peek()))
                    nameIndex += this._decodeVLQ(stringCharIterator);

                this._mappings.push([lineNumber, columnNumber, sourceURL, sourceLineNumber, sourceColumnNumber]);
                if (!reverseMappings[sourceLineNumber])
                    reverseMappings[sourceLineNumber] = [lineNumber, columnNumber];
            }
        }
    },

    _isSeparator: function(char)
    {
        return char === "," || char === ";";
    },

    _decodeVLQ: function(stringCharIterator)
    {
        // Read unsigned value.
        var result = 0;
        var shift = 0;
        do {
            var digit = this._base64Map[stringCharIterator.next()];
            result += (digit & this._VLQ_BASE_MASK) << shift;
            shift += this._VLQ_BASE_SHIFT;
        } while (digit & this._VLQ_CONTINUATION_MASK);

        // Fix the sign.
        var negative = result & 1;
        result >>= 1;
        return negative ? -result : result;
    },

    _canonicalizeURL: function(url, baseURL)
    {
        if (!url || !baseURL || url.asParsedURL() || url.substring(0, 5) === "data:")
            return url;

        var base = baseURL.asParsedURL();
        if (!base)
            return url;

        var baseHost = base.scheme + "://" + base.host + (base.port ? ":" + base.port : "");
        if (url[0] === "/")
            return baseHost + url;
        return baseHost + base.firstPathComponents + url;
    },

    _VLQ_BASE_SHIFT: 5,
    _VLQ_BASE_MASK: (1 << 5) - 1,
    _VLQ_CONTINUATION_MASK: 1 << 5
}

/**
 * @constructor
 */
WebInspector.SourceMapParser.StringCharIterator = function(string)
{
    this._string = string;
    this._position = 0;
}

WebInspector.SourceMapParser.StringCharIterator.prototype = {
    next: function()
    {
        return this._string.charAt(this._position++);
    },

    peek: function()
    {
        return this._string.charAt(this._position);
    },

    hasNext: function()
    {
        return this._position < this._string.length;
    }
}
