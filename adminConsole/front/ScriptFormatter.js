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
 */
WebInspector.ScriptFormatter = function()
{
    this._tasks = [];
}

/**
 * @param {Array.<number>} lineEndings
 * @param {number} lineNumber
 * @param {number} columnNumber
 * @return {number}
 */
WebInspector.ScriptFormatter.locationToPosition = function(lineEndings, lineNumber, columnNumber)
{
    var position = lineNumber ? lineEndings[lineNumber - 1] + 1 : 0;
    return position + columnNumber;
}

/**
 * @param {Array.<number>} lineEndings
 * @param {number} position
 * @return {Array.<number>}
 */
WebInspector.ScriptFormatter.positionToLocation = function(lineEndings, position)
{
    var lineNumber = lineEndings.upperBound(position - 1);
    if (!lineNumber)
        var columnNumber = position;
    else
        var columnNumber = position - lineEndings[lineNumber - 1] - 1;
    return [lineNumber, columnNumber];
}

WebInspector.ScriptFormatter.prototype = {
    /**
     * @param {string} mimeType
     * @param {string} content
     * @param {function(string, WebInspector.FormattedSourceMapping)} callback
     */
    formatContent: function(mimeType, content, callback)
    {
        content = content.replace(/\r\n?|[\n\u2028\u2029]/g, "\n").replace(/^\uFEFF/, '');
        const method = "format";
        var parameters = { mimeType: mimeType, content: content, indentString: "    "  };
        this._tasks.push({ data: parameters, callback: callback });
        this._worker.postMessage({ method: method, params: parameters });
    },

    /**
     * @param {WebInspector.Event} event
     */
    _didFormatContent: function(event)
    {
        var task = this._tasks.shift();
        var originalContent = task.data.content;
        var formattedContent = event.data.content;
        var mapping = event.data["mapping"];
        var sourceMapping = new WebInspector.FormattedSourceMapping(originalContent.lineEndings(), formattedContent.lineEndings(), mapping);
        task.callback(formattedContent, sourceMapping);
    },

    /**
     * @return {Worker}
     */
    get _worker()
    {
        if (!this._cachedWorker) {
            this._cachedWorker = new Worker("ScriptFormatterWorker.js");
            this._cachedWorker.onmessage = this._didFormatContent.bind(this);
        }
        return this._cachedWorker;
    }
}

/**
 * @constructor
 */
WebInspector.FormatterMappingPayload = function()
{
    this.original = [];
    this.formatted = [];
}

/**
 * @constructor
 * @param {Array.<number>} originalLineEndings
 * @param {Array.<number>} formattedLineEndings
 * @param {WebInspector.FormatterMappingPayload} mapping
 */
WebInspector.FormattedSourceMapping = function(originalLineEndings, formattedLineEndings, mapping)
{
    this._originalLineEndings = originalLineEndings;
    this._formattedLineEndings = formattedLineEndings;
    this._mapping = mapping;
}

WebInspector.FormattedSourceMapping.prototype = {
    /**
     * @param {number} lineNumber
     * @param {number} columnNumber
     * @return {Array.<number>}
     */
    originalToFormatted: function(lineNumber, columnNumber)
    {
        var originalPosition = WebInspector.ScriptFormatter.locationToPosition(this._originalLineEndings, lineNumber, columnNumber);
        var formattedPosition = this._convertPosition(this._mapping.original, this._mapping.formatted, originalPosition);
        return WebInspector.ScriptFormatter.positionToLocation(this._formattedLineEndings, formattedPosition);
    },

    /**
     * @param {number} lineNumber
     * @param {number} columnNumber
     * @return {Array.<number>}
     */
    formattedToOriginal: function(lineNumber, columnNumber)
    {
        var formattedPosition = WebInspector.ScriptFormatter.locationToPosition(this._formattedLineEndings, lineNumber, columnNumber);
        var originalPosition = this._convertPosition(this._mapping.formatted, this._mapping.original, formattedPosition);
        return WebInspector.ScriptFormatter.positionToLocation(this._originalLineEndings, originalPosition);
    },

    /**
     * @param {Array.<number>} positions1
     * @param {Array.<number>} positions2
     * @param {number} position
     * @return {number}
     */
    _convertPosition: function(positions1, positions2, position)
    {
        var index = positions1.upperBound(position) - 1;
        var convertedPosition = positions2[index] + position - positions1[index];
        if (index < positions2.length - 1 && convertedPosition > positions2[index + 1])
            convertedPosition = positions2[index + 1];
        return convertedPosition;
    }
}
