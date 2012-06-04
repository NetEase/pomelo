/*
 * Copyright (C) 2007, 2008 Apple Inc.  All rights reserved.
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
 * @extends {WebInspector.View}
 * @constructor
 */
WebInspector.Panel = function(name)
{
    WebInspector.View.call(this);

    this.element.addStyleClass("panel");
    this.element.addStyleClass(name);
    this._panelName = name;

    this._shortcuts = {};

    WebInspector.settings[this._sidebarWidthSettingName()] = WebInspector.settings.createSetting(this._sidebarWidthSettingName(), undefined);
}

// Should by in sync with style declarations.
WebInspector.Panel.counterRightMargin = 25;

WebInspector.Panel.prototype = {
    get toolbarItem()
    {
        if (this._toolbarItem)
            return this._toolbarItem;

        this._toolbarItem = WebInspector.Toolbar.createPanelToolbarItem(this);
        return this._toolbarItem;
    },

    get name()
    {
        return this._panelName;
    },

    show: function()
    {
        WebInspector.View.prototype.show.call(this, WebInspector.inspectorView.element);
    },

    wasShown: function()
    {
        var statusBarItems = this.statusBarItems;
        if (statusBarItems) {
            this._statusBarItemContainer = document.createElement("div");
            for (var i = 0; i < statusBarItems.length; ++i)
                this._statusBarItemContainer.appendChild(statusBarItems[i]);
            document.getElementById("main-status-bar").appendChild(this._statusBarItemContainer);
        }

        if ("_toolbarItem" in this)
            this._toolbarItem.addStyleClass("toggled-on");

        WebInspector.setCurrentFocusElement(this.defaultFocusedElement);
    },

    willHide: function()
    {
        if (this._statusBarItemContainer && this._statusBarItemContainer.parentNode)
            this._statusBarItemContainer.parentNode.removeChild(this._statusBarItemContainer);
        delete this._statusBarItemContainer;
        if ("_toolbarItem" in this)
            this._toolbarItem.removeStyleClass("toggled-on");
    },

    reset: function()
    {
        this.searchCanceled();
    },

    get defaultFocusedElement()
    {
        return this.sidebarTreeElement || this.element;
    },

    searchCanceled: function()
    {
        WebInspector.searchController.updateSearchMatchesCount(0, this);
    },

    performSearch: function(query)
    {
        // Call searchCanceled since it will reset everything we need before doing a new search.
        this.searchCanceled();
    },

    jumpToNextSearchResult: function()
    {
    },

    jumpToPreviousSearchResult: function()
    {
    },

    /**
     * @param {Element=} parentElement
     * @param {string=} position
     * @param {number=} defaultWidth
     */
    createSplitView: function(parentElement, position, defaultWidth)
    {
        if (this.splitView)
            return;

        if (!parentElement)
            parentElement = this.element;

        this.splitView = new WebInspector.SplitView(position || WebInspector.SplitView.SidebarPosition.Left, this._sidebarWidthSettingName(), defaultWidth);
        this.splitView.show(parentElement);
        this.splitView.addEventListener(WebInspector.SplitView.EventTypes.Resized, this.sidebarResized.bind(this));

        this.sidebarElement = this.splitView.sidebarElement;
    },

    /**
     * @param {Element=} parentElement
     * @param {string=} position
     * @param {number=} defaultWidth
     */
    createSplitViewWithSidebarTree: function(parentElement, position, defaultWidth)
    {
        if (this.splitView)
            return;

        this.createSplitView(parentElement, position);

        this.sidebarTreeElement = document.createElement("ol");
        this.sidebarTreeElement.className = "sidebar-tree";
        this.splitView.sidebarElement.appendChild(this.sidebarTreeElement);
        this.splitView.sidebarElement.addStyleClass("sidebar");

        this.sidebarTree = new TreeOutline(this.sidebarTreeElement);
        this.sidebarTree.panel = this;
    },

    _sidebarWidthSettingName: function()
    {
        return this._panelName + "SidebarWidth";
    },

    // Should be implemented by ancestors.

    get toolbarItemLabel()
    {
    },

    get statusBarItems()
    {
    },

    sidebarResized: function(width)
    {
    },

    statusBarResized: function()
    {
    },

    canShowAnchorLocation: function(anchor)
    {
        return false;
    },

    showAnchorLocation: function(anchor)
    {
        return false;
    },

    elementsToRestoreScrollPositionsFor: function()
    {
        return [];
    },

    handleShortcut: function(event)
    {
        var shortcutKey = WebInspector.KeyboardShortcut.makeKeyFromEvent(event);
        var handler = this._shortcuts[shortcutKey];
        if (handler) {
            handler(event);
            event.handled = true;
        }
    },

    registerShortcut: function(key, handler)
    {
        this._shortcuts[key] = handler;
    },

    unregisterShortcut: function(key)
    {
        delete this._shortcuts[key];
    }
}

WebInspector.Panel.prototype.__proto__ = WebInspector.View.prototype;
