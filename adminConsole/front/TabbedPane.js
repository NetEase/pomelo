/*
 * Copyright (C) 2010 Google Inc. All rights reserved.
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
WebInspector.TabbedPane = function()
{
    WebInspector.View.call(this);
    this.registerRequiredCSS("tabbedPane.css");
    this.element.addStyleClass("tabbed-pane");
    this._headerElement = this.element.createChild("div", "tabbed-pane-header");
    this._headerContentsElement = this._headerElement.createChild("div", "tabbed-pane-header-contents");
    this._tabsElement = this._headerContentsElement.createChild("div", "tabbed-pane-header-tabs");
    this._contentElement = this.element.createChild("div", "tabbed-pane-content");
    this._tabs = [];
    this._tabsHistory = [];
    this._tabsById = {};

    this._dropDownButton = this._createDropDownButton();
}

WebInspector.TabbedPane.EventTypes = {
    TabSelected: "TabSelected",
    TabClosed: "TabClosed"
}

WebInspector.TabbedPane.prototype = {
    /**
     * @type {WebInspector.View}
     */
    get visibleView()
    {
        return this._currentTab ? this._currentTab.view : null;
    },

    /**
     * @type {string}
     */
    get selectedTabId()
    {
        return this._currentTab ? this._currentTab.id : null;
    },

    /**
     * @type {boolean} shrinkableTabs
     */
    set shrinkableTabs(shrinkableTabs)
    {
        this._shrinkableTabs = shrinkableTabs;
    },

    /**
     * @type {boolean} shrinkableTabs
     */
    set closeableTabs(closeableTabs)
    {
        this._closeableTabs = closeableTabs;
    },

    focus: function()
    {
        if (!this.visibleView)
            return;
        if (typeof(this.visibleView.focus) === "function")
            this.visibleView.focus();
        else
            this.visibleView.element.focus();
    },

    /**
     * @param {string} id
     * @param {string} tabTitle
     * @param {WebInspector.View} view
     * @param {string=} tabTooltip
     * @param {boolean=} userGesture
     */
    appendTab: function(id, tabTitle, view, tabTooltip, userGesture)
    {
        var tab = new WebInspector.TabbedPaneTab(this, this._tabsElement, id, tabTitle, this._closeableTabs, view, tabTooltip);
        this._tabsById[id] = tab;

        this._tabs.push(tab);
        this._tabsHistory.push(tab);

        if (this._tabsHistory[0] === tab)
            this.selectTab(tab.id, userGesture);

        this._updateTabElements();
    },

    /**
     * @param {string} id
     * @param {boolean=} userGesture
     */
    closeTab: function(id, userGesture)
    {
        this._innerCloseTab(id, userGesture);
        this._updateTabElements();
        if (this._tabsHistory.length)
            this.selectTab(this._tabsHistory[0].id, userGesture);
    },

    /**
     * @param {string} id
     * @param {boolean=} userGesture
     */
    _innerCloseTab: function(id, userGesture)
    {
        if (this._currentTab && this._currentTab.id === id)
            this._hideCurrentTab();

        var tab = this._tabsById[id];
        delete this._tabsById[id];

        this._tabsHistory.splice(this._tabsHistory.indexOf(tab), 1);
        this._tabs.splice(this._tabs.indexOf(tab), 1);
        if (tab.shown)
            this._hideTabElement(tab);

        var eventData = { tabId: id, view: tab.view, isUserGesture: userGesture };
        this.dispatchEventToListeners(WebInspector.TabbedPane.EventTypes.TabClosed, eventData);
        return true;
    },

    /**
     * @param {boolean=} userGesture
     */
    closeAllTabs: function(userGesture)
    {
        var tabs = this._tabs.slice();
        for (var i = 0; i < tabs.length; ++i)
            this._innerCloseTab(tabs[i].id, userGesture);
        this._updateTabElements();
    },

    /**
     * @param {string} id
     * @param {boolean=} userGesture
     */
    selectTab: function(id, userGesture)
    {
        var tab = this._tabsById[id];
        if (!tab)
            return;
        if (this._currentTab && this._currentTab.id === id)
            return;

        this._hideCurrentTab();
        this._showTab(tab);
        this._currentTab = tab;
        
        this._tabsHistory.splice(this._tabsHistory.indexOf(tab), 1);
        this._tabsHistory.splice(0, 0, tab);
        
        this._updateTabElements();

        var eventData = { tabId: id, view: tab.view, isUserGesture: userGesture };
        this.dispatchEventToListeners(WebInspector.TabbedPane.EventTypes.TabSelected, eventData);
        return true;
    },

    /**
     * @param {number} tabsCount
     * @return {Array.<string>}
     */
    lastOpenedTabIds: function(tabsCount)
    {
        function tabToTabId(tab) {
            return tab.id;
        }

        return this._tabsHistory.slice(0, tabsCount).map(tabToTabId);
    },

    /**
     * @param {string} id
     * @param {string} tabTitle
     */
    changeTabTitle: function(id, tabTitle)
    {
        var tab = this._tabsById[id];
        tab.title = tabTitle;
        this._updateTabElements();
    },

    /**
     * @param {string} id
     * @param {WebInspector.View} view
     */
    changeTabView: function(id, view)
    {
        var tab = this._tabsById[id];
        if (this._currentTab && this._currentTab.id === tab.id) {
            this._hideTab(tab);
            tab.view = view;
            this._showTab(tab);
        } else
            tab.view = view;
    },

    /**
     * @param {string} id
     * @param {string=} tabTooltip
     */
    changeTabTooltip: function(id, tabTooltip)
    {
        var tab = this._tabsById[id];
        tab.tooltip = tabTooltip;
    },

    onResize: function()
    {
        this._updateTabElements();
    },

    _updateTabElements: function()
    {
        if (!this.isShowing())
            return;

        if (!this._tabs.length)
            this._contentElement.addStyleClass("has-no-tabs");
        else
            this._contentElement.removeStyleClass("has-no-tabs");
        
        if (!this._measuredDropDownButtonWidth)
            this._measureDropDownButton();

        if (this._shrinkableTabs)
            this._updateWidths();
        
        this._updateTabsDropDown();
    },

    /**
     * @param {number} index
     * @param {WebInspector.TabbedPaneTab} tab
     */
    _showTabElement: function(index, tab)
    {
        if (index >= this._tabsElement.children.length)
            this._tabsElement.appendChild(tab.tabElement);
        else
            this._tabsElement.insertBefore(tab.tabElement, this._tabsElement.children[index]);
        tab.shown = true;
    },

    /**
     * @param {WebInspector.TabbedPaneTab} tab
     */
    _hideTabElement: function(tab)
    {
        this._tabsElement.removeChild(tab.tabElement);
        tab.shown = false;
    },

    _createDropDownButton: function()
    {
        var dropDownContainer = document.createElement("div");
        dropDownContainer.addStyleClass("tabbed-pane-header-tabs-drop-down-container");
        var dropDownButton = dropDownContainer.createChild("div", "tabbed-pane-header-tabs-drop-down");
        dropDownButton.appendChild(document.createTextNode("\u00bb"));
        this._tabsSelect = dropDownButton.createChild("select", "tabbed-pane-header-tabs-drop-down-select");
        this._tabsSelect.addEventListener("change", this._tabsSelectChanged.bind(this), false);
        return dropDownContainer;
    },

    _updateTabsDropDown: function()
    {
        var tabsToShowIndexes = this._tabsToShowIndexes(this._tabs, this._tabsHistory, this._headerContentsElement.offsetWidth, this._measuredDropDownButtonWidth);

        for (var i = 0; i < this._tabs.length; ++i) {
            if (this._tabs[i].shown && tabsToShowIndexes.indexOf(i) === -1)
                this._hideTabElement(this._tabs[i]);
        }
        for (var i = 0; i < tabsToShowIndexes.length; ++i) {
            var tab = this._tabs[tabsToShowIndexes[i]];
            if (!tab.shown)
                this._showTabElement(i, tab);
        }
        
        this._populateDropDownFromIndex();
    },

    _populateDropDownFromIndex: function()
    {
        if (this._dropDownButton.parentElement)
            this._headerContentsElement.removeChild(this._dropDownButton);

        this._tabsSelect.removeChildren();
        var tabsToShow = [];
        for (var i = 0; i < this._tabs.length; ++i) {
            if (!this._tabs[i].shown)
                tabsToShow.push(this._tabs[i]);
                continue;
        }

        function compareFunction(tab1, tab2)
        {
            return tab1.title.localeCompare(tab2.title);
        }
        tabsToShow.sort(compareFunction);

        for (var i = 0; i < tabsToShow.length; ++i) {
            var option = new Option(tabsToShow[i].title);
            option.tab = tabsToShow[i];
            this._tabsSelect.appendChild(option);
        }
        if (this._tabsSelect.options.length) {
            this._headerContentsElement.appendChild(this._dropDownButton);
            this._tabsSelect.selectedIndex = -1;
        }
    },

    _tabsSelectChanged: function()
    {
        var options = this._tabsSelect.options;
        var selectedOption = options[this._tabsSelect.selectedIndex];
        this.selectTab(selectedOption.tab.id, true);
    },

    _measureDropDownButton: function()
    {
        this._dropDownButton.addStyleClass("measuring");
        this._headerContentsElement.appendChild(this._dropDownButton);
        this._measuredDropDownButtonWidth = this._dropDownButton.offsetWidth;
        this._headerContentsElement.removeChild(this._dropDownButton);
        this._dropDownButton.removeStyleClass("measuring");
    },

    _updateWidths: function()
    {
        var measuredWidths = [];
        for (var tabId in this._tabs)
            measuredWidths.push(this._tabs[tabId].measuredWidth);
        
        var maxWidth = this._calculateMaxWidth(measuredWidths, this._headerContentsElement.offsetWidth);
        
        for (var tabId in this._tabs) {
            var tab = this._tabs[tabId];
            tab.width = Math.min(tab.measuredWidth, maxWidth);
        }
    },

    /**
     * @param {Array.<number>} measuredWidths
     * @param {number} totalWidth
     */
    _calculateMaxWidth: function(measuredWidths, totalWidth)
    {
        if (!measuredWidths.length)
            return 0;

        measuredWidths.sort(function(x, y) { return x - y });

        var totalMeasuredWidth = 0;
        for (var i = 0; i < measuredWidths.length; ++i)
            totalMeasuredWidth += measuredWidths[i];

        if (totalWidth >= totalMeasuredWidth)
            return measuredWidths[measuredWidths.length - 1];

        var totalExtraWidth = 0;
        for (var i = measuredWidths.length - 1; i > 0; --i) {
            var extraWidth = measuredWidths[i] - measuredWidths[i - 1];
            totalExtraWidth += (measuredWidths.length - i) * extraWidth;

            if (totalWidth + totalExtraWidth >= totalMeasuredWidth)
                return measuredWidths[i - 1] + (totalWidth + totalExtraWidth - totalMeasuredWidth) / (measuredWidths.length - i); 
        }

        return totalWidth / measuredWidths.length;
    },

    /**
     * @param {Array.<WebInspector.TabbedPaneTab>} tabsOrdered
     * @param {Array.<WebInspector.TabbedPaneTab>} tabsHistory
     * @param {number} totalWidth
     * @param {number} measuredDropDownButtonWidth
     * @return {Array.<number>}
     */
    _tabsToShowIndexes: function(tabsOrdered, tabsHistory, totalWidth, measuredDropDownButtonWidth)
    {
        var tabsToShowIndexes = [];

        var totalTabsWidth = 0;
        for (var i = 0; i < tabsHistory.length; ++i) {
            totalTabsWidth += tabsHistory[i].width;
            var minimalRequiredWidth = totalTabsWidth;
            if (i !== tabsHistory.length - 1)
                minimalRequiredWidth += measuredDropDownButtonWidth;
            if (minimalRequiredWidth > totalWidth)
                break;
            tabsToShowIndexes.push(tabsOrdered.indexOf(tabsHistory[i]));
        }
        
        tabsToShowIndexes.sort(function(x, y) { return x - y });
        
        return tabsToShowIndexes;
    },
    
    _hideCurrentTab: function()
    {
        if (!this._currentTab)
            return;

        this._hideTab(this._currentTab);
        delete this._currentTab;
    },

    /**
     * @param {WebInspector.TabbedPaneTab} tab
     */
    _showTab: function(tab)
    {
        tab.tabElement.addStyleClass("selected");
        tab.view.show(this._contentElement);
    },

    /**
     * @param {WebInspector.TabbedPaneTab} tab
     */
    _hideTab: function(tab)
    {
        tab.tabElement.removeStyleClass("selected");
        tab.view.detach();
    },

    canHighlightLine: function()
    {
        return this._currentTab && this._currentTab.view && this._currentTab.view.canHighlightLine();
    },

    highlightLine: function(line)
    {
        if (this.canHighlightLine())
            this._currentTab.view.highlightLine(line);
    },

    /**
     * @return {Array.<Element>}
     */
    elementsToRestoreScrollPositionsFor: function()
    {
        return [ this._contentElement ];
    }
}

WebInspector.TabbedPane.prototype.__proto__ = WebInspector.View.prototype;


/**
 * @constructor
 * @param {WebInspector.TabbedPane} tabbedPane
 * @param {Element} measureElement
 * @param {string} id
 * @param {string} title
 * @param {boolean} closeable
 * @param {WebInspector.View} view
 * @param {string=} tooltip
 */
WebInspector.TabbedPaneTab = function(tabbedPane, measureElement, id, title, closeable, view, tooltip)
{
    this._closeable = closeable;
    this._tabbedPane = tabbedPane;
    this._measureElement = measureElement;
    this._id = id;
    this._title = title;
    this._tooltip = tooltip;
    this._view = view;
    this.shown = false;
}

WebInspector.TabbedPaneTab.prototype = {
    /**
     * @type {string}
     */
    get id()
    {
        return this._id;
    },

    /**
     * @type {string}
     */
    get title()
    {
        return this._title;
    },

    set title(title)
    {
        this._title = title;
        if (this._titleElement)
            this._titleElement.textContent = title;
        delete this._measuredWidth;
    },

    /**
     * @type {WebInspector.View}
     */
    get view()
    {
        return this._view;
    },

    set view(view)
    {
        this._view = view;
    },

    /**
     * @type {string|undefined}
     */
    get tooltip()
    {
        return this._tooltip;
    },

    set tooltip(tooltip)
    {
        this._tooltip = tooltip;
        if (this._titleElement)
            this._titleElement.title = tooltip || "";
    },

    /**
     * @type {Element}
     */
    get tabElement()
    {
        if (typeof(this._tabElement) !== "undefined")
            return this._tabElement;
        
        this._createTabElement(false);
        return this._tabElement;
    },

    /**
     * @type {number}
     */
    get measuredWidth()
    {
        if (typeof(this._measuredWidth) !== "undefined")
            return this._measuredWidth;
        
        this._measure();
        return this._measuredWidth;
    },

    /**
     * @type {number}
     */
    get width()
    {
        return this._width || this.measuredWidth;
    },

    set width(width)
    {
        this.tabElement.style.width = width + "px";
        this._width = width;
    },
    
    /**
     * @param {boolean} measuring
     */
    _createTabElement: function(measuring)
    {
        var tabElement = document.createElement("div");
        tabElement.addStyleClass("tabbed-pane-header-tab");
        tabElement.tabIndex = -1;
        
        var titleElement = tabElement.createChild("span", "tabbed-pane-header-tab-title");
        titleElement.textContent = this.title;
        titleElement.title = this.tooltip || "";
        if (!measuring)
            this._titleElement = titleElement;

        if (this._closeable) {
            var closeButtonSpan = tabElement.createChild("span", "tabbed-pane-header-tab-close-button");
            closeButtonSpan.textContent = "\u00D7"; // 'MULTIPLICATION SIGN' 
        }

        if (measuring)
            tabElement.addStyleClass("measuring");
        else {
            this._tabElement = tabElement;
            tabElement.addEventListener("click", this._tabClicked.bind(this), false);
        }
        
        return tabElement;
    },

    _measure: function()
    {
        var measuringTabElement = this._createTabElement(true);
        this._measureElement.appendChild(measuringTabElement);
        this._measuredWidth = measuringTabElement.offsetWidth;
        this._measureElement.removeChild(measuringTabElement);
    },

    /**
     * @param {Event} event
     */
    _tabClicked: function(event)
    {
        if (this._closeable && (event.button === 1 || event.target.hasStyleClass("tabbed-pane-header-tab-close-button")))
            this._tabbedPane.closeTab(this.id, true);
        else
            this._tabbedPane.selectTab(this.id, true);
        this._tabbedPane.focus();
    }
}
