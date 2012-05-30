/*
 * Copyright (C) 2011 Google Inc. All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are
 * met:
 *
 * 1. Redistributions of source code must retain the above copyright
 * notice, this list of conditions and the following disclaimer.
 *
 * 2. Redistributions in binary form must reproduce the above
 * copyright notice, this list of conditions and the following disclaimer
 * in the documentation and/or other materials provided with the
 * distribution.
 *
 * THIS SOFTWARE IS PROVIDED BY GOOGLE INC. AND ITS CONTRIBUTORS
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
 * A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL GOOGLE INC.
 * OR ITS CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 * LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
 * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

/**
 * @constructor
 * @extends {WebInspector.View}
 * @param {string=} sidebarPosition
 * @param {string=} sidebarWidthSettingName
 * @param {number=} defaultSidebarWidth
 */
WebInspector.SplitView = function(sidebarPosition, sidebarWidthSettingName, defaultSidebarWidth)
{
    WebInspector.View.call(this);
    this.registerRequiredCSS("splitView.css");

    this.element.className = "split-view";

    this._leftElement = document.createElement("div");
    this._leftElement.className = "split-view-contents";
    this.element.appendChild(this._leftElement);

    this._rightElement = document.createElement("div");
    this._rightElement.className = "split-view-contents";
    this.element.appendChild(this._rightElement);

    this.sidebarResizerElement = document.createElement("div");
    this.sidebarResizerElement.className = "split-view-resizer";
    this.installResizer(this.sidebarResizerElement);
    this._resizable = true;
    this.element.appendChild(this.sidebarResizerElement);

    defaultSidebarWidth = defaultSidebarWidth || 200;
    this._savedSidebarWidth = defaultSidebarWidth;

    this._sidebarWidthSettingName = sidebarWidthSettingName;
    if (this._sidebarWidthSettingName)
        WebInspector.settings[this._sidebarWidthSettingName] = WebInspector.settings.createSetting(this._sidebarWidthSettingName, undefined);

    this._minimalSidebarWidth = Preferences.minSidebarWidth;
    this._minimalMainWidth = 0;
    this._minimalSidebarWidthPercent = 0;
    this._minimalMainWidthPercent = 50;

    this._mainElementHidden = false;
    this._sidebarElementHidden = false;

    this._innerSetSidebarPosition(sidebarPosition || WebInspector.SplitView.SidebarPosition.Left);
}

WebInspector.SplitView.EventTypes = {
    Resized: "Resized"
}

/**
 * @enum {string}
 */
WebInspector.SplitView.SidebarPosition = {
    Left: "Left",
    Right: "Right"
}

WebInspector.SplitView.prototype = {
    /**
     * @type {boolean}
     */
    get hasLeftSidebar()
    {
        return this._sidebarPosition === WebInspector.SplitView.SidebarPosition.Left;
    },

    /**
     * @type {Element}
     */
    get mainElement()
    {
        return this.hasLeftSidebar ? this._rightElement : this._leftElement;
    },

    /**
     * @type {Element}
     */
    get sidebarElement()
    {
        return this.hasLeftSidebar ? this._leftElement : this._rightElement;
    },

    /**
     * @type {boolean}
     */
    get resizable()
    {
        return this._resizable && !this._mainElementHidden && !this._sidebarElementHidden;
    },

    /**
     * @type {boolean}
     */
    set resizable(resizable)
    {
        if (this._resizable === resizable)
            return;
        this._resizable = resizable;
        this._updateResizer(resizable);
    },

    _updateResizer: function()
    {
        if (this.resizable)
            this.sidebarResizerElement.removeStyleClass("hidden");
        else
            this.sidebarResizerElement.addStyleClass("hidden");
    },

    /**
     * @type {string}
     */
    set sidebarPosition(sidebarPosition)
    {
        if (this._sidebarPosition === sidebarPosition)
            return;
        this._innerSetSidebarPosition(sidebarPosition);
        this._restoreSidebarWidth();
    },

    /**
     * @param {string} sidebarPosition
     */
    _innerSetSidebarPosition: function(sidebarPosition)
    {
        this._sidebarPosition = sidebarPosition;

        this._leftElement.style.left = 0;
        this._rightElement.style.right = 0;
        if (this.hasLeftSidebar) {
            this._leftElement.addStyleClass("split-view-sidebar-left");
            this._rightElement.removeStyleClass("split-view-sidebar-right");
            this._leftElement.style.removeProperty("right");
            this._rightElement.style.removeProperty("width");
            this.sidebarResizerElement.style.removeProperty("right");
        } else {
            this._rightElement.addStyleClass("split-view-sidebar-right");
            this._leftElement.removeStyleClass("split-view-sidebar-left");
            this._leftElement.style.removeProperty("width");
            this._rightElement.style.removeProperty("left");
            this.sidebarResizerElement.style.removeProperty("left");
        }
    },

    /**
     * @param {number} width
     */
    set minimalSidebarWidth(width)
    {
        this._minimalSidebarWidth = width;
    },

    /**
     * @param {number} width
     */
    set minimalMainWidth(width)
    {
        this._minimalMainWidth = width;
    },

    /**
     * @param {number} widthPercent
     */
    set minimalSidebarWidthPercent(widthPercent)
    {
        this._minimalSidebarWidthPercent = widthPercent;
    },

    /**
     * @param {number} widthPercent
     */
    set minimalMainWidthPercent(widthPercent)
    {
        this._minimalMainWidthPercent = widthPercent;
    },

    /**
     * @param {number} width
     */
    setMainWidth: function(width)
    {
        this.setSidebarWidth(this._totalWidth - width);
    },

    /**
     * @param {number} width
     */
    setSidebarWidth: function(width)
    {
        if (this._sidebarWidth === width)
            return;

        this._innerSetSidebarWidth(width);
        this.saveSidebarWidth();
    },

    /**
     * @param {number} width
     */
    _innerSetSidebarWidth: function(width)
    {
        if (this.hasLeftSidebar)
            this._innerSetLeftSidebarWidth(width);
        else
            this._innerSetRightSidebarWidth(width);
        this._sidebarWidth = width;
        this.doResize();
        this.dispatchEventToListeners(WebInspector.SplitView.EventTypes.Resized, this._sidebarWidth);
    },

    /**
     * @param {number} width
     */
    _innerSetLeftSidebarWidth: function(width)
    {
        this._leftElement.style.width = width + "px";
        this._rightElement.style.left = width + "px";
        this.sidebarResizerElement.style.left = (width - 3) + "px";
    },

    /**
     * @param {number} width
     */
    _innerSetRightSidebarWidth: function(width)
    {
        this._rightElement.style.width = width + "px";
        this._leftElement.style.right = width + "px";
        this.sidebarResizerElement.style.right = (width - 3) + "px";
    },

    /**
     * @param {number} width
     */
    _setSidebarWidthEnsuringConstraints: function(width)
    {
        var minWidth = Math.max(this._minimalSidebarWidth, this._totalWidth * this._minimalSidebarWidthPercent);
        var maxWidth = Math.min(this._totalWidth - this._minimalMainWidth, this._totalWidth * (100 - this._minimalMainWidthPercent) / 100 );
        width = Number.constrain(width, minWidth, maxWidth);

        this.setSidebarWidth(width);
    },

    hideMainElement: function()
    {
        if (this._mainElementHidden)
            return;

        if (this._sidebarElementHidden)
            this.showSidebarElement();

        this.mainElement.addStyleClass("hidden");
        this.sidebarElement.addStyleClass("maximized");
        
        if (this.hasLeftSidebar)
            this.sidebarElement.style.right = "0px";
        else
            this.sidebarElement.style.left = "0px";
        
        this._mainElementHidden = true;
        this._updateResizer();
        this._restoreSidebarWidth();
        this.doResize();
    },

    showMainElement: function()
    {
        if (!this._mainElementHidden)
            return;

        this.mainElement.removeStyleClass("hidden");
        this.sidebarElement.removeStyleClass("maximized");
        
        if (this.hasLeftSidebar)
            this.sidebarElement.style.right = "";
        else
            this.sidebarElement.style.left = "";

        this._mainElementHidden = false;
        this._updateResizer();
        this._restoreSidebarWidth();
        this.doResize();
    },

    hideSidebarElement: function()
    {
        if (this._sidebarElementHidden)
            return;

        if (this._mainElementHidden)
            this.showMainElement();

        this.sidebarElement.addStyleClass("hidden");
        this._sidebarElementHidden = true;
        this._updateResizer();
        this._restoreSidebarWidth();
        this.doResize();
    },

    showSidebarElement: function()
    {
        if (!this._sidebarElementHidden)
            return;

        this.sidebarElement.removeStyleClass("hidden");
        this._sidebarElementHidden = false;
        this._updateResizer();
        this._restoreSidebarWidth();
        this.doResize();
    },

    wasShown: function()
    {
        this._totalWidth = this.element.offsetWidth;
        this._restoreSidebarWidth();
    },

    onResize: function()
    {
        this._totalWidth = this.element.offsetWidth;

        if (this._mainElementHidden)
            this._sidebarWidth = this._totalWidth;
    },

    /**
     * @param {Event} event
     */
    _startResizerDragging: function(event)
    {
        if (!this._resizable)
            return;

        var leftWidth = this.hasLeftSidebar ? this._sidebarWidth : this._totalWidth - this._sidebarWidth;
        this._dragOffset = leftWidth - event.pageX;

        WebInspector.elementDragStart(this.sidebarResizerElement, this._resizerDragging.bind(this), this._endResizerDragging.bind(this), event, "ew-resize");
    },

    /**
     * @param {Event} event
     */
    _resizerDragging: function(event)
    {
        var leftWidth = event.pageX + this._dragOffset;
        var rightWidth = this._totalWidth - leftWidth;
        var sidebarWidth = this.hasLeftSidebar ? leftWidth : rightWidth;

        this._setSidebarWidthEnsuringConstraints(sidebarWidth);
        event.preventDefault();
    },

    /**
     * @param {Event} event
     */
    _endResizerDragging: function(event)
    {
        delete this._dragOffset;
        WebInspector.elementDragEnd(event);
    },

    /**
     * @param {Element} resizerElement
     */
    installResizer: function(resizerElement)
    {
        resizerElement.addEventListener("mousedown", this._startResizerDragging.bind(this), false);
    },

    /**
     * @return {number}
     */
    preferredSidebarWidth: function()
    {
        if (!this._sidebarWidthSettingName)
            return this._savedSidebarWidth;

        return WebInspector.settings[this._sidebarWidthSettingName].get() || this._savedSidebarWidth;
    },

    _restoreSidebarWidth: function()
    {
        if (this._mainElementHidden) {
            this.sidebarElement.style.width = "";
            this._sidebarWidth = this._totalWidth;
            return;
        }

        if (this._sidebarElementHidden) {
            this._innerSetSidebarWidth(0);
            return;
        }

        // Ensure restore satisfies constraints.
        this._setSidebarWidthEnsuringConstraints(this.preferredSidebarWidth());
    },

    saveSidebarWidth: function()
    {
        this._savedSidebarWidth = this._sidebarWidth;
        if (!this._sidebarWidthSettingName)
            return;

        WebInspector.settings[this._sidebarWidthSettingName].set(this._sidebarWidth);
    },

    /**
     * @return {Array.<Element>}
     */
    elementsToRestoreScrollPositionsFor: function()
    {
        return [ this.mainElement, this.sidebarElement ];
    }
}

WebInspector.SplitView.prototype.__proto__ = WebInspector.View.prototype;
