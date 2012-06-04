/*
 * Copyright (C) 2008 Apple Inc.  All rights reserved.
 * Copyright (C) 2011 Google Inc.  All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions
 * are met:
 *
 * 1.  Redistributions of source code must retain the above copyright
 *     notice, this list of conditions and the following disclaimer.
 * 2.  Redistributions in binary form must reproduce the above copyright
 *     notice, this list of conditions and the following disclaimer in the
 *     documentation and/or other materials provided with the distribution.
 * 3.  Neither the name of Apple Computer, Inc. ("Apple") nor the names of
 *     its contributors may be used to endorse or promote products derived
 *     from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY APPLE AND ITS CONTRIBUTORS "AS IS" AND ANY
 * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL APPLE OR ITS CONTRIBUTORS BE LIABLE FOR ANY
 * DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
 * THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

/**
 * @constructor
 * @extends WebInspector.Object
 * @param {function(WebInspector.TextPrompt, Range, boolean, function(Array.<string>=))} completions
 * @param {string} stopCharacters
 */
WebInspector.TextPrompt = function(completions, stopCharacters)
{
    /**
     * @type {Element|undefined}
     */
    this._proxyElement;
    this._proxyElementDisplay = "inline-block";
    this._loadCompletions = completions;
    this._completionStopCharacters = stopCharacters;
    this._suggestForceable = true;
}

WebInspector.TextPrompt.Events = {
    ItemApplied: "text-prompt-item-applied",
    ItemAccepted: "text-prompt-item-accepted"
};

WebInspector.TextPrompt.prototype = {
    get proxyElement()
    {
        return this._proxyElement;
    },

    setSuggestForceable: function(x)
    {
        this._suggestForceable = x;
    },

    setSuggestBoxEnabled: function(className)
    {
        this._suggestBoxClassName = className;
    },

    renderAsBlock: function()
    {
        this._proxyElementDisplay = "block";
    },

    /**
     * Clients should never attach any event listeners to the |element|. Instead,
     * they should use the result of this method to attach listeners for bubbling events.
     *
     * @param {Element} element
     */
    attach: function(element)
    {
        return this._attachInternal(element);
    },

    /**
     * Clients should never attach any event listeners to the |element|. Instead,
     * they should use the result of this method to attach listeners for bubbling events
     * or the |blurListener| parameter to register a "blur" event listener on the |element|
     * (since the "blur" event does not bubble.)
     *
     * @param {Element} element
     * @param {function(Event)} blurListener
     */
    attachAndStartEditing: function(element, blurListener)
    {
        this._attachInternal(element);
        this._startEditing(blurListener);
        return this.proxyElement;
    },

    _attachInternal: function(element)
    {
        if (this.proxyElement)
            throw "Cannot attach an attached TextPrompt";
        this._element = element;

        this._boundOnKeyDown = this.onKeyDown.bind(this);
        this._boundSelectStart = this._selectStart.bind(this);
        this._proxyElement = element.ownerDocument.createElement("span");
        this._proxyElement.style.display = this._proxyElementDisplay;
        element.parentElement.insertBefore(this.proxyElement, element);
        this.proxyElement.appendChild(element);
        this._element.addStyleClass("text-prompt");
        this._element.addEventListener("keydown", this._boundOnKeyDown, false);
        this._element.addEventListener("selectstart", this._selectStart.bind(this), false);

        if (typeof this._suggestBoxClassName === "string")
            this._suggestBox = new WebInspector.TextPrompt.SuggestBox(this, this._element, this._suggestBoxClassName);

        return this.proxyElement;
    },

    detach: function()
    {
        this._removeFromElement();
        this.proxyElement.parentElement.insertBefore(this._element, this.proxyElement);
        this.proxyElement.parentElement.removeChild(this.proxyElement);
        delete this._proxyElement;
        WebInspector.restoreFocusFromElement(this._element);
    },

    get text()
    {
        return this._element.textContent;
    },

    set text(x)
    {
        this._removeSuggestionAids();
        if (!x) {
            // Append a break element instead of setting textContent to make sure the selection is inside the prompt.
            this._element.removeChildren();
            this._element.appendChild(document.createElement("br"));
        } else
            this._element.textContent = x;

        this.moveCaretToEndOfPrompt();
        this._element.scrollIntoView();
    },

    _removeFromElement: function()
    {
        this.clearAutoComplete(true);
        this._element.removeEventListener("keydown", this._boundOnKeyDown, false);
        this._element.removeEventListener("selectstart", this._boundSelectStart, false);
        if (this._isEditing)
            this._stopEditing();
        if (this._suggestBox)
            this._suggestBox.removeFromElement();
    },

    _startEditing: function(blurListener)
    {
        this._isEditing = true;
        this._element.addStyleClass("editing");
        if (blurListener) {
            this._blurListener = blurListener;
            this._element.addEventListener("blur", this._blurListener, false);
        }
        this._oldTabIndex = this._element.tabIndex;
        if (this._element.tabIndex < 0)
            this._element.tabIndex = 0;
        WebInspector.setCurrentFocusElement(this._element);
    },

    _stopEditing: function()
    {
        this._element.tabIndex = this._oldTabIndex;
        if (this._blurListener)
            this._element.removeEventListener("blur", this._blurListener, false);
        this._element.removeStyleClass("editing");
        delete this._isEditing;
    },

    _removeSuggestionAids: function()
    {
        this.clearAutoComplete();
        this.hideSuggestBox();
    },

    _selectStart: function(event)
    {
        if (this._selectionTimeout)
            clearTimeout(this._selectionTimeout);

        this._removeSuggestionAids();

        function moveBackIfOutside()
        {
            delete this._selectionTimeout;
            if (!this.isCaretInsidePrompt() && window.getSelection().isCollapsed) {
                this.moveCaretToEndOfPrompt();
                this.autoCompleteSoon();
            }
        }

        this._selectionTimeout = setTimeout(moveBackIfOutside.bind(this), 100);
    },

    /**
     * @param {boolean=} force
     */
    defaultKeyHandler: function(event, force)
    {
        this.clearAutoComplete();
        this.autoCompleteSoon(force);
        return false;
    },

    onKeyDown: function(event)
    {
        var handled = false;
        var invokeDefault = true;

        switch (event.keyIdentifier) {
        case "Up":
            handled = this.upKeyPressed(event);
            break;
        case "Down":
            handled = this.downKeyPressed(event);
            break;
        case "PageUp":
            handled = this.pageUpKeyPressed(event);
            break;
        case "PageDown":
            handled = this.pageDownKeyPressed(event);
            break;
        case "U+0009": // Tab
            handled = this.tabKeyPressed(event);
            break;
        case "Enter":
            handled = this.enterKeyPressed(event);
            break;
        case "Left":
        case "Home":
            this._removeSuggestionAids();
            invokeDefault = false;
            break;
        case "Right":
        case "End":
            if (this.isCaretAtEndOfPrompt())
                handled = this.acceptAutoComplete();
            else
                this._removeSuggestionAids();
            invokeDefault = false;
            break;
        case "U+001B": // Esc
            if (this.isSuggestBoxVisible()) {
                this._suggestBox.hide();
                handled = true;
            }
            break;
        case "U+0020": // Space
            if (this._suggestForceable && event.ctrlKey && !event.metaKey && !event.altKey && !event.shiftKey) {
                this.defaultKeyHandler(event, true);
                handled = true;
            }
            break;
        case "Alt":
        case "Meta":
        case "Shift":
        case "Control":
            invokeDefault = false;
            break;
        }

        if (!handled && invokeDefault)
            handled = this.defaultKeyHandler(event);

        if (handled)
            event.consume(true);

        return handled;
    },

    acceptAutoComplete: function()
    {
        var result = false;
        if (this.isSuggestBoxVisible())
            result = this._suggestBox.acceptSuggestion();
        if (!result)
            result = this.acceptSuggestion();

        return result;
    },

    /**
     * @param {boolean=} includeTimeout
     */
    clearAutoComplete: function(includeTimeout)
    {
        if (includeTimeout && this._completeTimeout) {
            clearTimeout(this._completeTimeout);
            delete this._completeTimeout;
        }
        delete this._waitingForCompletions;

        if (!this.autoCompleteElement)
            return;

        if (this.autoCompleteElement.parentNode)
            this.autoCompleteElement.parentNode.removeChild(this.autoCompleteElement);
        delete this.autoCompleteElement;

        if (!this._userEnteredRange || !this._userEnteredText)
            return;

        this._userEnteredRange.deleteContents();
        this._element.pruneEmptyTextNodes();

        var userTextNode = document.createTextNode(this._userEnteredText);
        this._userEnteredRange.insertNode(userTextNode);

        var selectionRange = document.createRange();
        selectionRange.setStart(userTextNode, this._userEnteredText.length);
        selectionRange.setEnd(userTextNode, this._userEnteredText.length);

        var selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(selectionRange);

        delete this._userEnteredRange;
        delete this._userEnteredText;
    },

    /**
     * @param {boolean=} force
     */
    autoCompleteSoon: function(force)
    {
        var immediately = this.isSuggestBoxVisible() || force;
        if (!this._completeTimeout)
            this._completeTimeout = setTimeout(this.complete.bind(this, true, force), immediately ? 0 : 250);
    },

    /**
     * @param {boolean=} reverse
     */
    complete: function(auto, force, reverse)
    {
        this.clearAutoComplete(true);
        var selection = window.getSelection();
        if (!selection.rangeCount)
            return;

        var selectionRange = selection.getRangeAt(0);
        var isEmptyInput = selectionRange.commonAncestorContainer === this._element; // this._element has no child Text nodes.

        var shouldExit;

        // Do not attempt to auto-complete an empty input in the auto mode (only on demand).
        if (auto && isEmptyInput && !force)
            shouldExit = true;
        else if (!auto && !isEmptyInput && !selectionRange.commonAncestorContainer.isDescendant(this._element))
            shouldExit = true;
        else if (auto && !force && !this.isCaretAtEndOfPrompt() && !this.isSuggestBoxVisible())
            shouldExit = true;
        else if (!selection.isCollapsed)
            shouldExit = true;
        else if (!force) {
            // BUG72018: Do not show suggest box if caret is followed by a non-stop character.
            var wordSuffixRange = selectionRange.startContainer.rangeOfWord(selectionRange.endOffset, this._completionStopCharacters, this._element, "forward");
            if (wordSuffixRange.toString().length)
                shouldExit = true;
        }
        if (shouldExit) {
            this.hideSuggestBox();
            return;
        }

        var wordPrefixRange = selectionRange.startContainer.rangeOfWord(selectionRange.startOffset, this._completionStopCharacters, this._element, "backward");
        this._waitingForCompletions = true;
        this._loadCompletions(this, wordPrefixRange, force, this._completionsReady.bind(this, selection, auto, wordPrefixRange, !!reverse));
    },

    _boxForAnchorAtStart: function(selection, textRange)
    {
        var rangeCopy = selection.getRangeAt(0).cloneRange();
        var anchorElement = document.createElement("span");
        anchorElement.textContent = "\u200B";
        textRange.insertNode(anchorElement);
        var box = anchorElement.boxInWindow(window);
        anchorElement.parentElement.removeChild(anchorElement);
        selection.removeAllRanges();
        selection.addRange(rangeCopy);
        return box;
    },

    /**
     * @param {Array.<string>} completions
     * @param {number} wordPrefixLength
     */
    _buildCommonPrefix: function(completions, wordPrefixLength)
    {
        var commonPrefix = completions[0];
        for (var i = 0; i < completions.length; ++i) {
            var completion = completions[i];
            var lastIndex = Math.min(commonPrefix.length, completion.length);
            for (var j = wordPrefixLength; j < lastIndex; ++j) {
                if (commonPrefix[j] !== completion[j]) {
                    commonPrefix = commonPrefix.substr(0, j);
                    break;
                }
            }
        }
        return commonPrefix;
    },

    /**
     * @param {Selection} selection
     * @param {boolean} auto
     * @param {Range} originalWordPrefixRange
     * @param {boolean} reverse
     * @param {Array.<string>=} completions
     */
    _completionsReady: function(selection, auto, originalWordPrefixRange, reverse, completions)
    {
        if (!this._waitingForCompletions || !completions || !completions.length) {
            this.hideSuggestBox();
            return;
        }
        delete this._waitingForCompletions;

        var selectionRange = selection.getRangeAt(0);

        var fullWordRange = document.createRange();
        fullWordRange.setStart(originalWordPrefixRange.startContainer, originalWordPrefixRange.startOffset);
        fullWordRange.setEnd(selectionRange.endContainer, selectionRange.endOffset);

        if (originalWordPrefixRange.toString() + selectionRange.toString() != fullWordRange.toString())
            return;

        this._userEnteredRange = fullWordRange;
        this._userEnteredText = fullWordRange.toString();

        if (this._suggestBox)
            this._suggestBox.updateSuggestions(this._boxForAnchorAtStart(selection, fullWordRange), completions, !this.isCaretAtEndOfPrompt());

        var wordPrefixLength = originalWordPrefixRange.toString().length;

        if (auto) {
            var completionText = completions[0];
            var commonPrefix = this._buildCommonPrefix(completions, wordPrefixLength);

            this._commonPrefix = commonPrefix;
        } else {
            if (completions.length === 1) {
                var completionText = completions[0];
                wordPrefixLength = completionText.length;
            } else {
                var commonPrefix = this._buildCommonPrefix(completions, wordPrefixLength);
                wordPrefixLength = commonPrefix.length;

                if (selection.isCollapsed)
                    var completionText = completions[0];
                else {
                    var currentText = fullWordRange.toString();

                    var foundIndex = null;
                    for (var i = 0; i < completions.length; ++i) {
                        if (completions[i] === currentText)
                            foundIndex = i;
                    }

                    var nextIndex = foundIndex + (reverse ? -1 : 1);
                    if (foundIndex === null || nextIndex >= completions.length)
                        var completionText = completions[0];
                    else if (nextIndex < 0)
                        var completionText = completions[completions.length - 1];
                    else
                        var completionText = completions[nextIndex];
                }
            }
        }

        if (auto) {
            if (this.isCaretAtEndOfPrompt()) {
                this._userEnteredRange.deleteContents();
                this._element.pruneEmptyTextNodes();
                var finalSelectionRange = document.createRange();
                var prefixText = completionText.substring(0, wordPrefixLength);
                var suffixText = completionText.substring(wordPrefixLength);

                var prefixTextNode = document.createTextNode(prefixText);
                fullWordRange.insertNode(prefixTextNode);

                this.autoCompleteElement = document.createElement("span");
                this.autoCompleteElement.className = "auto-complete-text";
                this.autoCompleteElement.textContent = suffixText;

                prefixTextNode.parentNode.insertBefore(this.autoCompleteElement, prefixTextNode.nextSibling);

                finalSelectionRange.setStart(prefixTextNode, wordPrefixLength);
                finalSelectionRange.setEnd(prefixTextNode, wordPrefixLength);
                selection.removeAllRanges();
                selection.addRange(finalSelectionRange);
            }
        } else
            this.applySuggestion(completionText, completions.length > 1, originalWordPrefixRange);
    },

    _completeCommonPrefix: function()
    {
        if (!this.autoCompleteElement || !this._commonPrefix || !this._userEnteredText || this._commonPrefix.indexOf(this._userEnteredText) !== 0)
            return;

        if (!this.isSuggestBoxVisible()) {
            this.acceptAutoComplete();
            return;
        }

        this.autoCompleteElement.textContent = this._commonPrefix.substring(this._userEnteredText.length);
        this.acceptSuggestion(true)
    },

    /**
     * @param {Range=} originalPrefixRange
     */
    applySuggestion: function(completionText, isIntermediateSuggestion, originalPrefixRange)
    {
        var wordPrefixLength;
        if (originalPrefixRange)
            wordPrefixLength = originalPrefixRange.toString().length;
        else
            wordPrefixLength = this._userEnteredText ? this._userEnteredText.length : 0;

        this._userEnteredRange.deleteContents();
        this._element.pruneEmptyTextNodes();
        var finalSelectionRange = document.createRange();
        var completionTextNode = document.createTextNode(completionText);
        this._userEnteredRange.insertNode(completionTextNode);
        if (this.autoCompleteElement && this.autoCompleteElement.parentNode) {
            this.autoCompleteElement.parentNode.removeChild(this.autoCompleteElement);
            delete this.autoCompleteElement;
        }

        if (isIntermediateSuggestion)
            finalSelectionRange.setStart(completionTextNode, wordPrefixLength);
        else
            finalSelectionRange.setStart(completionTextNode, completionText.length);

        finalSelectionRange.setEnd(completionTextNode, completionText.length);

        var selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(finalSelectionRange);
        if (isIntermediateSuggestion)
            this.dispatchEventToListeners(WebInspector.TextPrompt.Events.ItemApplied, { itemText: completionText });
    },

    /**
     * @param {boolean=} prefixAccepted
     */
    acceptSuggestion: function(prefixAccepted)
    {
        if (this._isAcceptingSuggestion)
            return false;

        if (!this.autoCompleteElement || !this.autoCompleteElement.parentNode)
            return false;

        var text = this.autoCompleteElement.textContent;
        var textNode = document.createTextNode(text);
        this.autoCompleteElement.parentNode.replaceChild(textNode, this.autoCompleteElement);
        delete this.autoCompleteElement;

        var finalSelectionRange = document.createRange();
        finalSelectionRange.setStart(textNode, text.length);
        finalSelectionRange.setEnd(textNode, text.length);

        var selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(finalSelectionRange);

        if (!prefixAccepted) {
            this.hideSuggestBox();
            this.dispatchEventToListeners(WebInspector.TextPrompt.Events.ItemAccepted);
        } else
            this.autoCompleteSoon(true);

        return true;
    },

    hideSuggestBox: function()
    {
        if (this.isSuggestBoxVisible())
            this._suggestBox.hide();
    },

    isSuggestBoxVisible: function()
    {
        return this._suggestBox && this._suggestBox.visible;
    },

    isCaretInsidePrompt: function()
    {
        return this._element.isInsertionCaretInside();
    },

    isCaretAtEndOfPrompt: function()
    {
        var selection = window.getSelection();
        if (!selection.rangeCount || !selection.isCollapsed)
            return false;

        var selectionRange = selection.getRangeAt(0);
        var node = selectionRange.startContainer;
        if (!node.isSelfOrDescendant(this._element))
            return false;

        if (node.nodeType === Node.TEXT_NODE && selectionRange.startOffset < node.nodeValue.length)
            return false;

        var foundNextText = false;
        while (node) {
            if (node.nodeType === Node.TEXT_NODE && node.nodeValue.length) {
                if (foundNextText && (!this.autoCompleteElement || !this.autoCompleteElement.isAncestor(node)))
                    return false;
                foundNextText = true;
            }

            node = node.traverseNextNode(this._element);
        }

        return true;
    },

    isCaretOnFirstLine: function()
    {
        var selection = window.getSelection();
        var focusNode = selection.focusNode;
        if (!focusNode || focusNode.nodeType !== Node.TEXT_NODE || focusNode.parentNode !== this._element)
            return true;

        if (focusNode.textContent.substring(0, selection.focusOffset).indexOf("\n") !== -1)
            return false;
        focusNode = focusNode.previousSibling;

        while (focusNode) {
            if (focusNode.nodeType !== Node.TEXT_NODE)
                return true;
            if (focusNode.textContent.indexOf("\n") !== -1)
                return false;
            focusNode = focusNode.previousSibling;
        }

        return true;
    },

    isCaretOnLastLine: function()
    {
        var selection = window.getSelection();
        var focusNode = selection.focusNode;
        if (!focusNode || focusNode.nodeType !== Node.TEXT_NODE || focusNode.parentNode !== this._element)
            return true;

        if (focusNode.textContent.substring(selection.focusOffset).indexOf("\n") !== -1)
            return false;
        focusNode = focusNode.nextSibling;

        while (focusNode) {
            if (focusNode.nodeType !== Node.TEXT_NODE)
                return true;
            if (focusNode.textContent.indexOf("\n") !== -1)
                return false;
            focusNode = focusNode.nextSibling;
        }

        return true;
    },

    moveCaretToEndOfPrompt: function()
    {
        var selection = window.getSelection();
        var selectionRange = document.createRange();

        var offset = this._element.childNodes.length;
        selectionRange.setStart(this._element, offset);
        selectionRange.setEnd(this._element, offset);

        selection.removeAllRanges();
        selection.addRange(selectionRange);
    },

    tabKeyPressed: function(event)
    {
        this._completeCommonPrefix();

        // Consume the key.
        return true;
    },

    enterKeyPressed: function(event)
    {
        if (this.isSuggestBoxVisible())
            return this._suggestBox.enterKeyPressed(event);

        return false;
    },

    upKeyPressed: function(event)
    {
        if (this.isSuggestBoxVisible())
            return this._suggestBox.upKeyPressed(event);

        return false;
    },

    downKeyPressed: function(event)
    {
        if (this.isSuggestBoxVisible())
            return this._suggestBox.downKeyPressed(event);

        return false;
    },

    pageUpKeyPressed: function(event)
    {
        if (this.isSuggestBoxVisible())
            return this._suggestBox.pageUpKeyPressed(event);

        return false;
    },

    pageDownKeyPressed: function(event)
    {
        if (this.isSuggestBoxVisible())
            return this._suggestBox.pageDownKeyPressed(event);

        return false;
    },
}

WebInspector.TextPrompt.prototype.__proto__ = WebInspector.Object.prototype;

/**
 * @constructor
 * @extends {WebInspector.TextPrompt}
 * @param {function(WebInspector.TextPrompt, Range, boolean, function(Array.<string>=))} completions
 * @param {string} stopCharacters
 */
WebInspector.TextPromptWithHistory = function(completions, stopCharacters)
{
    WebInspector.TextPrompt.call(this, completions, stopCharacters);

    /**
     * @type {Array.<string>}
     */
    this._data = [];

    /**
     * 1-based entry in the history stack.
     * @type {number}
     */
    this._historyOffset = 1;

    /**
     * Whether to coalesce duplicate items in the history, default is true.
     * @type {boolean}
     */
    this._coalesceHistoryDupes = true;
}

WebInspector.TextPromptWithHistory.prototype = {
    get historyData()
    {
        // FIXME: do we need to copy this?
        return this._data;
    },

    setCoalesceHistoryDupes: function(x)
    {
        this._coalesceHistoryDupes = x;
    },

    /**
     * @param {Array.<string>} data
     */
    setHistoryData: function(data)
    {
        this._data = [].concat(data);
        this._historyOffset = 1;
    },

    /**
     * Pushes a committed text into the history.
     * @param {string} text
     */
    pushHistoryItem: function(text)
    {
        if (this._uncommittedIsTop) {
            this._data.pop();
            delete this._uncommittedIsTop;
        }

        this._historyOffset = 1;
        if (this._coalesceHistoryDupes && text === this._currentHistoryItem())
            return;
        this._data.push(text);
    },

    /**
     * Pushes the current (uncommitted) text into the history.
     */
    _pushCurrentText: function()
    {
        if (this._uncommittedIsTop)
            this._data.pop(); // Throw away obsolete uncommitted text.
        this._uncommittedIsTop = true;
        this.clearAutoComplete(true);
        this._data.push(this.text);
    },

    /**
     * @return {string|undefined}
     */
    _previous: function()
    {
        if (this._historyOffset > this._data.length)
            return undefined;
        if (this._historyOffset === 1)
            this._pushCurrentText();
        ++this._historyOffset;
        return this._currentHistoryItem();
    },

    /**
     * @return {string|undefined}
     */
    _next: function()
    {
        if (this._historyOffset === 1)
            return undefined;
        --this._historyOffset;
        return this._currentHistoryItem();
    },

    _currentHistoryItem: function()
    {
        return this._data[this._data.length - this._historyOffset];
    },

    /**
     * @override
     */
    defaultKeyHandler: function(event, force)
    {
        var newText;
        var isPrevious;

        switch (event.keyIdentifier) {
        case "Up":
            if (!this.isCaretOnFirstLine())
                break;
            newText = this._previous();
            isPrevious = true;
            break;
        case "Down":
            if (!this.isCaretOnLastLine())
                break;
            newText = this._next();
            break;
        case "U+0050": // Ctrl+P = Previous
            if (WebInspector.isMac() && event.ctrlKey && !event.metaKey && !event.altKey && !event.shiftKey) {
                newText = this._previous();
                isPrevious = true;
            }
            break;
        case "U+004E": // Ctrl+N = Next
            if (WebInspector.isMac() && event.ctrlKey && !event.metaKey && !event.altKey && !event.shiftKey)
                newText = this._next();
            break;
        }

        if (newText !== undefined) {
            event.consume(true);
            this.text = newText;

            if (isPrevious) {
                var firstNewlineIndex = this.text.indexOf("\n");
                if (firstNewlineIndex === -1)
                    this.moveCaretToEndOfPrompt();
                else {
                    var selection = window.getSelection();
                    var selectionRange = document.createRange();

                    selectionRange.setStart(this._element.firstChild, firstNewlineIndex);
                    selectionRange.setEnd(this._element.firstChild, firstNewlineIndex);

                    selection.removeAllRanges();
                    selection.addRange(selectionRange);
                }
            }

            return true;
        }

        return WebInspector.TextPrompt.prototype.defaultKeyHandler.apply(this, arguments);
    }
}

WebInspector.TextPromptWithHistory.prototype.__proto__ = WebInspector.TextPrompt.prototype;

/**
 * @constructor
 */
WebInspector.TextPrompt.SuggestBox = function(textPrompt, inputElement, className)
{
    this._textPrompt = textPrompt;
    this._inputElement = inputElement;
    this._selectedElement = null;
    this._boundOnScroll = this._onscrollresize.bind(this, true);
    this._boundOnResize = this._onscrollresize.bind(this, false);
    window.addEventListener("scroll", this._boundOnScroll, true);
    window.addEventListener("resize", this._boundOnResize, true);

    this._bodyElement = inputElement.ownerDocument.body;
    this._element = inputElement.ownerDocument.createElement("div");
    this._element.className = "suggest-box " + (className || "");
    this._element.addEventListener("mousedown", this._onboxmousedown.bind(this), true);
    this.containerElement = this._element.createChild("div", "container");
    this.contentElement = this.containerElement.createChild("div", "content");
}

WebInspector.TextPrompt.SuggestBox.prototype = {
    get visible()
    {
        return !!this._element.parentElement;
    },

    get hasSelection()
    {
        return !!this._selectedElement;
    },

    _onscrollresize: function(isScroll, event)
    {
        if (isScroll && this._element.isAncestor(event.target) || !this.visible)
            return;
        this._updateBoxPositionWithExistingAnchor();
    },

    _updateBoxPositionWithExistingAnchor: function()
    {
        this._updateBoxPosition(this._anchorBox);
    },

    /**
     * @param {AnchorBox} anchorBox
     */
    _updateBoxPosition: function(anchorBox)
    {
        // Measure the content element box.
        this.contentElement.style.display = "inline-block";
        document.body.appendChild(this.contentElement);
        this.contentElement.positionAt(0, 0);
        var contentWidth = this.contentElement.offsetWidth;
        var contentHeight = this.contentElement.offsetHeight;
        this.contentElement.style.display = "block";
        this.containerElement.appendChild(this.contentElement);

        // Lay out the suggest-box relative to the anchorBox.
        this._anchorBox = anchorBox;
        const spacer = 6;

        const suggestBoxPaddingX = 21;
        var maxWidth = document.body.offsetWidth - anchorBox.x - spacer;
        var width = Math.min(contentWidth, maxWidth - suggestBoxPaddingX) + suggestBoxPaddingX;
        var paddedWidth = contentWidth + suggestBoxPaddingX;
        var boxX = anchorBox.x;
        if (width < paddedWidth) {
            // Shift the suggest box to the left to accommodate the content without trimming to the BODY edge.
            maxWidth = document.body.offsetWidth - spacer;
            width = Math.min(contentWidth, maxWidth - suggestBoxPaddingX) + suggestBoxPaddingX;
            boxX = document.body.offsetWidth - width;
        }

        const suggestBoxPaddingY = 2;
        var boxY;
        var aboveHeight = anchorBox.y;
        var underHeight = document.body.offsetHeight - anchorBox.y - anchorBox.height;
        var maxHeight = Math.max(underHeight, aboveHeight) - spacer;
        var height = Math.min(contentHeight, maxHeight - suggestBoxPaddingY) + suggestBoxPaddingY;
        if (underHeight >= aboveHeight) {
            // Locate the suggest box under the anchorBox.
            boxY = anchorBox.y + anchorBox.height;
            this._element.removeStyleClass("above-anchor");
            this._element.addStyleClass("under-anchor");
        } else {
            // Locate the suggest box above the anchorBox.
            boxY = anchorBox.y - height;
            this._element.removeStyleClass("under-anchor");
            this._element.addStyleClass("above-anchor");
        }

        this._element.positionAt(boxX, boxY);
        this._element.style.width = width + "px";
        this._element.style.height = height + "px";
    },

    _onboxmousedown: function(event)
    {
        event.preventDefault();
    },

    hide: function()
    {
        if (!this.visible)
            return;

        this._element.parentElement.removeChild(this._element);
        delete this._selectedElement;
    },

    removeFromElement: function()
    {
        window.removeEventListener("scroll", this._boundOnScroll, true);
        window.removeEventListener("resize", this._boundOnResize, true);
        this.hide();
    },

    /**
     * @param {string=} text
     * @param {boolean=} isIntermediateSuggestion
     */
    _applySuggestion: function(text, isIntermediateSuggestion)
    {
        if (!this.visible || !(text || this._selectedElement))
            return false;

        var suggestion = text || this._selectedElement.textContent;
        if (!suggestion)
            return false;

        this._textPrompt.applySuggestion(suggestion, isIntermediateSuggestion);
        return true;
    },

    /**
     * @param {string=} text
     */
    acceptSuggestion: function(text)
    {
        var result = this._applySuggestion(text, false);
        this.hide();
        if (!result)
            return false;

        this._textPrompt.acceptSuggestion();

        return true;
    },

    _onNextItem: function(event, isPageScroll)
    {
        var children = this.contentElement.childNodes;
        if (!children.length)
            return false;

        if (!this._selectedElement)
            this._selectedElement = this.contentElement.firstChild;
        else {
            if (!isPageScroll)
                this._selectedElement = this._selectedElement.nextSibling || this.contentElement.firstChild;
            else {
                var candidate = this._selectedElement;

                for (var itemsLeft = this._rowCountPerViewport; itemsLeft; --itemsLeft) {
                    if (candidate.nextSibling)
                        candidate = candidate.nextSibling;
                    else
                        break;
                }

                this._selectedElement = candidate;
            }
        }
        this._updateSelection();
        this._applySuggestion(undefined, true);
        return true;
    },

    _onPreviousItem: function(event, isPageScroll)
    {
        var children = this.contentElement.childNodes;
        if (!children.length)
            return false;

        if (!this._selectedElement)
            this._selectedElement = this.contentElement.lastChild;
        else {
            if (!isPageScroll)
                this._selectedElement = this._selectedElement.previousSibling || this.contentElement.lastChild;
            else {
                var candidate = this._selectedElement;

                for (var itemsLeft = this._rowCountPerViewport; itemsLeft; --itemsLeft) {
                    if (candidate.previousSibling)
                        candidate = candidate.previousSibling;
                    else
                        break;
                }

                this._selectedElement = candidate;
            }
        }
        this._updateSelection();
        this._applySuggestion(undefined, true);
        return true;
    },

    /**
     * @param {AnchorBox} anchorBox
     * @param {Array.<string>=} completions
     * @param {boolean=} canShowForSingleItem
     */
    updateSuggestions: function(anchorBox, completions, canShowForSingleItem)
    {
        if (this._suggestTimeout) {
            clearTimeout(this._suggestTimeout);
            delete this._suggestTimeout;
        }
        this._completionsReady(anchorBox, completions, canShowForSingleItem);
    },

    _onItemMouseDown: function(text, event)
    {
        this.acceptSuggestion(text);
        event.consume(true);
    },

    _createItemElement: function(prefix, text)
    {
        var element = document.createElement("div");
        element.className = "suggest-box-content-item source-code";
        element.tabIndex = -1;
        if (prefix && prefix.length && !text.indexOf(prefix)) {
            var prefixElement = element.createChild("span", "prefix");
            prefixElement.textContent = prefix;
            var suffixElement = element.createChild("span", "suffix");
            suffixElement.textContent = text.substring(prefix.length);
        } else {
            var suffixElement = element.createChild("span", "suffix");
            suffixElement.textContent = text;
        }
        element.addEventListener("mousedown", this._onItemMouseDown.bind(this, text), false);
        return element;
    },

    /**
     * @param {boolean=} canShowForSingleItem
     */
    _updateItems: function(items, canShowForSingleItem)
    {
        this.contentElement.removeChildren();

        var userEnteredText = this._textPrompt._userEnteredText;
        for (var i = 0; i < items.length; ++i) {
            var item = items[i];
            var currentItemElement = this._createItemElement(userEnteredText, item);
            this.contentElement.appendChild(currentItemElement);
        }

        this._selectedElement = canShowForSingleItem ? this.contentElement.firstChild : null;
        this._updateSelection();
    },

    _updateSelection: function()
    {
        // FIXME: might want some optimization if becomes a bottleneck.
        for (var child = this.contentElement.firstChild; child; child = child.nextSibling) {
            if (child !== this._selectedElement)
                child.removeStyleClass("selected");
        }
        if (this._selectedElement) {
            this._selectedElement.addStyleClass("selected");
            this._selectedElement.scrollIntoViewIfNeeded(false);
        }
    },

    /**
     * @param {Array.<string>=} completions
     * @param {boolean=} canShowForSingleItem
     */
    _canShowBox: function(completions, canShowForSingleItem)
    {
        if (!completions || !completions.length)
            return false;

        if (completions.length > 1)
            return true;

        // Do not show a single suggestion if it is the same as user-entered prefix, even if allowed to show single-item suggest boxes.
        return canShowForSingleItem && completions[0] !== this._textPrompt._userEnteredText;
    },

    _rememberRowCountPerViewport: function()
    {
        if (!this.contentElement.firstChild)
            return;

        this._rowCountPerViewport = Math.floor(this.containerElement.offsetHeight / this.contentElement.firstChild.offsetHeight);
    },

    /**
     * @param {AnchorBox} anchorBox
     * @param {Array.<string>=} completions
     * @param {boolean=} canShowForSingleItem
     */
    _completionsReady: function(anchorBox, completions, canShowForSingleItem)
    {
        if (this._canShowBox(completions, canShowForSingleItem)) {
            this._updateItems(completions, canShowForSingleItem);
            this._updateBoxPosition(anchorBox);
            if (!this.visible)
                this._bodyElement.appendChild(this._element);
            this._rememberRowCountPerViewport();
        } else
            this.hide();
    },

    upKeyPressed: function(event)
    {
        return this._onPreviousItem(event, false);
    },

    downKeyPressed: function(event)
    {
        return this._onNextItem(event, false);
    },

    pageUpKeyPressed: function(event)
    {
        return this._onPreviousItem(event, true);
    },

    pageDownKeyPressed: function(event)
    {
        return this._onNextItem(event, true);
    },

    enterKeyPressed: function(event)
    {
        var hasSelectedItem = !!this._selectedElement;
        this.acceptSuggestion();

        // Report the event as non-handled if there is no selected item,
        // to commit the input or handle it otherwise.
        return hasSelectedItem;
    },

    tabKeyPressed: function(event)
    {
        return this.enterKeyPressed(event);
    }
}
