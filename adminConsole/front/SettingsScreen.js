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
 * @extends {WebInspector.HelpScreen}
 */
WebInspector.SettingsScreen = function()
{
    WebInspector.HelpScreen.call(this, WebInspector.UIString("Settings"));

    this._leftColumnElement = document.createElement("td");
    this._rightColumnElement = document.createElement("td");
    var p;

    if (Preferences.showDockToRight || Preferences.exposeDisableCache) {
        p = this._appendSection(WebInspector.UIString("General"));
        if (Preferences.showDockToRight)
            p.appendChild(this._createCheckboxSetting(WebInspector.UIString("Dock to right"), WebInspector.settings.dockToRight));
        if (Preferences.exposeDisableCache)
            p.appendChild(this._createCheckboxSetting(WebInspector.UIString("Disable cache"), WebInspector.settings.cacheDisabled));
    }
    
    p = this._appendSection(WebInspector.UIString("Rendering"));
    p.appendChild(this._createCheckboxSetting(WebInspector.UIString("Show paint rectangles"), WebInspector.settings.showPaintRects));
    WebInspector.settings.showPaintRects.addChangeListener(this._showPaintRectsChanged, this);

    p = this._appendSection(WebInspector.UIString("Elements"));
    p.appendChild(this._createCheckboxSetting(WebInspector.UIString("Word wrap"), WebInspector.settings.domWordWrap));

    p = this._appendSection(WebInspector.UIString("Styles"));
    p.appendChild(this._createRadioSetting(WebInspector.UIString("Color format"), [
        [ WebInspector.StylesSidebarPane.ColorFormat.Original, WebInspector.UIString("As authored") ],
        [ WebInspector.StylesSidebarPane.ColorFormat.HEX, "HEX: #DAC0DE" ],
        [ WebInspector.StylesSidebarPane.ColorFormat.RGB, "RGB: rgb(128, 255, 255)" ],
        [ WebInspector.StylesSidebarPane.ColorFormat.HSL, "HSL: hsl(300, 80%, 90%)" ] ], WebInspector.settings.colorFormat));
    p.appendChild(this._createCheckboxSetting(WebInspector.UIString("Show user agent styles"), WebInspector.settings.showUserAgentStyles));

    p = this._appendSection(WebInspector.UIString("Text editor"));
    p.appendChild(this._createSelectSetting(WebInspector.UIString("Indent"), [
            [ WebInspector.UIString("2 spaces"), WebInspector.TextEditorModel.Indent.TwoSpaces ],
            [ WebInspector.UIString("4 spaces"), WebInspector.TextEditorModel.Indent.FourSpaces ],
            [ WebInspector.UIString("8 spaces"), WebInspector.TextEditorModel.Indent.EightSpaces ],
            [ WebInspector.UIString("Tab character"), WebInspector.TextEditorModel.Indent.TabCharacter ]
        ], WebInspector.settings.textEditorIndent));

    p = this._appendSection(WebInspector.UIString("User Agent"), true);
    p.appendChild(this._createUserActionControl());
    p.appendChild(this._createCheckboxSetting(WebInspector.UIString("Emulate touch events"), WebInspector.settings.emulateTouchEvents));

    p = this._appendSection(WebInspector.UIString("Scripts"), true);
    p.appendChild(this._createCheckboxSetting(WebInspector.UIString("Use file navigator and tabbed editor container in scripts panel"), WebInspector.settings.useScriptsNavigator));
    p.appendChild(this._createCheckboxSetting(WebInspector.UIString("Show script folders"), WebInspector.settings.showScriptFolders));
    p.appendChild(this._createCheckboxSetting(WebInspector.UIString("Search in content scripts"), WebInspector.settings.searchInContentScripts));
    p.appendChild(this._createCheckboxSetting(WebInspector.UIString("Enable source maps"), WebInspector.settings.sourceMapsEnabled));

    p = this._appendSection(WebInspector.UIString("Profiler"), true);
    p.appendChild(this._createCheckboxSetting(WebInspector.UIString("Show objects' hidden properties"), WebInspector.settings.showHeapSnapshotObjectsHiddenProperties));

    p = this._appendSection(WebInspector.UIString("Console"), true);
    p.appendChild(this._createCheckboxSetting(WebInspector.UIString("Log XMLHttpRequests"), WebInspector.settings.monitoringXHREnabled));
    p.appendChild(this._createCheckboxSetting(WebInspector.UIString("Preserve log upon navigation"), WebInspector.settings.preserveConsoleLog));

    if (WebInspector.extensionServer.hasExtensions()) {
        var handlerSelector = new WebInspector.HandlerSelector(WebInspector.openAnchorLocationRegistry);
        p = this._appendSection(WebInspector.UIString("Extensions"), true);
        p.appendChild(this._createCustomSetting(WebInspector.UIString("Open links in"), handlerSelector.element));
    }

    var experiments = WebInspector.experimentsSettings.experiments;
    if (WebInspector.experimentsSettings.experimentsEnabled && experiments.length) {
        var experimentsSection = this._appendSection(WebInspector.UIString("Experiments"), true);
        experimentsSection.appendChild(this._createExperimentsWarningSubsection());
        for (var i = 0; i < experiments.length; ++i)
            experimentsSection.appendChild(this._createExperimentCheckbox(experiments[i]));
    }
    
    var table = document.createElement("table");
    table.className = "help-table";
    var tr = document.createElement("tr");
    tr.appendChild(this._leftColumnElement);
    tr.appendChild(this._rightColumnElement);
    table.appendChild(tr);
    this.contentElement.appendChild(table);
}

WebInspector.SettingsScreen.prototype = {
    /**
     * @param {string} name
     * @param {boolean=} right
     */
    _appendSection: function(name, right)
    {
        var p = document.createElement("p");
        p.className = "help-section";
        var title = document.createElement("div");
        title.className = "help-section-title";
        title.textContent = name;
        p.appendChild(title);
        this._columnElement(right).appendChild(p);
        return p;
    },

    /**
     * @return {Element} element
     */
    _createExperimentsWarningSubsection: function()
    {
        var subsection = document.createElement("div");
        var warning = subsection.createChild("span", "settings-experiments-warning-subsection-warning");
        warning.textContent = WebInspector.UIString("WARNING:");
        subsection.appendChild(document.createTextNode(" "));
        var message = subsection.createChild("span", "settings-experiments-warning-subsection-message");
        message.textContent = WebInspector.UIString("These experiments could be dangerous and may require restart.");
        return subsection;
    },

    _columnElement: function(right)
    {
        return right ? this._rightColumnElement : this._leftColumnElement;
    },

    _createCheckboxSetting: function(name, setting)
    {
        var input = document.createElement("input");
        input.type = "checkbox";
        input.name = name;
        input.checked = setting.get();
        function listener()
        {
            setting.set(input.checked);
        }
        input.addEventListener("click", listener, false);

        var p = document.createElement("p");
        var label = document.createElement("label");
        label.appendChild(input);
        label.appendChild(document.createTextNode(name));
        p.appendChild(label);
        return p;
    },

    _createExperimentCheckbox: function(experiment)
    {
        var input = document.createElement("input");
        input.type = "checkbox";
        input.name = experiment.name;
        input.checked = experiment.isEnabled();
        function listener()
        {
            experiment.setEnabled(input.checked);
        }
        input.addEventListener("click", listener, false);

        var p = document.createElement("p");
        var label = document.createElement("label");
        label.appendChild(input);
        label.appendChild(document.createTextNode(WebInspector.UIString(experiment.title)));
        p.appendChild(label);
        return p;
    },

    _createSelectSetting: function(name, options, setting)
    {
        var fieldsetElement = document.createElement("fieldset");
        fieldsetElement.createChild("label").textContent = name;

        var select = document.createElement("select");
        var settingValue = setting.get();

        for (var i = 0; i < options.length; ++i) {
            var option = options[i];
            select.add(new Option(option[0], option[1]));
            if (settingValue === option[1])
                select.selectedIndex = i;
        }

        function changeListener(e)
        {
            setting.set(e.target.value);
        }

        select.addEventListener("change", changeListener, false);
        fieldsetElement.appendChild(select);

        var p = document.createElement("p");
        p.appendChild(fieldsetElement);
        return p;
    },

    _createRadioSetting: function(name, options, setting)
    {
        var pp = document.createElement("p");
        var fieldsetElement = document.createElement("fieldset");
        var legendElement = document.createElement("legend");
        legendElement.textContent = name;
        fieldsetElement.appendChild(legendElement);

        function clickListener(e)
        {
            setting.set(e.target.value);
        }

        var settingValue = setting.get();
        for (var i = 0; i < options.length; ++i) {
            var p = document.createElement("p");
            var label = document.createElement("label");
            p.appendChild(label);

            var input = document.createElement("input");
            input.type = "radio";
            input.name = setting.name;
            input.value = options[i][0];
            input.addEventListener("click", clickListener, false);
            if (settingValue == input.value)
                input.checked = true;

            label.appendChild(input);
            label.appendChild(document.createTextNode(options[i][1]));

            fieldsetElement.appendChild(p);
        }

        pp.appendChild(fieldsetElement);
        return pp;
    },

    _createCustomSetting: function(name, element)
    {
        var p = document.createElement("p");
        var fieldsetElement = document.createElement("fieldset");
        fieldsetElement.createChild("label").textContent = name;
        fieldsetElement.appendChild(element);
        p.appendChild(fieldsetElement);
        return p;
    },

    _createUserActionControl: function()
    {
        var userAgent = WebInspector.settings.userAgent.get();

        var p = document.createElement("p");
        var labelElement = p.createChild("label");
        var checkboxElement = labelElement.createChild("input");
        checkboxElement.type = "checkbox";
        checkboxElement.checked = !!userAgent;
        checkboxElement.addEventListener("click", checkboxClicked.bind(this), false);
        labelElement.appendChild(document.createTextNode("Override User Agent"));

        var selectSectionElement;
        function checkboxClicked()
        {
            if (checkboxElement.checked) {
                selectSectionElement = this._createUserAgentSelectRowElement();
                p.appendChild(selectSectionElement);
            } else {
                if (selectSectionElement) {
                    p.removeChild(selectSectionElement);
                    selectSectionElement = null;
                }
                WebInspector.settings.userAgent.set("");
            }
        }

        checkboxClicked.call(this);
        return p;
    },

    _createUserAgentSelectRowElement: function()
    {
        var userAgent = WebInspector.settings.userAgent.get();
        const userAgents = [
            ["Internet Explorer 9", "Mozilla/5.0 (compatible; MSIE 9.0; Windows NT 6.1; Trident/5.0)"],
            ["Internet Explorer 8", "Mozilla/4.0 (compatible; MSIE 8.0; Windows NT 6.0; Trident/4.0)"],
            ["Internet Explorer 7", "Mozilla/4.0 (compatible; MSIE 7.0; Windows NT 6.0)"],

            ["Firefox 7 \u2014 Windows", "Mozilla/5.0 (Windows NT 6.1; Intel Mac OS X 10.6; rv:7.0.1) Gecko/20100101 Firefox/7.0.1"],
            ["Firefox 7 \u2014 Mac", "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.6; rv:7.0.1) Gecko/20100101 Firefox/7.0.1"],
            ["Firefox 4 \u2014 Windows", "Mozilla/5.0 (Windows NT 6.1; rv:2.0.1) Gecko/20100101 Firefox/4.0.1"],
            ["Firefox 4 \u2014 Mac", "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.6; rv:2.0.1) Gecko/20100101 Firefox/4.0.1"],

            ["iPhone \u2014 iOS 5", "Mozilla/5.0 (iPhone; CPU iPhone OS 5_0 like Mac OS X) AppleWebKit/534.46 (KHTML, like Gecko) Version/5.1 Mobile/9A334 Safari/7534.48.3"],
            ["iPhone \u2014 iOS 4", "Mozilla/5.0 (iPhone; U; CPU iPhone OS 4_3_2 like Mac OS X; en-us) AppleWebKit/533.17.9 (KHTML, like Gecko) Version/5.0.2 Mobile/8H7 Safari/6533.18.5"],
            ["iPad \u2014 iOS 5", "Mozilla/5.0 (iPad; CPU OS 5_0 like Mac OS X) AppleWebKit/534.46 (KHTML, like Gecko) Version/5.1 Mobile/9A334 Safari/7534.48.3"],
            ["iPad \u2014 iOS 4", "Mozilla/5.0 (iPad; CPU OS 4_3_2 like Mac OS X; en-us) AppleWebKit/533.17.9 (KHTML, like Gecko) Version/5.0.2 Mobile/8H7 Safari/6533.18.5"],

            ["Android 2.3 \u2014 Nexus S", "Mozilla/5.0 (Linux; U; Android 2.3.6; en-us; Nexus S Build/GRK39F) AppleWebKit/533.1 (KHTML, like Gecko) Version/4.0 Mobile Safari/533.1"],

            ["BlackBerry \u2014 PlayBook 1.0","Mozilla/5.0 (PlayBook; U; RIM Tablet OS 1.0.0; en-US) AppleWebKit/534.11+ (KHTML, like Gecko) Version/7.1.0.7 Safari/534.11+"],
            ["BlackBerry \u2014 PlayBook 2.0", "Mozilla/5.0 (PlayBook; U; RIM Tablet OS 2.0.0; en-US) AppleWebKit/535.8+ (KHTML, like Gecko) Version/7.2.0.0 Safari/535.8+"],
            ["BlackBerry \u2014 9900", "Mozilla/5.0 (BlackBerry; U; BlackBerry 9900; en-US) AppleWebKit/534.11+ (KHTML, like Gecko) Version/7.0.0.187 Mobile Safari/534.11+"],

            ["MeeGo \u2014 Nokia N9", "Mozilla/5.0 (MeeGo; NokiaN9) AppleWebKit/534.13 (KHTML, like Gecko) NokiaBrowser/8.5.0 Mobile Safari/534.13"],

            [WebInspector.UIString("Other..."), "Other"]
        ];

        var fieldsetElement = document.createElement("fieldset");
        var selectElement = fieldsetElement.createChild("select");
        var otherUserAgentElement = fieldsetElement.createChild("input");
        otherUserAgentElement.value = userAgent;
        otherUserAgentElement.title = userAgent;

        var selectionRestored = false;
        for (var i = 0; i < userAgents.length; ++i) {
            var agent = userAgents[i];
            selectElement.add(new Option(agent[0], agent[1]));
            if (userAgent === agent[1]) {
                selectElement.selectedIndex = i;
                selectionRestored = true;
            }
        }

        if (!selectionRestored) {
            if (!userAgent)
                selectElement.selectedIndex = 0;
            else
                selectElement.selectedIndex = userAgents.length - 1;
        }

        selectElement.addEventListener("change", selectionChanged.bind(this), false);

        function selectionChanged()
        {
            var value = selectElement.options[selectElement.selectedIndex].value;
            if (value !== "Other") {
                WebInspector.settings.userAgent.set(value);
                otherUserAgentElement.value = value;
                otherUserAgentElement.title = value;
                otherUserAgentElement.disabled = true;
            } else {
                otherUserAgentElement.disabled = false;
                otherUserAgentElement.focus();
            }
        }

        fieldsetElement.addEventListener("dblclick", textDoubleClicked.bind(this), false);
        otherUserAgentElement.addEventListener("blur", textChanged.bind(this), false);

        function textDoubleClicked()
        {
            selectElement.selectedIndex = userAgents.length - 1;
            selectionChanged.call(this);
        }

        function textChanged()
        {
            WebInspector.settings.userAgent.set(otherUserAgentElement.value);
        }

        selectionChanged.call(this);
        return fieldsetElement;
    },

    _showPaintRectsChanged: function()
    {
        PageAgent.setShowPaintRects(WebInspector.settings.showPaintRects.get());
    }
}

WebInspector.SettingsScreen.prototype.__proto__ = WebInspector.HelpScreen.prototype;
