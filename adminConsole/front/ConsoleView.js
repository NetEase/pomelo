/*
 * Copyright (C) 2007, 2008 Apple Inc.  All rights reserved.
 * Copyright (C) 2009 Joseph Pecoraro
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

const ExpressionStopCharacters = " =:[({;,!+-*/&|^<>";

/**
 * @extends {WebInspector.View}
 * @constructor
 * @param {boolean} hideContextSelector
 */
WebInspector.ConsoleView = function(hideContextSelector)
{
    WebInspector.View.call(this);

    this.element.id = "console-view";
    this.messages = [];

    this._clearConsoleButton = new WebInspector.StatusBarButton(WebInspector.UIString("Clear console log."), "clear-status-bar-item");
    this._clearConsoleButton.addEventListener("click", this._requestClearMessages, this);

    this._contextSelectElement = document.createElement("select");
    this._contextSelectElement.id = "console-context";
    this._contextSelectElement.className = "status-bar-item";

    if (hideContextSelector)
        this._contextSelectElement.addStyleClass("hidden");

    this.messagesElement = document.createElement("div");
    this.messagesElement.id = "console-messages";
    this.messagesElement.className = "monospace";
    this.messagesElement.addEventListener("click", this._messagesClicked.bind(this), true);
    this.element.appendChild(this.messagesElement);
    this._scrolledToBottom = true;

    this.promptElement = document.createElement("div");
    this.promptElement.id = "console-prompt";
    this.promptElement.className = "source-code";
    this.promptElement.spellcheck = false;
    this.messagesElement.appendChild(this.promptElement);
    this.messagesElement.appendChild(document.createElement("br"));

    this.topGroup = new WebInspector.ConsoleGroup(null);
    this.messagesElement.insertBefore(this.topGroup.element, this.promptElement);
    this.currentGroup = this.topGroup;

    this._filterBarElement = document.createElement("div");
    this._filterBarElement.id = "console-filter";
    this._filterBarElement.className = "scope-bar status-bar-item";

    function createDividerElement() {
        var dividerElement = document.createElement("div");
        dividerElement.addStyleClass("scope-bar-divider");
        this._filterBarElement.appendChild(dividerElement);
    }

    var updateFilterHandler = this._updateFilter.bind(this);
    function createFilterElement(category, label) {
        var categoryElement = document.createElement("li");
        categoryElement.category = category;
        categoryElement.className = category;
        categoryElement.addEventListener("click", updateFilterHandler, false);
        categoryElement.textContent = label;

        this._filterBarElement.appendChild(categoryElement);

        return categoryElement;
    }

    this.allElement = createFilterElement.call(this, "all", WebInspector.UIString("All"));
    createDividerElement.call(this);
    this.errorElement = createFilterElement.call(this, "errors", WebInspector.UIString("Errors"));
    this.warningElement = createFilterElement.call(this, "warnings", WebInspector.UIString("Warnings"));
    this.logElement = createFilterElement.call(this, "logs", WebInspector.UIString("Logs"));

    this.filter(this.allElement, false);
    this._registerShortcuts();
    this.registerRequiredCSS("textPrompt.css");

    this.messagesElement.addEventListener("contextmenu", this._handleContextMenuEvent.bind(this), false);

    WebInspector.settings.monitoringXHREnabled.addChangeListener(this._monitoringXHREnabledSettingChanged.bind(this));

    WebInspector.console.addEventListener(WebInspector.ConsoleModel.Events.MessageAdded, this._consoleMessageAdded, this);
    WebInspector.console.addEventListener(WebInspector.ConsoleModel.Events.ConsoleCleared, this._consoleCleared, this);

    this._linkifier = WebInspector.debuggerPresentationModel.createLinkifier();

    this.prompt = new WebInspector.TextPromptWithHistory(this.completionsForTextPrompt.bind(this), ExpressionStopCharacters + ".");
    this.prompt.setSuggestBoxEnabled("generic-suggest");
    this.prompt.renderAsBlock();
    this.prompt.attach(this.promptElement);
    this.prompt.proxyElement.addEventListener("keydown", this._promptKeyDown.bind(this), false);
    this.prompt.setHistoryData(WebInspector.settings.consoleHistory.get());
}

WebInspector.ConsoleView.Events = {
  ConsoleCleared: "console-cleared",
  EntryAdded: "console-entry-added",
}

WebInspector.ConsoleView.prototype = {
    get statusBarItems()
    {
        return [this._clearConsoleButton.element, this._contextSelectElement, this._filterBarElement];
    },

    addContext: function(context)
    {
        var option = document.createElement("option");
        option.text = context.displayName;
        option.title = context.url;
        option._context = context;
        context._consoleOption = option;
        this._contextSelectElement.appendChild(option);
        context.addEventListener(WebInspector.FrameEvaluationContext.EventTypes.Updated, this._contextUpdated, this);
    },

    removeContext: function(context)
    {
        this._contextSelectElement.removeChild(context._consoleOption);
    },

    _contextUpdated: function(event)
    {
        var context = event.data;
        var option= context._consoleOption;
        option.text = context.displayName;
        option.title = context.url;
    },

    _currentEvaluationContextId: function()
    {
        if (this._contextSelectElement.selectedIndex === -1)
            return undefined;
        return this._contextSelectElement[this._contextSelectElement.selectedIndex]._context.frameId;
    },

    _updateFilter: function(e)
    {
        var isMac = WebInspector.isMac();
        var selectMultiple = false;
        if (isMac && e.metaKey && !e.ctrlKey && !e.altKey && !e.shiftKey)
            selectMultiple = true;
        if (!isMac && e.ctrlKey && !e.metaKey && !e.altKey && !e.shiftKey)
            selectMultiple = true;

        this.filter(e.target, selectMultiple);
    },

    filter: function(target, selectMultiple)
    {
        function unselectAll()
        {
            this.allElement.removeStyleClass("selected");
            this.errorElement.removeStyleClass("selected");
            this.warningElement.removeStyleClass("selected");
            this.logElement.removeStyleClass("selected");

            this.messagesElement.removeStyleClass("filter-all");
            this.messagesElement.removeStyleClass("filter-errors");
            this.messagesElement.removeStyleClass("filter-warnings");
            this.messagesElement.removeStyleClass("filter-logs");
        }

        var targetFilterClass = "filter-" + target.category;

        if (target.category === "all") {
            if (target.hasStyleClass("selected")) {
                // We can't unselect all, so we break early here
                return;
            }

            unselectAll.call(this);
        } else {
            // Something other than all is being selected, so we want to unselect all
            if (this.allElement.hasStyleClass("selected")) {
                this.allElement.removeStyleClass("selected");
                this.messagesElement.removeStyleClass("filter-all");
            }
        }

        if (!selectMultiple) {
            // If multiple selection is off, we want to unselect everything else
            // and just select ourselves.
            unselectAll.call(this);

            target.addStyleClass("selected");
            this.messagesElement.addStyleClass(targetFilterClass);

            return;
        }

        if (target.hasStyleClass("selected")) {
            // If selectMultiple is turned on, and we were selected, we just
            // want to unselect ourselves.
            target.removeStyleClass("selected");
            this.messagesElement.removeStyleClass(targetFilterClass);
        } else {
            // If selectMultiple is turned on, and we weren't selected, we just
            // want to select ourselves.
            target.addStyleClass("selected");
            this.messagesElement.addStyleClass(targetFilterClass);
        }
    },

    willHide: function()
    {
        this.prompt.hideSuggestBox();
        this.prompt.clearAutoComplete(true);
    },

    wasShown: function()
    {
        if (!this.prompt.isCaretInsidePrompt())
            this.prompt.moveCaretToEndOfPrompt();
    },

    afterShow: function()
    {
        WebInspector.setCurrentFocusElement(this.promptElement);
    },

    storeScrollPositions: function()
    {
        WebInspector.View.prototype.storeScrollPositions.call(this);
        this._scrolledToBottom = this.messagesElement.isScrolledToBottom();
    },

    restoreScrollPositions: function()
    {
        if (this._scrolledToBottom)
            this._immediatelyScrollIntoView();
        else
            WebInspector.View.prototype.restoreScrollPositions.call(this);
    },

    onResize: function()
    {
        this.restoreScrollPositions();
    },

    _isScrollIntoViewScheduled: function()
    {
        return !!this._scrollIntoViewTimer;
    },

    _scheduleScrollIntoView: function()
    {
        if (this._scrollIntoViewTimer)
            return;

        function scrollIntoView()
        {
            delete this._scrollIntoViewTimer;
            this.promptElement.scrollIntoView(true);
        }
        this._scrollIntoViewTimer = setTimeout(scrollIntoView.bind(this), 20);
    },

    _immediatelyScrollIntoView: function()
    {
        this.promptElement.scrollIntoView(true);
        this._cancelScheduledScrollIntoView();
    },

    _cancelScheduledScrollIntoView: function()
    {
        if (!this._isScrollIntoViewScheduled())
            return;

        clearTimeout(this._scrollIntoViewTimer);
        delete this._scrollIntoViewTimer;
    },

    _consoleMessageAdded: function(event)
    {
        this._appendConsoleMessage(event.data);
    },

    _appendConsoleMessage: function(msg)
    {
        // this.messagesElement.isScrolledToBottom() is forcing style recalculation.
        // We just skip it if the scroll action has been scheduled.
        if (!this._isScrollIntoViewScheduled() && ((msg instanceof WebInspector.ConsoleCommandResult) || this.messagesElement.isScrolledToBottom()))
            this._scheduleScrollIntoView();

        this.messages.push(msg);

        if (msg.type === WebInspector.ConsoleMessage.MessageType.EndGroup) {
            var parentGroup = this.currentGroup.parentGroup
            if (parentGroup)
                this.currentGroup = parentGroup;
        } else {
            if (msg.type === WebInspector.ConsoleMessage.MessageType.StartGroup || msg.type === WebInspector.ConsoleMessage.MessageType.StartGroupCollapsed) {
                var group = new WebInspector.ConsoleGroup(this.currentGroup);
                this.currentGroup.messagesElement.appendChild(group.element);
                this.currentGroup = group;
            }

            this.currentGroup.addMessage(msg);
        }

        this.dispatchEventToListeners(WebInspector.ConsoleView.Events.EntryAdded, msg);
    },

    _consoleCleared: function()
    {
        this._scrolledToBottom = true;
        this.messages = [];

        this.currentGroup = this.topGroup;
        this.topGroup.messagesElement.removeChildren();

        this.dispatchEventToListeners(WebInspector.ConsoleView.Events.ConsoleCleared);

        this._linkifier.reset();
    },

    completionsForTextPrompt: function(textPrompt, wordRange, force, completionsReadyCallback)
    {
        // Pass less stop characters to rangeOfWord so the range will be a more complete expression.
        var expressionRange = wordRange.startContainer.rangeOfWord(wordRange.startOffset, ExpressionStopCharacters, textPrompt.proxyElement, "backward");
        var expressionString = expressionRange.toString();
        var prefix = wordRange.toString();
        this.completionsForExpression(expressionString, prefix, force, completionsReadyCallback);
    },

    completionsForExpression: function(expressionString, prefix, force, completionsReadyCallback)
    {
        var lastIndex = expressionString.length - 1;

        var dotNotation = (expressionString[lastIndex] === ".");
        var bracketNotation = (expressionString[lastIndex] === "[");

        if (dotNotation || bracketNotation)
            expressionString = expressionString.substr(0, lastIndex);

        if (expressionString && parseInt(expressionString, 10) == expressionString) {
            // User is entering float value, do not suggest anything.
            completionsReadyCallback([]);
            return;
        }

        if (!prefix && !expressionString && !force) {
            completionsReadyCallback([]);
            return;
        }

        if (!expressionString && WebInspector.debuggerPresentationModel.selectedCallFrame)
            WebInspector.debuggerPresentationModel.getSelectedCallFrameVariables(receivedPropertyNames.bind(this));
        else
            this.evalInInspectedWindow(expressionString, "completion", true, true, false, evaluated.bind(this));

        function evaluated(result, wasThrown)
        {
            if (!result || wasThrown) {
                completionsReadyCallback([]);
                return;
            }

            function getCompletions(primitiveType)
            {
                var object;
                if (primitiveType === "string")
                    object = new String("");
                else if (primitiveType === "number")
                    object = new Number(0);
                else if (primitiveType === "boolean")
                    object = new Boolean(false);
                else
                    object = this;

                var resultSet = {};
                for (var o = object; o; o = o.__proto__) {
                    try {
                        var names = Object.getOwnPropertyNames(o);
                        for (var i = 0; i < names.length; ++i)
                            resultSet[names[i]] = true;
                    } catch (e) {
                    }
                }
                return resultSet;
            }

            if (result.type === "object" || result.type === "function")
                result.callFunctionJSON(getCompletions, undefined, receivedPropertyNames.bind(this));
            else if (result.type === "string" || result.type === "number" || result.type === "boolean")
                this.evalInInspectedWindow("(" + getCompletions + ")(\"" + result.type + "\")", "completion", false, true, true, receivedPropertyNamesFromEval.bind(this));
        }

        function receivedPropertyNamesFromEval(notRelevant, wasThrown, result)
        {
            if (result && !wasThrown)
                receivedPropertyNames.call(this, result.value);
            else
                completionsReadyCallback([]);
        }

        function receivedPropertyNames(propertyNames)
        {
            RuntimeAgent.releaseObjectGroup("completion");
            if (!propertyNames) {
                completionsReadyCallback([]);
                return;
            }
            var includeCommandLineAPI = (!dotNotation && !bracketNotation);
            if (includeCommandLineAPI) {
                const commandLineAPI = ["dir", "dirxml", "keys", "values", "profile", "profileEnd", "monitorEvents", "unmonitorEvents", "inspect", "copy", "clear"];
                for (var i = 0; i < commandLineAPI.length; ++i)
                    propertyNames[commandLineAPI[i]] = true;
            }
            this._reportCompletions(completionsReadyCallback, dotNotation, bracketNotation, expressionString, prefix, Object.keys(propertyNames));
        }
    },

    _reportCompletions: function(completionsReadyCallback, dotNotation, bracketNotation, expressionString, prefix, properties) {
        if (bracketNotation) {
            if (prefix.length && prefix[0] === "'")
                var quoteUsed = "'";
            else
                var quoteUsed = "\"";
        }

        var results = [];

        if (!expressionString) {
            const keywords = ["break", "case", "catch", "continue", "default", "delete", "do", "else", "finally", "for", "function", "if", "in",
                              "instanceof", "new", "return", "switch", "this", "throw", "try", "typeof", "var", "void", "while", "with"];
            properties = properties.concat(keywords);
        }

        properties.sort();

        for (var i = 0; i < properties.length; ++i) {
            var property = properties[i];

            if (dotNotation && !/^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(property))
                continue;

            if (bracketNotation) {
                if (!/^[0-9]+$/.test(property))
                    property = quoteUsed + property.escapeCharacters(quoteUsed + "\\") + quoteUsed;
                property += "]";
            }

            if (property.length < prefix.length)
                continue;
            if (prefix.length && property.indexOf(prefix) !== 0)
                continue;

            results.push(property);
        }
        completionsReadyCallback(results);
    },

    _handleContextMenuEvent: function(event)
    {
        if (!window.getSelection().isCollapsed) {
            // If there is a selection, we want to show our normal context menu
            // (with Copy, etc.), and not Clear Console.
            return;
        }

        var contextMenu = new WebInspector.ContextMenu();

        if (WebInspector.populateHrefContextMenu(contextMenu, null, event))
            contextMenu.appendSeparator();

        function monitoringXHRItemAction()
        {
            WebInspector.settings.monitoringXHREnabled.set(!WebInspector.settings.monitoringXHREnabled.get());
        }
        contextMenu.appendCheckboxItem(WebInspector.UIString("Log XMLHttpRequests"), monitoringXHRItemAction.bind(this), WebInspector.settings.monitoringXHREnabled.get());

        function preserveLogItemAction()
        {
            WebInspector.settings.preserveConsoleLog.set(!WebInspector.settings.preserveConsoleLog.get());
        }
        contextMenu.appendCheckboxItem(WebInspector.UIString(WebInspector.useLowerCaseMenuTitles() ? "Preserve log upon navigation" : "Preserve Log upon Navigation"), preserveLogItemAction.bind(this), WebInspector.settings.preserveConsoleLog.get());

        contextMenu.appendSeparator();
        contextMenu.appendItem(WebInspector.UIString(WebInspector.useLowerCaseMenuTitles() ? "Clear console" : "Clear Console"), this._requestClearMessages.bind(this));
        contextMenu.show(event);
    },

    _monitoringXHREnabledSettingChanged: function(event)
    {
        ConsoleAgent.setMonitoringXHREnabled(event.data);
    },

    _messagesClicked: function(event)
    {
        if (!this.prompt.isCaretInsidePrompt() && window.getSelection().isCollapsed)
            this.prompt.moveCaretToEndOfPrompt();
    },

    _registerShortcuts: function()
    {
        this._shortcuts = {};

        var shortcut = WebInspector.KeyboardShortcut;

        if (WebInspector.isMac()) {
            var shortcutK = shortcut.makeDescriptor("k", WebInspector.KeyboardShortcut.Modifiers.Meta);
            this._shortcuts[shortcutK.key] = this._requestClearMessages.bind(this);
        }

        var shortcutL = shortcut.makeDescriptor("l", WebInspector.KeyboardShortcut.Modifiers.Ctrl);
        this._shortcuts[shortcutL.key] = this._requestClearMessages.bind(this);

        var shortcutM = shortcut.makeDescriptor("m", WebInspector.KeyboardShortcut.Modifiers.CtrlOrMeta | WebInspector.KeyboardShortcut.Modifiers.Shift);
        this._shortcuts[shortcutM.key] = this._dumpMemory.bind(this);

        var section = WebInspector.shortcutsScreen.section(WebInspector.UIString("Console"));
        var keys = WebInspector.isMac() ? [ shortcutK.name, shortcutL.name ] : [ shortcutL.name ];
        section.addAlternateKeys(keys, WebInspector.UIString("Clear console"));

        keys = [
            shortcut.shortcutToString(shortcut.Keys.Tab),
            shortcut.shortcutToString(shortcut.Keys.Tab, shortcut.Modifiers.Shift)
        ];
        section.addRelatedKeys(keys, WebInspector.UIString("Next/previous suggestion"));
        section.addKey(shortcut.shortcutToString(shortcut.Keys.Right), WebInspector.UIString("Accept suggestion"));
        keys = [
            shortcut.shortcutToString(shortcut.Keys.Down),
            shortcut.shortcutToString(shortcut.Keys.Up)
        ];
        section.addRelatedKeys(keys, WebInspector.UIString("Next/previous line"));
        keys = [
            shortcut.shortcutToString("N", shortcut.Modifiers.Alt),
            shortcut.shortcutToString("P", shortcut.Modifiers.Alt)
        ];
        if (WebInspector.isMac())
            section.addRelatedKeys(keys, WebInspector.UIString("Next/previous command"));
        section.addKey(shortcut.shortcutToString(shortcut.Keys.Enter), WebInspector.UIString("Execute command"));
    },

    _requestClearMessages: function()
    {
        WebInspector.console.requestClearMessages();
    },

    _promptKeyDown: function(event)
    {
        if (isEnterKey(event)) {
            this._enterKeyPressed(event);
            return;
        }

        var shortcut = WebInspector.KeyboardShortcut.makeKeyFromEvent(event);
        var handler = this._shortcuts[shortcut];
        if (handler) {
            handler();
            event.preventDefault();
            return;
        }
    },

    /**
     * @param {string} expression
     * @param {string} objectGroup
     * @param {boolean} includeCommandLineAPI
     * @param {boolean} doNotPauseOnExceptions
     * @param {boolean} returnByValue
     * @param {function(?WebInspector.RemoteObject, boolean, RuntimeAgent.RemoteObject=)} callback
     */
    evalInInspectedWindow: function(expression, objectGroup, includeCommandLineAPI, doNotPauseOnExceptions, returnByValue, callback)
    {
        if (WebInspector.debuggerPresentationModel.selectedCallFrame) {
            WebInspector.debuggerPresentationModel.evaluateInSelectedCallFrame(expression, objectGroup, includeCommandLineAPI, returnByValue, callback);
            return;
        }

        if (!expression) {
            // There is no expression, so the completion should happen against global properties.
            expression = "this";
        }

        function evalCallback(error, result, wasThrown)
        {
            if (error) {
                console.error(error);
                callback(null, false);
                return;
            }

            if (returnByValue)
                callback(null, wasThrown, wasThrown ? null : result);
            else
                callback(WebInspector.RemoteObject.fromPayload(result), wasThrown);
        }
        RuntimeAgent.evaluate(expression, objectGroup, includeCommandLineAPI, doNotPauseOnExceptions, this._currentEvaluationContextId(), returnByValue, evalCallback);
    },

    evaluateUsingTextPrompt: function(expression, showResultOnly)
    {
        this._appendCommand(expression, this.prompt.text, false, showResultOnly);
    },

    _enterKeyPressed: function(event)
    {
        if (event.altKey || event.ctrlKey || event.shiftKey)
            return;

        event.consume(true);

        this.prompt.clearAutoComplete(true);

        var str = this.prompt.text;
        if (!str.length)
            return;
        this._appendCommand(str, "", true, false);
    },

    _appendCommand: function(text, newPromptText, useCommandLineAPI, showResultOnly)
    {
        if (!showResultOnly) {
            var commandMessage = new WebInspector.ConsoleCommand(text);
            WebInspector.console.interruptRepeatCount();
            this._appendConsoleMessage(commandMessage);
        }
        this.prompt.text = newPromptText;

        function printResult(result, wasThrown)
        {
            if (!result)
                return;

            if (!showResultOnly) {
                this.prompt.pushHistoryItem(text);
                WebInspector.settings.consoleHistory.set(this.prompt.historyData.slice(-30));
            }

            this._appendConsoleMessage(new WebInspector.ConsoleCommandResult(result, wasThrown, commandMessage, this._linkifier));
        }
        this.evalInInspectedWindow(text, "console", true, false, false, printResult.bind(this));

        WebInspector.userMetrics.ConsoleEvaluated.record();
    },

    elementsToRestoreScrollPositionsFor: function()
    {
        return [this.messagesElement];
    },

    _dumpMemory: function()
    {
        function comparator(a, b)
        {
            if (a.size < b.size)
                return 1;
            if (a.size > b.size)
                return -1;
            return a.title.localeCompare(b.title);
        }

        function callback(error, groups)
        {
            var titles = [];
            groups.sort(comparator);
            for (var i = 0; i < groups.length; ++i) {
                var suffix = groups[i].size > 0 ? " [" + groups[i].size + "]" : "";
                titles.push(groups[i].title + suffix + (groups[i].documentURI ? " (" + groups[i].documentURI + ")" : ""));
            }

            var counter = 1;
            var previousTitle = null;
            for (var i = 0; i < titles.length; ++i) {
                 var title = titles[i];
                 if (title === previousTitle) {
                     counter++;
                     continue;
                 }
                 if (previousTitle)
                     WebInspector.log(counter > 1 ? counter + " x " + previousTitle : previousTitle);
                 previousTitle = title;
                 counter = 1;
            }
            WebInspector.log(counter > 1 ? counter + " x " + previousTitle : previousTitle);
        }
        MemoryAgent.getDOMNodeCount(callback);
    }
}

WebInspector.ConsoleView.prototype.__proto__ = WebInspector.View.prototype;

/**
 * @constructor
 */
WebInspector.ConsoleCommand = function(command)
{
    this.command = command;
}

WebInspector.ConsoleCommand.prototype = {
    clearHighlight: function()
    {
        var highlightedMessage = this._formattedCommand;
        delete this._formattedCommand;
        this._formatCommand();
        this._element.replaceChild(this._formattedCommand, highlightedMessage);
    },

    highlightSearchResults: function(regexObject)
    {
        regexObject.lastIndex = 0;
        var text = this.command;
        var match = regexObject.exec(text);
        var offset = 0;
        var matchRanges = [];
        while (match) {
            matchRanges.push({ offset: match.index, length: match[0].length });
            match = regexObject.exec(text);
        }
        highlightSearchResults(this._formattedCommand, matchRanges);
        this._element.scrollIntoViewIfNeeded();
    },

    matchesRegex: function(regexObject)
    {
        return regexObject.test(this.command);
    },

    toMessageElement: function()
    {
        if (!this._element) {
            this._element = document.createElement("div");
            this._element.command = this;
            this._element.className = "console-user-command";

            this._formatCommand();
            this._element.appendChild(this._formattedCommand);
        }
        return this._element;
    },

    _formatCommand: function()
    {
        this._formattedCommand = document.createElement("span");
        this._formattedCommand.className = "console-message-text source-code";
        this._formattedCommand.textContent = this.command;
    },
}

/**
 * @extends {WebInspector.ConsoleMessageImpl}
 * @constructor
 * @param {WebInspector.DebuggerPresentationModel.Linkifier} linkifier
 */
WebInspector.ConsoleCommandResult = function(result, wasThrown, originatingCommand, linkifier)
{
    var level = (wasThrown ? WebInspector.ConsoleMessage.MessageLevel.Error : WebInspector.ConsoleMessage.MessageLevel.Log);
    this.originatingCommand = originatingCommand;
    WebInspector.ConsoleMessageImpl.call(this, WebInspector.ConsoleMessage.MessageSource.JS, level, "", linkifier, WebInspector.ConsoleMessage.MessageType.Result, undefined, undefined, undefined, [result]);
}

WebInspector.ConsoleCommandResult.prototype = {
    toMessageElement: function()
    {
        var element = WebInspector.ConsoleMessageImpl.prototype.toMessageElement.call(this);
        element.addStyleClass("console-user-command-result");
        return element;
    }
}

WebInspector.ConsoleCommandResult.prototype.__proto__ = WebInspector.ConsoleMessageImpl.prototype;

/**
 * @constructor
 */
WebInspector.ConsoleGroup = function(parentGroup)
{
    this.parentGroup = parentGroup;

    var element = document.createElement("div");
    element.className = "console-group";
    element.group = this;
    this.element = element;

    if (parentGroup) {
        var bracketElement = document.createElement("div");
        bracketElement.className = "console-group-bracket";
        element.appendChild(bracketElement);
    }

    var messagesElement = document.createElement("div");
    messagesElement.className = "console-group-messages";
    element.appendChild(messagesElement);
    this.messagesElement = messagesElement;
}

WebInspector.ConsoleGroup.prototype = {
    addMessage: function(msg)
    {
        var element = msg.toMessageElement();

        if (msg.type === WebInspector.ConsoleMessage.MessageType.StartGroup || msg.type === WebInspector.ConsoleMessage.MessageType.StartGroupCollapsed) {
            this.messagesElement.parentNode.insertBefore(element, this.messagesElement);
            element.addEventListener("click", this._titleClicked.bind(this), false);
            var groupElement = element.enclosingNodeOrSelfWithClass("console-group");
            if (groupElement && msg.type === WebInspector.ConsoleMessage.MessageType.StartGroupCollapsed)
                groupElement.addStyleClass("collapsed");
        } else
            this.messagesElement.appendChild(element);

        if (element.previousSibling && msg.originatingCommand && element.previousSibling.command === msg.originatingCommand)
            element.previousSibling.addStyleClass("console-adjacent-user-command-result");
    },

    _titleClicked: function(event)
    {
        var groupTitleElement = event.target.enclosingNodeOrSelfWithClass("console-group-title");
        if (groupTitleElement) {
            var groupElement = groupTitleElement.enclosingNodeOrSelfWithClass("console-group");
            if (groupElement)
                if (groupElement.hasStyleClass("collapsed"))
                    groupElement.removeStyleClass("collapsed");
                else
                    groupElement.addStyleClass("collapsed");
            groupTitleElement.scrollIntoViewIfNeeded(true);
        }

        event.consume(true);
    }
}

/**
 * @type {?WebInspector.ConsoleView}
 */
WebInspector.consoleView = null;

WebInspector.ConsoleMessage.create = function(source, level, message, type, url, line, repeatCount, parameters, stackTrace, request)
{
    return new WebInspector.ConsoleMessageImpl(source, level, message, WebInspector.consoleView._linkifier, type, url, line, repeatCount, parameters, stackTrace, request);
}
