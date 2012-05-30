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
 * @extends {WebInspector.View}
 * @constructor
 */
WebInspector.SourceFrame = function(url)
{
    WebInspector.View.call(this);
    this.element.addStyleClass("script-view");

    this._url = url;

    this._textModel = new WebInspector.TextEditorModel();

    var textViewerDelegate = new WebInspector.TextViewerDelegateForSourceFrame(this);
    this._textViewer = new WebInspector.TextViewer(this._textModel, WebInspector.platform(), this._url, textViewerDelegate);

    this._currentSearchResultIndex = -1;
    this._searchResults = [];

    this._messages = [];
    this._rowMessages = {};
    this._messageBubbles = {};

    this._textViewer.readOnly = !this.canEditSource();
}

WebInspector.SourceFrame.Events = {
    Loaded: "loaded"
}

WebInspector.SourceFrame.createSearchRegex = function(query)
{
    var regex;

    // First try creating regex if user knows the / / hint.
    try {
        if (/^\/.*\/$/.test(query))
            regex = new RegExp(query.substring(1, query.length - 1));
    } catch (e) {
        // Silent catch.
    }

    // Otherwise just do case-insensitive search.
    if (!regex)
        regex = createPlainTextSearchRegex(query, "i");

    return regex;
}

WebInspector.SourceFrame.prototype = {
    wasShown: function()
    {
        this._ensureContentLoaded();
        this._textViewer.show(this.element);
    },

    willHide: function()
    {
        WebInspector.View.prototype.willHide.call(this);
        if (this.loaded)
            this._textViewer.freeCachedElements();

        this._clearLineHighlight();
        this._clearLineToReveal();
    },

    focus: function()
    {
        this._textViewer.focus();
    },

    get loaded()
    {
        return this._loaded;
    },

    hasContent: function()
    {
        return true;
    },

    get textViewer()
    {
        return this._textViewer;
    },

    _ensureContentLoaded: function()
    {
        if (!this._contentRequested) {
            this._contentRequested = true;
            this.requestContent(this.setContent.bind(this));
        }
    },

    requestContent: function(callback)
    {
    },

    /**
     * @param {TextDiff} diffData
     */
    markDiff: function(diffData)
    {
        if (this._diffLines && this.loaded)
            this._removeDiffDecorations();

        this._diffLines = diffData;
        if (this.loaded)
            this._updateDiffDecorations();
    },

    addMessage: function(msg)
    {
        this._messages.push(msg);
        if (this.loaded)
            this.addMessageToSource(msg.line - 1, msg);
    },

    clearMessages: function()
    {
        for (var line in this._messageBubbles) {
            var bubble = this._messageBubbles[line];
            bubble.parentNode.removeChild(bubble);
        }

        this._messages = [];
        this._rowMessages = {};
        this._messageBubbles = {};

        this._textViewer.doResize();
    },

    get textModel()
    {
        return this._textModel;
    },

    canHighlightLine: function(line)
    {
        return true;
    },

    highlightLine: function(line)
    {
        this._clearLineToReveal();
        if (this.loaded)
            this._textViewer.highlightLine(line);
        else
            this._lineToHighlight = line;
    },

    _clearLineHighlight: function()
    {
        if (this.loaded)
            this._textViewer.clearLineHighlight();
        else
            delete this._lineToHighlight;
    },

    revealLine: function(line)
    {
        this._clearLineHighlight();
        if (this.loaded)
            this._textViewer.revealLine(line);
        else
            this._lineToReveal = line;
    },

    _clearLineToReveal: function()
    {
        delete this._lineToReveal;
    },

    beforeTextChanged: function()
    {
        WebInspector.searchController.cancelSearch();
        this.clearMessages();
    },

    afterTextChanged: function(oldRange, newRange)
    {
    },

    setContent: function(mimeType, content)
    {
        this._textViewer.mimeType = mimeType;

        this._loaded = true;
        this._textModel.setText(null, content);

        this._textViewer.beginUpdates();

        this._setTextViewerDecorations();

        if (typeof this._lineToHighlight === "number") {
            this.highlightLine(this._lineToHighlight);
            delete this._lineToHighlight;
        }

        if (typeof this._lineToReveal === "number") {
            this.revealLine(this._lineToReveal);
            delete this._lineToReveal;
        }

        if (this._delayedFindSearchMatches) {
            this._delayedFindSearchMatches();
            delete this._delayedFindSearchMatches;
        }

        this.dispatchEventToListeners(WebInspector.SourceFrame.Events.Loaded);

        this._textViewer.endUpdates();
    },

    _setTextViewerDecorations: function()
    {
        this._rowMessages = {};
        this._messageBubbles = {};

        this._textViewer.beginUpdates();

        this._addExistingMessagesToSource();
        this._updateDiffDecorations();

        this._textViewer.doResize();

        this._textViewer.endUpdates();
    },

    performSearch: function(query, callback)
    {
        // Call searchCanceled since it will reset everything we need before doing a new search.
        this.searchCanceled();

        function doFindSearchMatches(query)
        {
            this._currentSearchResultIndex = -1;
            this._searchResults = [];

            var regex = WebInspector.SourceFrame.createSearchRegex(query);
            this._searchResults = this._collectRegexMatches(regex);

            callback(this, this._searchResults.length);
        }

        if (this.loaded)
            doFindSearchMatches.call(this, query);
        else
            this._delayedFindSearchMatches = doFindSearchMatches.bind(this, query);

        this._ensureContentLoaded();
    },

    searchCanceled: function()
    {
        delete this._delayedFindSearchMatches;
        if (!this.loaded)
            return;

        this._currentSearchResultIndex = -1;
        this._searchResults = [];
        this._textViewer.markAndRevealRange(null);
    },

    hasSearchResults: function()
    {
        return this._searchResults.length > 0;
    },

    jumpToFirstSearchResult: function()
    {
        this.jumpToSearchResult(0);
    },

    jumpToLastSearchResult: function()
    {
        this.jumpToSearchResult(this._searchResults.length - 1);
    },

    jumpToNextSearchResult: function()
    {
        this.jumpToSearchResult(this._currentSearchResultIndex + 1);
    },

    jumpToPreviousSearchResult: function()
    {
        this.jumpToSearchResult(this._currentSearchResultIndex - 1);
    },

    showingFirstSearchResult: function()
    {
        return this._searchResults.length &&  this._currentSearchResultIndex === 0;
    },

    showingLastSearchResult: function()
    {
        return this._searchResults.length && this._currentSearchResultIndex === (this._searchResults.length - 1);
    },

    get currentSearchResultIndex()
    {
        return this._currentSearchResultIndex;
    },

    jumpToSearchResult: function(index)
    {
        if (!this.loaded || !this._searchResults.length)
            return;
        this._currentSearchResultIndex = (index + this._searchResults.length) % this._searchResults.length;
        this._textViewer.markAndRevealRange(this._searchResults[this._currentSearchResultIndex]);
    },

    _collectRegexMatches: function(regexObject)
    {
        var ranges = [];
        for (var i = 0; i < this._textModel.linesCount; ++i) {
            var line = this._textModel.line(i);
            var offset = 0;
            do {
                var match = regexObject.exec(line);
                if (match) {
                    if (match[0].length)
                        ranges.push(new WebInspector.TextRange(i, offset + match.index, i, offset + match.index + match[0].length));
                    offset += match.index + 1;
                    line = line.substring(match.index + 1);
                }
            } while (match && line);
        }
        return ranges;
    },

    _updateDiffDecorations: function()
    {
        if (!this._diffLines)
            return;

        function addDecorations(textViewer, lines, className)
        {
            for (var i = 0; i < lines.length; ++i)
                textViewer.addDecoration(lines[i], className);
        }
        addDecorations(this._textViewer, this._diffLines.added, "webkit-added-line");
        addDecorations(this._textViewer, this._diffLines.removed, "webkit-removed-line");
        addDecorations(this._textViewer, this._diffLines.changed, "webkit-changed-line");
    },

    _removeDiffDecorations: function()
    {
        function removeDecorations(textViewer, lines, className)
        {
            for (var i = 0; i < lines.length; ++i)
                textViewer.removeDecoration(lines[i], className);
        }
        removeDecorations(this._textViewer, this._diffLines.added, "webkit-added-line");
        removeDecorations(this._textViewer, this._diffLines.removed, "webkit-removed-line");
        removeDecorations(this._textViewer, this._diffLines.changed, "webkit-changed-line");
    },

    _addExistingMessagesToSource: function()
    {
        var length = this._messages.length;
        for (var i = 0; i < length; ++i)
            this.addMessageToSource(this._messages[i].line - 1, this._messages[i]);
    },

    addMessageToSource: function(lineNumber, msg)
    {
        if (lineNumber >= this._textModel.linesCount)
            lineNumber = this._textModel.linesCount - 1;
        if (lineNumber < 0)
            lineNumber = 0;

        var messageBubbleElement = this._messageBubbles[lineNumber];
        if (!messageBubbleElement || messageBubbleElement.nodeType !== Node.ELEMENT_NODE || !messageBubbleElement.hasStyleClass("webkit-html-message-bubble")) {
            messageBubbleElement = document.createElement("div");
            messageBubbleElement.className = "webkit-html-message-bubble";
            this._messageBubbles[lineNumber] = messageBubbleElement;
            this._textViewer.addDecoration(lineNumber, messageBubbleElement);
        }

        var rowMessages = this._rowMessages[lineNumber];
        if (!rowMessages) {
            rowMessages = [];
            this._rowMessages[lineNumber] = rowMessages;
        }

        for (var i = 0; i < rowMessages.length; ++i) {
            if (rowMessages[i].consoleMessage.isEqual(msg)) {
                rowMessages[i].repeatCount = msg.totalRepeatCount;
                this._updateMessageRepeatCount(rowMessages[i]);
                return;
            }
        }

        var rowMessage = { consoleMessage: msg };
        rowMessages.push(rowMessage);

        var imageURL;
        switch (msg.level) {
            case WebInspector.ConsoleMessage.MessageLevel.Error:
                messageBubbleElement.addStyleClass("webkit-html-error-message");
                imageURL = "Images/errorIcon.png";
                break;
            case WebInspector.ConsoleMessage.MessageLevel.Warning:
                messageBubbleElement.addStyleClass("webkit-html-warning-message");
                imageURL = "Images/warningIcon.png";
                break;
        }

        var messageLineElement = document.createElement("div");
        messageLineElement.className = "webkit-html-message-line";
        messageBubbleElement.appendChild(messageLineElement);

        // Create the image element in the Inspector's document so we can use relative image URLs.
        var image = document.createElement("img");
        image.src = imageURL;
        image.className = "webkit-html-message-icon";
        messageLineElement.appendChild(image);
        messageLineElement.appendChild(document.createTextNode(msg.message));

        rowMessage.element = messageLineElement;
        rowMessage.repeatCount = msg.totalRepeatCount;
        this._updateMessageRepeatCount(rowMessage);
    },

    _updateMessageRepeatCount: function(rowMessage)
    {
        if (rowMessage.repeatCount < 2)
            return;

        if (!rowMessage.repeatCountElement) {
            var repeatCountElement = document.createElement("span");
            rowMessage.element.appendChild(repeatCountElement);
            rowMessage.repeatCountElement = repeatCountElement;
        }

        rowMessage.repeatCountElement.textContent = WebInspector.UIString(" (repeated %d times)", rowMessage.repeatCount);
    },

    populateLineGutterContextMenu: function(contextMenu, lineNumber)
    {
    },

    populateTextAreaContextMenu: function(contextMenu, lineNumber)
    {
        if (!window.getSelection().isCollapsed)
            return;
        WebInspector.populateResourceContextMenu(contextMenu, this._url, lineNumber);
    },

    suggestedFileName: function()
    {
    },

    inheritScrollPositions: function(sourceFrame)
    {
        this._textViewer.inheritScrollPositions(sourceFrame._textViewer);
    },

    canEditSource: function()
    {
        return false;
    },

    commitEditing: function()
    {
        function callback(error)
        {
            this.didEditContent(error, this._textModel.text);
        }
        this.editContent(this._textModel.text, callback.bind(this));
    },

    didEditContent: function(error, content)
    {
        if (error) {
            if (error.message)
                WebInspector.log(error.message, WebInspector.ConsoleMessage.MessageLevel.Error, true);
            return;
        }
    },

    editContent: function(newContent, callback)
    {
    }
}

WebInspector.SourceFrame.prototype.__proto__ = WebInspector.View.prototype;


/**
 * @implements {WebInspector.TextViewerDelegate}
 * @constructor
 */
WebInspector.TextViewerDelegateForSourceFrame = function(sourceFrame)
{
    this._sourceFrame = sourceFrame;
}

WebInspector.TextViewerDelegateForSourceFrame.prototype = {
    beforeTextChanged: function()
    {
        this._sourceFrame.beforeTextChanged();
    },

    afterTextChanged: function(oldRange, newRange)
    {
        this._sourceFrame.afterTextChanged(oldRange, newRange);
    },

    commitEditing: function()
    {
        this._sourceFrame.commitEditing();
    },

    populateLineGutterContextMenu: function(contextMenu, lineNumber)
    {
        this._sourceFrame.populateLineGutterContextMenu(contextMenu, lineNumber);
    },

    populateTextAreaContextMenu: function(contextMenu, lineNumber)
    {
        this._sourceFrame.populateTextAreaContextMenu(contextMenu, lineNumber);
    },

    suggestedFileName: function()
    {
        return this._sourceFrame.suggestedFileName();
    }
}

WebInspector.TextViewerDelegateForSourceFrame.prototype.__proto__ = WebInspector.TextViewerDelegate.prototype;
