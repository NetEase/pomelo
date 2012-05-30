/*
 * Copyright (C) 2011 Google Inc.  All rights reserved.
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

WebInspector.elementDragStart = function(element, dividerDrag, elementDragEnd, event, cursor)
{
    if (WebInspector._elementDraggingEventListener || WebInspector._elementEndDraggingEventListener)
        WebInspector.elementDragEnd(event);

    if (element) {
        // Install glass pane
        if (WebInspector._elementDraggingGlassPane)
            WebInspector._elementDraggingGlassPane.parentElement.removeChild(WebInspector._elementDraggingGlassPane);

        var glassPane = document.createElement("div");
        glassPane.style.cssText = "position:absolute;top:0;bottom:0;left:0;right:0;opacity:0;z-index:1";
        glassPane.id = "glass-pane-for-drag";
        element.ownerDocument.body.appendChild(glassPane);
        WebInspector._elementDraggingGlassPane = glassPane;
    }

    WebInspector._elementDraggingEventListener = dividerDrag;
    WebInspector._elementEndDraggingEventListener = elementDragEnd;

    var targetDocument = event.target.ownerDocument;
    targetDocument.addEventListener("mousemove", dividerDrag, true);
    targetDocument.addEventListener("mouseup", elementDragEnd, true);

    targetDocument.body.style.cursor = cursor;

    event.preventDefault();
}

WebInspector.elementDragEnd = function(event)
{
    var targetDocument = event.target.ownerDocument;
    targetDocument.removeEventListener("mousemove", WebInspector._elementDraggingEventListener, true);
    targetDocument.removeEventListener("mouseup", WebInspector._elementEndDraggingEventListener, true);

    targetDocument.body.style.removeProperty("cursor");

    if (WebInspector._elementDraggingGlassPane)
        WebInspector._elementDraggingGlassPane.parentElement.removeChild(WebInspector._elementDraggingGlassPane);

    delete WebInspector._elementDraggingGlassPane;
    delete WebInspector._elementDraggingEventListener;
    delete WebInspector._elementEndDraggingEventListener;

    event.preventDefault();
}

WebInspector.animateStyle = function(animations, duration, callback)
{
    var interval;
    var complete = 0;
    var hasCompleted = false;

    const intervalDuration = (1000 / 30); // 30 frames per second.
    const animationsLength = animations.length;
    const propertyUnit = {opacity: ""};
    const defaultUnit = "px";

    function cubicInOut(t, b, c, d)
    {
        if ((t/=d/2) < 1) return c/2*t*t*t + b;
        return c/2*((t-=2)*t*t + 2) + b;
    }

    // Pre-process animations.
    for (var i = 0; i < animationsLength; ++i) {
        var animation = animations[i];
        var element = null, start = null, end = null, key = null;
        for (key in animation) {
            if (key === "element")
                element = animation[key];
            else if (key === "start")
                start = animation[key];
            else if (key === "end")
                end = animation[key];
        }

        if (!element || !end)
            continue;

        if (!start) {
            var computedStyle = element.ownerDocument.defaultView.getComputedStyle(element);
            start = {};
            for (key in end)
                start[key] = parseInt(computedStyle.getPropertyValue(key), 10);
            animation.start = start;
        } else
            for (key in start)
                element.style.setProperty(key, start[key] + (key in propertyUnit ? propertyUnit[key] : defaultUnit));
    }

    function animateLoop()
    {
        if (hasCompleted)
            return;
        
        // Advance forward.
        complete += intervalDuration;
        var next = complete + intervalDuration;

        // Make style changes.
        for (var i = 0; i < animationsLength; ++i) {
            var animation = animations[i];
            var element = animation.element;
            var start = animation.start;
            var end = animation.end;
            if (!element || !end)
                continue;

            var style = element.style;
            for (key in end) {
                var endValue = end[key];
                if (next < duration) {
                    var startValue = start[key];
                    var newValue = cubicInOut(complete, startValue, endValue - startValue, duration);
                    style.setProperty(key, newValue + (key in propertyUnit ? propertyUnit[key] : defaultUnit));
                } else
                    style.setProperty(key, endValue + (key in propertyUnit ? propertyUnit[key] : defaultUnit));
            }
        }

        // End condition.
        if (complete >= duration) {
            hasCompleted = true;
            clearInterval(interval);
            if (callback)
                callback();
        }
    }

    function forceComplete()
    {
        if (hasCompleted)
            return;

        complete = duration;
        animateLoop();
    }

    function cancel()
    {
        hasCompleted = true;
        clearInterval(interval);
    }

    interval = setInterval(animateLoop, intervalDuration);
    return {
        cancel: cancel,
        forceComplete: forceComplete
    };
}

WebInspector.isBeingEdited = function(element)
{
    if (element.hasStyleClass("text-prompt") || element.nodeName === "INPUT")
        return true;

    if (!WebInspector.__editingCount)
        return false;

    while (element) {
        if (element.__editing)
            return true;
        element = element.parentElement;
    }
    return false;
}

WebInspector.markBeingEdited = function(element, value)
{
    if (value) {
        if (element.__editing)
            return false;
        element.__editing = true;
        WebInspector.__editingCount = (WebInspector.__editingCount || 0) + 1;
    } else {
        if (!element.__editing)
            return false;
        delete element.__editing;
        --WebInspector.__editingCount;
    }
    return true;
}

/**
 * @constructor
 * @param {function(Element,string,string,*,string)} commitHandler
 * @param {function(Element,*)} cancelHandler
 * @param {*=} context
 */
WebInspector.EditingConfig = function(commitHandler, cancelHandler, context)
{
    this.commitHandler = commitHandler;
    this.cancelHandler = cancelHandler
    this.context = context;

    /**
     * Handles the "paste" event, return values are the same as those for customFinishHandler
     * @type {function(Element)|undefined}
     */
    this.pasteHandler;

    /** 
     * Whether the edited element is multiline
     * @type {boolean|undefined}
     */
    this.multiline;

    /**
     * Custom finish handler for the editing session (invoked on keydown)
     * @type {function(Element,*)|undefined}
     */
    this.customFinishHandler;
}

WebInspector.EditingConfig.prototype = {
    setPasteHandler: function(pasteHandler)
    {
        this.pasteHandler = pasteHandler;
    },

    setMultiline: function(multiline)
    {
        this.multiline = multiline;
    },

    setCustomFinishHandler: function(customFinishHandler)
    {
        this.customFinishHandler = customFinishHandler;
    }
}

/** 
 * @param {Element} element
 * @param {WebInspector.EditingConfig=} config
 */
WebInspector.startEditing = function(element, config)
{
    if (!WebInspector.markBeingEdited(element, true))
        return null;

    config = config || new WebInspector.EditingConfig(function() {}, function() {});
    var committedCallback = config.commitHandler;
    var cancelledCallback = config.cancelHandler;
    var pasteCallback = config.pasteHandler;
    var context = config.context;
    var oldText = getContent(element);
    var moveDirection = "";

    element.addStyleClass("editing");

    var oldTabIndex = element.getAttribute("tabIndex");
    if (isNaN(oldTabIndex) || oldTabIndex < 0)
        element.tabIndex = 0;

    function blurEventListener() {
        editingCommitted.call(element);
    }

    function getContent(element) {
        if (element.tagName === "INPUT" && element.type === "text")
            return element.value;
        else
            return element.textContent;
    }

    /** @this {Element} */
    function cleanUpAfterEditing()
    {
        WebInspector.markBeingEdited(element, false);

        this.removeStyleClass("editing");
        
        if (isNaN(oldTabIndex))
            element.removeAttribute("tabIndex");
        else
            this.tabIndex = oldTabIndex;
        this.scrollTop = 0;
        this.scrollLeft = 0;

        element.removeEventListener("blur", blurEventListener, false);
        element.removeEventListener("keydown", keyDownEventListener, true);
        if (pasteCallback)
            element.removeEventListener("paste", pasteEventListener, true);

        WebInspector.restoreFocusFromElement(element);
    }

    /** @this {Element} */
    function editingCancelled()
    {
        if (this.tagName === "INPUT" && this.type === "text")
            this.value = oldText;
        else
            this.textContent = oldText;

        cleanUpAfterEditing.call(this);

        cancelledCallback(this, context);
    }

    /** @this {Element} */
    function editingCommitted()
    {
        cleanUpAfterEditing.call(this);

        committedCallback(this, getContent(this), oldText, context, moveDirection);
    }

    function defaultFinishHandler(event)
    {
        var isMetaOrCtrl = WebInspector.isMac() ?
            event.metaKey && !event.shiftKey && !event.ctrlKey && !event.altKey :
            event.ctrlKey && !event.shiftKey && !event.metaKey && !event.altKey;
        if (isEnterKey(event) && (event.isMetaOrCtrlForTest || !config.multiline || isMetaOrCtrl))
            return "commit";
        else if (event.keyCode === WebInspector.KeyboardShortcut.Keys.Esc.code || event.keyIdentifier === "U+001B")
            return "cancel";
        else if (event.keyIdentifier === "U+0009") // Tab key
            return "move-" + (event.shiftKey ? "backward" : "forward");
    }

    function handleEditingResult(result, event)
    {
        if (result === "commit") {
            editingCommitted.call(element);
            event.consume(true);
        } else if (result === "cancel") {
            editingCancelled.call(element);
            event.consume(true);
        } else if (result && result.indexOf("move-") === 0) {
            moveDirection = result.substring(5);
            if (event.keyIdentifier !== "U+0009")
                blurEventListener();
        }
    }

    function pasteEventListener(event)
    {
        var result = pasteCallback(event);
        handleEditingResult(result, event);
    }

    function keyDownEventListener(event)
    {
        var handler = config.customFinishHandler || defaultFinishHandler;
        var result = handler(event);
        handleEditingResult(result, event);
    }

    element.addEventListener("blur", blurEventListener, false);
    element.addEventListener("keydown", keyDownEventListener, true);
    if (pasteCallback)
        element.addEventListener("paste", pasteEventListener, true);

    WebInspector.setCurrentFocusElement(element);
    return {
        cancel: editingCancelled.bind(element),
        commit: editingCommitted.bind(element)
    };
}

/**
 * @param {boolean=} higherResolution
 */
Number.secondsToString = function(seconds, higherResolution)
{
    if (seconds === 0)
        return "0";

    var ms = seconds * 1000;
    if (higherResolution && ms < 1000)
        return WebInspector.UIString("%.3fms", ms);
    else if (ms < 1000)
        return WebInspector.UIString("%.0fms", ms);

    if (seconds < 60)
        return WebInspector.UIString("%.2fs", seconds);

    var minutes = seconds / 60;
    if (minutes < 60)
        return WebInspector.UIString("%.1fmin", minutes);

    var hours = minutes / 60;
    if (hours < 24)
        return WebInspector.UIString("%.1fhrs", hours);

    var days = hours / 24;
    return WebInspector.UIString("%.1f days", days);
}

/**
 * @param {boolean=} higherResolution
 */
Number.bytesToString = function(bytes, higherResolution)
{
    if (typeof higherResolution === "undefined")
        higherResolution = true;

    if (bytes < 1024)
        return WebInspector.UIString("%.0fB", bytes);

    var kilobytes = bytes / 1024;
    if (higherResolution && kilobytes < 1024)
        return WebInspector.UIString("%.2fKB", kilobytes);
    else if (kilobytes < 1024)
        return WebInspector.UIString("%.0fKB", kilobytes);

    var megabytes = kilobytes / 1024;
    if (higherResolution)
        return WebInspector.UIString("%.2fMB", megabytes);
    else
        return WebInspector.UIString("%.0fMB", megabytes);
}

Number.withThousandsSeparator = function(num)
{
    var str = num + "";
    var re = /(\d+)(\d{3})/;
    while (str.match(re))
        str = str.replace(re, "$1\u2009$2"); // \u2009 is a thin space.
    return str;
}

WebInspector._missingLocalizedStrings = {};

/**
 * @param {string} string
 * @param {...*} vararg
 */
WebInspector.UIString = function(string, vararg)
{
    if (Preferences.localizeUI) {
        if (window.localizedStrings && string in window.localizedStrings)
            string = window.localizedStrings[string];
        else {
            if (!(string in WebInspector._missingLocalizedStrings)) {
                console.warn("Localized string \"" + string + "\" not found.");
                WebInspector._missingLocalizedStrings[string] = true;
            }
    
            if (Preferences.showMissingLocalizedStrings)
                string += " (not localized)";
        }
    }
    return String.vsprintf(string, Array.prototype.slice.call(arguments, 1));
}

WebInspector.useLowerCaseMenuTitles = function()
{
    return WebInspector.platform() === "windows" && Preferences.useLowerCaseMenuTitlesOnWindows;
}

WebInspector.formatLocalized = function(format, substitutions, formatters, initialValue, append)
{
    return String.format(WebInspector.UIString(format), substitutions, formatters, initialValue, append);
}

WebInspector.openLinkExternallyLabel = function()
{
    return WebInspector.UIString(WebInspector.useLowerCaseMenuTitles() ? "Open link in new tab" : "Open Link in New Tab");
}

WebInspector.openInNetworkPanelLabel = function()
{
    return WebInspector.UIString(WebInspector.useLowerCaseMenuTitles() ? "Open in network panel" : "Open in Network Panel");
}

WebInspector.copyLinkAddressLabel = function()
{
    return WebInspector.UIString(WebInspector.useLowerCaseMenuTitles() ? "Copy link address" : "Copy Link Address");
}

WebInspector.platform = function()
{
    if (!WebInspector._platform)
        WebInspector._platform = InspectorFrontendHost.platform();
    return WebInspector._platform;
}

WebInspector.isMac = function()
{
    if (typeof WebInspector._isMac === "undefined")
        WebInspector._isMac = WebInspector.platform() === "mac";

    return WebInspector._isMac;
}

WebInspector.PlatformFlavor = {
    WindowsVista: "windows-vista",
    MacTiger: "mac-tiger",
    MacLeopard: "mac-leopard",
    MacSnowLeopard: "mac-snowleopard"
}

WebInspector.platformFlavor = function()
{
    function detectFlavor()
    {
        const userAgent = navigator.userAgent;

        if (WebInspector.platform() === "windows") {
            var match = userAgent.match(/Windows NT (\d+)\.(?:\d+)/);
            if (match && match[1] >= 6)
                return WebInspector.PlatformFlavor.WindowsVista;
            return null;
        } else if (WebInspector.platform() === "mac") {
            var match = userAgent.match(/Mac OS X\s*(?:(\d+)_(\d+))?/);
            if (!match || match[1] != 10)
                return WebInspector.PlatformFlavor.MacSnowLeopard;
            switch (Number(match[2])) {
                case 4:
                    return WebInspector.PlatformFlavor.MacTiger;
                case 5:
                    return WebInspector.PlatformFlavor.MacLeopard;
                case 6:
                default:
                    return WebInspector.PlatformFlavor.MacSnowLeopard;
            }
        }
    }

    if (!WebInspector._platformFlavor)
        WebInspector._platformFlavor = detectFlavor();

    return WebInspector._platformFlavor;
}

WebInspector.port = function()
{
    if (!WebInspector._port)
        WebInspector._port = InspectorFrontendHost.port();

    return WebInspector._port;
}

WebInspector.installPortStyles = function()
{
    var platform = WebInspector.platform();
    document.body.addStyleClass("platform-" + platform);
    var flavor = WebInspector.platformFlavor();
    if (flavor)
        document.body.addStyleClass("platform-" + flavor);
    var port = WebInspector.port();
    document.body.addStyleClass("port-" + port);
}

WebInspector._windowFocused = function(event)
{
    if (event.target.document.nodeType === Node.DOCUMENT_NODE)
        document.body.removeStyleClass("inactive");
}

WebInspector._windowBlurred = function(event)
{
    if (event.target.document.nodeType === Node.DOCUMENT_NODE)
        document.body.addStyleClass("inactive");
}

WebInspector.previousFocusElement = function()
{
    return WebInspector._previousFocusElement;
}

WebInspector.currentFocusElement = function()
{
    return WebInspector._currentFocusElement;
}

WebInspector._focusChanged = function(event)
{
    WebInspector.setCurrentFocusElement(event.target);
}

WebInspector._textInputTypes = ["text", "search", "tel", "url", "email", "password"].keySet(); 
WebInspector._isTextEditingElement = function(element)
{
    if (element instanceof HTMLInputElement)
        return element.type in WebInspector._textInputTypes;

    if (element instanceof HTMLTextAreaElement)
        return true;

    return false;
}

WebInspector.setCurrentFocusElement = function(x)
{
    if (WebInspector._currentFocusElement !== x)
        WebInspector._previousFocusElement = WebInspector._currentFocusElement;
    WebInspector._currentFocusElement = x;

    if (WebInspector._currentFocusElement) {
        WebInspector._currentFocusElement.focus();

        // Make a caret selection inside the new element if there isn't a range selection and there isn't already a caret selection inside.
        // This is needed (at least) to remove caret from console when focus is moved to some element in the panel.
        // The code below should not be applied to text fields and text areas, hence _isTextEditingElement check.
        var selection = window.getSelection();
        if (!WebInspector._isTextEditingElement(WebInspector._currentFocusElement) && selection.isCollapsed && !WebInspector._currentFocusElement.isInsertionCaretInside()) {
            var selectionRange = WebInspector._currentFocusElement.ownerDocument.createRange();
            selectionRange.setStart(WebInspector._currentFocusElement, 0);
            selectionRange.setEnd(WebInspector._currentFocusElement, 0);

            selection.removeAllRanges();
            selection.addRange(selectionRange);
        }
    } else if (WebInspector._previousFocusElement)
        WebInspector._previousFocusElement.blur();
}

WebInspector.restoreFocusFromElement = function(element)
{
    if (element && element.isSelfOrAncestor(WebInspector.currentFocusElement()))
        WebInspector.setCurrentFocusElement(WebInspector.previousFocusElement());
}

WebInspector.setToolbarColors = function(backgroundColor, color)
{
    if (!WebInspector._themeStyleElement) {
        WebInspector._themeStyleElement = document.createElement("style");
        document.head.appendChild(WebInspector._themeStyleElement);
    }
    WebInspector._themeStyleElement.textContent =
        "#toolbar {\
             background-image: none !important;\
             background-color: " + backgroundColor + " !important;\
         }\
         \
         .toolbar-label {\
             color: " + color + " !important;\
             text-shadow: none;\
         }";
}

WebInspector.resetToolbarColors = function()
{
    if (WebInspector._themeStyleElement)
        WebInspector._themeStyleElement.textContent = "";
}

/**
 * @param {WebInspector.ContextMenu} contextMenu
 * @param {Node} contextNode
 * @param {Event} event
 */
WebInspector.populateHrefContextMenu = function(contextMenu, contextNode, event)
{
    var anchorElement = event.target.enclosingNodeOrSelfWithClass("webkit-html-resource-link") || event.target.enclosingNodeOrSelfWithClass("webkit-html-external-link");
    if (!anchorElement)
        return false;

    var resourceURL = WebInspector.resourceURLForRelatedNode(contextNode, anchorElement.href);
    if (!resourceURL)
        return false;

    // Add resource-related actions.
    contextMenu.appendItem(WebInspector.openLinkExternallyLabel(), WebInspector.openResource.bind(WebInspector, resourceURL, false));
    if (WebInspector.resourceForURL(resourceURL))
        contextMenu.appendItem(WebInspector.UIString(WebInspector.useLowerCaseMenuTitles() ? "Open link in Resources panel" : "Open Link in Resources Panel"), WebInspector.openResource.bind(null, resourceURL, true));
    contextMenu.appendItem(WebInspector.copyLinkAddressLabel(), InspectorFrontendHost.copyText.bind(InspectorFrontendHost, resourceURL));
    return true;
}

;(function() {

function windowLoaded()
{
    window.addEventListener("focus", WebInspector._windowFocused, false);
    window.addEventListener("blur", WebInspector._windowBlurred, false);
    document.addEventListener("focus", WebInspector._focusChanged.bind(this), true);
    window.removeEventListener("DOMContentLoaded", windowLoaded, false);
}

window.addEventListener("DOMContentLoaded", windowLoaded, false);

})();
