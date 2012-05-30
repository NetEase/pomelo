/*
 * Copyright (C) 2006, 2007, 2008 Apple Inc.  All rights reserved.
 * Copyright (C) 2007 Matt Lilek (pewtermoose@gmail.com).
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

var WebInspector = {
    _createPanels: function()
    {
        this.panels = {};
        WebInspector.inspectorView = new WebInspector.InspectorView();
        var parentElement = document.getElementById("main");
        WebInspector.inspectorView.show(parentElement);
        WebInspector.inspectorView.addEventListener(WebInspector.InspectorView.Events.PanelSelected, this._panelSelected, this);

        if (WebInspector.WorkerManager.isWorkerFrontend()) {
            this.panels.scripts = new WebInspector.ScriptsPanel(this.debuggerPresentationModel);
            this.panels.timeline = new WebInspector.TimelinePanel();
            this.panels.profiles = new WebInspector.ProfilesPanel();
            this.panels.console = new WebInspector.ConsolePanel();
            return;
        }
        var hiddenPanels = (InspectorFrontendHost.hiddenPanels() || "").split(',');
        							/**
        if (hiddenPanels.indexOf("elements") === -1)
            this.panels.elements = new WebInspector.ElementsPanel();
        if (hiddenPanels.indexOf("resources") === -1)
            this.panels.resources = new WebInspector.ResourcesPanel();
        if (hiddenPanels.indexOf("network") === -1)
            this.panels.network = new WebInspector.NetworkPanel();
        if (hiddenPanels.indexOf("scripts") === -1)
            this.panels.scripts = new WebInspector.ScriptsPanel(this.debuggerPresentationModel);
        if (hiddenPanels.indexOf("timeline") === -1)
            this.panels.timeline = new WebInspector.TimelinePanel();
            if (hiddenPanels.indexOf("audits") === -1)
            this.panels.audits = new WebInspector.AuditsPanel();
        if (hiddenPanels.indexOf("console") === -1)
            this.panels.console = new WebInspector.ConsolePanel();
            				*/
        if (hiddenPanels.indexOf("profiles") === -1)
            this.panels.profiles = new WebInspector.ProfilesPanel();
        
    },

    _panelSelected: function()
    {
        this._toggleConsoleButton.disabled = WebInspector.inspectorView.currentPanel() === WebInspector.panels.console;
    },

    _createGlobalStatusBarItems: function()
    {
        this._dockToggleButton = new WebInspector.StatusBarButton(this._dockButtonTitle(), "dock-status-bar-item");
        this._dockToggleButton.addEventListener("click", this._toggleAttach.bind(this), false);
        this._dockToggleButton.toggled = !this.attached;
        WebInspector.updateDockToggleButton();

        this._settingsButton = new WebInspector.StatusBarButton(WebInspector.UIString("Settings"), "settings-status-bar-item");
        this._settingsButton.addEventListener("click", this._toggleSettings.bind(this), false);

        var anchoredStatusBar = document.getElementById("anchored-status-bar-items");
        anchoredStatusBar.appendChild(this._dockToggleButton.element);

        this._toggleConsoleButton = new WebInspector.StatusBarButton(WebInspector.UIString("Show console."), "console-status-bar-item");
        this._toggleConsoleButton.addEventListener("click", this._toggleConsoleButtonClicked.bind(this), false);
        anchoredStatusBar.appendChild(this._toggleConsoleButton.element);

        if (this.panels.elements)
            anchoredStatusBar.appendChild(this.panels.elements.nodeSearchButton.element);
        anchoredStatusBar.appendChild(this._settingsButton.element);
    },

    _dockButtonTitle: function()
    {
        return this.attached ? WebInspector.UIString("Undock into separate window.") : WebInspector.UIString("Dock to main window.");
    },

    _toggleAttach: function()
    {
        if (!this._attached) {
            InspectorFrontendHost.requestAttachWindow();
            WebInspector.userMetrics.WindowDocked.record();
        } else {
            InspectorFrontendHost.requestDetachWindow();
            WebInspector.userMetrics.WindowUndocked.record();
        }
    },

    _toggleConsoleButtonClicked: function()
    {
        if (this._toggleConsoleButton.disabled)
            return;

        this._toggleConsoleButton.toggled = !this._toggleConsoleButton.toggled;

        var animationType = window.event && window.event.shiftKey ? WebInspector.Drawer.AnimationType.Slow : WebInspector.Drawer.AnimationType.Normal;
        if (this._toggleConsoleButton.toggled) {
            this._toggleConsoleButton.title = WebInspector.UIString("Hide console.");
            this.drawer.show(this.consoleView, animationType);
            this._consoleWasShown = true;
        } else {
            this._toggleConsoleButton.title = WebInspector.UIString("Show console.");
            this.drawer.hide(animationType);
            delete this._consoleWasShown;
        }
    },

    closeDrawerView: function()
    {
        // Once drawer is closed console should be shown if it was shown before current view replaced it in drawer. 
        if (!this._consoleWasShown)
            this.drawer.hide(WebInspector.Drawer.AnimationType.Immediately);
        else
            this._toggleConsoleButtonClicked();            
    },

    /**
     * @param {WebInspector.View} view
     */
    showViewInDrawer: function(view)
    {
        this._toggleConsoleButton.title = WebInspector.UIString("Hide console.");
        this._toggleConsoleButton.toggled = false;
        this.drawer.show(view, WebInspector.Drawer.AnimationType.Immediately);
    },

    _toggleSettings: function()
    {
        this._settingsButton.toggled = !this._settingsButton.toggled;
        if (this._settingsButton.toggled)
            this._showSettingsScreen();
        else
            this._hideSettingsScreen();
    },

    _showSettingsScreen: function()
    {
        function onhide()
        {
            this._settingsButton.toggled = false;
            delete this._settingsScreen;
        }

        if (!this._settingsScreen) {
            this._settingsScreen = new WebInspector.SettingsScreen();
            this._settingsScreen.show(onhide.bind(this));
        }
    },

    _hideSettingsScreen: function()
    {
        if (this._settingsScreen)
            this._settingsScreen.hide();
    },

    get attached()
    {
        return this._attached;
    },

    set attached(x)
    {
        if (this._attached === x)
            return;

        this._attached = x;

        if (this._dockToggleButton) {
            this._dockToggleButton.title = this._dockButtonTitle();
            this._dockToggleButton.toggled = !x;
        }

        if (x)
            document.body.removeStyleClass("detached");
        else
            document.body.addStyleClass("detached");

        this._setCompactMode(x && !WebInspector.settings.dockToRight.get());
    },

    isCompactMode: function()
    {
        return this.attached && !WebInspector.settings.dockToRight.get();
    },

    _setCompactMode: function(x)
    {
        var body = document.body;
        if (x)
            body.addStyleClass("compact");
        else
            body.removeStyleClass("compact");

        // This may be called before doLoadedDone, hence the bulk of inspector objects may
        // not be created yet.
        if (WebInspector.toolbar)
            WebInspector.toolbar.compact = x;

        if (WebInspector.searchController)
            WebInspector.searchController.updateSearchLabel();

        if (WebInspector.drawer)
            WebInspector.drawer.resize();
    },

    _updateErrorAndWarningCounts: function()
    {
        var errorWarningElement = document.getElementById("error-warning-count");
        if (!errorWarningElement)
            return;

        var errors = WebInspector.console.errors;
        var warnings = WebInspector.console.warnings;
        if (!errors && !warnings) {
            errorWarningElement.addStyleClass("hidden");
            return;
        }

        errorWarningElement.removeStyleClass("hidden");

        errorWarningElement.removeChildren();

        if (errors) {
            var errorImageElement = document.createElement("img");
            errorImageElement.id = "error-count-img";
            errorWarningElement.appendChild(errorImageElement);
            var errorElement = document.createElement("span");
            errorElement.id = "error-count";
            errorElement.textContent = errors;
            errorWarningElement.appendChild(errorElement);
        }

        if (warnings) {
            var warningsImageElement = document.createElement("img");
            warningsImageElement.id = "warning-count-img";
            errorWarningElement.appendChild(warningsImageElement);
            var warningsElement = document.createElement("span");
            warningsElement.id = "warning-count";
            warningsElement.textContent = warnings;
            errorWarningElement.appendChild(warningsElement);
        }

        if (errors) {
            if (warnings) {
                if (errors == 1) {
                    if (warnings == 1)
                        errorWarningElement.title = WebInspector.UIString("%d error, %d warning", errors, warnings);
                    else
                        errorWarningElement.title = WebInspector.UIString("%d error, %d warnings", errors, warnings);
                } else if (warnings == 1)
                    errorWarningElement.title = WebInspector.UIString("%d errors, %d warning", errors, warnings);
                else
                    errorWarningElement.title = WebInspector.UIString("%d errors, %d warnings", errors, warnings);
            } else if (errors == 1)
                errorWarningElement.title = WebInspector.UIString("%d error", errors);
            else
                errorWarningElement.title = WebInspector.UIString("%d errors", errors);
        } else if (warnings == 1)
            errorWarningElement.title = WebInspector.UIString("%d warning", warnings);
        else if (warnings)
            errorWarningElement.title = WebInspector.UIString("%d warnings", warnings);
        else
            errorWarningElement.title = null;
    },

    networkResourceById: function(id)
    {
        return this.panels.network.resourceById(id);
    },

    get inspectedPageDomain()
    {
        var parsedURL = WebInspector.inspectedPageURL && WebInspector.inspectedPageURL.asParsedURL();
        return parsedURL ? parsedURL.host : "";
    },

    _initializeCapability: function(name, callback, error, result)
    {
        Capabilities[name] = result;
        if (callback)
            callback();
    },

    _zoomIn: function()
    {
        ++this._zoomLevel;
        this._requestZoom();
    },

    _zoomOut: function()
    {
        --this._zoomLevel;
        this._requestZoom();
    },

    _resetZoom: function()
    {
        this._zoomLevel = 0;
        this._requestZoom();
    },

    _requestZoom: function()
    {
        WebInspector.settings.zoomLevel.set(this._zoomLevel);
        InspectorFrontendHost.setZoomFactor(Math.pow(1.2, this._zoomLevel));
    }
}

WebInspector.Events = {
    InspectorClosing: "InspectorClosing"
}

{(function parseQueryParameters()
{
    WebInspector.queryParamsObject = {};
    var queryParams = window.location.search;
    if (!queryParams)
        return;
    var params = queryParams.substring(1).split("&");
    for (var i = 0; i < params.length; ++i) {
        var pair = params[i].split("=");
        WebInspector.queryParamsObject[pair[0]] = pair[1];
    }
})();}

WebInspector.loaded = function()
{
    InspectorBackend.loadFromJSONIfNeeded();
    if ("page" in WebInspector.queryParamsObject) {
        var page = WebInspector.queryParamsObject.page;
        var host = "host" in WebInspector.queryParamsObject ? WebInspector.queryParamsObject.host : window.location.host;
        WebInspector.socket = new WebSocket("ws://" + host + "/devtools/page/" + page);
        WebInspector.socket.onmessage = function(message) { InspectorBackend.dispatch(message.data); }
        WebInspector.socket.onerror = function(error) { console.error(error); }
        WebInspector.socket.onopen = function() {
            InspectorFrontendHost.sendMessageToBackend = WebInspector.socket.send.bind(WebInspector.socket);
            WebInspector.doLoadedDone();
        }
        return;
    }
    WebInspector.doLoadedDone();
}

WebInspector.doLoadedDone = function()
{
    // Install styles and themes
    WebInspector.installPortStyles();
    if (WebInspector.socket)
        document.body.addStyleClass("remote");

    if (WebInspector.queryParamsObject.toolbarColor && WebInspector.queryParamsObject.textColor)
        WebInspector.setToolbarColors(WebInspector.queryParamsObject.toolbarColor, WebInspector.queryParamsObject.textColor);

    InspectorFrontendHost.loaded();
    WebInspector.WorkerManager.loaded();

    DebuggerAgent.causesRecompilation(WebInspector._initializeCapability.bind(WebInspector, "debuggerCausesRecompilation", null));
    DebuggerAgent.supportsNativeBreakpoints(WebInspector._initializeCapability.bind(WebInspector, "nativeInstrumentationEnabled", null));
    ProfilerAgent.causesRecompilation(WebInspector._initializeCapability.bind(WebInspector, "profilerCausesRecompilation", null));
    ProfilerAgent.isSampling(WebInspector._initializeCapability.bind(WebInspector, "samplingCPUProfiler", null));
    ProfilerAgent.hasHeapProfiler(WebInspector._initializeCapability.bind(WebInspector, "heapProfilerPresent", WebInspector._doLoadedDoneWithCapabilities.bind(WebInspector)));
}

WebInspector._doLoadedDoneWithCapabilities = function()
{
    WebInspector.shortcutsScreen = new WebInspector.ShortcutsScreen();
    this._registerShortcuts();

    // set order of some sections explicitly
    WebInspector.shortcutsScreen.section(WebInspector.UIString("Console"));
    WebInspector.shortcutsScreen.section(WebInspector.UIString("Elements Panel"));

    this.console = new WebInspector.ConsoleModel();
    this.console.addEventListener(WebInspector.ConsoleModel.Events.ConsoleCleared, this._updateErrorAndWarningCounts, this);
    this.console.addEventListener(WebInspector.ConsoleModel.Events.MessageAdded, this._updateErrorAndWarningCounts, this);
    this.console.addEventListener(WebInspector.ConsoleModel.Events.RepeatCountUpdated, this._updateErrorAndWarningCounts, this);

    this.debuggerModel = new WebInspector.DebuggerModel();
    this.snippetsModel = new WebInspector.SnippetsModel();
    this.debuggerPresentationModel = new WebInspector.DebuggerPresentationModel();

    this.drawer = new WebInspector.Drawer();
    this.consoleView = new WebInspector.ConsoleView(WebInspector.WorkerManager.isWorkerFrontend());

    this.networkManager = new WebInspector.NetworkManager();
    this.resourceTreeModel = new WebInspector.ResourceTreeModel(this.networkManager);
    this.networkLog = new WebInspector.NetworkLog();
    this.domAgent = new WebInspector.DOMAgent();
    new WebInspector.JavaScriptContextManager(this.resourceTreeModel, this.consoleView);

    InspectorBackend.registerInspectorDispatcher(this);

    this.cssModel = new WebInspector.CSSStyleModel();
    this.timelineManager = new WebInspector.TimelineManager();
    InspectorBackend.registerDatabaseDispatcher(new WebInspector.DatabaseDispatcher());
    InspectorBackend.registerDOMStorageDispatcher(new WebInspector.DOMStorageDispatcher());

    this.searchController = new WebInspector.SearchController();
    this.advancedSearchController = new WebInspector.AdvancedSearchController();

    if (Capabilities.nativeInstrumentationEnabled)
        this.domBreakpointsSidebarPane = new WebInspector.DOMBreakpointsSidebarPane();

    this._zoomLevel = WebInspector.settings.zoomLevel.get();
    if (this._zoomLevel)
        this._requestZoom();

    WebInspector.CSSCompletions.requestCSSNameCompletions();
    this._createPanels();
    this._createGlobalStatusBarItems();

    this.toolbar = new WebInspector.Toolbar();
    WebInspector._installDockToRight();

    for (var panelName in this.panels)
        this.addPanel(this.panels[panelName]);

    this.addMainEventListeners(document);

    window.addEventListener("resize", this.windowResize.bind(this), true);

    var errorWarningCount = document.getElementById("error-warning-count");
    errorWarningCount.addEventListener("click", this.showConsole.bind(this), false);
    this._updateErrorAndWarningCounts();

    var autoselectPanel = WebInspector.UIString("a panel chosen automatically");
    var openAnchorLocationSetting = WebInspector.settings.createSetting("openLinkHandler", autoselectPanel);
    this.openAnchorLocationRegistry = new WebInspector.HandlerRegistry(openAnchorLocationSetting);
    this.openAnchorLocationRegistry.registerHandler(autoselectPanel, function() { return false; });

    this.extensionServer.initExtensions();

    this.console.enableAgent();

    function showInitialPanel()
    {
        if (!WebInspector.inspectorView.currentPanel())
            WebInspector.showPanel(WebInspector.settings.lastActivePanel.get());
    }

    InspectorAgent.enable(showInitialPanel);
    DatabaseAgent.enable();
    DOMStorageAgent.enable();

    if (WebInspector.settings.showPaintRects.get())
        PageAgent.setShowPaintRects(true);

    WebInspector.WorkerManager.loadCompleted();
    InspectorFrontendAPI.loadCompleted();
}

WebInspector._installDockToRight = function()
{
    // Re-use Settings infrastructure for the dock-to-right settings UI
    WebInspector.settings.dockToRight.set(WebInspector.queryParamsObject.dockSide === "right");

    if (WebInspector.settings.dockToRight.get())
        document.body.addStyleClass("dock-to-right");

    if (WebInspector.attached)
        WebInspector._setCompactMode(!WebInspector.settings.dockToRight.get());

    WebInspector.settings.dockToRight.addChangeListener(listener.bind(this));

    function listener(event)
    {
        var value = WebInspector.settings.dockToRight.get();
        if (value) {
            InspectorFrontendHost.requestSetDockSide("right");
            document.body.addStyleClass("dock-to-right");
        } else {
            InspectorFrontendHost.requestSetDockSide("bottom");
            document.body.removeStyleClass("dock-to-right");
        }
        if (WebInspector.attached)
            WebInspector._setCompactMode(!value);
    }
}

WebInspector.addPanel = function(panel)
{
    WebInspector.inspectorView.addPanel(panel);
}

var windowLoaded = function()
{
    var localizedStringsURL = InspectorFrontendHost.localizedStringsURL();
    if (localizedStringsURL) {
        var localizedStringsScriptElement = document.createElement("script");
        localizedStringsScriptElement.addEventListener("load", WebInspector.loaded.bind(WebInspector), false);
        localizedStringsScriptElement.type = "text/javascript";
        localizedStringsScriptElement.src = localizedStringsURL;
        document.head.appendChild(localizedStringsScriptElement);
    } else
        WebInspector.loaded();

    WebInspector.setAttachedWindow(WebInspector.queryParamsObject.docked === "true");

    window.removeEventListener("DOMContentLoaded", windowLoaded, false);
    delete windowLoaded;
};

window.addEventListener("DOMContentLoaded", windowLoaded, false);

// We'd like to enforce asynchronous interaction between the inspector controller and the frontend.
// It is needed to prevent re-entering the backend code.
// Also, native dispatches do not guarantee setTimeouts to be serialized, so we
// enforce serialization using 'messagesToDispatch' queue. It is also important that JSC debugger
// tests require that each command was dispatch within individual timeout callback, so we don't batch them.

var messagesToDispatch = [];

WebInspector.dispatchQueueIsEmpty = function() {
    return messagesToDispatch.length == 0;
}

WebInspector.dispatch = function(message) {
    messagesToDispatch.push(message);
    setTimeout(function() {
        InspectorBackend.dispatch(messagesToDispatch.shift());
    }, 0);
}

WebInspector.dispatchMessageFromBackend = function(messageObject)
{
    WebInspector.dispatch(messageObject);
}

WebInspector.windowResize = function(event)
{
    WebInspector.inspectorView.doResize();
    WebInspector.drawer.resize();
    WebInspector.toolbar.resize();
}

WebInspector.setAttachedWindow = function(attached)
{
    this.attached = attached;
    WebInspector.updateDockToggleButton();
}

WebInspector.setDockingUnavailable = function(unavailable)
{
    this._isDockingUnavailable = unavailable;
    WebInspector.updateDockToggleButton();
}

WebInspector.updateDockToggleButton = function()
{
    if (!this._dockToggleButton)
        return;
    this._dockToggleButton.disabled = this.attached ? false : this._isDockingUnavailable;
}

WebInspector.close = function(event)
{
    if (this._isClosing)
        return;
    this._isClosing = true;
    this.notifications.dispatchEventToListeners(WebInspector.Events.InspectorClosing);
    InspectorFrontendHost.closeWindow();
}

WebInspector.documentClick = function(event)
{
    var anchor = event.target.enclosingNodeOrSelfWithNodeName("a");
    if (!anchor || anchor.target === "_blank")
        return;

    // Prevent the link from navigating, since we don't do any navigation by following links normally.
    event.consume(true);

    function followLink()
    {
        if (WebInspector.isBeingEdited(event.target) || WebInspector._showAnchorLocation(anchor))
            return;

        const profileMatch = WebInspector.ProfileType.URLRegExp.exec(anchor.href);
        if (profileMatch) {
            WebInspector.showProfileForURL(anchor.href);
            return;
        }

        var parsedURL = anchor.href.asParsedURL();
        if (parsedURL && parsedURL.scheme === "webkit-link-action") {
            if (parsedURL.host === "show-panel") {
                var panel = parsedURL.path.substring(1);
                if (WebInspector.panels[panel])
                    WebInspector.showPanel(panel);
            }
            return;
        }

        WebInspector.showPanel("resources");
    }

    if (WebInspector.followLinkTimeout)
        clearTimeout(WebInspector.followLinkTimeout);

    if (anchor.preventFollowOnDoubleClick) {
        // Start a timeout if this is the first click, if the timeout is canceled
        // before it fires, then a double clicked happened or another link was clicked.
        if (event.detail === 1)
            WebInspector.followLinkTimeout = setTimeout(followLink, 333);
        return;
    }

    followLink();
}

WebInspector.openResource = function(resourceURL, inResourcesPanel)
{
    var resource = WebInspector.resourceForURL(resourceURL);
    if (inResourcesPanel && resource) {
        WebInspector.showPanel("resources");
        WebInspector.panels.resources.showResource(resource);
    } else
        InspectorFrontendHost.openInNewTab(resourceURL);
}

WebInspector.openRequestInNetworkPanel = function(resource)
{
    WebInspector.showPanel("network");
    WebInspector.panels.network.revealAndHighlightResource(resource);
}

WebInspector._registerShortcuts = function()
{
    var shortcut = WebInspector.KeyboardShortcut;
    var section = WebInspector.shortcutsScreen.section(WebInspector.UIString("All Panels"));
    var keys = [
        shortcut.shortcutToString("]", shortcut.Modifiers.CtrlOrMeta),
        shortcut.shortcutToString("[", shortcut.Modifiers.CtrlOrMeta)
    ];
    section.addRelatedKeys(keys, WebInspector.UIString("Go to the panel to the left/right"));

    var keys = [
        shortcut.shortcutToString("[", shortcut.Modifiers.CtrlOrMeta | shortcut.Modifiers.Alt),
        shortcut.shortcutToString("]", shortcut.Modifiers.CtrlOrMeta | shortcut.Modifiers.Alt)
    ];
    section.addRelatedKeys(keys, WebInspector.UIString("Go back/forward in panel history"));

    section.addKey(shortcut.shortcutToString(shortcut.Keys.Esc), WebInspector.UIString("Toggle console"));
    section.addKey(shortcut.shortcutToString("f", shortcut.Modifiers.CtrlOrMeta), WebInspector.UIString("Search"));
    
    var advancedSearchShortcut = WebInspector.AdvancedSearchController.createShortcut();
    section.addKey(advancedSearchShortcut.name, WebInspector.UIString("Search across all scripts"));
    
    if (WebInspector.isMac()) {
        keys = [
            shortcut.shortcutToString("g", shortcut.Modifiers.Meta),
            shortcut.shortcutToString("g", shortcut.Modifiers.Meta | shortcut.Modifiers.Shift)
        ];
        section.addRelatedKeys(keys, WebInspector.UIString("Find next/previous"));
    }

    var goToShortcut = WebInspector.GoToLineDialog.createShortcut();
    section.addKey(goToShortcut.name, WebInspector.UIString("Go to line"));
}

WebInspector.documentKeyDown = function(event)
{
    const helpKey = WebInspector.isMac() ? "U+003F" : "U+00BF"; // "?" for both platforms

    if (event.keyIdentifier === "F1" ||
        (event.keyIdentifier === helpKey && event.shiftKey && (!WebInspector.isBeingEdited(event.target) || event.metaKey))) {
        WebInspector.shortcutsScreen.show();
        event.consume(true);
        return;
    }

    if (WebInspector.currentFocusElement() && WebInspector.currentFocusElement().handleKeyEvent) {
        WebInspector.currentFocusElement().handleKeyEvent(event);
        if (event.handled) {
            event.consume(true);
            return;
        }
    }

    if (WebInspector.inspectorView.currentPanel()) {
        WebInspector.inspectorView.currentPanel().handleShortcut(event);
        if (event.handled) {
            event.consume(true);
            return;
        }
    }

    WebInspector.searchController.handleShortcut(event);
    WebInspector.advancedSearchController.handleShortcut(event);
    if (event.handled) {
        event.consume(true);
        return;
    }

    var isMac = WebInspector.isMac();
    switch (event.keyIdentifier) {
        case "U+0052": // R key
            if ((event.metaKey && isMac) || (event.ctrlKey && !isMac)) {
                PageAgent.reload(event.shiftKey);
                event.consume(true);
            }
            break;
        case "F5":
            if (!isMac) {
                PageAgent.reload(event.ctrlKey || event.shiftKey);
                event.consume(true);
            }
            break;
    }

    var isValidZoomShortcut = WebInspector.KeyboardShortcut.eventHasCtrlOrMeta(event) &&
        !event.shiftKey &&
        !event.altKey &&
        !InspectorFrontendHost.isStub;
    switch (event.keyCode) {
        case 107: // +
        case 187: // +
            if (isValidZoomShortcut) {
                WebInspector._zoomIn();
                event.consume(true);
            }
            break;
        case 109: // -
        case 189: // -
            if (isValidZoomShortcut) {
                WebInspector._zoomOut();
                event.consume(true);
            }
            break;
        case 48: // 0
            if (isValidZoomShortcut) {
                WebInspector._resetZoom();
                event.consume(true);
            }
            break;
    }
}

WebInspector.postDocumentKeyDown = function(event)
{
    if (event.handled)
        return;

    if (event.keyIdentifier === "U+001B") { // Escape key
        // If drawer is open with some view other than console then close it.
        if (!this._toggleConsoleButton.toggled && WebInspector.drawer.visible)
            this.closeDrawerView();
        else
            this._toggleConsoleButtonClicked();
    }
}

WebInspector.documentCanCopy = function(event)
{
    if (WebInspector.inspectorView.currentPanel() && WebInspector.inspectorView.currentPanel().handleCopyEvent)
        event.preventDefault();
}

WebInspector.documentCopy = function(event)
{
    if (WebInspector.inspectorView.currentPanel() && WebInspector.inspectorView.currentPanel().handleCopyEvent)
        WebInspector.inspectorView.currentPanel().handleCopyEvent(event);
}

WebInspector.contextMenuEventFired = function(event)
{
    if (event.handled || event.target.hasStyleClass("popup-glasspane"))
        event.preventDefault();
}

WebInspector.toggleSearchingForNode = function()
{
    if (this.panels.elements) {
        this.showPanel("elements");
        this.panels.elements.toggleSearchingForNode();
    }
}

WebInspector.showConsole = function()
{
    if (WebInspector._toggleConsoleButton && !WebInspector._toggleConsoleButton.toggled)
        WebInspector._toggleConsoleButtonClicked();
}

WebInspector.showPanel = function(panel)
{
    if (!(panel in this.panels)) {
        if (WebInspector.WorkerManager.isWorkerFrontend())
            panel = "scripts";
        else
            panel = "elements";
    }
    WebInspector.inspectorView.setCurrentPanel(this.panels[panel]);
}

WebInspector.bringToFront = function()
{
    InspectorFrontendHost.bringToFront();
}

WebInspector.didCreateWorker = function()
{
    var workersPane = WebInspector.panels.scripts.sidebarPanes.workers;
    if (workersPane)
        workersPane.addWorker.apply(workersPane, arguments);
}

WebInspector.didDestroyWorker = function()
{
    var workersPane = WebInspector.panels.scripts.sidebarPanes.workers;
    if (workersPane)
        workersPane.removeWorker.apply(workersPane, arguments);
}

/**
 * @param {string=} messageLevel
 * @param {boolean=} showConsole
 */
WebInspector.log = function(message, messageLevel, showConsole)
{
    // remember 'this' for setInterval() callback
    var self = this;

    // return indication if we can actually log a message
    function isLogAvailable()
    {
        return WebInspector.ConsoleMessage && WebInspector.RemoteObject && self.console;
    }

    // flush the queue of pending messages
    function flushQueue()
    {
        var queued = WebInspector.log.queued;
        if (!queued)
            return;

        for (var i = 0; i < queued.length; ++i)
            logMessage(queued[i]);

        delete WebInspector.log.queued;
    }

    // flush the queue if it console is available
    // - this function is run on an interval
    function flushQueueIfAvailable()
    {
        if (!isLogAvailable())
            return;

        clearInterval(WebInspector.log.interval);
        delete WebInspector.log.interval;

        flushQueue();
    }

    // actually log the message
    function logMessage(message)
    {
        // post the message
        var msg = WebInspector.ConsoleMessage.create(
            WebInspector.ConsoleMessage.MessageSource.Other,
            messageLevel || WebInspector.ConsoleMessage.MessageLevel.Debug,
            message);

        self.console.addMessage(msg);
        if (showConsole)
            WebInspector.showConsole();
    }

    // if we can't log the message, queue it
    if (!isLogAvailable()) {
        if (!WebInspector.log.queued)
            WebInspector.log.queued = [];

        WebInspector.log.queued.push(message);

        if (!WebInspector.log.interval)
            WebInspector.log.interval = setInterval(flushQueueIfAvailable, 1000);

        return;
    }

    // flush the pending queue if any
    flushQueue();

    // log the message
    logMessage(message);
}

WebInspector.inspect = function(payload, hints)
{
    var object = WebInspector.RemoteObject.fromPayload(payload);
    if (object.subtype === "node") {
        // Request node from backend and focus it.
        WebInspector.inspectorView.setCurrentPanel(WebInspector.panels.elements);
        object.pushNodeToFrontend(WebInspector.updateFocusedNode.bind(WebInspector), object.release.bind(object));
        return;
    }

    if (hints.databaseId) {
        WebInspector.inspectorView.setCurrentPanel(WebInspector.panels.resources);
        WebInspector.panels.resources.selectDatabase(hints.databaseId);
    } else if (hints.domStorageId) {
        WebInspector.inspectorView.setCurrentPanel(WebInspector.panels.resources);
        WebInspector.panels.resources.selectDOMStorage(hints.domStorageId);
    }

    object.release();
}

WebInspector.updateFocusedNode = function(nodeId)
{
    this.panels.elements.revealAndSelectNode(nodeId);
}

WebInspector.populateResourceContextMenu = function(contextMenu, url, preferredLineNumber)
{
    var registry = WebInspector.openAnchorLocationRegistry;
    // Skip 0th handler, as it's 'Use default panel' one.
    for (var i = 1; i < registry.handlerNames.length; ++i) {
        var handler = registry.handlerNames[i];
        contextMenu.appendItem(WebInspector.UIString(WebInspector.useLowerCaseMenuTitles() ? "Open using %s" : "Open Using %s", handler),
            registry.dispatchToHandler.bind(registry, handler, { url: url, preferredLineNumber: preferredLineNumber }));
    }
}

WebInspector._showAnchorLocation = function(anchor)
{
    if (WebInspector.openAnchorLocationRegistry.dispatch({ url: anchor.href, lineNumber: anchor.lineNumber}))
        return true;
    var preferedPanel = this.panels[anchor.preferredPanel || "resources"];
    if (WebInspector._showAnchorLocationInPanel(anchor, preferedPanel))
        return true;
    if (preferedPanel !== this.panels.resources && WebInspector._showAnchorLocationInPanel(anchor, this.panels.resources))
        return true;
    return false;
}

WebInspector._showAnchorLocationInPanel = function(anchor, panel)
{
    if (!panel.canShowAnchorLocation(anchor))
        return false;

    // FIXME: support webkit-html-external-link links here.
    if (anchor.hasStyleClass("webkit-html-external-link")) {
        anchor.removeStyleClass("webkit-html-external-link");
        anchor.addStyleClass("webkit-html-resource-link");
    }

    this.showPanelForAnchorNavigation(panel);
    panel.showAnchorLocation(anchor);
    return true;
}

WebInspector.showPanelForAnchorNavigation = function(panel)
{
    WebInspector.searchController.disableSearchUntilExplicitAction();
    WebInspector.inspectorView.setCurrentPanel(panel);
}

WebInspector.showProfileForURL = function(url)
{
    WebInspector.showPanel("profiles");
    WebInspector.panels.profiles.showProfileForURL(url);
}

WebInspector.evaluateInConsole = function(expression, showResultOnly)
{
    this.showConsole();
    this.consoleView.evaluateUsingTextPrompt(expression, showResultOnly);
}

WebInspector.addMainEventListeners = function(doc)
{
    doc.addEventListener("keydown", this.documentKeyDown.bind(this), true);
    doc.addEventListener("keydown", this.postDocumentKeyDown.bind(this), false);
    doc.addEventListener("beforecopy", this.documentCanCopy.bind(this), true);
    doc.addEventListener("copy", this.documentCopy.bind(this), true);
    doc.addEventListener("contextmenu", this.contextMenuEventFired.bind(this), true);
    doc.addEventListener("click", this.documentClick.bind(this), true);
}

WebInspector.frontendReused = function()
{
    this.resourceTreeModel.frontendReused();
}

WebInspector._toolbarItemClicked = function(event)
{
    var toolbarItem = event.currentTarget;
    WebInspector.inspectorView.setCurrentPanel(toolbarItem.panel);
}
