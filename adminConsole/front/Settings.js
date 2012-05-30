/*
 * Copyright (C) 2009 Google Inc. All rights reserved.
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


var Preferences = {
    maxInlineTextChildLength: 80,
    minConsoleHeight: 75,
    minSidebarWidth: 100,
    minElementsSidebarWidth: 200,
    minScriptsSidebarWidth: 200,
    styleRulesExpandedState: {},
    showMissingLocalizedStrings: false,
    useLowerCaseMenuTitlesOnWindows: false,
    sharedWorkersDebugNote: undefined,
    localizeUI: true,
    exposeDisableCache: false,
    exposeWorkersInspection: false,
    applicationTitle: "Web Inspector - %s",
    showHeapSnapshotObjectsHiddenProperties: false,
    showDockToRight: false
}

var Capabilities = {
    samplingCPUProfiler: false,
    debuggerCausesRecompilation: true,
    profilerCausesRecompilation: true,
    nativeInstrumentationEnabled: false,
    heapProfilerPresent: false
}

/**
 * @constructor
 */
WebInspector.Settings = function()
{
    this._eventSupport = new WebInspector.Object();

    this.colorFormat = this.createSetting("colorFormat", "hex");
    this.consoleHistory = this.createSetting("consoleHistory", []);
    this.debuggerEnabled = this.createSetting("debuggerEnabled", false);
    this.domWordWrap = this.createSetting("domWordWrap", true);
    this.profilerEnabled = this.createSetting("profilerEnabled", false);
    this.eventListenersFilter = this.createSetting("eventListenersFilter", "all");
    this.lastActivePanel = this.createSetting("lastActivePanel", "elements");
    this.lastViewedScriptFile = this.createSetting("lastViewedScriptFile", "application");
    this.monitoringXHREnabled = this.createSetting("monitoringXHREnabled", false);
    this.preserveConsoleLog = this.createSetting("preserveConsoleLog", false);
    this.resourcesLargeRows = this.createSetting("resourcesLargeRows", true);
    this.resourcesSortOptions = this.createSetting("resourcesSortOptions", {timeOption: "responseTime", sizeOption: "transferSize"});
    this.resourceViewTab = this.createSetting("resourceViewTab", "preview");
    this.showInheritedComputedStyleProperties = this.createSetting("showInheritedComputedStyleProperties", false);
    this.showUserAgentStyles = this.createSetting("showUserAgentStyles", true);
    this.watchExpressions = this.createSetting("watchExpressions", []);
    this.breakpoints = this.createSetting("breakpoints", []);
    this.eventListenerBreakpoints = this.createSetting("eventListenerBreakpoints", []);
    this.domBreakpoints = this.createSetting("domBreakpoints", []);
    this.xhrBreakpoints = this.createSetting("xhrBreakpoints", []);
    this.sourceMapsEnabled = this.createSetting("sourceMapsEnabled", false);
    this.cacheDisabled = this.createSetting("cacheDisabled", false);
    this.overrideUserAgent = this.createSetting("overrideUserAgent", "");
    this.userAgent = this.createSetting("userAgent", "");
    this.showScriptFolders = this.createSetting("showScriptFolders", true);
    this.dockToRight = this.createSetting("dockToRight", false);
    this.emulateTouchEvents = this.createSetting("emulateTouchEvents", false);
    this.showPaintRects = this.createSetting("showPaintRects", false);
    this.zoomLevel = this.createSetting("zoomLevel", 0);

    // If there are too many breakpoints in a storage, it is likely due to a recent bug that caused
    // periodical breakpoints duplication leading to inspector slowness.
    if (this.breakpoints.get().length > 500000)
        this.breakpoints.set([]);
}

WebInspector.Settings.prototype = {
    /**
     * @return {WebInspector.Setting}
     */
    createSetting: function(key, defaultValue)
    {
        return new WebInspector.Setting(key, defaultValue, this._eventSupport);
    }
}

/**
 * @constructor
 */
WebInspector.Setting = function(name, defaultValue, eventSupport)
{
    this._name = name;
    this._defaultValue = defaultValue;
    this._eventSupport = eventSupport;
}

WebInspector.Setting.prototype = {
    addChangeListener: function(listener, thisObject)
    {
        this._eventSupport.addEventListener(this._name, listener, thisObject);
    },

    removeChangeListener: function(listener, thisObject)
    {
        this._eventSupport.removeEventListener(this._name, listener, thisObject);
    },

    get name()
    {
        return this._name;
    },

    get: function()
    {
        if (typeof this._value !== "undefined")
            return this._value;

        this._value = this._defaultValue;
        if (window.localStorage != null && this._name in window.localStorage) {
            try {
                this._value = JSON.parse(window.localStorage[this._name]);
            } catch(e) {
                window.localStorage.removeItem(this._name);
            }
        }
        return this._value;
    },

    set: function(value)
    {
        this._value = value;
        if (window.localStorage != null) {
            try {
                window.localStorage[this._name] = JSON.stringify(value);
            } catch(e) {
                console.error("Error saving setting with name:" + this._name);
            }
        }
        this._eventSupport.dispatchEventToListeners(this._name, value);
    }
}

/**
 * @constructor
 */
WebInspector.ExperimentsSettings = function()
{
    this._setting = WebInspector.settings.createSetting("experiments", {});
    this._experiments = [];
    this._enabledForTest = {};
    
    // Add currently running experiments here.
    this.timelineVerticalOverview = this._createExperiment("timelineStartAtZero", "Enable vertical overview mode in the Timeline panel");
    // FIXME: Enable http/tests/inspector/indexeddb/resources-panel.html when removed from experiments.
    this.showIndexedDB = this._createExperiment("showIndexedDB", "Show IndexedDB in Resources panel");
    this.showShadowDOM = this._createExperiment("showShadowDOM", "Show shadow DOM");
    this.snippetsSupport = this._createExperiment("snippetsSupport", "Snippets support");

    this._cleanUpSetting();
}

WebInspector.ExperimentsSettings.prototype = {
    /**
     * @type {Array.<WebInspector.Experiment>}
     */
    get experiments()
    {
        return this._experiments.slice();
    },
    
    /**
     * @type {boolean}
     */
    get experimentsEnabled()
    {
        return "experiments" in WebInspector.queryParamsObject;
    },
    
    /**
     * @param {string} experimentName
     * @param {string} experimentTitle
     * @return {WebInspector.Experiment}
     */
    _createExperiment: function(experimentName, experimentTitle)
    {
        var experiment = new WebInspector.Experiment(this, experimentName, experimentTitle);
        this._experiments.push(experiment);
        return experiment;
    },
    
    /**
     * @param {string} experimentName
     * @return {boolean}
     */
    isEnabled: function(experimentName)
    {
        if (this._enabledForTest[experimentName])
            return true;

        if (!this.experimentsEnabled)
            return false;
        
        var experimentsSetting = this._setting.get();
        return experimentsSetting[experimentName];
    },
    
    /**
     * @param {string} experimentName
     * @param {boolean} enabled
     */
    setEnabled: function(experimentName, enabled)
    {
        var experimentsSetting = this._setting.get();
        experimentsSetting[experimentName] = enabled;
        this._setting.set(experimentsSetting);
    },

    /**
     * @param {string} experimentName
     */
    _enableForTest: function(experimentName)
    {
        this._enabledForTest[experimentName] = true;
    },

    _cleanUpSetting: function()
    {
        var experimentsSetting = this._setting.get();
        var cleanedUpExperimentSetting = {};
        for (var i = 0; i < this._experiments.length; ++i) {
            var experimentName = this._experiments[i].name;
            if (experimentsSetting[experimentName])
                cleanedUpExperimentSetting[experimentName] = true;
        }
        this._setting.set(cleanedUpExperimentSetting);
    }
}

/**
 * @constructor
 * @param {WebInspector.ExperimentsSettings} experimentsSettings
 * @param {string} name
 * @param {string} title
 */
WebInspector.Experiment = function(experimentsSettings, name, title)
{
    this._name = name;
    this._title = title;
    this._experimentsSettings = experimentsSettings;
}

WebInspector.Experiment.prototype = {
    /**
     * @return {string}
     */
    get name()
    {
        return this._name;
    },
    
    /**
     * @return {string}
     */
    get title()
    {
        return this._title;
    },
    
    /**
     * @return {boolean}
     */
    isEnabled: function()
    {
        return this._experimentsSettings.isEnabled(this._name);
    },
    
    /**
     * @param {boolean} enabled
     */
    setEnabled: function(enabled)
    {
        return this._experimentsSettings.setEnabled(this._name, enabled);
    },

    enableForTest: function()
    {
        this._experimentsSettings._enableForTest(this._name);
    }
}

WebInspector.settings = new WebInspector.Settings();
WebInspector.experimentsSettings = new WebInspector.ExperimentsSettings();
