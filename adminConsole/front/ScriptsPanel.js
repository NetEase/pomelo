/*
 * Copyright (C) 2008 Apple Inc. All Rights Reserved.
 * Copyright (C) 2011 Google Inc. All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions
 * are met:
 * 1. Redistributions of source code must retain the above copyright
 *    notice, this list of conditions and the following disclaimer.
 * 2. Redistributions in binary form must reproduce the above copyright
 *    notice, this list of conditions and the following disclaimer in the
 *    documentation and/or other materials provided with the distribution.
 *
 * THIS SOFTWARE IS PROVIDED BY APPLE INC. ``AS IS'' AND ANY
 * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR
 * PURPOSE ARE DISCLAIMED.  IN NO EVENT SHALL APPLE INC. OR
 * CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
 * EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
 * PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
 * PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY
 * OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

/**
 * @constructor
 * @implements {WebInspector.EditorContainerDelegate}
 * @extends {WebInspector.Panel}
 */
WebInspector.ScriptsPanel = function(presentationModel)
{
    WebInspector.Panel.call(this, "scripts");
    this.registerRequiredCSS("scriptsPanel.css");

    WebInspector.settings.pauseOnExceptionStateString = WebInspector.settings.createSetting("pauseOnExceptionStateString", WebInspector.ScriptsPanel.PauseOnExceptionsState.DontPauseOnExceptions);
    WebInspector.settings.navigatorWasOnceHidden = WebInspector.settings.createSetting("navigatorWasOnceHidden", false);

    this._presentationModel = presentationModel;

    function viewGetter()
    {
        return this.visibleView;
    }
    WebInspector.GoToLineDialog.install(this, viewGetter.bind(this));
    WebInspector.JavaScriptOutlineDialog.install(this, viewGetter.bind(this));

    this.debugToolbar = this._createDebugToolbar();

    const initialDebugSidebarWidth = 225;
    const maximalDebugSidebarWidthPercent = 50;
    this.createSplitView(this.element, WebInspector.SplitView.SidebarPosition.Right, initialDebugSidebarWidth);
    this.splitView.element.id = "scripts-split-view";
    this.splitView.minimalSidebarWidth = Preferences.minScriptsSidebarWidth;
    this.splitView.minimalMainWidthPercent = 100 - maximalDebugSidebarWidthPercent;

    this.sidebarElement.appendChild(this.debugToolbar);

    this.debugSidebarResizeWidgetElement = document.createElement("div");
    this.debugSidebarResizeWidgetElement.id = "scripts-debug-sidebar-resizer-widget";
    this.splitView.installResizer(this.debugSidebarResizeWidgetElement);

    WebInspector.settings.useScriptsNavigator = WebInspector.settings.createSetting("useScriptsNavigator", true);
    if (WebInspector.settings.useScriptsNavigator.get()) {
        const initialNavigatorWidth = 225;
        const minimalViewsContainerWidthPercent = 50;
        this.editorView = new WebInspector.SplitView(WebInspector.SplitView.SidebarPosition.Left, "scriptsPanelNavigatorSidebarWidth", initialNavigatorWidth);
        this.editorView.element.id = "scripts-editor-view";
        this.editorView.element.tabIndex = 0;

        this.editorView.minimalSidebarWidth = Preferences.minScriptsSidebarWidth;
        this.editorView.minimalMainWidthPercent = minimalViewsContainerWidthPercent;
        this.editorView.show(this.splitView.mainElement);

        this._navigator = new WebInspector.ScriptsNavigator();
        this._navigatorView = this._navigator.view;
        this._fileSelector = this._navigator;
        this._fileSelector.show(this.editorView.sidebarElement);

        this._tabbedEditorContainer = new WebInspector.TabbedEditorContainer(this);
        this._editorContainer = this._tabbedEditorContainer;
        this._editorContainer.show(this.editorView.mainElement);
        WebInspector.OpenResourceDialog.install(this, this._presentationModel, this.editorView.mainElement);

        this._createNavigatorControls();
        WebInspector.settings.navigatorHidden = WebInspector.settings.createSetting("navigatorHidden", true);
        if (WebInspector.settings.navigatorHidden.get())
            this._toggleNavigator();
    } else {
        this._fileSelector = new WebInspector.ScriptsPanel.ComboBoxFileSelector();
        this._fileSelector.show(this.splitView.mainElement);

        this._editorContainer = new WebInspector.ScriptsPanel.SingleFileEditorContainer(this);
        this._editorContainer.show(this.splitView.mainElement);
        WebInspector.OpenResourceDialog.install(this, this._presentationModel, this.splitView.mainElement);
    }
    this._fileSelector.addEventListener(WebInspector.ScriptsPanel.FileSelector.Events.FileSelected, this._fileSelected, this);
    this._fileSelector.addEventListener(WebInspector.ScriptsPanel.FileSelector.Events.ReleasedFocusAfterSelection, this._fileSelectorReleasedFocus, this);
    this._editorContainer.addEventListener(WebInspector.EditorContainer.Events.EditorSelected, this._editorSelected, this);
    this._editorContainer.addEventListener(WebInspector.EditorContainer.Events.EditorClosed, this._editorClosed, this);

    this.splitView.mainElement.appendChild(this.debugSidebarResizeWidgetElement);

    this.sidebarPanes = {};
    this.sidebarPanes.watchExpressions = new WebInspector.WatchExpressionsSidebarPane();
    this.sidebarPanes.callstack = new WebInspector.CallStackSidebarPane(this._presentationModel);
    this.sidebarPanes.scopechain = new WebInspector.ScopeChainSidebarPane();
    this.sidebarPanes.jsBreakpoints = new WebInspector.JavaScriptBreakpointsSidebarPane(this._presentationModel, this._showSourceLine.bind(this));
    if (Capabilities.nativeInstrumentationEnabled) {
        this.sidebarPanes.domBreakpoints = WebInspector.domBreakpointsSidebarPane;
        this.sidebarPanes.xhrBreakpoints = new WebInspector.XHRBreakpointsSidebarPane();
        this.sidebarPanes.eventListenerBreakpoints = new WebInspector.EventListenerBreakpointsSidebarPane();
    }

    if (Preferences.exposeWorkersInspection && !WebInspector.WorkerManager.isWorkerFrontend()) {
        WorkerAgent.setWorkerInspectionEnabled(true);
        this.sidebarPanes.workerList = new WebInspector.WorkerListSidebarPane(WebInspector.workerManager);
    } else
        this.sidebarPanes.workers = new WebInspector.WorkersSidebarPane();

    this._debugSidebarContentsElement = document.createElement("div");
    this._debugSidebarContentsElement.id = "scripts-debug-sidebar-contents";
    this.sidebarElement.appendChild(this._debugSidebarContentsElement);

    for (var pane in this.sidebarPanes)
        this._debugSidebarContentsElement.appendChild(this.sidebarPanes[pane].element);

    this.sidebarPanes.callstack.expanded = true;

    this.sidebarPanes.scopechain.expanded = true;
    this.sidebarPanes.jsBreakpoints.expanded = true;

    var helpSection = WebInspector.shortcutsScreen.section(WebInspector.UIString("Scripts Panel"));
    this.sidebarPanes.callstack.registerShortcuts(helpSection, this.registerShortcut.bind(this));
    var evaluateInConsoleShortcut = WebInspector.KeyboardShortcut.makeDescriptor("e", WebInspector.KeyboardShortcut.Modifiers.Shift | WebInspector.KeyboardShortcut.Modifiers.Ctrl);
    helpSection.addKey(evaluateInConsoleShortcut.name, WebInspector.UIString("Evaluate selection in console"));
    this.registerShortcut(evaluateInConsoleShortcut.key, this._evaluateSelectionInConsole.bind(this));

    var openResourceShortcut = WebInspector.OpenResourceDialog.createShortcut();
    helpSection.addKey(openResourceShortcut.name, WebInspector.UIString("Open script"));

    var scriptOutlineShortcut = WebInspector.JavaScriptOutlineDialog.createShortcut();
    helpSection.addKey(scriptOutlineShortcut.name, WebInspector.UIString("Go to function"));

    var panelEnablerHeading = WebInspector.UIString("You need to enable debugging before you can use the Scripts panel.");
    var panelEnablerDisclaimer = WebInspector.UIString("Enabling debugging will make scripts run slower.");
    var panelEnablerButton = WebInspector.UIString("Enable Debugging");

    this.panelEnablerView = new WebInspector.PanelEnablerView("scripts", panelEnablerHeading, panelEnablerDisclaimer, panelEnablerButton);
    this.panelEnablerView.addEventListener("enable clicked", this.enableDebugging, this);

    this.enableToggleButton = new WebInspector.StatusBarButton("", "enable-toggle-status-bar-item");
    this.enableToggleButton.addEventListener("click", this.toggleDebugging, this);
    if (!Capabilities.debuggerCausesRecompilation)
        this.enableToggleButton.element.addStyleClass("hidden");

    this._pauseOnExceptionButton = new WebInspector.StatusBarButton("", "scripts-pause-on-exceptions-status-bar-item", 3);
    this._pauseOnExceptionButton.addEventListener("click", this._togglePauseOnExceptions, this);

    this._toggleFormatSourceButton = new WebInspector.StatusBarButton(WebInspector.UIString("Pretty print"), "scripts-toggle-pretty-print-status-bar-item");
    this._toggleFormatSourceButton.toggled = false;
    this._toggleFormatSourceButton.addEventListener("click", this._toggleFormatSource, this);

    this._scriptViewStatusBarItemsContainer = document.createElement("div");
    this._scriptViewStatusBarItemsContainer.style.display = "inline-block";

    this._debuggerEnabled = !Capabilities.debuggerCausesRecompilation;

    this._reset(false);

    WebInspector.debuggerModel.addEventListener(WebInspector.DebuggerModel.Events.DebuggerWasEnabled, this._debuggerWasEnabled, this);
    WebInspector.debuggerModel.addEventListener(WebInspector.DebuggerModel.Events.DebuggerWasDisabled, this._debuggerWasDisabled, this);

    this._presentationModel.addEventListener(WebInspector.DebuggerPresentationModel.Events.UISourceCodeAdded, this._uiSourceCodeAdded, this)
    this._presentationModel.addEventListener(WebInspector.DebuggerPresentationModel.Events.UISourceCodeReplaced, this._uiSourceCodeReplaced, this);
    this._presentationModel.addEventListener(WebInspector.DebuggerPresentationModel.Events.UISourceCodeRemoved, this._uiSourceCodeRemoved, this);
    this._presentationModel.addEventListener(WebInspector.DebuggerPresentationModel.Events.ConsoleMessageAdded, this._consoleMessageAdded, this);
    this._presentationModel.addEventListener(WebInspector.DebuggerPresentationModel.Events.ConsoleMessagesCleared, this._consoleMessagesCleared, this);
    this._presentationModel.addEventListener(WebInspector.DebuggerPresentationModel.Events.DebuggerPaused, this._debuggerPaused, this);
    this._presentationModel.addEventListener(WebInspector.DebuggerPresentationModel.Events.DebuggerResumed, this._debuggerResumed, this);
    this._presentationModel.addEventListener(WebInspector.DebuggerPresentationModel.Events.CallFrameSelected, this._callFrameSelected, this);
    this._presentationModel.addEventListener(WebInspector.DebuggerPresentationModel.Events.ConsoleCommandEvaluatedInSelectedCallFrame, this._consoleCommandEvaluatedInSelectedCallFrame, this);
    this._presentationModel.addEventListener(WebInspector.DebuggerPresentationModel.Events.ExecutionLineChanged, this._executionLineChanged, this);
    this._presentationModel.addEventListener(WebInspector.DebuggerPresentationModel.Events.DebuggerReset, this._reset.bind(this, false));

    var enableDebugger = !Capabilities.debuggerCausesRecompilation || WebInspector.settings.debuggerEnabled.get();
    if (enableDebugger)
        WebInspector.debuggerModel.enableDebugger();

    WebInspector.advancedSearchController.registerSearchScope(new WebInspector.ScriptsSearchScope());

    this._sourceFramesByUISourceCode = new Map();
}

// Keep these in sync with WebCore::ScriptDebugServer
WebInspector.ScriptsPanel.PauseOnExceptionsState = {
    DontPauseOnExceptions : "none",
    PauseOnAllExceptions : "all",
    PauseOnUncaughtExceptions: "uncaught"
};

WebInspector.ScriptsPanel.prototype = {
    get toolbarItemLabel()
    {
        return WebInspector.UIString("Scripts");
    },

    get statusBarItems()
    {
        return [this.enableToggleButton.element, this._pauseOnExceptionButton.element, this._toggleFormatSourceButton.element, this._scriptViewStatusBarItemsContainer];
    },

    get defaultFocusedElement()
    {
        return this._fileSelector.defaultFocusedElement;
    },

    get paused()
    {
        return this._paused;
    },

    wasShown: function()
    {
        WebInspector.Panel.prototype.wasShown.call(this);
        if (Capabilities.nativeInstrumentationEnabled)
            this._debugSidebarContentsElement.insertBefore(this.sidebarPanes.domBreakpoints.element, this.sidebarPanes.xhrBreakpoints.element);
        this.sidebarPanes.watchExpressions.show();

        window.setTimeout(this._maybeShowNavigatorOverlay.bind(this), 0);
    },

    breakpointsActivated: function()
    {
        return this.toggleBreakpointsButton.toggled;
    },

    activateBreakpoints: function()
    {
        if (!this.breakpointsActivated)
            this._toggleBreakpointsClicked();
    },

    _didBuildOutlineChunk: function(event)
    {
        WebInspector.JavaScriptOutlineDialog.didAddChunk(event.data);
        if (event.data.total === event.data.index) {
            if (this._outlineWorker) {
                this._outlineWorker.terminate();
                delete this._outlineWorker;
            }
        }
    },

    _uiSourceCodeAdded: function(event)
    {
        var uiSourceCode = /** @type {WebInspector.UISourceCode} */ event.data;

        var breakpoints = uiSourceCode.breakpoints();
        for (var lineNumber in breakpoints)
            this._uiBreakpointAdded({ data: breakpoints[lineNumber] });
        this._addBreakpointListeners(uiSourceCode);

        if (!uiSourceCode.url || uiSourceCode.isSnippetEvaluation) {
            // Anonymous sources and snippets evaluations are shown only when stepping.
            return;
        }

        this._addUISourceCode(uiSourceCode);
    },

    /**
     * @param {WebInspector.UISourceCode} uiSourceCode
     */
    _addUISourceCode: function(uiSourceCode)
    {
        this._fileSelector.addUISourceCode(uiSourceCode);
        this._editorContainer.uiSourceCodeAdded(uiSourceCode);
    },

    _uiSourceCodeRemoved: function(event)
    {
        var uiSourceCode = /** @type {WebInspector.UISourceCode} */ event.data;
        this._removeSourceFrame(uiSourceCode);
        this._removeBreakpointListeners(uiSourceCode);
    },

    /**
     * @param {WebInspector.UISourceCode} uiSourceCode
     */
    _addBreakpointListeners: function(uiSourceCode)
    {
        uiSourceCode.addEventListener(WebInspector.UISourceCode.Events.BreakpointAdded, this._uiBreakpointAdded, this);
        uiSourceCode.addEventListener(WebInspector.UISourceCode.Events.BreakpointRemoved, this._uiBreakpointRemoved, this);
    },

    /**
     * @param {WebInspector.UISourceCode} uiSourceCode
     */
    _removeBreakpointListeners: function(uiSourceCode)
    {
        uiSourceCode.removeEventListener(WebInspector.UISourceCode.Events.BreakpointAdded, this._uiBreakpointAdded, this);
        uiSourceCode.removeEventListener(WebInspector.UISourceCode.Events.BreakpointRemoved, this._uiBreakpointRemoved, this);
    },

    /**
     * @param {WebInspector.UISourceCode} uiSourceCode
     * @param {boolean} isDirty
     */
    setScriptSourceIsDirty: function(uiSourceCode, isDirty)
    {
        this._fileSelector.setScriptSourceIsDirty(uiSourceCode, isDirty);
        this._editorContainer.setFileIsDirty(uiSourceCode, isDirty);
    },

    _consoleMessagesCleared: function()
    {
        var sourceFrames = this._sourceFramesByUISourceCode.values();
        for (var i = 0; i < sourceFrames.length; ++i)
            sourceFrames[i].clearMessages();
    },

    _consoleMessageAdded: function(event)
    {
        var message = event.data;

        var sourceFrame = this._sourceFramesByUISourceCode.get(message.uiSourceCode)
        if (sourceFrame && sourceFrame.loaded)
            sourceFrame.addMessageToSource(message.lineNumber, message.originalMessage);
    },

    _uiBreakpointAdded: function(event)
    {
        var uiBreakpoint = /** @type {WebInspector.UIBreakpoint} */ event.data;

        var sourceFrame = this._sourceFramesByUISourceCode.get(uiBreakpoint.uiSourceCode)
        if (sourceFrame && sourceFrame.loaded)
            sourceFrame.addBreakpoint(uiBreakpoint.lineNumber, uiBreakpoint.resolved, uiBreakpoint.condition, uiBreakpoint.enabled);

        this.sidebarPanes.jsBreakpoints.addBreakpoint(uiBreakpoint);
    },

    _uiBreakpointRemoved: function(event)
    {
        var uiBreakpoint = /** @type {WebInspector.UIBreakpoint} */ event.data;

        var sourceFrame = this._sourceFramesByUISourceCode.get(uiBreakpoint.uiSourceCode)
        if (sourceFrame && sourceFrame.loaded)
            sourceFrame.removeBreakpoint(uiBreakpoint.lineNumber);

        this.sidebarPanes.jsBreakpoints.removeBreakpoint(uiBreakpoint.uiSourceCode, uiBreakpoint.lineNumber);
    },

    _consoleCommandEvaluatedInSelectedCallFrame: function(event)
    {
        this.sidebarPanes.scopechain.update(this._presentationModel.selectedCallFrame);
    },

    _debuggerPaused: function(event)
    {
        var callFrames = event.data.callFrames;
        var details = event.data.details;

        this._paused = true;
        this._waitingToPause = false;
        this._stepping = false;

        this._updateDebuggerButtons();

        WebInspector.inspectorView.setCurrentPanel(this);
        this.sidebarPanes.callstack.update(callFrames);

        if (details.reason === WebInspector.DebuggerModel.BreakReason.DOM) {
            this.sidebarPanes.domBreakpoints.highlightBreakpoint(details.auxData);
            function didCreateBreakpointHitStatusMessage(element)
            {
                this.sidebarPanes.callstack.setStatus(element);
            }
            this.sidebarPanes.domBreakpoints.createBreakpointHitStatusMessage(details.auxData, didCreateBreakpointHitStatusMessage.bind(this));
        } else if (details.reason === WebInspector.DebuggerModel.BreakReason.EventListener) {
            var eventName = details.auxData.eventName;
            this.sidebarPanes.eventListenerBreakpoints.highlightBreakpoint(details.auxData.eventName);
            var eventNameForUI = WebInspector.EventListenerBreakpointsSidebarPane.eventNameForUI(eventName);
            this.sidebarPanes.callstack.setStatus(WebInspector.UIString("Paused on a \"%s\" Event Listener.", eventNameForUI));
        } else if (details.reason === WebInspector.DebuggerModel.BreakReason.XHR) {
            this.sidebarPanes.xhrBreakpoints.highlightBreakpoint(details.auxData["breakpointURL"]);
            this.sidebarPanes.callstack.setStatus(WebInspector.UIString("Paused on a XMLHttpRequest."));
        } else if (details.reason === WebInspector.DebuggerModel.BreakReason.Exception) {
            this.sidebarPanes.callstack.setStatus(WebInspector.UIString("Paused on exception: '%s'.", details.auxData.description));
        } else {
            function didGetUILocation(uiLocation)
            {
                if (!this._presentationModel.findBreakpoint(uiLocation.uiSourceCode, uiLocation.lineNumber))
                    return;
                this.sidebarPanes.jsBreakpoints.highlightBreakpoint(uiLocation.uiSourceCode, uiLocation.lineNumber);
                this.sidebarPanes.callstack.setStatus(WebInspector.UIString("Paused on a JavaScript breakpoint."));
            }
            callFrames[0].uiLocation(didGetUILocation.bind(this));
        }

        window.focus();
        InspectorFrontendHost.bringToFront();
    },

    _debuggerResumed: function()
    {
        this._paused = false;
        this._waitingToPause = false;
        this._stepping = false;

        this._clearInterface();
    },

    _debuggerWasEnabled: function()
    {
        this._setPauseOnExceptions(WebInspector.settings.pauseOnExceptionStateString.get());

        if (this._debuggerEnabled)
            return;

        this._debuggerEnabled = true;
        this._reset(true);
    },

    _debuggerWasDisabled: function()
    {
        if (!this._debuggerEnabled)
            return;

        this._debuggerEnabled = false;
        this._reset(true);
    },

    _reset: function(preserveItems)
    {
        delete this.currentQuery;
        this.searchCanceled();

        this._debuggerResumed();

        delete this._currentUISourceCode;
        this._fileSelector.reset();
        this._editorContainer.reset();
        this._updateScriptViewStatusBarItems();

        this.sidebarPanes.jsBreakpoints.reset();
        this.sidebarPanes.watchExpressions.reset();
        if (!preserveItems && this.sidebarPanes.workers)
            this.sidebarPanes.workers.reset();
    },

    get visibleView()
    {
        return this._editorContainer.visibleView;
    },

    _updateScriptViewStatusBarItems: function()
    {
        this._scriptViewStatusBarItemsContainer.removeChildren();

        var sourceFrame = this.visibleView;
        if (sourceFrame) {
            var statusBarItems = sourceFrame.statusBarItems || [];
            for (var i = 0; i < statusBarItems.length; ++i)
                this._scriptViewStatusBarItemsContainer.appendChild(statusBarItems[i]);
        }
    },

    canShowAnchorLocation: function(anchor)
    {
        return this._debuggerEnabled && anchor.uiSourceCode;
    },

    showAnchorLocation: function(anchor)
    {
        this._showSourceLine(anchor.uiSourceCode, anchor.lineNumber);
    },

    showFunctionDefinition: function(functionLocation)
    {
        WebInspector.showPanelForAnchorNavigation(this);
        var uiLocation = this._presentationModel.rawLocationToUILocation(functionLocation);
        this._showSourceLine(uiLocation.uiSourceCode, uiLocation.lineNumber);
    },

    showUISourceCode: function(uiSourceCode)
    {
        this._showSourceLine(uiSourceCode);
    },

    /**
     * @param {WebInspector.UISourceCode} uiSourceCode
     * @param {number=} lineNumber
     */
    _showSourceLine: function(uiSourceCode, lineNumber)
    {
        var sourceFrame = this._showFile(uiSourceCode);
        if (typeof lineNumber === "number")
            sourceFrame.highlightLine(lineNumber);
        sourceFrame.focus();
    },

    /**
     * @param {WebInspector.UISourceCode} uiSourceCode
     * @return {WebInspector.SourceFrame}
     */
    _showFile: function(uiSourceCode)
    {
        if (!this._fileSelector.isScriptSourceAdded(uiSourceCode))
            return null;

        var sourceFrame = this._getOrCreateSourceFrame(uiSourceCode);
        if (this._currentUISourceCode === uiSourceCode)
            return sourceFrame;
        this._currentUISourceCode = uiSourceCode;

        this._fileSelector.revealUISourceCode(uiSourceCode);
        this._editorContainer.showFile(uiSourceCode);
        this._updateScriptViewStatusBarItems();

        return sourceFrame;
    },

    requestVisibleScriptOutline: function()
    {
        function contentCallback(mimeType, content)
        {
            if (this._outlineWorker)
                this._outlineWorker.terminate();
            this._outlineWorker = new Worker("ScriptFormatterWorker.js");
            this._outlineWorker.onmessage = this._didBuildOutlineChunk.bind(this);
            const method = "outline";
            this._outlineWorker.postMessage({ method: method, params: { content: content, id: this.visibleView.uiSourceCode.id } });
        }

        if (this.visibleView.uiSourceCode)
            this.visibleView.uiSourceCode.requestContent(contentCallback.bind(this));
    },

    /**
     * @param {WebInspector.UISourceCode} uiSourceCode
     * @return {WebInspector.SourceFrame}
     */
    _createSourceFrame: function(uiSourceCode)
    {
        var sourceFrame = new WebInspector.JavaScriptSourceFrame(this, this._presentationModel, uiSourceCode);

        sourceFrame._uiSourceCode = uiSourceCode;
        sourceFrame.addEventListener(WebInspector.SourceFrame.Events.Loaded, this._sourceFrameLoaded, this);
        this._sourceFramesByUISourceCode.put(uiSourceCode, sourceFrame);
        return sourceFrame;
    },

    /**
     * @param {WebInspector.UISourceCode} uiSourceCode
     * @return {WebInspector.SourceFrame}
     */
    _getOrCreateSourceFrame: function(uiSourceCode)
    {
        return this._sourceFramesByUISourceCode.get(uiSourceCode) || this._createSourceFrame(uiSourceCode);
    },

    /**
     * @param {WebInspector.UISourceCode} uiSourceCode
     * @return {WebInspector.SourceFrame}
     */
    viewForFile: function(uiSourceCode)
    {
        return this._getOrCreateSourceFrame(uiSourceCode);
    },

    /**
     * @param {WebInspector.UISourceCode} uiSourceCode
     */
    _removeSourceFrame: function(uiSourceCode)
    {
        var sourceFrame = this._sourceFramesByUISourceCode.get(uiSourceCode);
        if (!sourceFrame)
            return;
        this._sourceFramesByUISourceCode.remove(uiSourceCode);
        sourceFrame.detach();
        sourceFrame.removeEventListener(WebInspector.SourceFrame.Events.Loaded, this._sourceFrameLoaded, this);
    },

    /**
     * @param {Event} event
     */
    _uiSourceCodeReplaced: function(event)
    {
        var oldUISourceCodeList = /** @type {Array.<WebInspector.UISourceCode>} */ event.data.oldUISourceCodeList;
        var uiSourceCodeList = /** @type {Array.<WebInspector.UISourceCode>} */ event.data.uiSourceCodeList;

        this._fileSelector.replaceUISourceCodes(oldUISourceCodeList, uiSourceCodeList);
        this._editorContainer.replaceFiles(oldUISourceCodeList, uiSourceCodeList);
        for (var i = 0; i < oldUISourceCodeList.length; ++i)
            this._removeSourceFrame(oldUISourceCodeList[i]);

        for (var i = 0; i < oldUISourceCodeList.length; ++i)
            this._removeBreakpointListeners(oldUISourceCodeList[i]);
        for (var i = 0; i < uiSourceCodeList.length; ++i) {
            var uiSourceCode = uiSourceCodeList[i];
            var breakpoints = uiSourceCode.breakpoints();
            for (var lineNumber in breakpoints)
                this._uiBreakpointAdded({ data: breakpoints[lineNumber] });
            this._addBreakpointListeners(uiSourceCode);
        }
    },

    _sourceFrameLoaded: function(event)
    {
        var sourceFrame = /** @type {WebInspector.JavaScriptSourceFrame} */ event.target;
        var uiSourceCode = sourceFrame._uiSourceCode;

        var messages = this._presentationModel.messagesForUISourceCode(uiSourceCode);
        for (var i = 0; i < messages.length; ++i) {
            var message = messages[i];
            sourceFrame.addMessageToSource(message.lineNumber, message.originalMessage);
        }

        var breakpoints = this._presentationModel.breakpointsForUISourceCode(uiSourceCode);
        for (var i = 0; i < breakpoints.length; ++i) {
            var breakpoint = breakpoints[i];
            sourceFrame.addBreakpoint(breakpoint.lineNumber, breakpoint.resolved, breakpoint.condition, breakpoint.enabled);
        }
    },

    _clearCurrentExecutionLine: function()
    {
        if (this._executionSourceFrame)
            this._executionSourceFrame.clearExecutionLine();
        delete this._executionSourceFrame;
    },

    _executionLineChanged: function(event)
    {
        var uiLocation = event.data;

        this._clearCurrentExecutionLine();
        if (!uiLocation)
            return;
        var sourceFrame = this._getOrCreateSourceFrame(uiLocation.uiSourceCode);
        sourceFrame.setExecutionLine(uiLocation.lineNumber);
        this._executionSourceFrame = sourceFrame;
    },

    _revealExecutionLine: function(uiLocation)
    {
        // Some scripts (anonymous and snippets evaluations) are not added to files select by default.
        this._addUISourceCode(uiLocation.uiSourceCode);
        var sourceFrame = this._showFile(uiLocation.uiSourceCode);
        sourceFrame.revealLine(uiLocation.lineNumber);
    },

    _callFrameSelected: function(event)
    {
        var callFrame = event.data;

        if (!callFrame)
            return;

        this.sidebarPanes.scopechain.update(callFrame);
        this.sidebarPanes.watchExpressions.refreshExpressions();
        this.sidebarPanes.callstack.selectedCallFrame = callFrame;
        callFrame.uiLocation(this._revealExecutionLine.bind(this));
    },

    _editorClosed: function(event)
    {
        this._hideNavigatorOverlay();
        var uiSourceCode = /** @type {WebInspector.UISourceCode} */ event.data;

        if (this._currentUISourceCode === uiSourceCode)
            delete this._currentUISourceCode;

        // We don't need to update file selector here regardless of whether useScriptsNavigator is set or not:
        // SingleFileEditorContainer never dispatches EditorClosed, so no need to update ComboBoxFileSelector;
        // ScriptsNavigator does not need to update on EditorClosed.

        this._updateScriptViewStatusBarItems();
    },

    _editorSelected: function(event)
    {
        var uiSourceCode = /** @type {WebInspector.UISourceCode} */ event.data;
        this._showFile(uiSourceCode);
        this._hideNavigatorOverlay();
    },

    _fileSelected: function(event)
    {
        var uiSourceCode = /** @type {WebInspector.UISourceCode} */ event.data;
        this._showFile(uiSourceCode);
        this._hideNavigatorOverlay();
    },

    _fileSelectorReleasedFocus: function(event)
    {
        var uiSourceCode = /** @type {WebInspector.UISourceCode} */ event.data;
        var sourceFrame = this._sourceFramesByUISourceCode.get(uiSourceCode);
        if (sourceFrame)
            sourceFrame.focus();
    },

    _setPauseOnExceptions: function(pauseOnExceptionsState)
    {
        pauseOnExceptionsState = pauseOnExceptionsState || WebInspector.ScriptsPanel.PauseOnExceptionsState.DontPauseOnExceptions;
        function callback(error)
        {
            if (error)
                return;
            if (pauseOnExceptionsState == WebInspector.ScriptsPanel.PauseOnExceptionsState.DontPauseOnExceptions)
                this._pauseOnExceptionButton.title = WebInspector.UIString("Don't pause on exceptions.\nClick to Pause on all exceptions.");
            else if (pauseOnExceptionsState == WebInspector.ScriptsPanel.PauseOnExceptionsState.PauseOnAllExceptions)
                this._pauseOnExceptionButton.title = WebInspector.UIString("Pause on all exceptions.\nClick to Pause on uncaught exceptions.");
            else if (pauseOnExceptionsState == WebInspector.ScriptsPanel.PauseOnExceptionsState.PauseOnUncaughtExceptions)
                this._pauseOnExceptionButton.title = WebInspector.UIString("Pause on uncaught exceptions.\nClick to Not pause on exceptions.");

            this._pauseOnExceptionButton.state = pauseOnExceptionsState;
            WebInspector.settings.pauseOnExceptionStateString.set(pauseOnExceptionsState);
        }
        DebuggerAgent.setPauseOnExceptions(pauseOnExceptionsState, callback.bind(this));
    },

    _updateDebuggerButtons: function()
    {
        if (this._debuggerEnabled) {
            this.enableToggleButton.title = WebInspector.UIString("Debugging enabled. Click to disable.");
            this.enableToggleButton.toggled = true;
            this._pauseOnExceptionButton.visible = true;
            this.panelEnablerView.detach();
        } else {
            this.enableToggleButton.title = WebInspector.UIString("Debugging disabled. Click to enable.");
            this.enableToggleButton.toggled = false;
            this._pauseOnExceptionButton.visible = false;
            this.panelEnablerView.show(this.element);
        }

        if (this._paused) {
            this.pauseButton.addStyleClass("paused");

            this.pauseButton.disabled = false;
            this.stepOverButton.disabled = false;
            this.stepIntoButton.disabled = false;
            this.stepOutButton.disabled = false;

            this.debuggerStatusElement.textContent = WebInspector.UIString("Paused");
        } else {
            this.pauseButton.removeStyleClass("paused");

            this.pauseButton.disabled = this._waitingToPause;
            this.stepOverButton.disabled = true;
            this.stepIntoButton.disabled = true;
            this.stepOutButton.disabled = true;

            if (this._waitingToPause)
                this.debuggerStatusElement.textContent = WebInspector.UIString("Pausing");
            else if (this._stepping)
                this.debuggerStatusElement.textContent = WebInspector.UIString("Stepping");
            else
                this.debuggerStatusElement.textContent = "";
        }
    },

    _clearInterface: function()
    {
        this.sidebarPanes.callstack.update(null);
        this.sidebarPanes.scopechain.update(null);
        this.sidebarPanes.jsBreakpoints.clearBreakpointHighlight();
        if (Capabilities.nativeInstrumentationEnabled) {
            this.sidebarPanes.domBreakpoints.clearBreakpointHighlight();
            this.sidebarPanes.eventListenerBreakpoints.clearBreakpointHighlight();
            this.sidebarPanes.xhrBreakpoints.clearBreakpointHighlight();
        }

        this._clearCurrentExecutionLine();
        this._updateDebuggerButtons();
    },

    get debuggingEnabled()
    {
        return this._debuggerEnabled;
    },

    enableDebugging: function()
    {
        if (this._debuggerEnabled)
            return;
        this.toggleDebugging(this.panelEnablerView.alwaysEnabled);
    },

    disableDebugging: function()
    {
        if (!this._debuggerEnabled)
            return;
        this.toggleDebugging(this.panelEnablerView.alwaysEnabled);
    },

    toggleDebugging: function(optionalAlways)
    {
        this._paused = false;
        this._waitingToPause = false;
        this._stepping = false;

        if (this._debuggerEnabled) {
            WebInspector.settings.debuggerEnabled.set(false);
            WebInspector.debuggerModel.disableDebugger();
        } else {
            WebInspector.settings.debuggerEnabled.set(!!optionalAlways);
            WebInspector.debuggerModel.enableDebugger();
        }
    },

    _togglePauseOnExceptions: function()
    {
        var nextStateMap = {};
        var stateEnum = WebInspector.ScriptsPanel.PauseOnExceptionsState;
        nextStateMap[stateEnum.DontPauseOnExceptions] = stateEnum.PauseOnAllExceptions;
        nextStateMap[stateEnum.PauseOnAllExceptions] = stateEnum.PauseOnUncaughtExceptions;
        nextStateMap[stateEnum.PauseOnUncaughtExceptions] = stateEnum.DontPauseOnExceptions;
        this._setPauseOnExceptions(nextStateMap[this._pauseOnExceptionButton.state]);
    },

    _togglePause: function()
    {
        if (this._paused) {
            this._paused = false;
            this._waitingToPause = false;
            DebuggerAgent.resume();
        } else {
            this._stepping = false;
            this._waitingToPause = true;
            DebuggerAgent.pause();
        }

        this._clearInterface();
    },

    _stepOverClicked: function()
    {
        if (!this._paused)
            return;

        this._paused = false;
        this._stepping = true;

        this._clearInterface();

        DebuggerAgent.stepOver();
    },

    _stepIntoClicked: function()
    {
        if (!this._paused)
            return;

        this._paused = false;
        this._stepping = true;

        this._clearInterface();

        DebuggerAgent.stepInto();
    },

    _stepOutClicked: function()
    {
        if (!this._paused)
            return;

        this._paused = false;
        this._stepping = true;

        this._clearInterface();

        DebuggerAgent.stepOut();
    },

    _toggleBreakpointsClicked: function()
    {
        this.toggleBreakpointsButton.toggled = !this.toggleBreakpointsButton.toggled;
        if (this.toggleBreakpointsButton.toggled) {
            DebuggerAgent.setBreakpointsActive(true);
            this.toggleBreakpointsButton.title = WebInspector.UIString("Deactivate all breakpoints.");
            WebInspector.inspectorView.element.removeStyleClass("breakpoints-deactivated");
        } else {
            DebuggerAgent.setBreakpointsActive(false);
            this.toggleBreakpointsButton.title = WebInspector.UIString("Activate all breakpoints.");
            WebInspector.inspectorView.element.addStyleClass("breakpoints-deactivated");
        }
    },

    _evaluateSelectionInConsole: function()
    {
        var selection = window.getSelection();
        if (selection.type === "Range" && !selection.isCollapsed)
            WebInspector.evaluateInConsole(selection.toString());
    },

    _createDebugToolbar: function()
    {
        var debugToolbar = document.createElement("div");
        debugToolbar.className = "status-bar";
        debugToolbar.id = "scripts-debug-toolbar";

        var title, handler, shortcuts;
        var platformSpecificModifier = WebInspector.KeyboardShortcut.Modifiers.CtrlOrMeta;

        // Continue.
        title = WebInspector.UIString("Pause script execution (%s).");
        handler = this._togglePause.bind(this);
        shortcuts = [];
        shortcuts.push(WebInspector.KeyboardShortcut.makeDescriptor(WebInspector.KeyboardShortcut.Keys.F8));
        shortcuts.push(WebInspector.KeyboardShortcut.makeDescriptor(WebInspector.KeyboardShortcut.Keys.Slash, platformSpecificModifier));
        this.pauseButton = this._createButtonAndRegisterShortcuts("scripts-pause", title, handler, shortcuts, WebInspector.UIString("Pause/Continue"));
        debugToolbar.appendChild(this.pauseButton);

        // Step over.
        title = WebInspector.UIString("Step over next function call (%s).");
        handler = this._stepOverClicked.bind(this);
        shortcuts = [];
        shortcuts.push(WebInspector.KeyboardShortcut.makeDescriptor(WebInspector.KeyboardShortcut.Keys.F10));
        shortcuts.push(WebInspector.KeyboardShortcut.makeDescriptor(WebInspector.KeyboardShortcut.Keys.SingleQuote, platformSpecificModifier));
        this.stepOverButton = this._createButtonAndRegisterShortcuts("scripts-step-over", title, handler, shortcuts, WebInspector.UIString("Step over"));
        debugToolbar.appendChild(this.stepOverButton);

        // Step into.
        title = WebInspector.UIString("Step into next function call (%s).");
        handler = this._stepIntoClicked.bind(this);
        shortcuts = [];
        shortcuts.push(WebInspector.KeyboardShortcut.makeDescriptor(WebInspector.KeyboardShortcut.Keys.F11));
        shortcuts.push(WebInspector.KeyboardShortcut.makeDescriptor(WebInspector.KeyboardShortcut.Keys.Semicolon, platformSpecificModifier));
        this.stepIntoButton = this._createButtonAndRegisterShortcuts("scripts-step-into", title, handler, shortcuts, WebInspector.UIString("Step into"));
        debugToolbar.appendChild(this.stepIntoButton);

        // Step out.
        title = WebInspector.UIString("Step out of current function (%s).");
        handler = this._stepOutClicked.bind(this);
        shortcuts = [];
        shortcuts.push(WebInspector.KeyboardShortcut.makeDescriptor(WebInspector.KeyboardShortcut.Keys.F11, WebInspector.KeyboardShortcut.Modifiers.Shift));
        shortcuts.push(WebInspector.KeyboardShortcut.makeDescriptor(WebInspector.KeyboardShortcut.Keys.Semicolon, WebInspector.KeyboardShortcut.Modifiers.Shift | platformSpecificModifier));
        this.stepOutButton = this._createButtonAndRegisterShortcuts("scripts-step-out", title, handler, shortcuts, WebInspector.UIString("Step out"));
        debugToolbar.appendChild(this.stepOutButton);

        this.toggleBreakpointsButton = new WebInspector.StatusBarButton(WebInspector.UIString("Deactivate all breakpoints."), "toggle-breakpoints");
        this.toggleBreakpointsButton.toggled = true;
        this.toggleBreakpointsButton.addEventListener("click", this._toggleBreakpointsClicked, this);
        debugToolbar.appendChild(this.toggleBreakpointsButton.element);

        this.debuggerStatusElement = document.createElement("div");
        this.debuggerStatusElement.id = "scripts-debugger-status";
        debugToolbar.appendChild(this.debuggerStatusElement);

        return debugToolbar;
    },

    _createNavigatorControls: function()
    {
        this._navigatorSidebarResizeWidgetElement = document.createElement("div");
        this._navigatorSidebarResizeWidgetElement.addStyleClass("scripts-navigator-resizer-widget");
        this.editorView.installResizer(this._navigatorSidebarResizeWidgetElement);
        this._navigatorView.element.appendChild(this._navigatorSidebarResizeWidgetElement);

        this._navigatorShowHideButton = this._createNavigatorControlButton(WebInspector.UIString("Show scripts navigator"), "scripts-navigator-show-hide-button", this._toggleNavigator.bind(this));
        this._navigatorShowHideButton.addStyleClass("toggled-on");
        this._navigatorShowHideButton.title = WebInspector.UIString("Hide scripts navigator");
        this.editorView.element.appendChild(this._navigatorShowHideButton);

        this._navigatorPinButton = this._createNavigatorControlButton(WebInspector.UIString("Pin scripts navigator"), "scripts-navigator-pin-button", this._pinNavigator.bind(this));
        this._navigatorPinButton.addStyleClass("hidden");
        this._navigatorView.element.appendChild(this._navigatorPinButton);
    },

    _createNavigatorControlButton: function(title, id, listener)
    {
        var button = document.createElement("button");
        button.title = title;
        button.id = id;
        button.addStyleClass("scripts-navigator-control-button");
        button.addEventListener("click", listener, false);
        button.createChild("div", "glyph");
        return button;
    },

    _escDownWhileNavigatorOverlayOpen: function(event)
    {
        this._hideNavigatorOverlay();
    },

    _maybeShowNavigatorOverlay: function()
    {
        if (this._navigator && WebInspector.settings.navigatorHidden.get() && !WebInspector.settings.navigatorWasOnceHidden.get())
            this._showNavigatorOverlay();
    },

    _toggleNavigator: function()
    {
        if (this._navigatorOverlayShown)
            this._hideNavigatorOverlay();
        else if (this._navigatorHidden)
            this._showNavigatorOverlay();
        else
            this._hidePinnedNavigator();
    },

    _hidePinnedNavigator: function()
    {
        this._navigatorHidden = true;
        this._navigatorShowHideButton.removeStyleClass("toggled-on");
        this._navigatorShowHideButton.title = WebInspector.UIString("Show scripts navigator");
        this._tabbedEditorContainer.element.addStyleClass("navigator-hidden");
        this._navigatorSidebarResizeWidgetElement.addStyleClass("hidden");

        this._navigatorPinButton.removeStyleClass("hidden");

        this.editorView.hideSidebarElement();
        this._navigatorView.detach();
        WebInspector.settings.navigatorHidden.set(true);
    },

    _pinNavigator: function()
    {
        delete this._navigatorHidden;
        this._hideNavigatorOverlay();

        this._navigatorPinButton.addStyleClass("hidden");
        this._navigatorShowHideButton.addStyleClass("toggled-on");
        this._navigatorShowHideButton.title = WebInspector.UIString("Hide scripts navigator");

        this._tabbedEditorContainer.element.removeStyleClass("navigator-hidden");
        this._navigatorSidebarResizeWidgetElement.removeStyleClass("hidden");

        this.editorView.showSidebarElement();
        this._navigator.show(this.editorView.sidebarElement);
        this._navigator.focus();
        WebInspector.settings.navigatorHidden.set(false);
    },

    _showNavigatorOverlay: function()
    {
        if (this._navigatorOverlayShown)
            return;

        this._navigatorOverlayShown = true;
        this._sidebarOverlay = new WebInspector.SidebarOverlay(this._navigatorView, "scriptsPanelNavigatorOverlayWidth", Preferences.minScriptsSidebarWidth);
        this._sidebarOverlay.addEventListener(WebInspector.SidebarOverlay.EventTypes.WasShown, this._navigatorOverlayWasShown, this);
        this._sidebarOverlay.addEventListener(WebInspector.SidebarOverlay.EventTypes.WillHide, this._navigatorOverlayWillHide, this);

        var navigatorOverlayResizeWidgetElement = document.createElement("div");
        navigatorOverlayResizeWidgetElement.addStyleClass("scripts-navigator-resizer-widget");
        this._sidebarOverlay.resizerWidgetElement = navigatorOverlayResizeWidgetElement;

        this._sidebarOverlay.show(this.editorView.element);
    },

    _hideNavigatorOverlay: function()
    {
        if (!this._navigatorOverlayShown)
            return;

        this._sidebarOverlay.hide();
        if (this.visibleView)
            this.visibleView.focus();
    },

    _navigatorOverlayWasShown: function(event)
    {
        this._navigatorView.element.appendChild(this._navigatorShowHideButton);
        this._navigatorShowHideButton.addStyleClass("toggled-on");
        this._navigatorShowHideButton.title = WebInspector.UIString("Hide scripts navigator");
        this._navigator.focus();
        this.registerShortcut(WebInspector.KeyboardShortcut.Keys.Esc.code, this._escDownWhileNavigatorOverlayOpen.bind(this));
    },

    _navigatorOverlayWillHide: function(event)
    {
        delete this._navigatorOverlayShown;
        WebInspector.settings.navigatorWasOnceHidden.set(true);
        this.editorView.element.appendChild(this._navigatorShowHideButton);
        this._navigatorShowHideButton.removeStyleClass("toggled-on");
        this._navigatorShowHideButton.title = WebInspector.UIString("Show scripts navigator");
        this.unregisterShortcut(WebInspector.KeyboardShortcut.Keys.Esc.code);
    },

    _createButtonAndRegisterShortcuts: function(buttonId, buttonTitle, handler, shortcuts, shortcutDescription)
    {
        var button = document.createElement("button");
        button.className = "status-bar-item";
        button.id = buttonId;
        button.title = String.vsprintf(buttonTitle, [shortcuts[0].name]);
        button.disabled = true;
        button.appendChild(document.createElement("img"));
        button.addEventListener("click", handler, false);

        var shortcutNames = [];
        for (var i = 0; i < shortcuts.length; ++i) {
            this.registerShortcut(shortcuts[i].key, handler);
            shortcutNames.push(shortcuts[i].name);
        }
        var section = WebInspector.shortcutsScreen.section(WebInspector.UIString("Scripts Panel"));
        section.addAlternateKeys(shortcutNames, shortcutDescription);

        return button;
    },

    searchCanceled: function()
    {
        if (this._searchView)
            this._searchView.searchCanceled();

        delete this._searchView;
        delete this._searchQuery;
    },

    performSearch: function(query)
    {
        WebInspector.searchController.updateSearchMatchesCount(0, this);

        if (!this.visibleView)
            return;

        // Call searchCanceled since it will reset everything we need before doing a new search.
        this.searchCanceled();

        this._searchView = this.visibleView;
        this._searchQuery = query;

        function finishedCallback(view, searchMatches)
        {
            if (!searchMatches)
                return;

            WebInspector.searchController.updateSearchMatchesCount(searchMatches, this);
            view.jumpToFirstSearchResult();
            WebInspector.searchController.updateCurrentMatchIndex(view.currentSearchResultIndex, this);
        }

        this._searchView.performSearch(query, finishedCallback.bind(this));
    },

    jumpToNextSearchResult: function()
    {
        if (!this._searchView)
            return;

        if (this._searchView !== this.visibleView) {
            this.performSearch(this._searchQuery);
            return;
        }

        if (this._searchView.showingLastSearchResult())
            this._searchView.jumpToFirstSearchResult();
        else
            this._searchView.jumpToNextSearchResult();
        WebInspector.searchController.updateCurrentMatchIndex(this._searchView.currentSearchResultIndex, this);
    },

    jumpToPreviousSearchResult: function()
    {
        if (!this._searchView)
            return;

        if (this._searchView !== this.visibleView) {
            this.performSearch(this._searchQuery);
            if (this._searchView)
                this._searchView.jumpToLastSearchResult();
            return;
        }

        if (this._searchView.showingFirstSearchResult())
            this._searchView.jumpToLastSearchResult();
        else
            this._searchView.jumpToPreviousSearchResult();
        WebInspector.searchController.updateCurrentMatchIndex(this._searchView.currentSearchResultIndex, this);
    },

    _toggleFormatSource: function()
    {
        this._toggleFormatSourceButton.toggled = !this._toggleFormatSourceButton.toggled;
        this._presentationModel.setFormatSource(this._toggleFormatSourceButton.toggled);
    },

    addToWatch: function(expression)
    {
        this.sidebarPanes.watchExpressions.addExpression(expression);
    }
}

WebInspector.ScriptsPanel.prototype.__proto__ = WebInspector.Panel.prototype;

/**
 * @interface
 */
WebInspector.ScriptsPanel.FileSelector = function() { }

WebInspector.ScriptsPanel.FileSelector.Events = {
    FileSelected: "FileSelected",
    ReleasedFocusAfterSelection: "ReleasedFocusAfterSelection"
}

WebInspector.ScriptsPanel.FileSelector.prototype = {
    /**
     * @type {Element}
     */
    get defaultFocusedElement() { },

    /**
     * @param {Element} element
     */
    show: function(element) { },

    /**
     * @param {WebInspector.UISourceCode} uiSourceCode
     */
    addUISourceCode: function(uiSourceCode) { },

    /**
     * @param {WebInspector.UISourceCode} uiSourceCode
     * @return {boolean}
     */
    isScriptSourceAdded: function(uiSourceCode) { },

    /**
     * @param {WebInspector.UISourceCode} uiSourceCode
     */
    revealUISourceCode: function(uiSourceCode) { },

    /**
     * @param {WebInspector.UISourceCode} uiSourceCode
     * @param {boolean} isDirty
     */
    setScriptSourceIsDirty: function(uiSourceCode, isDirty) { },

    /**
     * @param {Array.<WebInspector.UISourceCode>} oldUISourceCodeList
     * @param {Array.<WebInspector.UISourceCode>} uiSourceCodeList
     */
    replaceUISourceCodes: function(oldUISourceCodeList, uiSourceCodeList) { },

    reset: function() { }
}

/**
 * @interface
 */
WebInspector.EditorContainer = function() { }

WebInspector.EditorContainer.Events = {
    EditorSelected: "EditorSelected",
    EditorClosed: "EditorClosed"
}

WebInspector.EditorContainer.prototype = {
    /**
     * @type {WebInspector.SourceFrame}
     */
    get visibleView() { },

    /**
     * @param {Element} element
     */
    show: function(element) { },

    /**
     * @param {WebInspector.UISourceCode} uiSourceCode
     */
    showFile: function(uiSourceCode) { },

    /**
     * @param {WebInspector.UISourceCode} uiSourceCode
     * @param {boolean} isDirty
     */
    setFileIsDirty: function(uiSourceCode, isDirty) { },

    /**
     * @param {WebInspector.UISourceCode} uiSourceCode
     */
    uiSourceCodeAdded: function(uiSourceCode) { },

    /**
     * @param {Array.<WebInspector.UISourceCode>} oldUISourceCodeList
     * @param {Array.<WebInspector.UISourceCode>} uiSourceCodeList
     */
    replaceFiles: function(oldUISourceCodeList, uiSourceCodeList) { },

    reset: function() { }
}

/**
 * @interface
 */
WebInspector.EditorContainerDelegate = function() { }

WebInspector.EditorContainerDelegate.prototype = {
    /**
     * @param {WebInspector.UISourceCode} uiSourceCode
     * @return {WebInspector.SourceFrame}
     */
    viewForFile: function(uiSourceCode) { }
}

/**
 * @implements {WebInspector.ScriptsPanel.FileSelector}
 * @extends {WebInspector.Object}
 * @constructor
 */
WebInspector.ScriptsPanel.ComboBoxFileSelector = function()
{
    WebInspector.Object.call(this);
    this.editorToolbar = this._createEditorToolbar();

    WebInspector.settings.showScriptFolders.addChangeListener(this._showScriptFoldersSettingChanged.bind(this));

    this._backForwardList = [];
}

WebInspector.ScriptsPanel.ComboBoxFileSelector.prototype = {
    get defaultFocusedElement()
    {
        return this._filesSelectElement;
    },

    /**
     * @param {Element} element
     */
    show: function(element)
    {
        element.appendChild(this.editorToolbar);
    },

    /**
     * @param {WebInspector.UISourceCode} uiSourceCode
     */
    addUISourceCode: function(uiSourceCode)
    {
        if (uiSourceCode._option)
            return;

        this._addOptionToFilesSelect(uiSourceCode);
    },

    /**
     * @param {WebInspector.UISourceCode} uiSourceCode
     * @return {boolean}
     */
    isScriptSourceAdded: function(uiSourceCode)
    {
        return !!uiSourceCode._option;
    },

    /**
     * @param {WebInspector.UISourceCode} uiSourceCode
     */
    revealUISourceCode: function(uiSourceCode)
    {
        if (this._filesSelectElement.selectedIndex === uiSourceCode._option.index)
            return;
        this._innerRevealUISourceCode(uiSourceCode, true);
    },

    /**
     * @param {WebInspector.UISourceCode} uiSourceCode
     * @param {boolean} addToHistory
     */
    _innerRevealUISourceCode: function(uiSourceCode, addToHistory)
    {
        if (!uiSourceCode._option)
            return;

        if (addToHistory)
            this._addToHistory(uiSourceCode);

        this._updateBackAndForwardButtons();
        this._filesSelectElement.selectedIndex = uiSourceCode._option.index;
        this.dispatchEventToListeners(WebInspector.ScriptsPanel.FileSelector.Events.FileSelected, uiSourceCode);
    },

    /**
     * @param {WebInspector.UISourceCode} uiSourceCode
     */
    _addToHistory: function(uiSourceCode)
    {
        var oldIndex = this._currentBackForwardIndex;
        if (oldIndex >= 0)
            this._backForwardList.splice(oldIndex + 1, this._backForwardList.length - oldIndex);

        // Check for a previous entry of the same object in _backForwardList. If one is found, remove it.
        var previousEntryIndex = this._backForwardList.indexOf(uiSourceCode);
        if (previousEntryIndex !== -1)
            this._backForwardList.splice(previousEntryIndex, 1);

        this._backForwardList.push(uiSourceCode);
        this._currentBackForwardIndex = this._backForwardList.length - 1;
    },

    /**
     * @param {Array.<WebInspector.UISourceCode>} oldUISourceCodeList
     * @param {Array.<WebInspector.UISourceCode>} uiSourceCodeList
     */
    replaceUISourceCodes: function(oldUISourceCodeList, uiSourceCodeList)
    {
        var selected = false;
        var added = false;
        var selectedOption = this._filesSelectElement[this._filesSelectElement.selectedIndex];
        var selectedUISourceCode = selectedOption ? selectedOption._uiSourceCode : null;
        for (var i = 0; i < oldUISourceCodeList.length; ++i) {
            var uiSourceCode = oldUISourceCodeList[i];
            var option = uiSourceCode._option;
            if (!option)
                continue;
            added = true;

            // FIXME: find out why we are getting here with option detached.
            if (this._filesSelectElement === option.parentElement)
                this._filesSelectElement.removeChild(option);

            if (selectedUISourceCode === oldUISourceCodeList[i])
                selected = true;
        }

        if (!added)
            return;

        for (var i = 0; i < uiSourceCodeList.length; ++i)
            this._addOptionToFilesSelect(uiSourceCodeList[i]);

        if (selected)
            this._filesSelectElement.selectedIndex = uiSourceCodeList[0]._option.index;
    },

    _showScriptFoldersSettingChanged: function()
    {
        var selectedOption = this._filesSelectElement[this._filesSelectElement.selectedIndex];
        var uiSourceCode = selectedOption ? selectedOption._uiSourceCode : null;

        var options = Array.prototype.slice.call(this._filesSelectElement);
        this._resetFilesSelect();
        for (var i = 0; i < options.length; ++i) {
            if (options[i]._uiSourceCode)
                this._addOptionToFilesSelect(options[i]._uiSourceCode);
        }

        if (uiSourceCode) {
            var index = uiSourceCode._option.index;
            if (typeof index === "number")
                this._filesSelectElement.selectedIndex = index;
        }
    },

    reset: function()
    {
        this._backForwardList = [];
        this._currentBackForwardIndex = -1;
        this._updateBackAndForwardButtons();
        this._resetFilesSelect();
    },

    /**
     * @param {WebInspector.UISourceCode} uiSourceCode
     * @param {boolean} isDirty
     */
    setScriptSourceIsDirty: function(uiSourceCode, isDirty)
    {
        var option = uiSourceCode._option;
        if (!option)
            return;
        if (isDirty)
            option.text = option.text.replace(/[^*]$/, "$&*");
        else
            option.text = option.text.replace(/[*]$/, "");
    },

    /**
     * @return {Element}
     */
    _createEditorToolbar: function()
    {
        var editorToolbar = document.createElement("div");
        editorToolbar.className = "status-bar";
        editorToolbar.id = "scripts-editor-toolbar";

        this.backButton = document.createElement("button");
        this.backButton.className = "status-bar-item";
        this.backButton.id = "scripts-back";
        this.backButton.title = WebInspector.UIString("Show the previous script resource.");
        this.backButton.disabled = true;
        this.backButton.appendChild(document.createElement("img"));
        this.backButton.addEventListener("click", this._goBack.bind(this), false);
        editorToolbar.appendChild(this.backButton);

        this.forwardButton = document.createElement("button");
        this.forwardButton.className = "status-bar-item";
        this.forwardButton.id = "scripts-forward";
        this.forwardButton.title = WebInspector.UIString("Show the next script resource.");
        this.forwardButton.disabled = true;
        this.forwardButton.appendChild(document.createElement("img"));
        this.forwardButton.addEventListener("click", this._goForward.bind(this), false);
        editorToolbar.appendChild(this.forwardButton);

        this._filesSelectElement = document.createElement("select");
        this._filesSelectElement.className = "status-bar-item";
        this._filesSelectElement.id = "scripts-files";
        this._filesSelectElement.addEventListener("change", this._filesSelectChanged.bind(this, true), false);
        this._filesSelectElement.addEventListener("keyup", this._filesSelectChanged.bind(this, false), false);
        editorToolbar.appendChild(this._filesSelectElement);

        return editorToolbar;
    },

    /**
     * @param {WebInspector.UISourceCode} uiSourceCode
     */
    _addOptionToFilesSelect: function(uiSourceCode)
    {
        var showScriptFolders = WebInspector.settings.showScriptFolders.get();

        var select = this._filesSelectElement;
        if (!select.domainOptions)
            select.domainOptions = {};
        if (!select.folderOptions)
            select.folderOptions = {};

        var option = document.createElement("option");
        var parsedURL = uiSourceCode.url.asParsedURL();

        const indent = WebInspector.isMac() ? "" : "\u00a0\u00a0\u00a0\u00a0";

        option.displayName = uiSourceCode.displayName;

        var contentScriptPrefix = uiSourceCode.isContentScript ? "2:" : "0:";
        var folderName = uiSourceCode.folderName;
        var domain = uiSourceCode.domain;

        if (uiSourceCode.isContentScript && domain) {
            // Render extension domain as a path in structured view
            folderName = domain + (folderName ? folderName : "");
            domain = "";
        }

        var folderNameForSorting = contentScriptPrefix + (domain ? domain + "\t\t" : "") + folderName;

        if (showScriptFolders) {
            option.text = indent + uiSourceCode.displayName;
            option.nameForSorting = folderNameForSorting + "\t/\t" + uiSourceCode.fileName; // Use '\t' to make files stick to their folder.
        } else {
            option.text = uiSourceCode.displayName;
            // Content script should contain its domain name as a prefix
            if (uiSourceCode.isContentScript && folderName)
                option.text = folderName + "/" + option.text;
            option.nameForSorting = contentScriptPrefix + option.text;
        }
        option.title = uiSourceCode.url;

        if (uiSourceCode.isContentScript)
            option.addStyleClass("extension-script");

        function insertOrdered(option)
        {
            function optionCompare(a, b)
            {
                return a.nameForSorting.localeCompare(b.nameForSorting);
            }
            var insertionIndex = insertionIndexForObjectInListSortedByFunction(option, select.childNodes, optionCompare);
            var showsNothing = select.selectedIndex === -1;
            select.insertBefore(option, insertionIndex < 0 ? null : select.childNodes.item(insertionIndex));
            if (showsNothing)
                select.selectedIndex = -1;
        }

        insertOrdered(option);

        if (uiSourceCode.isContentScript && !select.contentScriptSection) {
            var contentScriptSection = document.createElement("option");
            contentScriptSection.text = "\u2014 " + WebInspector.UIString("Content scripts") + " \u2014";
            contentScriptSection.disabled = true;
            contentScriptSection.nameForSorting = "1/ContentScriptSeparator";
            select.contentScriptSection = contentScriptSection;
            insertOrdered(contentScriptSection);
        }

        if (showScriptFolders && !uiSourceCode.isContentScript && domain && !select.domainOptions[domain]) {
            var domainOption = document.createElement("option");
            domainOption.text = "\u2014 " + domain + " \u2014";
            domainOption.nameForSorting = "0:" + domain;
            domainOption.disabled = true;
            select.domainOptions[domain] = domainOption;
            insertOrdered(domainOption);
        }

        if (showScriptFolders && folderName && !select.folderOptions[folderNameForSorting]) {
            var folderOption = document.createElement("option");
            folderOption.text = folderName;
            folderOption.nameForSorting = folderNameForSorting;
            folderOption.disabled = true;
            select.folderOptions[folderNameForSorting] = folderOption;
            insertOrdered(folderOption);
        }

        option._uiSourceCode = uiSourceCode;
        uiSourceCode._option = option;
    },

    _resetFilesSelect: function()
    {
        this._filesSelectElement.removeChildren();
        this._filesSelectElement.domainOptions = {};
        this._filesSelectElement.folderOptions = {};
        delete this._filesSelectElement.contentScriptSection;
    },

    _updateBackAndForwardButtons: function()
    {
        this.backButton.disabled = this._currentBackForwardIndex <= 0;
        this.forwardButton.disabled = this._currentBackForwardIndex >= (this._backForwardList.length - 1);
    },

    _goBack: function()
    {
        if (this._currentBackForwardIndex <= 0) {
            console.error("Can't go back from index " + this._currentBackForwardIndex);
            return;
        }

        var uiSourceCode = this._backForwardList[--this._currentBackForwardIndex];
        this._innerRevealUISourceCode(uiSourceCode, false);
    },

    _goForward: function()
    {
        if (this._currentBackForwardIndex >= this._backForwardList.length - 1) {
            console.error("Can't go forward from index " + this._currentBackForwardIndex);
            return;
        }

        var uiSourceCode = this._backForwardList[++this._currentBackForwardIndex];
        this._innerRevealUISourceCode(uiSourceCode, false);
    },

    /**
     * @param {boolean} focusSource
     */
    _filesSelectChanged: function(focusSource)
    {
        if (this._filesSelectElement.selectedIndex === -1)
            return;

        var uiSourceCode = this._filesSelectElement[this._filesSelectElement.selectedIndex]._uiSourceCode;
        this._innerRevealUISourceCode(uiSourceCode, true);
        if (focusSource)
            this.dispatchEventToListeners(WebInspector.ScriptsPanel.FileSelector.Events.ReleasedFocusAfterSelection, uiSourceCode);
    }
}

WebInspector.ScriptsPanel.ComboBoxFileSelector.prototype.__proto__ = WebInspector.Object.prototype;

/**
 * @implements {WebInspector.EditorContainer}
 * @extends {WebInspector.Object}
 * @constructor
 * @param {WebInspector.EditorContainerDelegate} delegate
 */
WebInspector.ScriptsPanel.SingleFileEditorContainer = function(delegate)
{
    this._delegate = delegate;
    this.element = document.createElement("div");
    this.element.className = "scripts-views-container";
}

WebInspector.ScriptsPanel.SingleFileEditorContainer.prototype = {
    /**
     * @type {WebInspector.SourceFrame}
     */
    get visibleView()
    {
        return this._currentSourceFrame;
    },

    /**
     * @param {Element} element
     */
    show: function(element)
    {
        element.appendChild(this.element);
    },

    /**
     * @param {WebInspector.UISourceCode} uiSourceCode
     */
    showFile: function(uiSourceCode)
    {
        var sourceFrame = this._delegate.viewForFile(uiSourceCode);
        if (this._currentSourceFrame === sourceFrame)
            return;

        this._innerShowFile(uiSourceCode, true);
    },

    /**
     * @param {WebInspector.UISourceCode} uiSourceCode
     * @param {boolean} userGesture
     */
    _innerShowFile: function(uiSourceCode, userGesture)
    {
        if (this._currentSourceFrame)
            this._currentSourceFrame.detach();

        this._initialViewSelectionProcessed = true;

        var sourceFrame = this._delegate.viewForFile(uiSourceCode);
        this._currentSourceFrame = sourceFrame;
        this._currentFile = uiSourceCode;

        if (userGesture) {
            this._userSelectedFiles = true;
            WebInspector.settings.lastViewedScriptFile.set(uiSourceCode.url);
        }

        if (sourceFrame)
            sourceFrame.show(this.element);
        this.dispatchEventToListeners(WebInspector.EditorContainer.Events.EditorSelected, uiSourceCode);
    },

    /**
     * @param {WebInspector.UISourceCode} uiSourceCode
     */
    uiSourceCodeAdded: function(uiSourceCode)
    {
        var lastViewedURL = WebInspector.settings.lastViewedScriptFile.get();
        // Show first file that was added or file with the last viewed url.
        if (this._userSelectedFiles)
            return;
        if (uiSourceCode.url === lastViewedURL || !this._initialViewSelectionProcessed)
            this._innerShowFile(uiSourceCode, false);
    },

    /**
     * @param {WebInspector.UISourceCode} uiSourceCode
     * @param {boolean} isDirty
     */
    setFileIsDirty: function(uiSourceCode, isDirty)
    {
        // Do nothing.
    },

    /**
     * @param {Array.<WebInspector.UISourceCode>} oldUISourceCodeList
     * @param {Array.<WebInspector.UISourceCode>} uiSourceCodeList
     */
    replaceFiles: function(oldUISourceCodeList, uiSourceCodeList)
    {
        if (oldUISourceCodeList.indexOf(this._currentFile) !== -1)
            this.showFile(uiSourceCodeList[0]);
    },

    reset: function()
    {
        if (this._currentSourceFrame)
            this._currentSourceFrame.detach();
        this._currentSourceFrame = null;
        this._currentFile = null;
        delete this._initialViewSelectionProcessed;
        delete this._userSelectedFiles;
    }
}

WebInspector.ScriptsPanel.SingleFileEditorContainer.prototype.__proto__ = WebInspector.Object.prototype;
