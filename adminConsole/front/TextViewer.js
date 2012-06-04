/*
 * Copyright (C) 2011 Google Inc. All rights reserved.
 * Copyright (C) 2010 Apple Inc. All rights reserved.
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
WebInspector.TextViewer = function(textModel, platform, url, delegate)
{
    WebInspector.View.call(this);
    this.registerRequiredCSS("textViewer.css");

    this._textModel = textModel;
    this._textModel.changeListener = this._textChanged.bind(this);
    this._textModel.resetUndoStack();
    this._delegate = delegate;

    this.element.className = "text-editor monospace";

    var enterTextChangeMode = this._enterInternalTextChangeMode.bind(this);
    var exitTextChangeMode = this._exitInternalTextChangeMode.bind(this);
    var syncScrollListener = this._syncScroll.bind(this);
    var syncDecorationsForLineListener = this._syncDecorationsForLine.bind(this);
    var syncLineHeightListener = this._syncLineHeight.bind(this);
    this._mainPanel = new WebInspector.TextEditorMainPanel(this._textModel, url, syncScrollListener, syncDecorationsForLineListener, enterTextChangeMode, exitTextChangeMode);
    this._gutterPanel = new WebInspector.TextEditorGutterPanel(this._textModel, syncDecorationsForLineListener, syncLineHeightListener);
    this.element.appendChild(this._mainPanel.element);
    this.element.appendChild(this._gutterPanel.element);

    // Forward mouse wheel events from the unscrollable gutter to the main panel.
    function forwardWheelEvent(event)
    {
        var clone = document.createEvent("WheelEvent");
        clone.initWebKitWheelEvent(event.wheelDeltaX, event.wheelDeltaY,
                                   event.view,
                                   event.screenX, event.screenY,
                                   event.clientX, event.clientY,
                                   event.ctrlKey, event.altKey, event.shiftKey, event.metaKey);
        this._mainPanel.element.dispatchEvent(clone);
    }
    this._gutterPanel.element.addEventListener("mousewheel", forwardWheelEvent.bind(this), false);

    this.element.addEventListener("keydown", this._handleKeyDown.bind(this), false);
    this.element.addEventListener("contextmenu", this._contextMenu.bind(this), true);

    this._registerShortcuts();
}

WebInspector.TextViewer.prototype = {
    set mimeType(mimeType)
    {
        this._mainPanel.mimeType = mimeType;
    },

    set readOnly(readOnly)
    {
        if (this._mainPanel.readOnly === readOnly)
            return;
        this._mainPanel.readOnly = readOnly;
        WebInspector.markBeingEdited(this.element, !readOnly);
    },

    get readOnly()
    {
        return this._mainPanel.readOnly;
    },

    get textModel()
    {
        return this._textModel;
    },

    focus: function()
    {
        this._mainPanel.focus();
    },

    revealLine: function(lineNumber)
    {
        this._mainPanel.revealLine(lineNumber);
    },

    addDecoration: function(lineNumber, decoration)
    {
        this._mainPanel.addDecoration(lineNumber, decoration);
        this._gutterPanel.addDecoration(lineNumber, decoration);
    },

    removeDecoration: function(lineNumber, decoration)
    {
        this._mainPanel.removeDecoration(lineNumber, decoration);
        this._gutterPanel.removeDecoration(lineNumber, decoration);
    },

    markAndRevealRange: function(range)
    {
        this._mainPanel.markAndRevealRange(range);
    },

    highlightLine: function(lineNumber)
    {
        if (typeof lineNumber !== "number" || lineNumber < 0)
            return;

        lineNumber = Math.min(lineNumber, this._textModel.linesCount - 1);
        this._mainPanel.highlightLine(lineNumber);
    },

    clearLineHighlight: function()
    {
        this._mainPanel.clearLineHighlight();
    },

    freeCachedElements: function()
    {
        this._mainPanel.freeCachedElements();
        this._gutterPanel.freeCachedElements();
    },

    elementsToRestoreScrollPositionsFor: function()
    {
        return [this._mainPanel.element];
    },

    inheritScrollPositions: function(textViewer)
    {
        this._mainPanel.element._scrollTop = textViewer._mainPanel.element.scrollTop;
        this._mainPanel.element._scrollLeft = textViewer._mainPanel.element.scrollLeft;
    },

    beginUpdates: function()
    {
        this._mainPanel.beginUpdates();
        this._gutterPanel.beginUpdates();
    },

    endUpdates: function()
    {
        this._mainPanel.endUpdates();
        this._gutterPanel.endUpdates();
        this._updatePanelOffsets();
    },

    onResize: function()
    {
        this._mainPanel.resize();
        this._gutterPanel.resize();
        this._updatePanelOffsets();
    },

    // WebInspector.TextModel listener
    _textChanged: function(oldRange, newRange, oldText, newText)
    {
        if (!this._internalTextChangeMode)
            this._textModel.resetUndoStack();
        this._mainPanel.textChanged(oldRange, newRange);
        this._gutterPanel.textChanged(oldRange, newRange);
        this._updatePanelOffsets();
    },

    _enterInternalTextChangeMode: function()
    {
        this._internalTextChangeMode = true;
        this._delegate.beforeTextChanged();
    },

    _exitInternalTextChangeMode: function(oldRange, newRange)
    {
        this._internalTextChangeMode = false;
        this._delegate.afterTextChanged(oldRange, newRange);
    },

    _updatePanelOffsets: function()
    {
        var lineNumbersWidth = this._gutterPanel.element.offsetWidth;
        if (lineNumbersWidth)
            this._mainPanel.element.style.setProperty("left", lineNumbersWidth + "px");
        else
            this._mainPanel.element.style.removeProperty("left"); // Use default value set in CSS.
    },

    _syncScroll: function()
    {
        var mainElement = this._mainPanel.element;
        var gutterElement = this._gutterPanel.element;
        // Handle horizontal scroll bar at the bottom of the main panel.
        this._gutterPanel.syncClientHeight(mainElement.clientHeight);
        gutterElement.scrollTop = mainElement.scrollTop;
    },

    _syncDecorationsForLine: function(lineNumber)
    {
        if (lineNumber >= this._textModel.linesCount)
            return;

        var mainChunk = this._mainPanel.chunkForLine(lineNumber);
        if (mainChunk.linesCount === 1 && mainChunk.decorated) {
            var gutterChunk = this._gutterPanel.makeLineAChunk(lineNumber);
            var height = mainChunk.height;
            if (height)
                gutterChunk.element.style.setProperty("height", height + "px");
            else
                gutterChunk.element.style.removeProperty("height");
        } else {
            var gutterChunk = this._gutterPanel.chunkForLine(lineNumber);
            if (gutterChunk.linesCount === 1)
                gutterChunk.element.style.removeProperty("height");
        }
    },

    _syncLineHeight: function(gutterRow)
    {
        if (this._lineHeightSynced)
            return;
        if (gutterRow && gutterRow.offsetHeight) {
            // Force equal line heights for the child panels.
            this.element.style.setProperty("line-height", gutterRow.offsetHeight + "px");
            this._lineHeightSynced = true;
        }
    },

    _registerShortcuts: function()
    {
        var keys = WebInspector.KeyboardShortcut.Keys;
        var modifiers = WebInspector.KeyboardShortcut.Modifiers;

        this._shortcuts = {};
        var commitEditing = this._commitEditing.bind(this);
        this._shortcuts[WebInspector.KeyboardShortcut.makeKey("s", modifiers.CtrlOrMeta)] = commitEditing;

        var handleEnterKey = this._mainPanel.handleEnterKey.bind(this._mainPanel);
        this._shortcuts[WebInspector.KeyboardShortcut.makeKey(keys.Enter.code, WebInspector.KeyboardShortcut.Modifiers.None)] = handleEnterKey;

        var handleUndo = this._mainPanel.handleUndoRedo.bind(this._mainPanel, false);
        var handleRedo = this._mainPanel.handleUndoRedo.bind(this._mainPanel, true);
        this._shortcuts[WebInspector.KeyboardShortcut.makeKey("z", modifiers.CtrlOrMeta)] = handleUndo;
        this._shortcuts[WebInspector.KeyboardShortcut.makeKey("z", modifiers.Shift | modifiers.CtrlOrMeta)] = handleRedo;

        var handleTabKey = this._mainPanel.handleTabKeyPress.bind(this._mainPanel, false);
        var handleShiftTabKey = this._mainPanel.handleTabKeyPress.bind(this._mainPanel, true);
        this._shortcuts[WebInspector.KeyboardShortcut.makeKey(keys.Tab.code)] = handleTabKey;
        this._shortcuts[WebInspector.KeyboardShortcut.makeKey(keys.Tab.code, modifiers.Shift)] = handleShiftTabKey;
    },

    _handleKeyDown: function(e)
    {
        if (this.readOnly)
            return;

        var shortcutKey = WebInspector.KeyboardShortcut.makeKeyFromEvent(e);
        var handler = this._shortcuts[shortcutKey];
        if (handler && handler())
            e.consume(true);
    },

    _contextMenu: function(event)
    {
        var contextMenu = new WebInspector.ContextMenu();
        var target = event.target.enclosingNodeOrSelfWithClass("webkit-line-number");
        if (target)
            this._delegate.populateLineGutterContextMenu(contextMenu, target.lineNumber);
        else {
            target = this._mainPanel._enclosingLineRowOrSelf(event.target);
            this._delegate.populateTextAreaContextMenu(contextMenu, target && target.lineNumber);
        }
        var fileName = this._delegate.suggestedFileName();
        if (fileName)
            contextMenu.appendItem(WebInspector.UIString(WebInspector.useLowerCaseMenuTitles() ? "Save as..." : "Save As..."), InspectorFrontendHost.saveAs.bind(InspectorFrontendHost, fileName, this._textModel.text));

        contextMenu.show(event);
    },

    _commitEditing: function()
    {
        if (this.readOnly)
            return false;

        this._delegate.commitEditing();
        return true;
    },

    wasShown: function()
    {
        if (!this.readOnly)
            WebInspector.markBeingEdited(this.element, true);
    },

    willHide: function()
    {
        if (!this.readOnly)
            WebInspector.markBeingEdited(this.element, false);
    }
}

WebInspector.TextViewer.prototype.__proto__ = WebInspector.View.prototype;

/**
 * @interface
 */
WebInspector.TextViewerDelegate = function()
{
}

WebInspector.TextViewerDelegate.prototype = {
    beforeTextChanged: function() { },

    afterTextChanged: function(oldRange, newRange) { },

    commitEditing: function() { },

    populateLineGutterContextMenu: function(contextMenu, lineNumber) { },

    populateTextAreaContextMenu: function(contextMenu, lineNumber) { },

    suggestedFileName: function() { }
}

/**
 * @constructor
 */
WebInspector.TextEditorChunkedPanel = function(textModel)
{
    this._textModel = textModel;

    this._defaultChunkSize = 50;
    this._paintCoalescingLevel = 0;
    this._domUpdateCoalescingLevel = 0;
}

WebInspector.TextEditorChunkedPanel.prototype = {
    get textModel()
    {
        return this._textModel;
    },

    revealLine: function(lineNumber)
    {
        if (lineNumber >= this._textModel.linesCount)
            return;

        var chunk = this.makeLineAChunk(lineNumber);
        chunk.element.scrollIntoViewIfNeeded();
    },

    addDecoration: function(lineNumber, decoration)
    {
        if (lineNumber >= this._textModel.linesCount)
            return;

        var chunk = this.makeLineAChunk(lineNumber);
        chunk.addDecoration(decoration);
    },

    removeDecoration: function(lineNumber, decoration)
    {
        if (lineNumber >= this._textModel.linesCount)
            return;

        var chunk = this.chunkForLine(lineNumber);
        chunk.removeDecoration(decoration);
    },

    _buildChunks: function()
    {
        this.beginDomUpdates();

        this._container.removeChildren();

        this._textChunks = [];
        for (var i = 0; i < this._textModel.linesCount; i += this._defaultChunkSize) {
            var chunk = this._createNewChunk(i, i + this._defaultChunkSize);
            this._textChunks.push(chunk);
            this._container.appendChild(chunk.element);
        }

        this._repaintAll();

        this.endDomUpdates();
    },

    makeLineAChunk: function(lineNumber)
    {
        var chunkNumber = this._chunkNumberForLine(lineNumber);
        var oldChunk = this._textChunks[chunkNumber];

        if (!oldChunk) {
            console.error("No chunk for line number: " + lineNumber);
            return;
        }

        if (oldChunk.linesCount === 1)
            return oldChunk;

        return this._splitChunkOnALine(lineNumber, chunkNumber, true);
    },

    _splitChunkOnALine: function(lineNumber, chunkNumber, createSuffixChunk)
    {
        this.beginDomUpdates();

        var oldChunk = this._textChunks[chunkNumber];
        var wasExpanded = oldChunk.expanded;
        oldChunk.expanded = false;

        var insertIndex = chunkNumber + 1;

        // Prefix chunk.
        if (lineNumber > oldChunk.startLine) {
            var prefixChunk = this._createNewChunk(oldChunk.startLine, lineNumber);
            prefixChunk.readOnly = oldChunk.readOnly;
            this._textChunks.splice(insertIndex++, 0, prefixChunk);
            this._container.insertBefore(prefixChunk.element, oldChunk.element);
        }

        // Line chunk.
        var endLine = createSuffixChunk ? lineNumber + 1 : oldChunk.startLine + oldChunk.linesCount;
        var lineChunk = this._createNewChunk(lineNumber, endLine);
        lineChunk.readOnly = oldChunk.readOnly;
        this._textChunks.splice(insertIndex++, 0, lineChunk);
        this._container.insertBefore(lineChunk.element, oldChunk.element);

        // Suffix chunk.
        if (oldChunk.startLine + oldChunk.linesCount > endLine) {
            var suffixChunk = this._createNewChunk(endLine, oldChunk.startLine + oldChunk.linesCount);
            suffixChunk.readOnly = oldChunk.readOnly;
            this._textChunks.splice(insertIndex, 0, suffixChunk);
            this._container.insertBefore(suffixChunk.element, oldChunk.element);
        }

        // Remove enclosing chunk.
        this._textChunks.splice(chunkNumber, 1);
        this._container.removeChild(oldChunk.element);

        if (wasExpanded) {
            if (prefixChunk)
                prefixChunk.expanded = true;
            lineChunk.expanded = true;
            if (suffixChunk)
                suffixChunk.expanded = true;
        }

        this.endDomUpdates();

        return lineChunk;
    },

    _scroll: function()
    {
        // FIXME: Replace the "2" with the padding-left value from CSS.
        if (this.element.scrollLeft <= 2)
            this.element.scrollLeft = 0;

        this._scheduleRepaintAll();
        if (this._syncScrollListener)
            this._syncScrollListener();
    },

    _scheduleRepaintAll: function()
    {
        if (this._repaintAllTimer)
            clearTimeout(this._repaintAllTimer);
        this._repaintAllTimer = setTimeout(this._repaintAll.bind(this), 50);
    },

    beginUpdates: function()
    {
        this._paintCoalescingLevel++;
    },

    endUpdates: function()
    {
        this._paintCoalescingLevel--;
        if (!this._paintCoalescingLevel)
            this._repaintAll();
    },

    beginDomUpdates: function()
    {
        this._domUpdateCoalescingLevel++;
    },

    endDomUpdates: function()
    {
        this._domUpdateCoalescingLevel--;
    },

    _chunkNumberForLine: function(lineNumber)
    {
        function compareLineNumbers(value, chunk)
        {
            return value < chunk.startLine ? -1 : 1;
        }
        var insertBefore = insertionIndexForObjectInListSortedByFunction(lineNumber, this._textChunks, compareLineNumbers);
        return insertBefore - 1;
    },

    chunkForLine: function(lineNumber)
    {
        return this._textChunks[this._chunkNumberForLine(lineNumber)];
    },

    _findFirstVisibleChunkNumber: function(visibleFrom)
    {
        function compareOffsetTops(value, chunk)
        {
            return value < chunk.offsetTop ? -1 : 1;
        }
        var insertBefore = insertionIndexForObjectInListSortedByFunction(visibleFrom, this._textChunks, compareOffsetTops);
        return insertBefore - 1;
    },

    _findVisibleChunks: function(visibleFrom, visibleTo)
    {
        var from = this._findFirstVisibleChunkNumber(visibleFrom);
        for (var to = from + 1; to < this._textChunks.length; ++to) {
            if (this._textChunks[to].offsetTop >= visibleTo)
                break;
        }
        return { start: from, end: to };
    },

    _findFirstVisibleLineNumber: function(visibleFrom)
    {
        var chunk = this._textChunks[this._findFirstVisibleChunkNumber(visibleFrom)];
        if (!chunk.expanded)
            return chunk.startLine;

        var lineNumbers = [];
        for (var i = 0; i < chunk.linesCount; ++i) {
            lineNumbers.push(chunk.startLine + i);
        }

        function compareLineRowOffsetTops(value, lineNumber)
        {
            var lineRow = chunk.getExpandedLineRow(lineNumber);
            return value < lineRow.offsetTop ? -1 : 1;
        }
        var insertBefore = insertionIndexForObjectInListSortedByFunction(visibleFrom, lineNumbers, compareLineRowOffsetTops);
        return lineNumbers[insertBefore - 1];
    },

    _repaintAll: function()
    {
        delete this._repaintAllTimer;

        if (this._paintCoalescingLevel || this._dirtyLines)
            return;

        var visibleFrom = this.element.scrollTop;
        var visibleTo = this.element.scrollTop + this.element.clientHeight;

        if (visibleTo) {
            var result = this._findVisibleChunks(visibleFrom, visibleTo);
            this._expandChunks(result.start, result.end);
        }
    },

    _expandChunks: function(fromIndex, toIndex)
    {
        // First collapse chunks to collect the DOM elements into a cache to reuse them later.
        for (var i = 0; i < fromIndex; ++i)
            this._textChunks[i].expanded = false;
        for (var i = toIndex; i < this._textChunks.length; ++i)
            this._textChunks[i].expanded = false;
        for (var i = fromIndex; i < toIndex; ++i)
            this._textChunks[i].expanded = true;
    },

    _totalHeight: function(firstElement, lastElement)
    {
        lastElement = (lastElement || firstElement).nextElementSibling;
        if (lastElement)
            return lastElement.offsetTop - firstElement.offsetTop;

        var offsetParent = firstElement.offsetParent;
        if (offsetParent && offsetParent.scrollHeight > offsetParent.clientHeight)
            return offsetParent.scrollHeight - firstElement.offsetTop;

        var total = 0;
        while (firstElement && firstElement !== lastElement) {
            total += firstElement.offsetHeight;
            firstElement = firstElement.nextElementSibling;
        }
        return total;
    },

    resize: function()
    {
        this._repaintAll();
    }
}

/**
 * @constructor
 * @extends {WebInspector.TextEditorChunkedPanel}
 */
WebInspector.TextEditorGutterPanel = function(textModel, syncDecorationsForLineListener, syncLineHeightListener)
{
    WebInspector.TextEditorChunkedPanel.call(this, textModel);

    this._syncDecorationsForLineListener = syncDecorationsForLineListener;
    this._syncLineHeightListener = syncLineHeightListener;

    this.element = document.createElement("div");
    this.element.className = "text-editor-lines";

    this._container = document.createElement("div");
    this._container.className = "inner-container";
    this.element.appendChild(this._container);

    this.element.addEventListener("scroll", this._scroll.bind(this), false);

    this.freeCachedElements();
    this._buildChunks();
    this._decorations = {};
}

WebInspector.TextEditorGutterPanel.prototype = {
    freeCachedElements: function()
    {
        this._cachedRows = [];
    },

    _createNewChunk: function(startLine, endLine)
    {
        return new WebInspector.TextEditorGutterChunk(this, startLine, endLine);
    },

    textChanged: function(oldRange, newRange)
    {
        this.beginDomUpdates();

        var linesDiff = newRange.linesCount - oldRange.linesCount;
        if (linesDiff) {
            // Remove old chunks (if needed).
            for (var chunkNumber = this._textChunks.length - 1; chunkNumber >= 0 ; --chunkNumber) {
                var chunk = this._textChunks[chunkNumber];
                if (chunk.startLine + chunk.linesCount <= this._textModel.linesCount)
                    break;
                chunk.expanded = false;
                this._container.removeChild(chunk.element);
            }
            this._textChunks.length = chunkNumber + 1;

            // Add new chunks (if needed).
            var totalLines = 0;
            if (this._textChunks.length) {
                var lastChunk = this._textChunks[this._textChunks.length - 1];
                totalLines = lastChunk.startLine + lastChunk.linesCount;
            }

            for (var i = totalLines; i < this._textModel.linesCount; i += this._defaultChunkSize) {
                var chunk = this._createNewChunk(i, i + this._defaultChunkSize);
                this._textChunks.push(chunk);
                this._container.appendChild(chunk.element);
            }

            // Shift decorations if necessary
            for (var lineNumber in this._decorations) {
                lineNumber = parseInt(lineNumber, 10);

                // Do not move decorations before the start position.
                if (lineNumber < oldRange.startLine)
                    continue;

                var lineDecorationsCopy = this._decorations[lineNumber].slice();
                for (var i = 0; i < lineDecorationsCopy.length; ++i) {
                    var decoration = lineDecorationsCopy[i];
                    this.removeDecoration(lineNumber, decoration);

                    // Do not restore the decorations before the end position.
                    if (lineNumber < oldRange.endLine)
                        continue;

                    this.addDecoration(lineNumber + linesDiff, decoration);
                }
            }

            this._repaintAll();
        } else {
            // Decorations may have been removed, so we may have to sync those lines.
            var chunkNumber = this._chunkNumberForLine(newRange.startLine);
            var chunk = this._textChunks[chunkNumber];
            while (chunk && chunk.startLine <= newRange.endLine) {
                if (chunk.linesCount === 1)
                    this._syncDecorationsForLineListener(chunk.startLine);
                chunk = this._textChunks[++chunkNumber];
            }
        }

        this.endDomUpdates();
    },

    syncClientHeight: function(clientHeight)
    {
        if (this.element.offsetHeight > clientHeight)
            this._container.style.setProperty("padding-bottom", (this.element.offsetHeight - clientHeight) + "px");
        else
            this._container.style.removeProperty("padding-bottom");
    },

    addDecoration: function(lineNumber, decoration)
    {
        WebInspector.TextEditorChunkedPanel.prototype.addDecoration.call(this, lineNumber, decoration);
        var decorations = this._decorations[lineNumber];
        if (!decorations) {
            decorations = [];
            this._decorations[lineNumber] = decorations;
        }
        decorations.push(decoration);
    },

    removeDecoration: function(lineNumber, decoration)
    {
        WebInspector.TextEditorChunkedPanel.prototype.removeDecoration.call(this, lineNumber, decoration);
        var decorations = this._decorations[lineNumber];
        if (decorations) {
            decorations.remove(decoration);
            if (!decorations.length)
                delete this._decorations[lineNumber];
        }
    }
}

WebInspector.TextEditorGutterPanel.prototype.__proto__ = WebInspector.TextEditorChunkedPanel.prototype;

/**
 * @constructor
 */
WebInspector.TextEditorGutterChunk = function(textViewer, startLine, endLine)
{
    this._textViewer = textViewer;
    this._textModel = textViewer._textModel;

    this.startLine = startLine;
    endLine = Math.min(this._textModel.linesCount, endLine);
    this.linesCount = endLine - startLine;

    this._expanded = false;

    this.element = document.createElement("div");
    this.element.lineNumber = startLine;
    this.element.className = "webkit-line-number";

    if (this.linesCount === 1) {
        // Single line chunks are typically created for decorations. Host line number in
        // the sub-element in order to allow flexible border / margin management.
        var innerSpan = document.createElement("span");
        innerSpan.className = "webkit-line-number-inner";
        innerSpan.textContent = startLine + 1;
        var outerSpan = document.createElement("div");
        outerSpan.className = "webkit-line-number-outer";
        outerSpan.appendChild(innerSpan);
        this.element.appendChild(outerSpan);
    } else {
        var lineNumbers = [];
        for (var i = startLine; i < endLine; ++i)
            lineNumbers.push(i + 1);
        this.element.textContent = lineNumbers.join("\n");
    }
}

WebInspector.TextEditorGutterChunk.prototype = {
    addDecoration: function(decoration)
    {
        this._textViewer.beginDomUpdates();
        if (typeof decoration === "string")
            this.element.addStyleClass(decoration);
        this._textViewer.endDomUpdates();
    },

    removeDecoration: function(decoration)
    {
        this._textViewer.beginDomUpdates();
        if (typeof decoration === "string")
            this.element.removeStyleClass(decoration);
        this._textViewer.endDomUpdates();
    },

    get expanded()
    {
        return this._expanded;
    },

    set expanded(expanded)
    {
        if (this.linesCount === 1)
            this._textViewer._syncDecorationsForLineListener(this.startLine);

        if (this._expanded === expanded)
            return;

        this._expanded = expanded;

        if (this.linesCount === 1)
            return;

        this._textViewer.beginDomUpdates();

        if (expanded) {
            this._expandedLineRows = [];
            var parentElement = this.element.parentElement;
            for (var i = this.startLine; i < this.startLine + this.linesCount; ++i) {
                var lineRow = this._createRow(i);
                parentElement.insertBefore(lineRow, this.element);
                this._expandedLineRows.push(lineRow);
            }
            parentElement.removeChild(this.element);
            this._textViewer._syncLineHeightListener(this._expandedLineRows[0]);
        } else {
            var elementInserted = false;
            for (var i = 0; i < this._expandedLineRows.length; ++i) {
                var lineRow = this._expandedLineRows[i];
                var parentElement = lineRow.parentElement;
                if (parentElement) {
                    if (!elementInserted) {
                        elementInserted = true;
                        parentElement.insertBefore(this.element, lineRow);
                    }
                    parentElement.removeChild(lineRow);
                }
                this._textViewer._cachedRows.push(lineRow);
            }
            delete this._expandedLineRows;
        }

        this._textViewer.endDomUpdates();
    },

    get height()
    {
        if (!this._expandedLineRows)
            return this._textViewer._totalHeight(this.element);
        return this._textViewer._totalHeight(this._expandedLineRows[0], this._expandedLineRows[this._expandedLineRows.length - 1]);
    },

    get offsetTop()
    {
        return (this._expandedLineRows && this._expandedLineRows.length) ? this._expandedLineRows[0].offsetTop : this.element.offsetTop;
    },

    _createRow: function(lineNumber)
    {
        var lineRow = this._textViewer._cachedRows.pop() || document.createElement("div");
        lineRow.lineNumber = lineNumber;
        lineRow.className = "webkit-line-number";
        lineRow.textContent = lineNumber + 1;
        return lineRow;
    }
}

/**
 * @constructor
 * @extends {WebInspector.TextEditorChunkedPanel}
 */
WebInspector.TextEditorMainPanel = function(textModel, url, syncScrollListener, syncDecorationsForLineListener, enterTextChangeMode, exitTextChangeMode)
{
    WebInspector.TextEditorChunkedPanel.call(this, textModel);

    this._syncScrollListener = syncScrollListener;
    this._syncDecorationsForLineListener = syncDecorationsForLineListener;
    this._enterTextChangeMode = enterTextChangeMode;
    this._exitTextChangeMode = exitTextChangeMode;

    this._url = url;
    this._highlighter = new WebInspector.TextEditorHighlighter(textModel, this._highlightDataReady.bind(this));
    this._readOnly = true;

    this.element = document.createElement("div");
    this.element.className = "text-editor-contents";
    this.element.tabIndex = 0;

    this._container = document.createElement("div");
    this._container.className = "inner-container";
    this._container.tabIndex = 0;
    this.element.appendChild(this._container);

    this.element.addEventListener("scroll", this._scroll.bind(this), false);
    this.element.addEventListener("focus", this._handleElementFocus.bind(this), false);

    // In WebKit the DOMNodeRemoved event is fired AFTER the node is removed, thus it should be
    // attached to all DOM nodes that we want to track. Instead, we attach the DOMNodeRemoved
    // listeners only on the line rows, and use DOMSubtreeModified to track node removals inside
    // the line rows. For more info see: https://bugs.webkit.org/show_bug.cgi?id=55666
    //
    // OPTIMIZATION. It is very expensive to listen to the DOM mutation events, thus we remove the
    // listeners whenever we do any internal DOM manipulations (such as expand/collapse line rows)
    // and set the listeners back when we are finished.
    this._handleDOMUpdatesCallback = this._handleDOMUpdates.bind(this);
    this._container.addEventListener("DOMCharacterDataModified", this._handleDOMUpdatesCallback, false);
    this._container.addEventListener("DOMNodeInserted", this._handleDOMUpdatesCallback, false);
    this._container.addEventListener("DOMSubtreeModified", this._handleDOMUpdatesCallback, false);

    this.freeCachedElements();
    this._buildChunks();
}

WebInspector.TextEditorMainPanel.prototype = {
    set mimeType(mimeType)
    {
        this._highlighter.mimeType = mimeType;
    },

    set readOnly(readOnly)
    {
        if (this._readOnly === readOnly)
            return;

        this.beginDomUpdates();
        this._readOnly = readOnly;
        if (this._readOnly)
            this._container.removeStyleClass("text-editor-editable");
        else {
            this._container.addStyleClass("text-editor-editable");
            this._updateSelectionOnStartEditing();
        }
        this.endDomUpdates();
    },

    get readOnly()
    {
        return this._readOnly;
    },

    _handleElementFocus: function()
    {
        if (!this._readOnly)
            this._container.focus();
    },

    focus: function()
    {
        if (this._readOnly)
            this.element.focus();
        else
            this._container.focus();
    },

    _updateSelectionOnStartEditing: function()
    {
        // focus() needs to go first for the case when the last selection was inside the editor and
        // the "Edit" button was clicked. In this case we bail at the check below, but the
        // editor does not receive the focus, thus "Esc" does not cancel editing until at least
        // one change has been made to the editor contents.
        this._container.focus();
        var selection = window.getSelection();
        if (selection.rangeCount) {
            var commonAncestorContainer = selection.getRangeAt(0).commonAncestorContainer;
            if (this._container.isSelfOrAncestor(commonAncestorContainer))
                return;
        }

        selection.removeAllRanges();
        var range = document.createRange();
        range.setStart(this._container, 0);
        range.setEnd(this._container, 0);
        selection.addRange(range);
    },

    setEditableRange: function(startLine, endLine)
    {
        this.beginDomUpdates();

        var firstChunkNumber = this._chunkNumberForLine(startLine);
        var firstChunk = this._textChunks[firstChunkNumber];
        if (firstChunk.startLine !== startLine) {
            this._splitChunkOnALine(startLine, firstChunkNumber);
            firstChunkNumber += 1;
        }

        var lastChunkNumber = this._textChunks.length;
        if (endLine !== this._textModel.linesCount) {
            lastChunkNumber = this._chunkNumberForLine(endLine);
            var lastChunk = this._textChunks[lastChunkNumber];
            if (lastChunk && lastChunk.startLine !== endLine) {
                this._splitChunkOnALine(endLine, lastChunkNumber);
                lastChunkNumber += 1;
            }
        }

        for (var chunkNumber = 0; chunkNumber < firstChunkNumber; ++chunkNumber)
            this._textChunks[chunkNumber].readOnly = true;
        for (var chunkNumber = firstChunkNumber; chunkNumber < lastChunkNumber; ++chunkNumber)
            this._textChunks[chunkNumber].readOnly = false;
        for (var chunkNumber = lastChunkNumber; chunkNumber < this._textChunks.length; ++chunkNumber)
            this._textChunks[chunkNumber].readOnly = true;

        this.endDomUpdates();
    },

    clearEditableRange: function()
    {
        for (var chunkNumber = 0; chunkNumber < this._textChunks.length; ++chunkNumber)
            this._textChunks[chunkNumber].readOnly = false;
    },

    markAndRevealRange: function(range)
    {
        if (this._rangeToMark) {
            var markedLine = this._rangeToMark.startLine;
            delete this._rangeToMark;
            // Remove the marked region immediately.
            if (!this._dirtyLines) {
                this.beginDomUpdates();
                var chunk = this.chunkForLine(markedLine);
                var wasExpanded = chunk.expanded;
                chunk.expanded = false;
                chunk.updateCollapsedLineRow();
                chunk.expanded = wasExpanded;
                this.endDomUpdates();
            } else
                this._paintLines(markedLine, markedLine + 1);
        }

        if (range) {
            this._rangeToMark = range;
            this.revealLine(range.startLine);
            var chunk = this.makeLineAChunk(range.startLine);
            this._paintLine(chunk.element);
            if (this._markedRangeElement)
                this._markedRangeElement.scrollIntoViewIfNeeded();
        }
        delete this._markedRangeElement;
    },

    highlightLine: function(lineNumber)
    {
        this.clearLineHighlight();
        this._highlightedLine = lineNumber;
        this.revealLine(lineNumber);

        if (!this._readOnly)
            this._restoreSelection(new WebInspector.TextRange(lineNumber, 0, lineNumber, 0), false);

        this.addDecoration(lineNumber, "webkit-highlighted-line");
    },

    clearLineHighlight: function()
    {
        if (typeof this._highlightedLine === "number") {
            this.removeDecoration(this._highlightedLine, "webkit-highlighted-line");
            delete this._highlightedLine;
        }
    },

    freeCachedElements: function()
    {
        this._cachedSpans = [];
        this._cachedTextNodes = [];
        this._cachedRows = [];
    },

    handleUndoRedo: function(redo)
    {
        if (this._dirtyLines)
            return false;

        this.beginUpdates();

        function before()
        {
            this._enterTextChangeMode();
        }

        function after(oldRange, newRange)
        {
            this._exitTextChangeMode(oldRange, newRange);
        }

        var range = redo ? this._textModel.redo(before.bind(this), after.bind(this)) : this._textModel.undo(before.bind(this), after.bind(this));

        this.endUpdates();

        // Restore location post-repaint.
        if (range)
            this._setCaretLocation(range.endLine, range.endColumn, true);

        return true;
    },

    handleTabKeyPress: function(shiftKey)
    {
        if (this._dirtyLines)
            return false;

        var selection = this._getSelection();
        if (!selection)
            return false;

        var range = selection.normalize();

        this.beginUpdates();
        this._enterTextChangeMode();

        var newRange;
        if (shiftKey)
            newRange = this._unindentLines(range);
        else {
            if (range.isEmpty()) {
                newRange = this._setText(range, WebInspector.settings.textEditorIndent.get());
                newRange.startColumn = newRange.endColumn;
            } else
                newRange = this._indentLines(range);

        }

        this._exitTextChangeMode(range, newRange);
        this.endUpdates();
        this._restoreSelection(newRange, true);
        return true;
    },

    _indentLines: function(range)
    {
        var indent = WebInspector.settings.textEditorIndent.get();

        if (this._lastEditedRange)
            this._textModel.markUndoableState();

        var newRange = range.clone();

        // Do not change a selection start position when it is at the beginning of a line
        if (range.startColumn)
            newRange.startColumn += indent.length;

        var indentEndLine = range.endLine;
        if (range.endColumn)
            newRange.endColumn += indent.length;
        else
            indentEndLine--;

        for (var lineNumber = range.startLine; lineNumber <= indentEndLine; lineNumber++)
            this._textModel.setText(new WebInspector.TextRange(lineNumber, 0, lineNumber, 0), indent);

        this._lastEditedRange = newRange;

        return newRange;
    },

    _unindentLines: function(range)
    {
        if (this._lastEditedRange)
            this._textModel.markUndoableState();

        var indent = WebInspector.settings.textEditorIndent.get();
        var indentLength = indent === WebInspector.TextEditorModel.Indent.TabCharacter ? 4 : indent.length;
        var lineIndentRegex = new RegExp("^ {1," + indentLength + "}");
        var newRange = range.clone();

        var indentEndLine = range.endLine;
        if (!range.endColumn)
            indentEndLine--;

        for (var lineNumber = range.startLine; lineNumber <= indentEndLine; lineNumber++) {
            var line = this._textModel.line(lineNumber);
            var firstCharacter = line.charAt(0);
            var lineIndentLength;

            if (firstCharacter === " ")
                lineIndentLength = line.match(lineIndentRegex)[0].length;
            else if (firstCharacter === "\t")
                lineIndentLength = 1;
            else
                continue;

            this._textModel.setText(new WebInspector.TextRange(lineNumber, 0, lineNumber, lineIndentLength), "");

            if (lineNumber === range.startLine)
                newRange.startColumn = Math.max(0, newRange.startColumn - lineIndentLength);
        }

        if (lineIndentLength)
            newRange.endColumn = Math.max(0, newRange.endColumn - lineIndentLength);

        this._lastEditedRange = newRange;

        return newRange;
    },

    handleEnterKey: function()
    {
        if (this._dirtyLines)
            return false;

        var range = this._getSelection();
        if (!range)
            return false;

        range.normalize();

        if (range.endColumn === 0)
            return false;

        var line = this._textModel.line(range.startLine);
        var linePrefix = line.substring(0, range.startColumn);
        var indentMatch = linePrefix.match(/^\s+/);
        var currentIndent = indentMatch ? indentMatch[0] : "";

        var textEditorIndent = WebInspector.settings.textEditorIndent.get();
        var indent = WebInspector.TextEditorModel.endsWithBracketRegex.test(linePrefix) ? currentIndent + textEditorIndent : currentIndent;

        if (!indent)
            return false;

        this.beginUpdates();
        this._enterTextChangeMode();

        var lineBreak = this._textModel.lineBreak;
        var newRange;
        if (range.isEmpty() && line.substr(range.endColumn - 1, 2) === '{}') {
            // {|}
            // becomes
            // {
            //     |
            // }
            newRange = this._setText(range, lineBreak + indent + lineBreak + currentIndent);
            newRange.endLine--;
            newRange.endColumn += textEditorIndent.length;
        } else
            newRange = this._setText(range, lineBreak + indent);

        this._exitTextChangeMode(range, newRange);
        this.endUpdates();
        this._restoreSelection(newRange.collapseToEnd(), true);

        return true;
    },

    _splitChunkOnALine: function(lineNumber, chunkNumber, createSuffixChunk)
    {
        var selection = this._getSelection();
        var chunk = WebInspector.TextEditorChunkedPanel.prototype._splitChunkOnALine.call(this, lineNumber, chunkNumber, createSuffixChunk);
        this._restoreSelection(selection);
        return chunk;
    },

    beginDomUpdates: function()
    {
        WebInspector.TextEditorChunkedPanel.prototype.beginDomUpdates.call(this);
        if (this._domUpdateCoalescingLevel === 1) {
            this._container.removeEventListener("DOMCharacterDataModified", this._handleDOMUpdatesCallback, false);
            this._container.removeEventListener("DOMNodeInserted", this._handleDOMUpdatesCallback, false);
            this._container.removeEventListener("DOMSubtreeModified", this._handleDOMUpdatesCallback, false);
        }
    },

    endDomUpdates: function()
    {
        WebInspector.TextEditorChunkedPanel.prototype.endDomUpdates.call(this);
        if (this._domUpdateCoalescingLevel === 0) {
            this._container.addEventListener("DOMCharacterDataModified", this._handleDOMUpdatesCallback, false);
            this._container.addEventListener("DOMNodeInserted", this._handleDOMUpdatesCallback, false);
            this._container.addEventListener("DOMSubtreeModified", this._handleDOMUpdatesCallback, false);
        }
    },

    _enableDOMNodeRemovedListener: function(lineRow, enable)
    {
        if (enable)
            lineRow.addEventListener("DOMNodeRemoved", this._handleDOMUpdatesCallback, false);
        else
            lineRow.removeEventListener("DOMNodeRemoved", this._handleDOMUpdatesCallback, false);
    },

    _buildChunks: function()
    {
        for (var i = 0; i < this._textModel.linesCount; ++i)
            this._textModel.removeAttribute(i, "highlight");

        WebInspector.TextEditorChunkedPanel.prototype._buildChunks.call(this);
    },

    _createNewChunk: function(startLine, endLine)
    {
        return new WebInspector.TextEditorMainChunk(this, startLine, endLine);
    },

    _expandChunks: function(fromIndex, toIndex)
    {
        var lastChunk = this._textChunks[toIndex - 1];
        var lastVisibleLine = lastChunk.startLine + lastChunk.linesCount;

        var selection = this._getSelection();

        this._muteHighlightListener = true;
        this._highlighter.highlight(lastVisibleLine);
        delete this._muteHighlightListener;

        this._restorePaintLinesOperationsCredit();
        WebInspector.TextEditorChunkedPanel.prototype._expandChunks.call(this, fromIndex, toIndex);
        this._adjustPaintLinesOperationsRefreshValue();

        this._restoreSelection(selection);
    },

    _highlightDataReady: function(fromLine, toLine)
    {
        if (this._muteHighlightListener)
            return;
        this._restorePaintLinesOperationsCredit();
        this._paintLines(fromLine, toLine, true /*restoreSelection*/);
    },

    _schedulePaintLines: function(startLine, endLine)
    {
        if (startLine >= endLine)
            return;

        if (!this._scheduledPaintLines) {
            this._scheduledPaintLines = [ { startLine: startLine, endLine: endLine } ];
            this._paintScheduledLinesTimer = setTimeout(this._paintScheduledLines.bind(this), 0);
        } else {
            for (var i = 0; i < this._scheduledPaintLines.length; ++i) {
                var chunk = this._scheduledPaintLines[i];
                if (chunk.startLine <= endLine && chunk.endLine >= startLine) {
                    chunk.startLine = Math.min(chunk.startLine, startLine);
                    chunk.endLine = Math.max(chunk.endLine, endLine);
                    return;
                }
                if (chunk.startLine > endLine) {
                    this._scheduledPaintLines.splice(i, 0, { startLine: startLine, endLine: endLine });
                    return;
                }
            }
            this._scheduledPaintLines.push({ startLine: startLine, endLine: endLine });
        }
    },

    _paintScheduledLines: function(skipRestoreSelection)
    {
        if (this._paintScheduledLinesTimer)
            clearTimeout(this._paintScheduledLinesTimer);
        delete this._paintScheduledLinesTimer;

        if (!this._scheduledPaintLines)
            return;

        // Reschedule the timer if we can not paint the lines yet, or the user is scrolling.
        if (this._dirtyLines || this._repaintAllTimer) {
            this._paintScheduledLinesTimer = setTimeout(this._paintScheduledLines.bind(this), 50);
            return;
        }

        var scheduledPaintLines = this._scheduledPaintLines;
        delete this._scheduledPaintLines;

        this._restorePaintLinesOperationsCredit();
        this._paintLineChunks(scheduledPaintLines, !skipRestoreSelection);
        this._adjustPaintLinesOperationsRefreshValue();
    },

    _restorePaintLinesOperationsCredit: function()
    {
        if (!this._paintLinesOperationsRefreshValue)
            this._paintLinesOperationsRefreshValue = 250;
        this._paintLinesOperationsCredit = this._paintLinesOperationsRefreshValue;
        this._paintLinesOperationsLastRefresh = Date.now();
    },

    _adjustPaintLinesOperationsRefreshValue: function()
    {
        var operationsDone = this._paintLinesOperationsRefreshValue - this._paintLinesOperationsCredit;
        if (operationsDone <= 0)
            return;
        var timePast = Date.now() - this._paintLinesOperationsLastRefresh;
        if (timePast <= 0)
            return;
        // Make the synchronous CPU chunk for painting the lines 50 msec.
        var value = Math.floor(operationsDone / timePast * 50);
        this._paintLinesOperationsRefreshValue = Number.constrain(value, 150, 1500);
    },

    /**
     * @param {boolean=} restoreSelection
     */
    _paintLines: function(fromLine, toLine, restoreSelection)
    {
        this._paintLineChunks([ { startLine: fromLine, endLine: toLine } ], restoreSelection);
    },

    _paintLineChunks: function(lineChunks, restoreSelection)
    {
        // First, paint visible lines, so that in case of long lines we should start highlighting
        // the visible area immediately, instead of waiting for the lines above the visible area.
        var visibleFrom = this.element.scrollTop;
        var firstVisibleLineNumber = this._findFirstVisibleLineNumber(visibleFrom);

        var chunk;
        var selection;
        var invisibleLineRows = [];
        for (var i = 0; i < lineChunks.length; ++i) {
            var lineChunk = lineChunks[i];
            if (this._dirtyLines || this._scheduledPaintLines) {
                this._schedulePaintLines(lineChunk.startLine, lineChunk.endLine);
                continue;
            }
            for (var lineNumber = lineChunk.startLine; lineNumber < lineChunk.endLine; ++lineNumber) {
                if (!chunk || lineNumber < chunk.startLine || lineNumber >= chunk.startLine + chunk.linesCount)
                    chunk = this.chunkForLine(lineNumber);
                var lineRow = chunk.getExpandedLineRow(lineNumber);
                if (!lineRow)
                    continue;
                if (lineNumber < firstVisibleLineNumber) {
                    invisibleLineRows.push(lineRow);
                    continue;
                }
                if (restoreSelection && !selection)
                    selection = this._getSelection();
                this._paintLine(lineRow);
                if (this._paintLinesOperationsCredit < 0) {
                    this._schedulePaintLines(lineNumber + 1, lineChunk.endLine);
                    break;
                }
            }
        }

        for (var i = 0; i < invisibleLineRows.length; ++i) {
            if (restoreSelection && !selection)
                selection = this._getSelection();
            this._paintLine(invisibleLineRows[i]);
        }

        if (restoreSelection)
            this._restoreSelection(selection);
    },

    _paintLine: function(lineRow)
    {
        var lineNumber = lineRow.lineNumber;
        if (this._dirtyLines) {
            this._schedulePaintLines(lineNumber, lineNumber + 1);
            return;
        }

        this.beginDomUpdates();
        try {
            if (this._scheduledPaintLines || this._paintLinesOperationsCredit < 0) {
                this._schedulePaintLines(lineNumber, lineNumber + 1);
                return;
            }

            var highlight = this._textModel.getAttribute(lineNumber, "highlight");
            if (!highlight)
                return;

            lineRow.removeChildren();
            var line = this._textModel.line(lineNumber);
            if (!line)
                lineRow.appendChild(document.createElement("br"));

            var plainTextStart = -1;
            for (var j = 0; j < line.length;) {
                if (j > 1000) {
                    // This line is too long - do not waste cycles on minified js highlighting.
                    if (plainTextStart === -1)
                        plainTextStart = j;
                    break;
                }
                var attribute = highlight[j];
                if (!attribute || !attribute.tokenType) {
                    if (plainTextStart === -1)
                        plainTextStart = j;
                    j++;
                } else {
                    if (plainTextStart !== -1) {
                        this._appendTextNode(lineRow, line.substring(plainTextStart, j));
                        plainTextStart = -1;
                        --this._paintLinesOperationsCredit;
                    }
                    this._appendSpan(lineRow, line.substring(j, j + attribute.length), attribute.tokenType);
                    j += attribute.length;
                    --this._paintLinesOperationsCredit;
                }
            }
            if (plainTextStart !== -1) {
                this._appendTextNode(lineRow, line.substring(plainTextStart, line.length));
                --this._paintLinesOperationsCredit;
            }
            if (lineRow.decorationsElement)
                lineRow.appendChild(lineRow.decorationsElement);
        } finally {
            if (this._rangeToMark && this._rangeToMark.startLine === lineNumber)
                this._markedRangeElement = highlightSearchResult(lineRow, this._rangeToMark.startColumn, this._rangeToMark.endColumn - this._rangeToMark.startColumn);
            this.endDomUpdates();
        }
    },

    _releaseLinesHighlight: function(lineRow)
    {
        if (!lineRow)
            return;
        if ("spans" in lineRow) {
            var spans = lineRow.spans;
            for (var j = 0; j < spans.length; ++j)
                this._cachedSpans.push(spans[j]);
            delete lineRow.spans;
        }
        if ("textNodes" in lineRow) {
            var textNodes = lineRow.textNodes;
            for (var j = 0; j < textNodes.length; ++j)
                this._cachedTextNodes.push(textNodes[j]);
            delete lineRow.textNodes;
        }
        this._cachedRows.push(lineRow);
    },

    _getSelection: function()
    {
        var selection = window.getSelection();
        if (!selection.rangeCount)
            return null;
        // Selection may be outside of the viewer.
        if (!this._container.isAncestor(selection.anchorNode) || !this._container.isAncestor(selection.focusNode))
            return null;
        var start = this._selectionToPosition(selection.anchorNode, selection.anchorOffset);
        var end = selection.isCollapsed ? start : this._selectionToPosition(selection.focusNode, selection.focusOffset);
        return new WebInspector.TextRange(start.line, start.column, end.line, end.column);
    },

    /**
     * @param {boolean=} scrollIntoView
     */
    _restoreSelection: function(range, scrollIntoView)
    {
        if (!range)
            return;
        var start = this._positionToSelection(range.startLine, range.startColumn);
        var end = range.isEmpty() ? start : this._positionToSelection(range.endLine, range.endColumn);
        window.getSelection().setBaseAndExtent(start.container, start.offset, end.container, end.offset);

        if (scrollIntoView) {
            for (var node = end.container; node; node = node.parentElement) {
                if (node.scrollIntoViewIfNeeded) {
                    node.scrollIntoViewIfNeeded();
                    break;
                }
            }
        }
    },

    _setCaretLocation: function(line, column, scrollIntoView)
    {
        var range = new WebInspector.TextRange(line, column, line, column);
        this._restoreSelection(range, scrollIntoView);
    },

    _selectionToPosition: function(container, offset)
    {
        if (container === this._container && offset === 0)
            return { line: 0, column: 0 };
        if (container === this._container && offset === 1)
            return { line: this._textModel.linesCount - 1, column: this._textModel.lineLength(this._textModel.linesCount - 1) };

        var lineRow = this._enclosingLineRowOrSelf(container);
        var lineNumber = lineRow.lineNumber;
        if (container === lineRow && offset === 0)
            return { line: lineNumber, column: 0 };

        // This may be chunk and chunks may contain \n.
        var column = 0;
        var node = lineRow.nodeType === Node.TEXT_NODE ? lineRow : lineRow.traverseNextTextNode(lineRow);
        while (node && node !== container) {
            var text = node.textContent;
            for (var i = 0; i < text.length; ++i) {
                if (text.charAt(i) === "\n") {
                    lineNumber++;
                    column = 0;
                } else
                    column++;
            }
            node = node.traverseNextTextNode(lineRow);
        }

        if (node === container && offset) {
            var text = node.textContent;
            for (var i = 0; i < offset; ++i) {
                if (text.charAt(i) === "\n") {
                    lineNumber++;
                    column = 0;
                } else
                    column++;
            }
        }
        return { line: lineNumber, column: column };
    },

    _positionToSelection: function(line, column)
    {
        var chunk = this.chunkForLine(line);
        // One-lined collapsed chunks may still stay highlighted.
        var lineRow = chunk.linesCount === 1 ? chunk.element : chunk.getExpandedLineRow(line);
        if (lineRow)
            var rangeBoundary = lineRow.rangeBoundaryForOffset(column);
        else {
            var offset = column;
            for (var i = chunk.startLine; i < line; ++i)
                offset += this._textModel.lineLength(i) + 1; // \n
            lineRow = chunk.element;
            if (lineRow.firstChild)
                var rangeBoundary = { container: lineRow.firstChild, offset: offset };
            else
                var rangeBoundary = { container: lineRow, offset: 0 };
        }
        return rangeBoundary;
    },

    _enclosingLineRowOrSelf: function(element)
    {
        var lineRow = element.enclosingNodeOrSelfWithClass("webkit-line-content");
        if (lineRow)
            return lineRow;

        for (lineRow = element; lineRow; lineRow = lineRow.parentElement) {
            if (lineRow.parentElement === this._container)
                return lineRow;
        }
        return null;
    },

    _appendSpan: function(element, content, className)
    {
        if (className === "html-resource-link" || className === "html-external-link") {
            element.appendChild(this._createLink(content, className === "html-external-link"));
            return;
        }

        var span = this._cachedSpans.pop() || document.createElement("span");
        span.className = "webkit-" + className;
        span.textContent = content;
        element.appendChild(span);
        if (!("spans" in element))
            element.spans = [];
        element.spans.push(span);
    },

    _appendTextNode: function(element, text)
    {
        var textNode = this._cachedTextNodes.pop();
        if (textNode)
            textNode.nodeValue = text;
        else
            textNode = document.createTextNode(text);
        element.appendChild(textNode);
        if (!("textNodes" in element))
            element.textNodes = [];
        element.textNodes.push(textNode);
    },

    _createLink: function(content, isExternal)
    {
        var quote = content.charAt(0);
        if (content.length > 1 && (quote === "\"" ||   quote === "'"))
            content = content.substring(1, content.length - 1);
        else
            quote = null;

        var a = WebInspector.linkifyURLAsNode(this._rewriteHref(content), content, undefined, isExternal);
        var span = document.createElement("span");
        span.className = "webkit-html-attribute-value";
        if (quote)
            span.appendChild(document.createTextNode(quote));
        span.appendChild(a);
        if (quote)
            span.appendChild(document.createTextNode(quote));
        return span;
    },

    /**
     * @param {boolean=} isExternal
     */
    _rewriteHref: function(hrefValue, isExternal)
    {
        if (!this._url || !hrefValue || hrefValue.indexOf("://") > 0)
            return hrefValue;
        return WebInspector.completeURL(this._url, hrefValue);
    },

    _handleDOMUpdates: function(e)
    {
        if (this._domUpdateCoalescingLevel)
            return;

        var target = e.target;
        if (target === this._container)
            return;

        var lineRow = this._enclosingLineRowOrSelf(target);
        if (!lineRow)
            return;

        if (lineRow.decorationsElement && lineRow.decorationsElement.isSelfOrAncestor(target)) {
            if (this._syncDecorationsForLineListener)
                this._syncDecorationsForLineListener(lineRow.lineNumber);
            return;
        }

        if (this._readOnly)
            return;

        if (target === lineRow && e.type === "DOMNodeInserted") {
            // Ensure that the newly inserted line row has no lineNumber.
            delete lineRow.lineNumber;
        }

        var startLine = 0;
        for (var row = lineRow; row; row = row.previousSibling) {
            if (typeof row.lineNumber === "number") {
                startLine = row.lineNumber;
                break;
            }
        }

        var endLine = startLine + 1;
        for (var row = lineRow.nextSibling; row; row = row.nextSibling) {
            if (typeof row.lineNumber === "number" && row.lineNumber > startLine) {
                endLine = row.lineNumber;
                break;
            }
        }

        if (target === lineRow && e.type === "DOMNodeRemoved") {
            // Now this will no longer be valid.
            delete lineRow.lineNumber;
        }

        if (this._dirtyLines) {
            this._dirtyLines.start = Math.min(this._dirtyLines.start, startLine);
            this._dirtyLines.end = Math.max(this._dirtyLines.end, endLine);
        } else {
            this._dirtyLines = { start: startLine, end: endLine };
            setTimeout(this._applyDomUpdates.bind(this), 0);
            // Remove marked ranges, if any.
            this.markAndRevealRange(null);
        }
    },

    _applyDomUpdates: function()
    {
        if (!this._dirtyLines)
            return;

        // Check if the editor had been set readOnly by the moment when this async callback got executed.
        if (this._readOnly) {
            delete this._dirtyLines;
            return;
        }

        var dirtyLines = this._dirtyLines;

        var firstChunkNumber = this._chunkNumberForLine(dirtyLines.start);
        var startLine = this._textChunks[firstChunkNumber].startLine;
        var endLine = this._textModel.linesCount;

        // Collect lines.
        var firstLineRow;
        if (firstChunkNumber) {
            var chunk = this._textChunks[firstChunkNumber - 1];
            firstLineRow = chunk.expanded ? chunk.getExpandedLineRow(chunk.startLine + chunk.linesCount - 1) : chunk.element;
            firstLineRow = firstLineRow.nextSibling;
        } else
            firstLineRow = this._container.firstChild;

        var lines = [];
        for (var lineRow = firstLineRow; lineRow; lineRow = lineRow.nextSibling) {
            if (typeof lineRow.lineNumber === "number" && lineRow.lineNumber >= dirtyLines.end) {
                endLine = lineRow.lineNumber;
                break;
            }
            // Update with the newest lineNumber, so that the call to the _getSelection method below should work.
            lineRow.lineNumber = startLine + lines.length;
            this._collectLinesFromDiv(lines, lineRow);
        }

        // Try to decrease the range being replaced, if possible.
        var startOffset = 0;
        while (startLine < dirtyLines.start && startOffset < lines.length) {
            if (this._textModel.line(startLine) !== lines[startOffset])
                break;
            ++startOffset;
            ++startLine;
        }

        var endOffset = lines.length;
        while (endLine > dirtyLines.end && endOffset > startOffset) {
            if (this._textModel.line(endLine - 1) !== lines[endOffset - 1])
                break;
            --endOffset;
            --endLine;
        }

        lines = lines.slice(startOffset, endOffset);

        // Try to decrease the range being replaced by column offsets, if possible.
        var startColumn = 0;
        var endColumn = this._textModel.lineLength(endLine - 1);
        if (lines.length > 0) {
            var line1 = this._textModel.line(startLine);
            var line2 = lines[0];
            while (line1[startColumn] && line1[startColumn] === line2[startColumn])
                ++startColumn;
            lines[0] = line2.substring(startColumn);

            line1 = this._textModel.line(endLine - 1);
            line2 = lines[lines.length - 1];
            for (var i = 0; i < endColumn && i < line2.length; ++i) {
                if (startLine === endLine - 1 && endColumn - i <= startColumn)
                    break;
                if (line1[endColumn - i - 1] !== line2[line2.length - i - 1])
                    break;
            }
            if (i) {
                endColumn -= i;
                lines[lines.length - 1] = line2.substring(0, line2.length - i);
            }
        }

        var selection = this._getSelection();

        if (lines.length === 0 && endLine < this._textModel.linesCount)
            var oldRange = new WebInspector.TextRange(startLine, 0, endLine, 0);
        else if (lines.length === 0 && startLine > 0)
            var oldRange = new WebInspector.TextRange(startLine - 1, this._textModel.lineLength(startLine - 1), endLine - 1, this._textModel.lineLength(endLine - 1));
        else
            var oldRange = new WebInspector.TextRange(startLine, startColumn, endLine - 1, endColumn);

        var newContent = lines.join("\n");
        if (this._textModel.copyRange(oldRange) === newContent) {
            delete this._dirtyLines;
            return; // Noop
        }

        // This is a "foreign" call outside of this class. Should be before we delete the dirty lines flag.
        this._enterTextChangeMode();

        delete this._dirtyLines;

        var newRange = this._setText(oldRange, newContent);

        this._paintScheduledLines(true);
        this._restoreSelection(selection);

        this._exitTextChangeMode(oldRange, newRange);
    },

    textChanged: function(oldRange, newRange)
    {
        this.beginDomUpdates();
        this._removeDecorationsInRange(oldRange);
        this._updateChunksForRanges(oldRange, newRange);
        this._updateHighlightsForRange(newRange);
        this.endDomUpdates();
    },

    _setText: function(range, text)
    {
        if (this._lastEditedRange && (!text || text.indexOf("\n") !== -1 || this._lastEditedRange.endLine !== range.startLine || this._lastEditedRange.endColumn !== range.startColumn))
            this._textModel.markUndoableState();

        var newRange = this._textModel.setText(range, text);
        this._lastEditedRange = newRange;

        return newRange;
    },

    _removeDecorationsInRange: function(range)
    {
        for (var i = this._chunkNumberForLine(range.startLine); i < this._textChunks.length; ++i) {
            var chunk = this._textChunks[i];
            if (chunk.startLine > range.endLine)
                break;
            chunk.removeAllDecorations();
        }
    },

    _updateChunksForRanges: function(oldRange, newRange)
    {
        // Update the chunks in range: firstChunkNumber <= index <= lastChunkNumber
        var firstChunkNumber = this._chunkNumberForLine(oldRange.startLine);
        var lastChunkNumber = firstChunkNumber;
        while (lastChunkNumber + 1 < this._textChunks.length) {
            if (this._textChunks[lastChunkNumber + 1].startLine > oldRange.endLine)
                break;
            ++lastChunkNumber;
        }

        var startLine = this._textChunks[firstChunkNumber].startLine;
        var linesCount = this._textChunks[lastChunkNumber].startLine + this._textChunks[lastChunkNumber].linesCount - startLine;
        var linesDiff = newRange.linesCount - oldRange.linesCount;
        linesCount += linesDiff;

        if (linesDiff) {
            // Lines shifted, update the line numbers of the chunks below.
            for (var chunkNumber = lastChunkNumber + 1; chunkNumber < this._textChunks.length; ++chunkNumber)
                this._textChunks[chunkNumber].startLine += linesDiff;
        }

        var firstLineRow;
        if (firstChunkNumber) {
            var chunk = this._textChunks[firstChunkNumber - 1];
            firstLineRow = chunk.expanded ? chunk.getExpandedLineRow(chunk.startLine + chunk.linesCount - 1) : chunk.element;
            firstLineRow = firstLineRow.nextSibling;
        } else
            firstLineRow = this._container.firstChild;

        // Most frequent case: a chunk remained the same.
        for (var chunkNumber = firstChunkNumber; chunkNumber <= lastChunkNumber; ++chunkNumber) {
            var chunk = this._textChunks[chunkNumber];
            if (chunk.startLine + chunk.linesCount > this._textModel.linesCount)
                break;
            var lineNumber = chunk.startLine;
            for (var lineRow = firstLineRow; lineRow && lineNumber < chunk.startLine + chunk.linesCount; lineRow = lineRow.nextSibling) {
                if (lineRow.lineNumber !== lineNumber || lineRow !== chunk.getExpandedLineRow(lineNumber) || lineRow.textContent !== this._textModel.line(lineNumber) || !lineRow.firstChild)
                    break;
                ++lineNumber;
            }
            if (lineNumber < chunk.startLine + chunk.linesCount)
                break;
            chunk.updateCollapsedLineRow();
            ++firstChunkNumber;
            firstLineRow = lineRow;
            startLine += chunk.linesCount;
            linesCount -= chunk.linesCount;
        }

        if (firstChunkNumber > lastChunkNumber && linesCount === 0)
            return;

        // Maybe merge with the next chunk, so that we should not create 1-sized chunks when appending new lines one by one.
        var chunk = this._textChunks[lastChunkNumber + 1];
        var linesInLastChunk = linesCount % this._defaultChunkSize;
        if (chunk && !chunk.decorated && linesInLastChunk > 0 && linesInLastChunk + chunk.linesCount <= this._defaultChunkSize) {
            ++lastChunkNumber;
            linesCount += chunk.linesCount;
        }

        var scrollTop = this.element.scrollTop;
        var scrollLeft = this.element.scrollLeft;

        // Delete all DOM elements that were either controlled by the old chunks, or have just been inserted.
        var firstUnmodifiedLineRow = null;
        chunk = this._textChunks[lastChunkNumber + 1];
        if (chunk)
            firstUnmodifiedLineRow = chunk.expanded ? chunk.getExpandedLineRow(chunk.startLine) : chunk.element;

        while (firstLineRow && firstLineRow !== firstUnmodifiedLineRow) {
            var lineRow = firstLineRow;
            firstLineRow = firstLineRow.nextSibling;
            this._container.removeChild(lineRow);
        }

        // Replace old chunks with the new ones.
        for (var chunkNumber = firstChunkNumber; linesCount > 0; ++chunkNumber) {
            var chunkLinesCount = Math.min(this._defaultChunkSize, linesCount);
            var newChunk = this._createNewChunk(startLine, startLine + chunkLinesCount);
            this._container.insertBefore(newChunk.element, firstUnmodifiedLineRow);

            if (chunkNumber <= lastChunkNumber)
                this._textChunks[chunkNumber] = newChunk;
            else
                this._textChunks.splice(chunkNumber, 0, newChunk);
            startLine += chunkLinesCount;
            linesCount -= chunkLinesCount;
        }
        if (chunkNumber <= lastChunkNumber)
            this._textChunks.splice(chunkNumber, lastChunkNumber - chunkNumber + 1);

        this.element.scrollTop = scrollTop;
        this.element.scrollLeft = scrollLeft;
    },

    _updateHighlightsForRange: function(range)
    {
        var visibleFrom = this.element.scrollTop;
        var visibleTo = this.element.scrollTop + this.element.clientHeight;

        var result = this._findVisibleChunks(visibleFrom, visibleTo);
        var chunk = this._textChunks[result.end - 1];
        var lastVisibleLine = chunk.startLine + chunk.linesCount;

        lastVisibleLine = Math.max(lastVisibleLine, range.endLine + 1);
        lastVisibleLine = Math.min(lastVisibleLine, this._textModel.linesCount);

        var updated = this._highlighter.updateHighlight(range.startLine, lastVisibleLine);
        if (!updated) {
            // Highlights for the chunks below are invalid, so just collapse them.
            for (var i = this._chunkNumberForLine(range.startLine); i < this._textChunks.length; ++i)
                this._textChunks[i].expanded = false;
        }

        this._repaintAll();
    },

    _collectLinesFromDiv: function(lines, element)
    {
        var textContents = [];
        var node = element.nodeType === Node.TEXT_NODE ? element : element.traverseNextNode(element);
        while (node) {
            if (element.decorationsElement === node) {
                node = node.nextSibling;
                continue;
            }
            if (node.nodeName.toLowerCase() === "br")
                textContents.push("\n");
            else if (node.nodeType === Node.TEXT_NODE)
                textContents.push(node.textContent);
            node = node.traverseNextNode(element);
        }

        var textContent = textContents.join("");
        // The last \n (if any) does not "count" in a DIV.
        textContent = textContent.replace(/\n$/, "");

        textContents = textContent.split("\n");
        for (var i = 0; i < textContents.length; ++i)
            lines.push(textContents[i]);
    }
}

WebInspector.TextEditorMainPanel.prototype.__proto__ = WebInspector.TextEditorChunkedPanel.prototype;

/**
 * @constructor
 */
WebInspector.TextEditorMainChunk = function(textViewer, startLine, endLine)
{
    this._textViewer = textViewer;
    this._textModel = textViewer._textModel;

    this.element = document.createElement("div");
    this.element.lineNumber = startLine;
    this.element.className = "webkit-line-content";
    this._textViewer._enableDOMNodeRemovedListener(this.element, true);

    this._startLine = startLine;
    endLine = Math.min(this._textModel.linesCount, endLine);
    this.linesCount = endLine - startLine;

    this._expanded = false;
    this._readOnly = false;

    this.updateCollapsedLineRow();
}

WebInspector.TextEditorMainChunk.prototype = {
    addDecoration: function(decoration)
    {
        this._textViewer.beginDomUpdates();
        if (typeof decoration === "string")
            this.element.addStyleClass(decoration);
        else {
            if (!this.element.decorationsElement) {
                this.element.decorationsElement = document.createElement("div");
                this.element.decorationsElement.className = "webkit-line-decorations";
                this.element.appendChild(this.element.decorationsElement);
            }
            this.element.decorationsElement.appendChild(decoration);
        }
        this._textViewer.endDomUpdates();
    },

    removeDecoration: function(decoration)
    {
        this._textViewer.beginDomUpdates();
        if (typeof decoration === "string")
            this.element.removeStyleClass(decoration);
        else if (this.element.decorationsElement)
            this.element.decorationsElement.removeChild(decoration);
        this._textViewer.endDomUpdates();
    },

    removeAllDecorations: function()
    {
        this._textViewer.beginDomUpdates();
        this.element.className = "webkit-line-content";
        if (this.element.decorationsElement) {
            this.element.removeChild(this.element.decorationsElement);
            delete this.element.decorationsElement;
        }
        this._textViewer.endDomUpdates();
    },

    get decorated()
    {
        return this.element.className !== "webkit-line-content" || !!(this.element.decorationsElement && this.element.decorationsElement.firstChild);
    },

    get startLine()
    {
        return this._startLine;
    },

    set startLine(startLine)
    {
        this._startLine = startLine;
        this.element.lineNumber = startLine;
        if (this._expandedLineRows) {
            for (var i = 0; i < this._expandedLineRows.length; ++i)
                this._expandedLineRows[i].lineNumber = startLine + i;
        }
    },

    get expanded()
    {
        return this._expanded;
    },

    set expanded(expanded)
    {
        if (this._expanded === expanded)
            return;

        this._expanded = expanded;

        if (this.linesCount === 1) {
            if (expanded)
                this._textViewer._paintLine(this.element);
            return;
        }

        this._textViewer.beginDomUpdates();

        if (expanded) {
            this._expandedLineRows = [];
            var parentElement = this.element.parentElement;
            for (var i = this.startLine; i < this.startLine + this.linesCount; ++i) {
                var lineRow = this._createRow(i);
                this._textViewer._enableDOMNodeRemovedListener(lineRow, true);
                this._updateElementReadOnlyState(lineRow);
                parentElement.insertBefore(lineRow, this.element);
                this._expandedLineRows.push(lineRow);
            }
            this._textViewer._enableDOMNodeRemovedListener(this.element, false);
            parentElement.removeChild(this.element);
            this._textViewer._paintLines(this.startLine, this.startLine + this.linesCount);
        } else {
            var elementInserted = false;
            for (var i = 0; i < this._expandedLineRows.length; ++i) {
                var lineRow = this._expandedLineRows[i];
                this._textViewer._enableDOMNodeRemovedListener(lineRow, false);
                var parentElement = lineRow.parentElement;
                if (parentElement) {
                    if (!elementInserted) {
                        elementInserted = true;
                        this._textViewer._enableDOMNodeRemovedListener(this.element, true);
                        parentElement.insertBefore(this.element, lineRow);
                    }
                    parentElement.removeChild(lineRow);
                }
                this._textViewer._releaseLinesHighlight(lineRow);
            }
            delete this._expandedLineRows;
        }

        this._textViewer.endDomUpdates();
    },

    set readOnly(readOnly)
    {
        if (this._readOnly === readOnly)
            return;

        this._readOnly = readOnly;
        this._updateElementReadOnlyState(this.element);
        if (this._expandedLineRows) {
            for (var i = 0; i < this._expandedLineRows.length; ++i)
                this._updateElementReadOnlyState(this._expandedLineRows[i]);
        }
    },

    get readOnly()
    {
        return this._readOnly;
    },

    _updateElementReadOnlyState: function(element)
    {
        if (this._readOnly)
            element.addStyleClass("text-editor-read-only");
        else
            element.removeStyleClass("text-editor-read-only");
    },

    get height()
    {
        if (!this._expandedLineRows)
            return this._textViewer._totalHeight(this.element);
        return this._textViewer._totalHeight(this._expandedLineRows[0], this._expandedLineRows[this._expandedLineRows.length - 1]);
    },

    get offsetTop()
    {
        return (this._expandedLineRows && this._expandedLineRows.length) ? this._expandedLineRows[0].offsetTop : this.element.offsetTop;
    },

    _createRow: function(lineNumber)
    {
        var lineRow = this._textViewer._cachedRows.pop() || document.createElement("div");
        lineRow.lineNumber = lineNumber;
        lineRow.className = "webkit-line-content";
        lineRow.textContent = this._textModel.line(lineNumber);
        if (!lineRow.textContent)
            lineRow.appendChild(document.createElement("br"));
        return lineRow;
    },

    getExpandedLineRow: function(lineNumber)
    {
        if (!this._expanded || lineNumber < this.startLine || lineNumber >= this.startLine + this.linesCount)
            return null;
        if (!this._expandedLineRows)
            return this.element;
        return this._expandedLineRows[lineNumber - this.startLine];
    },

    updateCollapsedLineRow: function()
    {
        if (this.linesCount === 1 && this._expanded)
            return;

        var lines = [];
        for (var i = this.startLine; i < this.startLine + this.linesCount; ++i)
            lines.push(this._textModel.line(i));

        this.element.removeChildren();
        this.element.textContent = lines.join("\n");

        // The last empty line will get swallowed otherwise.
        if (!lines[lines.length - 1])
            this.element.appendChild(document.createElement("br"));
    }
}
