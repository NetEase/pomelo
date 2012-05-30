/*
 * Copyright (C) 2008 Apple Inc. All Rights Reserved.
 * Copyright (C) 2011 Google Inc. All Rights Reserved.
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
 * @extends {WebInspector.Object}
 */
WebInspector.View = function()
{
    this.element = document.createElement("div");
    this.element.__view = this;
    this._visible = true;
    this._isRoot = false;
    this._isShowing = false;
    this._children = [];
    this._hideOnDetach = false;
    this._cssFiles = [];
}

WebInspector.View._cssFileToVisibleViewCount = {};
WebInspector.View._cssFileToStyleElement = {};

WebInspector.View.prototype = {
    markAsRoot: function()
    {
        this._isRoot = true;
    },

    isShowing: function()
    {
        return this._isShowing;
    },

    setHideOnDetach: function()
    {
        this._hideOnDetach = true;
    },

    _parentIsShowing: function()
    {
        return this._isRoot || (this._parentView && this._parentView.isShowing());
    },

    _callOnVisibleChildren: function(method)
    {
        for (var i = 0; i < this._children.length; ++i)
            if (this._children[i]._visible)
                method.call(this._children[i]);
    },

    _processWillShow: function()
    {
        this._loadCSSIfNeeded();
        this._callOnVisibleChildren(this._processWillShow);
    },

    _processWasShown: function()
    {
        this._isShowing = true;
        this.restoreScrollPositions();

        this.wasShown();
        this.onResize();

        this._callOnVisibleChildren(this._processWasShown);
    },

    _processWillHide: function()
    {
        this.storeScrollPositions();

        this._callOnVisibleChildren(this._processWillHide);

        this.willHide();
        this._isShowing = false;
    },

    _processWasHidden: function()
    {
        this._disableCSSIfNeeded();
        this._callOnVisibleChildren(this._processWasHidden);
    },

    _processOnResize: function()
    {
        if (!this.isShowing())
            return;

        this.onResize();
        this._callOnVisibleChildren(this._processOnResize);
    },

    wasShown: function()
    {
    },

    willHide: function()
    {
    },

    onResize: function()
    {
    },

    /**
     * @param {Element} parentElement
     * @param {Element=} insertBefore
     */
    show: function(parentElement, insertBefore)
    {
        WebInspector.View._assert(parentElement, "Attempt to attach view with no parent element");

        // Update view hierarchy
        if (this.element.parentElement !== parentElement) {
            var currentParent = parentElement;
            while (currentParent && !currentParent.__view)
                currentParent = currentParent.parentElement;

            if (currentParent) {
                this._parentView = currentParent.__view;
                this._parentView._children.push(this);
                this._isRoot = false;
            } else
                WebInspector.View._assert(this._isRoot, "Attempt to attach view to orphan node");
        } else if (this._visible)
            return;

        this._visible = true;
        if (this._parentIsShowing())
            this._processWillShow();

        this.element.addStyleClass("visible");

        // Reparent
        if (this.element.parentElement !== parentElement) {
            WebInspector.View._incrementViewCounter(parentElement, this.element);
            if (insertBefore)
                WebInspector.View._originalInsertBefore.call(parentElement, this.element, insertBefore);
            else
                WebInspector.View._originalAppendChild.call(parentElement, this.element);
        }

        if (this._parentIsShowing())
            this._processWasShown();
    },

    /**
     * @param {boolean=} overrideHideOnDetach
     */
    detach: function(overrideHideOnDetach)
    {
        var parentElement = this.element.parentElement;
        if (!parentElement)
            return;

        if (this._parentIsShowing())
            this._processWillHide();

        if (this._hideOnDetach && !overrideHideOnDetach) {
            this.element.removeStyleClass("visible");
            this._visible = false;
            if (this._parentIsShowing())
                this._processWasHidden();
            return;
        }

        // Force legal removal
        WebInspector.View._decrementViewCounter(parentElement, this.element);
        WebInspector.View._originalRemoveChild.call(parentElement, this.element);

        this._visible = false;
        if (this._parentIsShowing())
            this._processWasHidden();

        // Update view hierarchy
        if (this._parentView) {
            var childIndex = this._parentView._children.indexOf(this);
            WebInspector.View._assert(childIndex >= 0, "Attempt to remove non-child view");
            this._parentView._children.splice(childIndex, 1);
            this._parentView = null;
        } else
            WebInspector.View._assert(this._isRoot, "Removing non-root view from DOM");
    },

    detachChildViews: function()
    {
        var children = this._children.slice();
        for (var i = 0; i < children.length; ++i)
            children[i].detach();
    },

    elementsToRestoreScrollPositionsFor: function()
    {
        return [this.element];
    },

    storeScrollPositions: function()
    {
        var elements = this.elementsToRestoreScrollPositionsFor();
        for (var i = 0; i < elements.length; ++i) {
            var container = elements[i];
            container._scrollTop = container.scrollTop;
            container._scrollLeft = container.scrollLeft;
        }
    },

    restoreScrollPositions: function()
    {
        var elements = this.elementsToRestoreScrollPositionsFor();
        for (var i = 0; i < elements.length; ++i) {
            var container = elements[i];
            if (container._scrollTop)
                container.scrollTop = container._scrollTop;
            if (container._scrollLeft)
                container.scrollLeft = container._scrollLeft;
        }
    },

    canHighlightLine: function()
    {
        return false;
    },

    highlightLine: function(line)
    {
    },

    doResize: function()
    {
        this._processOnResize();
    },

    registerRequiredCSS: function(cssFile)
    {
        this._cssFiles.push(cssFile);
    },

    _loadCSSIfNeeded: function()
    {
        for (var i = 0; i < this._cssFiles.length; ++i) {
            var cssFile = this._cssFiles[i];

            var viewsWithCSSFile = WebInspector.View._cssFileToVisibleViewCount[cssFile];
            WebInspector.View._cssFileToVisibleViewCount[cssFile] = (viewsWithCSSFile || 0) + 1;
            if (!viewsWithCSSFile)
                this._doLoadCSS(cssFile);
        }
    },

    _doLoadCSS: function(cssFile)
    {
        var styleElement = WebInspector.View._cssFileToStyleElement[cssFile];
        if (styleElement) {
            styleElement.disabled = false;
            return;
        }

        if (window.debugCSS) { /* debugging support */
            styleElement = document.createElement("link");
            styleElement.rel = "stylesheet";
            styleElement.type = "text/css";
            styleElement.href = cssFile;
        } else {
            var xhr = new XMLHttpRequest();
            xhr.open("GET", cssFile, false);
            xhr.send(null);

            styleElement = document.createElement("style");
            styleElement.type = "text/css";
            styleElement.textContent = xhr.responseText;
        }
        document.head.insertBefore(styleElement, document.head.firstChild);

        WebInspector.View._cssFileToStyleElement[cssFile] = styleElement;
    },

    _disableCSSIfNeeded: function()
    {
        for (var i = 0; i < this._cssFiles.length; ++i) {
            var cssFile = this._cssFiles[i];

            var viewsWithCSSFile = WebInspector.View._cssFileToVisibleViewCount[cssFile];
            viewsWithCSSFile--;
            WebInspector.View._cssFileToVisibleViewCount[cssFile] = viewsWithCSSFile;

            if (!viewsWithCSSFile)
                this._doUnloadCSS(cssFile);
        }
    },

    _doUnloadCSS: function(cssFile)
    {
        var styleElement = WebInspector.View._cssFileToStyleElement[cssFile];
        styleElement.disabled = true;
    },

    printViewHierarchy: function()
    {
        var lines = [];
        this._collectViewHierarchy("", lines);
        console.log(lines.join("\n"));
    },

    _collectViewHierarchy: function(prefix, lines)
    {
        lines.push(prefix + "[" + this.element.className + "]" + (this._children.length ? " {" : ""));

        for (var i = 0; i < this._children.length; ++i)
            this._children[i]._collectViewHierarchy(prefix + "    ", lines);

        if (this._children.length)
            lines.push(prefix + "}");
    }
}

WebInspector.View.prototype.__proto__ = WebInspector.Object.prototype;

WebInspector.View._originalAppendChild = Element.prototype.appendChild;
WebInspector.View._originalInsertBefore = Element.prototype.insertBefore;
WebInspector.View._originalRemoveChild = Element.prototype.removeChild;
WebInspector.View._originalRemoveChildren = Element.prototype.removeChildren;

WebInspector.View._incrementViewCounter = function(parentElement, childElement)
{
    var count = (childElement.__viewCounter || 0) + (childElement.__view ? 1 : 0);
    if (!count)
        return;

    while (parentElement) {
        parentElement.__viewCounter = (parentElement.__viewCounter || 0) + count;
        parentElement = parentElement.parentElement;
    }
}

WebInspector.View._decrementViewCounter = function(parentElement, childElement)
{
    var count = (childElement.__viewCounter || 0) + (childElement.__view ? 1 : 0);
    if (!count)
        return;

    while (parentElement) {
        parentElement.__viewCounter -= count;
        parentElement = parentElement.parentElement;
    }
}

WebInspector.View._assert = function(condition, message)
{
    if (!condition) {
        console.trace();
        throw new Error(message);
    }
}

Element.prototype.appendChild = function(child)
{
    WebInspector.View._assert(!child.__view, "Attempt to add view via regular DOM operation.");
    return WebInspector.View._originalAppendChild.call(this, child);
}

Element.prototype.insertBefore = function(child, anchor)
{
    WebInspector.View._assert(!child.__view, "Attempt to add view via regular DOM operation.");
    return WebInspector.View._originalInsertBefore.call(this, child, anchor);
}


Element.prototype.removeChild = function(child)
{
    WebInspector.View._assert(!child.__viewCounter && !child.__view, "Attempt to remove element containing view via regular DOM operation");
    return WebInspector.View._originalRemoveChild.call(this, child);
}

Element.prototype.removeChildren = function()
{
    WebInspector.View._assert(!this.__viewCounter, "Attempt to remove element containing view via regular DOM operation");
    WebInspector.View._originalRemoveChildren.call(this);
}
